/* eslint-disable no-tabs */
import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';

autoformat = (value) => {
    let formatter = '0,0.0000';
    value = Math.round(value * 1000) / 1000
    if (Math.round(value) === value)
        formatter = '0,0'
    else if (Math.round(value * 10) === value * 10)
        formatter = '0,0.0'
    else if (Math.round(value * 100) === value * 100)
        formatter = '0,0.00'
    else if (Math.round(value * 1000) === value * 1000)
        formatter = '0,0.000'
    return numbro(value).format(formatter)
}

const coinList = Meteor.settings.public.coins;

export default class Coin {

    static StakingCoin = (coinList == null) ? "" : coinList.find(coin => coin.denom === Meteor.settings.public.bondDenom);
    static MinStake = (coinList == null) ? 0 : 1 / Number(Coin.StakingCoin.fraction);

    constructor(amount, denom = Meteor.settings.public.bondDenom) {
        const lowerDenom = denom.toLowerCase();
        if (coinList == null) {
            this._coin = null;
        } else {
            this._coin = coinList.find(coin =>
                coin.denom.toLowerCase() === lowerDenom || coin.displayName.toLowerCase() === lowerDenom
            );
        }


        if (this._coin) {
            if (lowerDenom === this._coin.denom.toLowerCase()) {
                this._amount = Number(amount);
            } else if (lowerDenom === this._coin.displayName.toLowerCase()) {
                this._amount = Number(amount) * this._coin.fraction;
            }
        } else {
            this._coin = "";
            this._amount = Number(amount);
        }
    }

    get amount() {
        return this._amount;
    }

    get stakingAmount() {
        return (this._coin) ? this._amount / this._coin.fraction : this._amount;
    }

    toString(precision) {
        // default to display in mint denom if it has more than 4 decimal places
        let minStake = Coin.StakingCoin.fraction / (precision ? (10 ** precision) : 10000)
        if (this.amount === 0) {
            return `0 ${this._coin.displayName}`
        } else if (this.amount < minStake) {
            return `${numbro(this.amount).format('0,0.000000' )} ${this._coin.denom}`;
        } else if (!this._coin.displayName) {
            return `${this.stakingAmount ?? 0} ${Coin.StakingCoin.displayName}`
        } else if (this.amount % 1 === 0) {
            return `${this.stakingAmount} ${this._coin.displayName}`
        } else {
            return `${precision?numbro(this.stakingAmount).format('0,0.' + '0'.repeat(precision)):autoformat(this.stakingAmount)} ${this._coin.displayName}`
        }
    }
}