const { Client, AccountBalanceQuery, Hbar, AccountId, TokenCreateTransaction, TokenAssociateTransaction, TransferTransaction } = require("@hashgraph/sdk");

// Replace these values with your actual Hedera account details
const bankAccountId = AccountId.fromString("0.0.7713452");
//const bankPrivateKey = "your_bank_private_key";
const adminAccountId = AccountId.fromString("0.0.7713579");
const adminPrivateKey = "302e020100300506032b657004220420f78003ba4cf5ff052cd0edd3137088eef9f34039616c582dcd938b19c9020393";

//testing
const clientAccount =AccountId.fromString("0.0.7714331");
const clientPrivateKey="3030020100300706052b8104000a0422042067d40d6bbc0ba85a117988a38598f4cf39e8165ab344d15687ca68155c5fb985";
const btcAmount=0.001;
const usdtAmount=30;
const timeLimitInHours=0.1;

// Mock database for storing loan details
const loans = [];

//async function approveLoan(clientAccountId, btcAmount, usdtAmount, timeLimitInHours)
async function approveLoan()
 {
    //const clientAccount = AccountId.fromString(clientAccountId);
    const client = new Client({
        network: { "testnet.hedera.com:50211": "0.0.3" },
      });
      
    // Check client's balance
    const clientBalance = await new AccountBalanceQuery().setAccountId(clientAccount).execute(client);
    if (clientBalance.hbars.toTinybars() < usdtAmount) {
        console.error("Insufficient funds for the loan");
        return;
    }

    // Transfer BTC from client to admin
    const transferBtcTransaction = new TransferTransaction()
        .addTokenTransfer(bankAccountId, -btcAmount)
        .addTokenTransfer(adminAccountId, btcAmount);

    const transferBtcResponse = await transferBtcTransaction
        .freezeWith(client)
        .sign(adminPrivateKey)
        .sign(clientPrivateKey)
        .execute(client);

    const transferBtcReceipt = await transferBtcResponse.getReceipt(client);

    // Create loan entry
    const loan = {
        clientAccount,
        btcAmount,
        usdtAmount,
        timeLimit: Date.now() + timeLimitInHours * 60 * 60 * 1000,
        transferBtcTransactionId: transferBtcReceipt.transactionId,
    };

    loans.push(loan);

    console.log("Loan approved. BTC transferred to admin.");

    // Schedule repayment check
    setTimeout(() => checkRepayment(client, loan), timeLimitInHours * 60 * 60 * 1000);
}

async function checkRepayment(client, loan) {
    const currentTime = Date.now();

    if (currentTime < loan.timeLimit) {
        console.log("Loan repaid on time. Returning BTC to the client.");

        // Transfer BTC back to the client
        const transferBtcBackTransaction = new TransferTransaction()
            .addTokenTransfer(bankAccountId, loan.btcAmount)
            .addTokenTransfer(loan.clientAccountId, -loan.btcAmount);

        await transferBtcBackTransaction
            .freezeWith(client)
            .sign(adminPrivateKey)
            .sign(clientPrivateKey)
            .execute(client);
    } else {
        console.log("Loan not repaid on time. BTC goes to the bank.");

        // Transfer BTC to the bank
        const transferBtcToBankTransaction = new TransferTransaction()
            .addTokenTransfer(adminAccountId, -loan.btcAmount)
            .addTokenTransfer(bankAccountId, loan.btcAmount);

        await transferBtcToBankTransaction
            .freezeWith(client)
            .sign(adminPrivateKey)
            .sign(clientPrivateKey)
            .execute(client);
    }

    // Remove loan entry from the database
    const loanIndex = loans.findIndex((l) => l === loan);
    loans.splice(loanIndex, 1);
}

async function main() {
    const client = new Client({ network: { "0.testnet.hedera.com:50211": "0.0.3" } });

    // Approve a loan (replace these values with actual data)
    //await approveLoan("your_client_account_id", 10, 100, 1);
    await approveLoan();
    // Wait for 2 hours to see the loan status
    setTimeout(() => {
        // Check the status of existing loans
        for (const loan of loans) {
            checkRepayment(client, loan);
        }
    }, 2 * 60 * 60 * 1000);

    await client.close();
}

main();
