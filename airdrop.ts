import csv from 'csv-parser';
import TronWeb from 'tronweb';
import { appendFileSync, createReadStream } from "fs";

import * as secrets from "./secrets.json"


let contract;
let decimals;

const fullNode =     'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer =  'https://api.trongrid.io';

let web3;

const init = async (privateKey: string, contractAddress: string) => {
    web3 = new TronWeb({
        fullNode,
        solidityNode,
        eventServer,
        privateKey
    })

    const defaultAddress = web3.address.fromPrivateKey(privateKey);
    appendFileSync('result.csv', `\naddress,balance,txid`)
    contract = await web3.contract().at(contractAddress);
    decimals = await contract.methods.decimals().call();

    console.log(privateKey, defaultAddress);
};

function sendTokens(recipient: string, amount: number) {
    let errorCount = 0;
    return new Promise((res, rej) => {
        const send = async () => {

            console.log("Sending",amount * (10 ** +decimals) )
            try {
                let result = await contract.transfer(
                    recipient, //address _to
                    +(amount * (10 ** +decimals)).toFixed()   //amount
                ).send().then(output => { console.log('- Output:', output, '\n'); return output});

                console.log(`Transaction to ${recipient} for ${(amount * (10 ** +decimals)).toFixed()} tokens:`, result);
                res(result);
            } catch (e) {
                console.log(`Error sending tokens to ${recipient}:`, e);
                console.log(`Retrying in 30 seconds, please wait...`);
                errorCount++;
                if (errorCount < 3) {
                    setTimeout(() => {
                        send();
                    }, 31 * 1000)
                } else {
                    rej(e);
                }
            }
        }

        send();
    })
}


const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms));

console.log("Starting airdrop");
const start = async () => {
    await init((secrets as any).privateKey, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
    for await (const row of createReadStream('./test.csv').pipe(csv())) {
        const recipient = row.address;
        const amount = Number(row.balance);
        console.log(`Sending ${amount} to ${recipient}`);
        const txhash = await sendTokens(recipient, amount);
        console.log(`Transaction to ${recipient} for ${amount} tokens, DONE`);
        appendFileSync('result.csv', `\n${recipient},${amount},${txhash}`)
        await sleep(600);
    }
}


start();