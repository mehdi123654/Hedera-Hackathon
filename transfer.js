const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar,
    TransferTransaction,
  } = require("@hashgraph/sdk");
  const adminAccountId = AccountId.fromString("0.0.7713579");
  require("dotenv").config();
  
  async function transferSomme() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
  
    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
      throw new Error(
        "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
      );
    }
    
    //Create your Hedera Testnet client
    const client = Client.forTestnet();
  
   client.setOperator(myAccountId,myPrivateKey);
   const newAccountId ="0.0.7722159";
/////////
   const sendHbar = await new TransferTransaction()
     .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
     .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
     .execute(client);
 

  //Verify the transaction reached consensus
const transactionReceipt = await sendHbar.getReceipt(client);
console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

const getNewBalance = await new AccountBalanceQuery()
.setAccountId(newAccountId)
.getCost(client);
console.log('new balance:'+getNewBalance);
//testing code
    console.log("success");
    client.close(); 
  }
  transferSomme();
