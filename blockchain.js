const SHA256 = require('crypto-js/sha256'); 
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction{
    constructor(from,to,amount){
        this.from=from;
        this.to=to;
        this.amount=amount;
    }

    calculatehash(){
        return SHA256(this.from+this.to+this.amount).toString();
    }

    signTransaction(signingkey){

        if(signingkey.getPublic('hex' ) !== this.from){
            throw new Error("You Cannot sign!");
        }
        const hashtx = this.calculatehash();
        const sig = signingkey.sign(hashtx,'base64');
        this.signature = sig.toDER('hex');
    }


    isValid(){
        if(!this.from ) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error("Not Signer!");
        }

        const pubickey = ec.keyFromPublic(this.from,'hex');
        return pubickey.verify(this.calculatehash(),this.signature);
    }
}


class Block{
    
    constructor(timestamp,transactions,prevhash=''){
        this.timestamp=timestamp;
        this.transactions = transactions;
        this.prevhash = prevhash;
        this.hash = this.calculatehash();
        this.nonce = 0;
    }
    calculatehash(){
        return SHA256(this.prevhash+this.timestamp+JSON.stringify(this.data)+this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash=this.calculatehash();
        }
    }

    hasvalidtransaction(){
        for(const tx of this.transactions){
            if(!tx.isValid()) return false;

        }

        return true;
    }
}



class BlockChain{
    constructor(){
        this.chain = [this.createGenesis()];
        this.difficulty=1;
        this.pending =[];
        this.reward = 10;
    }
    createGenesis(){
        return new Block("30/3/2020","GenesisBlock","0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePending(rewardAddr){
        let block = new Block(Date.now(),this.pending);
        block.mineBlock(this.difficulty)
            console.log("Block Mined");
            this.chain.push(block);

            this.pending = [
                new Transaction( null, rewardAddr, this.reward)
            ];
    }

    addTransaction(transaction){

        if(!transaction.from || !transaction.to) throw new Error("Transaction invalid!");

        if(!transaction.isValid()) throw new Error("Transaction Cannot happen!");

        this.pending.push(transaction);
    }

    getBalance(addr){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.from == addr) balance -= trans.amount;
                if(trans.to == addr) balance += trans.amount;
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i=1;i<this.chain.length-1;i++){
            const curblock = this.chain[i];
            const prevblock = this.chain[i-1];
            console.log(curblock.hash);
            if(curblock.hash !== curblock.calculatehash()) return false;
            if(curblock.prevhash !== prevblock.hash) return false;
            if(!curblock.hasvalidtransaction()) return false;
        }
        return true;
    }

}

module.exports.BlockChain=BlockChain;
module.exports.Transaction=Transaction;