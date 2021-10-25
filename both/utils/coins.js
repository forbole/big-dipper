/* eslint-disable no-tabs */
import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';
import BigNumber from 'bignumber.js';

autoformat = (value) => {
    let formatter = '0,0.0000';
    value = Math.round(value * 1000) / 1000
    if (Math.round(value) === value)
        formatter = '0,0'
    else if (Math.round(value*10) === value*10)
        formatter = '0,0.0'
    else if (Math.round(value*100) === value*100)
        formatter = '0,0.00'
    else if (Math.round(value*1000) === value*1000)
        formatter = '0,0.000'
    return numbro(value).format(formatter)
}

getDecimals = (fraction) => {
    return fraction.toString().length - 1;
}

const coinList = Meteor.settings.public.coins;

export default class Coin {

static StakingCoin = coinList.find(coin => coin.denom === Meteor.settings.public.bondDenom);
static MinStake = 1 / Number(Coin.StakingCoin.fraction);

constructor(amount, denom=Meteor.settings.public.bondDenom) {
    const lowerDenom = denom.toLowerCase();
    
    this._coin = coinList.find(coin =>
        coin.denom.toLowerCase() === lowerDenom || coin.displayName.toLowerCase() === lowerDenom
    );

    if (this._coin){
        if (lowerDenom === this._coin.denom.toLowerCase()) {
            this._amount = new BigNumber(amount);
        } else if (lowerDenom === this._coin.displayName.toLowerCase()) {
            this._amount = (new BigNumber(amount)).decimalPlaces(getDecimals(Coin.StakingCoin.fraction)).multipliedBy(this._coin.fraction);
        }
    }
    else {
        this._coin = "";
        this._amount = new BigNumber(amount);
    }
}

get amount () {
    return this._amount;
}

set amount (amount) {
    this._amount = new BigNumber(amount);
}
get stakingAmount () {
    return (this._coin) ? this._amount.dividedBy(this._coin.fraction) : this._amount;
}

get denom() {
    return this._coin.denom;
}

toString (precision) {
    let result = '';
    // default to display in mint denom if it has more than 4 decimal places
    let minStake = Coin.StakingCoin.fraction / (precision ? (10 ** precision) : 10000)
    if (this.amount < minStake) {
        result =  `${numbro(this.amount).format('0,0.0000')} ${this._coin.denom}`;
    } else {
        result =  `${precision ? numbro(this.stakingAmount).format('0,0.' + '0'.repeat(precision)) : autoformat(this.stakingAmount)} ${this._coin.displayName}`
    }
    
    return result;
}

mintString (formatter) {
    let amount = this.amount
    if (formatter) {
        amount = numbro(amount).format(formatter)
    }

    let denom = (this._coin == "")?Coin.StakingCoin.displayName:this._coin.denom;
    return `${amount} ${denom}`;
}

stakeString (formatter) {
    let amount = this.stakingAmount
    if (formatter) {
        amount = numbro(amount).format(formatter)
    } else {
        amount = numbro(amount).format("0." + `${this._coin.fraction}`.substr(1))
    }

    return `${amount} ${Coin.StakingCoin.displayName}`;
}
}