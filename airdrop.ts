import * as csv from 'csv-parser';
import TronWeb from 'tronweb';
import { createReadStream } from "fs";

async function sendTokens(csvFile: string, privateKey: string, tokenId: string) {
    const fullNode = 'https://api.trongrid.io';
    const solidityNode = 'https://api.trongrid.io';
    const eventServer = 'https://api.trongrid.io';

    const tronWeb = new TronWeb({
        fullNode,
        solidityNode,
        eventServer,
        privateKey
    });

    const defaultAddress = tronWeb.address.fromPrivateKey(privateKey);

    createReadStream(csvFile)
        .pipe(csv())
        .on('data', async (row) => {
            const recipient = row[0];
            const amount = parseInt(row[1]);

            try {
                const transaction = await tronWeb.transactionBuilder.sendToken(recipient, amount, tokenId);
                const signedTransaction = await tronWeb.trx.sign(transaction);
                const result = await tronWeb.trx.broadcast(signedTransaction);
                console.log(`Transaction to ${recipient} for ${amount} tokens:`, result);
            } catch (e) {
                console.log(`Error sending tokens to ${recipient}:`, e);
            }
        });
}


console.log("Starting airdrop...");
sendTokens('', 'jey', 'token');