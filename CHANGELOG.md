# Changelog

## kava-3-v1.0.0
### Release Date: 24 Jul 2020

* [#306] Display errors with SDK v0.38 format
* [#301] Using Jazzicon as avatar if no Keybase avatar exists
* [#297] Prettify unrecognized JSON messages
* [#303] Fixed wrong validator display in unjail message
* [#294] Fixed cloneDeep typo in Account section for case-sensitve filesystems.
* [#284] Support Tendermint v0.33 block format
* Fixed Commission bug in AccountTooltip to read rates from validator.commission.commission_rates.rate & validator.commission.rate
* Added Russian transation
* Fixed Unjail message with a correct account address.
* [#323] Display rewards amount in activities list.
* Implemented maximum USDX draw debt amount.
* Implemented min liquidation ratio & min repay debt value.
* Updated CDP display in Account to show BNB:USD and BNB:USD:30 price.
* Updated Withdraw and Repay CDP Price to BNB:USD:30.
* Updated all Ledger's form styling.
* Updated buttons size, added padding & transition.
* Added PeriodicVestingAccount Account Type.
* Implemented Auctions in Nav and Auction Button.
* Implemented Incentive Rewards Claim.
* Change Collateral Deposited and Principal Drawn font to bold in CDP List. 
* Added increase/reduce arrows in CDP list to indicate if the Collateralization Ratio is higher than or close to 1.5 ratio.
* Updated total available KAVA value displayed in 'Send' & 'Delegate' form.
* [#367] Fixed wrong (unbonding) calculation of Total Kava Value.
* [#372] Fixed Redelegation List showing on all account pages  
* [#375] Fixed the Commission Value Calculations that caused Account Page to break 
* [#380] Fixed undefined value of operator_address in withdraw commission
* Updated unbonding calculations

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
