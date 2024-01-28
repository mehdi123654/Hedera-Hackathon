// EmpowerLoanContract.js

const { Client, AccountBalanceQuery, Hbar, AccountId, TokenCreateTransaction, TokenAssociateTransaction, TransferTransaction } = require("@hashgraph/sdk");
const timeLimit=0.1;
const adminAccountId = AccountId.fromString("0.0.7713579");
const adminPrivateKey = "302e020100300506032b657004220420f78003ba4cf5ff052cd0edd3137088eef9f34039616c582dcd938b19c9020393";
const clientAccountId =AccountId.fromString("0.0.7714331");
const clientPrivateKey="3030020100300706052b8104000a0422042067d40d6bbc0ba85a117988a38598f4cf39e8165ab344d15687ca68155c5fb985";
const interest=0.7;
class EmpowerLoanContract {
    constructor() {
        // Initialize Hedera client
        this.client = Client.forTestnet();
         // Use forTestnet() or forMainnet() accordingly
        //usdtAmount, interest, btcAmount
        
        // Add more initialization as needed
    }

    async createLoan(borrower, usdtAmount, btcAmount) {
        // Implement logic for creating a loan and storing collateralToken
        this.client.setOperator(clientAccountId,clientPrivateKey);
        // Check client's balance
        const clientBalance = await new AccountBalanceQuery().setAccountId(borrower).execute(this.client);
        if (clientBalance.hbars.toTinybars() < usdtAmount) {
            console.error("Insufficient funds for the loan");
            return;
        }

        //transfer collateral
        
        const sendHbar = await new TransferTransaction()
        .addHbarTransfer(borrower, Hbar.fromTinybars(-btcAmount)) // Sending account
        .addHbarTransfer(adminAccountId, Hbar.fromTinybars(btcAmount)) // Receiving account
        .execute(this.client); // Execute the transaction
    
    const transactionReceipt = await sendHbar.getReceipt(this.client);
    
console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

//reciept
        const transferBtcReceipt = await sendHbar.getReceipt(this.client);

        //transfer loan
        console.log("Loan approved. BTC transferred to admin.");

     }

    async repayLoan(borrower, usdtAmount/*,interest*/) {
        // Implement logic for repaying the loan and returning collateralToken
        const amount=usdtAmount*interest;
        this.client.setOperator(clientAccountId,clientPrivateKey);
        const sendHbar = await new TransferTransaction()
     .addHbarTransfer(borrower, Hbar.from(-amount)) //Sending account
     .addHbarTransfer(adminAccountId, Hbar.from(amount)) //Receiving account
     .execute(this.client);
     const transactionReceipt = await sendHbar.getReceipt(this.client);
console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

const getNewBalance = await new AccountBalanceQuery()
.setAccountId(clientAccountId)
.getCost(this.client);
console.log('new balance:'+getNewBalance);
    }

    async checkRepayment(bankAccountId,burrower,btcAmount) {
        const currentTime = Date.now();
        this.client.setOperator(adminAccountId,adminPrivateKey);
        if (currentTime < timeLimit) {
            console.log("Loan repaid on time. Returning BTC to the client.");
    
            // Transfer BTC back to the client
            const sendHbar = await new TransferTransaction()
         .addHbarTransfer(adminAccountId, Hbar.fromTinybars(-btcAmount)) //Sending account
         .addHbarTransfer(burrower, Hbar.fromTinybars(btcAmount)) //Receiving account
         .execute(client);
         const transactionReceipt = await sendHbar.getReceipt(this.client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());
    
        } else {
            console.log("Loan not repaid on time. BTC goes to the bank.");
    
            // Transfer BTC to the bank
            
            const sendHbar = await new TransferTransaction()
         .addHbarTransfer(adminAccountId, Hbar.fromTinybars(-btcAmount)) //Sending account
         .addHbarTransfer(bankAccountId, Hbar.fromTinybars(btcAmount)) //Receiving account
         .execute(this.client);
         const transactionReceipt = await sendHbar.getReceipt(this.client);
   console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());
    
        }
    /*
        // Remove loan entry from the database
        const loanIndex = loans.findIndex((l) => l === loan);
        loans.splice(loanIndex, 1);*/
    }
    
    // Add more functions as needed
}

//module.exports = EmpowerLoanContract;
async function main() {
    //testing
const clientAccount =AccountId.fromString("0.0.7714331");
const clientPrivateKey="3030020100300706052b8104000a0422042067d40d6bbc0ba85a117988a38598f4cf39e8165ab344d15687ca68155c5fb985";
const btcAmount=2;
const usdtAmount=30;
const bankAccountId = AccountId.fromString("0.0.7713452");


// Mock database for storing loan details
const loans = [];
const test=new EmpowerLoanContract();
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
    rl.question('Enter 1 to approve a loan or 2 to check loan status , 3 to pay debt: ', async (answer) => {
        if (answer === '1') {
            // Case 1: Approve a loan
             test.createLoan(clientAccount,usdtAmount,btcAmount);
        } else if (answer === '2') {
            // Case 2: Check loan status
            // Wait for 2 hours to see the loan status
            
                // Check the status of existing loans
                
                    test.checkRepayment(bankAccountId,clientAccount,btcAmount);
                
            
        }else if (answer=='3'){
            test.repayLoan(clientAccount,btcAmount,usdtAmount);
        }
         else {
            console.log('Invalid input. Please enter 1 or 2.');
        }

        rl.close();
    });
}
main();

