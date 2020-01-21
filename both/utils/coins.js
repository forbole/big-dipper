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

 let coinList = Meteor.settings.public.coins;


export default class Coin {

	
	static StakingDenom = '';
	static StakingDenomPlural = '';
	static MintingDenom = '';
	static StakingFraction = '';
	static MinStake = '';

	coinProperties = (amount, denom) => {
	 
		for (let i in coinList){
			let coin = coinList[i] // if match the denom
	
			if(coin != null)
			{
				let denomType = coin.mintingDenom;
	
				if(denom === denomType)
				{
					Coin.StakingDenom = coin.stakingDenom;
					Coin.StakingDenomPlural = coin.stakingDenomPlural;
					Coin.MintingDenom = coin.mintingDenom;
					Coin.StakingFraction = Number(coin.stakingFraction);
					Coin.MinStake = 1 / Number(coin.stakingFraction);
				}
				
			}
 
			if (!denom || denom.toLowerCase() === Coin.MintingDenom.toLowerCase()) {
				this._amount = Number(amount);
			} 
			else if (denom.toLowerCase() === Coin.StakingDenom.toLowerCase()) {
				this._amount = Number(amount) * Coin.StakingFraction;
			}
		}
	}
	
	constructor(amount, denom=null) {
		 this.coinProperties(amount, denom);
	}

	get amount () {
		return this._amount;
	}

	get stakingAmount () {
		return this._amount / Coin.StakingFraction;
	}

	toString (precision) {
		// default to display in mint denom if it has more than 4 decimal places
		let minStake = Coin.StakingFraction/(precision?Math.pow(10, precision):10000)
		if (this.amount < minStake) {
			return `${numbro(this.amount).format('0,0.0000' )} ${Coin.MintingDenom}`;
		} else {
			return `${precision?numbro(this.stakingAmount).format('0,0.' + '0'.repeat(precision)):autoformat(this.stakingAmount)} ${Coin.StakingDenom}`
		}
	}

	mintString (formatter) {
		let amount = this.amount
		if (formatter) {
			amount = numbro(amount).format(formatter)
		}
		return `${amount} ${Coin.MintingDenom}`;
	}

	stakeString (formatter) {
		let amount = this.stakingAmount
		if (formatter) {
			amount = numbro(amount).format(formatter)
		}
		return `${amount} ${Coin.StakingDenom}`;
	}
}