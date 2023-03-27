"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const tronweb_1 = __importDefault(require("tronweb"));
const fs_1 = require("fs");
const secrets = __importStar(require("./secrets.json"));
function sendTokens(csvFile, privateKey, tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullNode = 'https://api.nileex.io/';
        const solidityNode = 'https://api.nileex.io';
        const eventServer = 'https://event.nileex.io';
        const tronWeb = new tronweb_1.default({
            fullNode,
            solidityNode,
            eventServer,
            privateKey
        });
        const defaultAddress = tronWeb.address.fromPrivateKey(privateKey);
        console.log(privateKey, defaultAddress);
        (0, fs_1.createReadStream)(csvFile)
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => __awaiter(this, void 0, void 0, function* () {
            console.log(row);
            const recipient = row.address;
            const amount = parseInt(row.balance);
            try {
                let contract = yield tronWeb.contract().at(tokenId);
                // const transaction = await tronWeb.transactionBuilder.sendToken(recipient, amount, tokenId);
                // const signedTransaction = await tronWeb.trx.sign(transaction);
                // const result = await tronWeb.trx.broadcast(signedTransaction);
                let result = yield contract.transfer(recipient, //address _to
                amount //amount
                ).send().then(output => { console.log('- Output:', output, '\n'); });
                console.log(`Transaction to ${recipient} for ${amount} tokens:`, result);
            }
            catch (e) {
                console.log(`Error sending tokens to ${recipient}:`, e);
            }
        }));
    });
}
console.log("Starting airdrop...");
sendTokens('./test.csv', secrets.privateKey, 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj');
