import csv from 'csv-parser';
import TronWeb from 'tronweb';
import { createReadStream } from "fs";

import * as secrets from "./secrets.json"

async function sendTokens(csvFile: string, privateKey: string, tokenId: string) {
    const fullNode = 'https://api.nileex.io/';
    const solidityNode = 'https://api.nileex.io';
    const eventServer = 'https://event.nileex.io';

    const tronWeb = new TronWeb({
        fullNode,
        solidityNode,
        eventServer,
        privateKey
    });

    const defaultAddress = tronWeb.address.fromPrivateKey(privateKey);
    console.log(privateKey, defaultAddress);
    createReadStream(csvFile)
        .pipe(csv())
        .on('data', async (row) => {
            console.log(row)
            const recipient = row.address;
            const amount = Number(row.balance);

            try {
                let contract = await tronWeb.contract().at(tokenId);
                const decimals = await contract.methods.decimals().call();
                // const transaction = await tronWeb.transactionBuilder.sendToken(recipient, amount, tokenId);
                // const signedTransaction = await tronWeb.trx.sign(transaction);
                // const result = await tronWeb.trx.broadcast(signedTransaction);

                console.log(decimals, amount,amount * (10 ** +decimals));
                let result = await contract.transfer(
                    recipient, //address _to
                    amount * (10 ** +decimals)   //amount
                ).send().then(output => { console.log('- Output:', output, '\n'); });

                console.log(`Transaction to ${recipient} for ${amount * (10 ** +decimals)  } tokens:`, result);
            } catch (e) {
                console.log(`Error sending tokens to ${recipient}:`, e);
            }
        });
}


console.log("Starting airdrop...");
sendTokens('./test.csv', (secrets as any).privateKey, 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj');