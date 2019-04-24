export const numeralRounding = (value) => {
	/* To be used as rounding function for Numeral formatting.
	This is a workaround for a bug where formatting will return NaN when a value
	is expressed in exponential notation. */
	let tokens = value.toString().split('e');
	if (tokens.length > 2) {
		let exponents = tokens.slice(1).reduce(
			(sum, exponent) => sum + Number(exponent), 0);
		value = `${tokens[0]}e${exponents}`;
	}
	return Math.round(value);
}