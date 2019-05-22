import { Meteor } from 'meteor/meteor';
import { App, comm_u2f } from "ledger-cosmos-js"
import { signatureImport } from "secp256k1"
import semver from "semver"
import bech32 from "bech32";
import secp256k1 from "secp256k1";
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"


const INTERACTION_TIMEOUT = 120000 // seconds to wait for user action on Ledger, currently is always limited to 60
const REQUIRED_COSMOS_APP_VERSION = "1.5.0"
const DEFAULT_MEMO = 'Sent via Big Dipper'
const DEFAULT_DENOM = 'uatom';
const DEFAULT_GAS = 200000;
const DEFAULT_GAS_PRICE = 0.025;

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
const HDPATH = [44, 118, 0, 0, 0]
const BECH32PREFIX = `cosmos`

function bech32ify(address, prefix) {
  const words = bech32.toWords(address)
  return bech32.encode(prefix, words)
}

function createCosmosAddress(publicKey) {
  const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
  const hash = ripemd160(sha256(message)).toString()
  const address = Buffer.from(hash, `hex`)
  const cosmosAddress = bech32ify(address, `cosmos`)

  return cosmosAddress
}

export class Ledger {
    constructor({ testModeAllowed }) {
        this.testModeAllowed = testModeAllowed
    }


  // test connection and compatibility
  async testDevice() {
    // poll device with low timeout to check if the device is connected
    const secondsTimeout = 3 // a lower value always timeouts
    await this.connect(secondsTimeout)
  }
  async isSendingData() {
    // check if the device is connected or on screensaver mode
    const response = await this.cosmosApp.publicKey(HDPATH)
    this.checkLedgerErrors(response, {
      timeoutMessag: "Could not find a connected and unlocked Ledger device"
    })
  }
  async isReady() {
    // check if the version is supported
    const version = await this.getCosmosAppVersion()

    if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
      const msg = `Outdated version: Please update Ledger Cosmos App to the latest version.`
      throw new Error(msg)
    }

    // throws if not open
    await this.isCosmosAppOpen()
  }
  // connects to the device and checks for compatibility
  async connect(timeout = INTERACTION_TIMEOUT) {
    // assume well connection if connected once
    if (this.cosmosApp) return

    const communicationMethod = await comm_u2f.create_async(timeout, true)
    const cosmosLedgerApp = new App(communicationMethod)

    this.cosmosApp = cosmosLedgerApp

    await this.isSendingData()
    await this.isReady()
  }
  async getCosmosAppVersion() {
    await this.connect()

    const response = await this.cosmosApp.get_version()
    this.checkLedgerErrors(response)
    const { major, minor, patch, test_mode } = response
    checkAppMode(this.testModeAllowed, test_mode)
    const version = versionString({ major, minor, patch })

    return version
  }
  async isCosmosAppOpen() {
    await this.connect()

    const response = await this.cosmosApp.appInfo()
    this.checkLedgerErrors(response)
    const { appName } = response

    if (appName.toLowerCase() !== `cosmos`) {
      throw new Error(`Close ${appName} and open the Cosmos app`)
    }
  }
  async getPubKey() {
    await this.connect()

    const response = await this.cosmosApp.publicKey(HDPATH)
    this.checkLedgerErrors(response)
    return response.compressed_pk
  }
  async getCosmosAddress() {
    await this.connect()

    const pubKey = await this.getPubKey(this.cosmosApp)
    return createCosmosAddress(pubKey)
  }
  async confirmLedgerAddress() {
    await this.connect()
    const cosmosAppVersion = await this.getCosmosAppVersion()

    if (semver.lt(cosmosAppVersion, REQUIRED_COSMOS_APP_VERSION)) {
      // we can't check the address on an old cosmos app
      return
    }

    const response = await this.cosmosApp.getAddressAndPubKey(
      BECH32PREFIX,
      HDPATH
    )
    this.checkLedgerErrors(response, {
      rejectionMessage: "Displayed address was rejected"
    })
  }
  async sign(signMessage) {
    await this.connect()

    const response = await this.cosmosApp.sign(HDPATH, signMessage)
    this.checkLedgerErrors(response)
    // we have to parse the signature from Ledger as it's in DER format
    const parsedSignature = signatureImport(response.signature)
    return parsedSignature
  }

  /* istanbul ignore next: maps a bunch of errors */
  checkLedgerErrors(
    { error_message, device_locked },
    {
      timeoutMessag = "Connection timed out. Please try again.",
      rejectionMessage = "User rejected the transaction"
    } = {}
  ) {
    if (device_locked) {
      throw new Error(`Ledger's screensaver mode is on`)
    }
    switch (error_message) {
      case `U2F: Timeout`:
        throw new Error(timeoutMessag)
      case `Cosmos app does not seem to be open`:
        throw new Error(`Cosmos app is not open`)
      case `Command not allowed`:
        throw new Error(`Transaction rejected`)
      case `Transaction rejected`:
        throw new Error(rejectionMessage)
      case `Unknown error code`:
        throw new Error(`Ledger's screensaver mode is on`)
      case `Instruction not supported`:
        throw new Error(
          `Your Cosmos Ledger App is not up to date. ` +
            `Please update to version ${REQUIRED_COSMOS_APP_VERSION}.`
        )
      case `No errors`:
        // do nothing
        break
      default:
        throw new Error(error_message)
    }
  }
}

