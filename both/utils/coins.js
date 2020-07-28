import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';

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

const coinList = Meteor.settings.public.coins;
for (let i in coinList) {
	const coin = coinList[i];
	if (!coin.displayNamePlural) {
		coin.displayNamePlural = coin.displayName + 's';
	}
}


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
				this._amount = Number(amount);
			} else if (lowerDenom === this._coin.displayName.toLowerCase()) {
				this._amount = Number(amount) * this._coin.fraction;
			}
		}
		else {
			this._coin = "";
			this._amount = Number(amount);
		}
	}

	get amount () {
		return this._amount;
	}

	get denom() {
		return this._denom;
	}

	get stakingAmount () {
		return (this._coin)?this._amount / this._coin.fraction:this._amount;
	}

	toString (precision) {
		// default to display in mint denom if it has more than 4 decimal places
		let minStake = Coin.StakingCoin.fraction/(precision?Math.pow(10, precision):10000)
		if (this.amount < minStake) {
			return `${numbro(this.amount).format('0,0.0000' )} ${this._coin.denom}`;
		} 
		else {
			return `${precision?numbro(this.stakingAmount).format('0,0.' + '0'.repeat(precision)):autoformat(this.stakingAmount)} ${this._coin.displayName}`
		}
	}

	// Return value in corresponding staking denom (no multiplications)
	convertToString(precision){
		return `${precision?numbro(this._amount).format('0,0.' + '0'.repeat(precision)):autoformat(this._amount)} ${this._coin.displayName}`	
	}

	//retrun value in mint String 
	mintString (formatter) {
		let amount = this.amount
		if (formatter) {
			amount = numbro(amount).format(formatter)
		}

		let denom = (this._coin == "")?Coin.StakingCoin.displayName:this._coin.denom;
		return `${amount} ${denom}`;
	}

	//return value along with bonding (staking) denom type
	stakeString (formatter) {
		let amount = this.stakingAmount
		if (formatter) {
			amount = numbro(amount).format(formatter)
		}
		return `${amount} ${Coin.StakingCoin.displayName}`;
	}
}