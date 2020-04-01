const {BlockChain,Transaction} = require('./blockchain')


const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const mykey = ec.keyFromPrivate('6cb09d20bf35dcbdc53c79fc6b83ef27c60ec6c54fa3c3bc5897dd698899de2a ');
const mywallet = mykey.getPublic('hex');

let CoronaCoin = new BlockChain();

//T1
const tx1 = new Transaction(mywallet,'govt', 100);

tx1.signTransaction(mykey);

CoronaCoin.addTransaction(tx1);


console.log("Miner...");

CoronaCoin.minePending(mywallet);
console.log(CoronaCoin.getBalance(mywallet));


console.log("Miner Cash");

CoronaCoin.minePending(mywallet);
console.log(CoronaCoin.getBalance(mywallet));