function versionString({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

export const checkAppMode = (testModeAllowed, testMode) => {
  if (testMode && !testModeAllowed) {
    throw new Error(
      `DANGER: The Cosmos Ledger app is in test mode and shouldn't be used on mainnet!`
    )
  }
}

export function canonicalizeJson(jsonTx) {
    if (Array.isArray(jsonTx)) {
        return jsonTx.map(canonicalizeJson);
    }
    if (typeof jsonTx !== 'object') {
        return jsonTx;
    }
    const tmp = {};
    Object.keys(jsonTx).sort().forEach((key) => {
        // eslint-disable-next-line no-unused-expressions
        jsonTx[key] != null && (tmp[key] = jsonTx[key]);
    });

    return tmp;
}

export function getBytesToSign(tx, txContext) {
    if (typeof txContext === 'undefined') {
        throw new Error('txContext is not defined');
    }
    if (typeof txContext.chainId === 'undefined') {
        throw new Error('txContext does not contain the chainId');
    }
    if (typeof txContext.accountNumber === 'undefined') {
        throw new Error('txContext does not contain the accountNumber');
    }
    if (typeof txContext.sequence === 'undefined') {
        throw new Error('txContext does not contain the sequence value');
    }

    const txFieldsToSign = {
        account_number: txContext.accountNumber.toString(),
        chain_id: txContext.chainId,
        fee: tx.value.fee,
        memo: tx.value.memo,
        msgs: tx.value.msg,
        sequence: txContext.sequence.toString(),
    };

    return JSON.stringify(canonicalizeJson(txFieldsToSign));
}

export function applyGas(unsignedTx, gas) {
    if (typeof unsignedTx === 'undefined') {
        throw new Error('undefined unsignedTx');
    }
    if (typeof gas === 'undefined') {
        throw new Error('undefined gas');
    }

    // eslint-disable-next-line no-param-reassign
    unsignedTx.value.fee = {
        // amount: [{
        //     amount: (gas * DEFAULT_GAS_PRICE).toString(),
        //     denom: DEFAULT_DENOM,
        // }],
        amount: [],
        gas: gas.toString(),
    };

    return unsignedTx;
}

// Creates a new tx skeleton
export function createSkeleton(txContext) {
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.accountNumber === 'undefined') {
        throw new Error('txContext does not contain the accountNumber');
    }
    if (typeof txContext.sequence === 'undefined') {
        throw new Error('txContext does not contain the sequence value');
    }
    const txSkeleton = {
        type: 'auth/StdTx',
        value: {
            msg: [], // messages
            fee: '',
            memo: txContext.memo || DEFAULT_MEMO,
            signatures: [{
                signature: 'N/A',
                account_number: txContext.accountNumber.toString(),
                sequence: txContext.sequence.toString(),
                pub_key: {
                    type: 'tendermint/PubKeySecp256k1',
                    value: txContext.pk || 'PK',
                },
            }],
        },
    };
    return applyGas(txSkeleton, DEFAULT_GAS);
}

export function applySignature(unsignedTx, txContext, secp256k1Sig) {
    if (typeof unsignedTx === 'undefined') {
        throw new Error('undefined unsignedTx');
    }
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.pk === 'undefined') {
        throw new Error('txContext does not contain the public key (pk)');
    }
    if (typeof txContext.accountNumber === 'undefined') {
        throw new Error('txContext does not contain the accountNumber');
    }
    if (typeof txContext.sequence === 'undefined') {
        throw new Error('txContext does not contain the sequence value');
    }

    const tmpCopy = Object.assign({}, unsignedTx, {});

    tmpCopy.value.signatures = [
        {
            signature: secp256k1Sig.toString('base64'),
            account_number: txContext.accountNumber.toString(),
            sequence: txContext.sequence.toString(),
            pub_key: {
                type: 'tendermint/PubKeySecp256k1',
                value: txContext.pk//Buffer.from(txContext.pk, 'hex').toString('base64'),
            },
        },
    ];
    return tmpCopy;
}

// Creates a new delegation tx based on the input parameters
// the function expects a complete txContext
export function createDelegate(
    txContext,
    validatorBech32,
    uatomAmount,
    memo,
) {
    const txSkeleton = createSkeleton(txContext);

    const txMsg = {
        type: 'cosmos-sdk/MsgDelegate',
        value: {
            amount: {
                amount: uatomAmount.toString(),
                denom: txContext.denom,
            },
            delegator_address: txContext.bech32,
            validator_address: validatorBech32,
        },
    };

    txSkeleton.value.msg = [txMsg];
    txSkeleton.value.memo = memo || '';

    return txSkeleton;
}

// Creates a new undelegation tx based on the input parameters
// the function expects a complete txContext
export function createUndelegate(
    txContext,
    validatorBech32,
    uatomAmount,
    memo,
) {
    const txSkeleton = createSkeleton(txContext);

    const txMsg = {
        type: 'cosmos-sdk/MsgUndelegate',
        value: {
            amount: {
                amount: uatomAmount.toString(),
                denom: DEFAULT_DENOM,
            },
            delegator_address: txContext.bech32,
            validator_address: validatorBech32,
        },
    };

    txSkeleton.value.msg = [txMsg];
    txSkeleton.value.memo = memo || '';

    return txSkeleton;
}

// Creates a new redelegation tx based on the input parameters
// the function expects a complete txContext
export function createRedelegate(
    txContext,
    validatorSourceBech32,
    validatorDestBech32,
    uatomAmount,
    memo,
) {
    const txSkeleton = createSkeleton(txContext);

    const txMsg = {
        type: 'cosmos-sdk/MsgBeginRedelegate',
        value: {
            amount: {
                amount: uatomAmount.toString(),
                denom: DEFAULT_DENOM,
            },
            delegator_address: txContext.bech32,
            validator_dst_address: validatorDestBech32,
            validator_src_address: validatorSourceBech32,
        },
    };

    txSkeleton.value.msg = [txMsg];
    txSkeleton.value.memo = memo || '';

    return txSkeleton;
}
