# Changelog

## [Unreleased]
* Dockerize big-dipper
* [#306] Display errors with SDK v0.38 format
* [#301] Using Jazzicon as avatar if no Keybase avatar exists
* [#297] Prettify unrecognized JSON messages
* [#294] Fixed cloneDeep typo in Account section for case-sensitve filesystems.
* [#284] Support Tendermint v0.33 block format

## v0.37.x-patch-11

* [#306] Display errors with SDK v0.38 format
* [#301] Using Jazzicon as avatar if no Keybase avatar exists
* [#297] Prettify unrecognized JSON messages
* [#294] Fixed cloneDeep typo in Account section for case-sensitve filesystems.
* [#284] Support Tendermint v0.33 block format
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
* [#346] Changed "Governanza" typo to "Gobernanza" in Spanish Translation 

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
