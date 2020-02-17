# Changelog

## [Unreleased]
* Update Meteor to v1.9
* [#267] Fixed Fee Decimal Places
* [#263] Fixed Tx fee to be displayed in Minting or Staking Denom depending on the fee amount
* [#262] Fixed Validator Popover in Account Section 
* [#260] Fixed Token unit to display the correct Denom Name/Type  
* [#227] Added additional info to be displayed for Parameter Change Proposal and Community Pool Spend Proposal

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
