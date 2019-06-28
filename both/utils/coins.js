import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';


export default class Coin {
	static StakingDenom = Meteor.settings.public.stakingDenom.toLowerCase();
	static MintingDenom = Meteor.settings.public.mintingDenom.toLowerCase();
	static StakingFraction = Number(Meteor.settings.public.stakingFraction);
	static MinStake = 1 / Number(Meteor.settings.public.stakingFraction);

	constructor(amount, denom=null) {
		if (typeof amount === 'object')
			({amount, denom} = amount)
		if (!denom || denom.toLowerCase() === Coin.MintingDenom) {
			this._amount = Number(amount);
		} else if (denom.toLowerCase() === Coin.StakingDenom) {
			this._amount = Number(amount) * Coin.StakingFraction;
		}
		else {
			throw Error(`unsupported denom ${denom}`);
		}
	}

	get amount () {
		return this._amount;
	}

	get stakingAmount () {
		return this._amount / Coin.StakingFraction;
	}

	get mint () {
		return `${this._amount} ${Coin.MintingDenom}`;
	}

	get stake () {
		return `${this._amount/Coin.StakingFraction} ${Coin.StakingDenom.toUpperCase()}`;
	}
}