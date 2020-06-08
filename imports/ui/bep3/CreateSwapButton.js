const _ = require('lodash');
// const Env = require('./static/env').env;
const kava = require("@kava-labs/javascript-sdk");
const kavaUtils = kava.utils;
const KavaClient = kava.KavaClient;
const BnbApiClient = require('@binance-chain/javascript-sdk');
const bnbCrypto = BnbApiClient.crypto;

const BNB_CONVERSION_FACTOR = 10 ** 8;

const BinanceTestnetURL = "https://testnet-dex.binance.org/";
const KavaTestnet6000 = "http://54.88.243.146:1317";
const deputyKavaAddr = "kava1tfvn5t8qwngqd2q427za2mel48pcus3z9u73fl";
const deputyBNBAddr = "tbnb10uypsspvl6jlxcx5xse02pag39l8xpe7a3468h";
const userBnbAddr = " ";
const userBnbMnemonic = " ";
const userKavaAddr = " ";


var main = async () => {
    await incomingSwap();
};

var incomingSwap = async () => {
    // Start new Kava client
    kavaClient = new KavaClient(KavaTestnet6000);
    kavaClient.setWallet(userBnbMnemonic);
    await kavaClient.initChain();

    // Start Binance Chain client
    const bnbClient = await new BnbApiClient(BinanceTestnetURL);
    bnbClient.chooseNetwork('testnet');
    const privateKey = bnbCrypto.getPrivateKeyFromMnemonic(
        userBnbMnemonic
    );
    bnbClient.setPrivateKey(privateKey);
    await bnbClient.initChain();

    // -------------------------------------------------------------------------------
    //                       Binance Chain blockchain interaction
    // -------------------------------------------------------------------------------
    // Assets involved in the swap
    const asset = 'BNB';
    const amount = 2 * BNB_CONVERSION_FACTOR;

    // Addresses involved in the swap
    const sender = userBnbAddr; // user's address on Binance Chain
    const recipient = deputyBNBAddr; // deputy's address on Binance Chain
    const senderOtherChain = deputyKavaAddr; // deputy's address on Kava
    const recipientOtherChain = userKavaAddr; // user's address on Kava

    // Format asset/amount parameters as tokens, expectedIncome
    const tokens = [
        {
            denom: asset,
            amount: amount,
        },
    ];
    const expectedIncome = [String(amount), ':', asset].join('');

    // Number of blocks that swap will be active
    const heightSpan = 10005;

    // Generate random number hash from timestamp and hex-encoded random number
    const randomNumber = kavaUtils.generateRandomNumber();
    const timestamp = Math.floor(Date.now() / 1000);
    const randomNumberHash = kavaUtils.calculateRandomNumberHash(
        randomNumber,
        timestamp
    );
    console.log('Secret random number:', randomNumber);

    printSwapIDs(randomNumberHash, sender, senderOtherChain);

    // Send create swap tx using Binance Chain client
    const res = await bnbClient.swap.HTLT(
        sender,
        recipient,
        recipientOtherChain,
        senderOtherChain,
        randomNumberHash,
        timestamp,
        tokens,
        expectedIncome,
        heightSpan,
        true
    );

    if (res && res.status == 200) {
        console.log('\nCreate swap tx hash (Binance Chain): ', res.result[0].hash);
    } else {
        console.log('Tx error:', res);
        return;
    }
    // Wait for deputy to see the new swap on Binance Chain and relay it to Kava
    console.log('Waiting for deputy to witness and relay the swap...');

    // Calculate the expected swap ID on Kava
    const expectedKavaSwapID = kavaUtils.calculateSwapID(
        randomNumberHash,
        senderOtherChain,
        sender
    );
    await kavaClient.getSwap(expectedKavaSwapID, 45000); // 45 seconds

    // -------------------------------------------------------------------------------
    //                           Kava blockchain interaction
    // -------------------------------------------------------------------------------

    // Send claim swap tx using Kava client
    const txHashClaim = await kavaClient.claimSwap(
        expectedKavaSwapID,
        randomNumber
    );
    console.log('Claim swap tx hash (Kava): '.concat(txHashClaim));

    // Check the claim tx hash
    const txRes = await kavaClient.checkTxHash(txHashClaim, 15000);
    console.log('\nTx result:', txRes.raw_log);
};

// Print swap IDs
var printSwapIDs = (randomNumberHash, sender, senderOtherChain) => {
    // Calculate the expected swap ID on origin chain
    const originChainSwapID = kavaUtils.calculateSwapID(
        randomNumberHash,
        sender,
        senderOtherChain
    );

    // Calculate the expected swap ID on destination chain
    const destChainSwapID = kavaUtils.calculateSwapID(
        randomNumberHash,
        senderOtherChain,
        sender
    );

    console.log('Expected Kava swap ID:', originChainSwapID);
    console.log('Expected Bnbchain swap ID:', destChainSwapID);
};

main();
