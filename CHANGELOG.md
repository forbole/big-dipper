# Changelog

## [UNRELEASED]
* [#529] Upgraded ledger transactions to stargate format
* [#523] Implemented readable messages for IBC messages

## [v0.41.x-14.2]
* Fixes Ledger WebUSB + Chrome 91.x issue (https://github.com/LedgerHQ/ledgerjs/issues/607)

## v0.41.x-14.1
* [#426] Updated proposal tally result, added activeVotingPower value to active proposal collection.
* [#524] Added `noreferrer` to Banner links

## v0.41.x-14
* [#488] Updated missing proposer address in proposals.
* [#486] Fixed delegators voting power display on gov proposals
* [#493] Fixed validators address showing as undefined in links.
* [#491] Fixed query that are called when the gov module is active.
* [#522] Fixed validator commission tx with correct validator operator address when signing with Ledger.

## v0.41.x-13
* [#484] Replaced delegation list displayed under validator page with total number of delegations. 
* [#509] Added display list of addresses available for user to login with when connecting the Ledger.  
* [#497] Fetch keybase with timer settings 
* [#403] Unified token display to show stake denom with 6 decimal places (abandon displaying values in mint denom) and improved the txs by adding gas caluclations before broadcasting the tx to ensure the message will not fail due to insufficient funds to cover the fees. 

## v0.41.x-12
* [#387] Added Bluetooth Ledger support
* Fix transaction simulation bug

## v0.41.x-11
* Replaced Random Validators and Chart components with Latest Blocks and Latest Transactions components on homepage
* Update meta data to align with setting values

## v0.41.x-10
* Bump Meteor to v2.2
## v0.41.x-9
* Added banner support. Banner settings are loading remotely from the url defined in settings.

## v0.41.x-8

* [#487] Fixed typo in the query which make validator power change tx lookup failed.
* Fixed an issue on displaying individual transaction.
* Updated Ledger app name checking so that it will follows the value defined in settings.
* [#213] Updated `@ledgerhq/hw-transport-webusb` pkg to v5.49.0 to fix Ledger errors on Windows10

## v0.41.x-7 (Stargate compatible)

* [#472] Fix missing transactions
* [#449] Migrate API to gRPC gateway
* [#360] Update validator info correctly
* [#311] Update validator status to display validators correctly
* [#321] Enable module related components which will display 0 or hide the components when the Cosmos SDK modules are not implemented
* [#485] Query proposal tally results correctly
* Update transaction skeletons for Ledger to work properly
* Config correct Ledger app and app version

## v0.39.x-7

* [#452] Fix VP Chart not being shown

## v0.39.x-6

* Index transactions with timer settings

## v0.39.x-5

* [#444] Fetch keybase in async function with query interval contolled by settings
* Fix missing value in VP distribution

## v0.39.x-4

* [#436] Index transactions in a separate process
* Update to Meteor 1.12
* [#435] Show inflation as 0% if there is no inflation (no minting module integrated)
* [#433] Create tx index for MsgCreateValidator
* Use react-json-view instead of JSONPretty
* Update uptime with signing info
* [#280] Remove reading genesis file
* Remove plural denom
* Simplify validator storing
* Get data and show proposal based on enabled modules
* Calculate validator uptime in async
* Update validator status

## v0.39.x-3

* [#431] Create correct index for trasaction events

## v0.39.x-2

* [#392] Fixed account page not rendering when the account is empty
* [#413] Fixed validator page error after logging in with Ledger

## v0.39.x-1

* [#425] Fixed `commission_rates` might not exists in `validator.commission` object

## v0.39.x

* [#420] Update brand font
* [#418] Fix avatar at delegation pane
* [#404] Replace "casted" with "cast"
* [#421] Fix NaN on account delegation pane
* [#417] Fix NaN on account total value
* [#416] Add version number to UI
* Bump Meteor to v1.11.1 and update some dependency pcakges with security issues
* Dockerize big-dipper
* [#306] Display errors with SDK v0.38 format
* [#301] Using Jazzicon as avatar if no Keybase avatar exists
* [#297] Prettify unrecognized JSON messages
* [#294] Fixed cloneDeep typo in Account section for case-sensitve filesystems.
* [#284] Support Tendermint v0.33 block format
* [#346] Changed "Governanza" typo to "Gobernanza" in Spanish Translation
* [#375] Fixed the Commission Value Calculations that caused Account Page to break
* [#372] Fixed Redelegation List showing on all account pages  

## v0.37.x-patch-11

* [#303] Fixed wrong validator display in unjail message
* [#294] Fixed cloneDeep typo in Account section for case-sensitve filesystems.
* [#298] Fixed NaN values for Rewards and Commissions that were displayed after clicking Withdrawal Button
* [#288] Add Secp256p1 validator pubkey type. A new paramemter in public setting is added to control whether the validator pubkey is seck256p1 or default ed25519. If `secp256k1` in `settings.json` is set to `true`, it will see all validator pubkeys in Secp256k1 format.
* Fixed Commission bug in AccountTooltip to read rates from validator.commission.commission_rates.rate & validator.commission.rate
* Added Russian transation
* Fixed Unjail message with a correct account address.
* [#323] Display rewards amount in activities list.
* [#327] Fixed error in Proposals section to accept String and Number as a value in Changes table
* Hide Italian it-IT Translation
* Fixed hash overflow on mobile in Transaction Section (Added scroller)

## v0.37.x-patch-10.1

* Fixed a display bug when there is no denom value in the tx fee

## v0.37.x-patch-10

### Release Date: 24 Feb 2020

* Changed the structure of `coins.js` utility and `settings.json`. Information of multiple denoms can be defined in `settings.json`. A `bondDenom` should be defined and coins information is defined in `coins` array. `powerReduction` is the `token / power` ratio which is set to be `1,000,000` by default in the `staking` module. The display value of coins should be set correctly in the `coins` array. An example is as below.

    ```json
        "bondDenom": "umuon",
        "powerReduction": 1000000,
        "coins": [
            {
                "denom": "umuon",
                "displayName": "Muon",
                "displayNamePlural": "Muons",
                "fraction": 1000000
            }
        ],
    ```

* Update Meteor to v1.9
* [#267] Fixed Fee Decimal Places
* [#263] Fixed Tx fee to be displayed in Minting or Staking Denom depending on the fee amount
* [#262] Fixed Validator Popover in Account Section
* [#260] Fixed Token unit to display the correct Denom Name/Type  
* [#227] Added additional info to be displayed for Parameter Change Proposal and Community Pool Spend Proposal
* [#276] Added Coin Selection Dropdown in Account Section to support multiple denomination
* [#289] Updated Coin Selection Dropdown to display the denom as the display (Staking) denom and only show when more than one type of Coin is available.

## v0.37.x-patch-9

### Release Date: 22 Jan 2020

* Added features to disable `gov` and `mint` modules if they don't exist
* [#254] Fixed the delegation order in delegation panel
* [#253] Fixed total delegation became wrong after adding rewards
* Added Polish transation
* Added Spanish translation
* [#240] Fixed commission sorting
* [#239] Fixed Coin untilty. Now it shows coins from the chain matching with the `settings.json` if configuration exist. Please note there is a new `coins` object in the [`settings.json`](https://github.com/forbole/big_dipper/blob/master/default_settings.json#L17) to define the display parameters of each coin
* [#238] Styled the tooltip not to block the validator info
* [#230] Removed the delegation shares in account's delegation panel
* [#229] Fixed the account address display
* [#228] Added rewards column to account's delegation panel
* Added memo button in each transaction
