import { IQuoterContract, ProviderOrSigner, TheaNetwork, UniswapPoolFee } from "../../types";
import { amountShouldBeGTZero, consts, ContractWrapper, validateAddress } from "../../utils";
import Quoter_ABI from "../../abi/Quoter_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export class Quoter extends ContractWrapper<IQuoterContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Quoter_ABI, consts[`${network}`].quoterContract);
	}

	/**
	 * Search all pair pools and get the best price for given token in and token out
	 * @param tokenIn - token in address
	 * @param tokenOut - token out address
	 * @param amount - amount of token in
	 * @returns - amount of token out
	 */
	async quoteBestPrice(
		tokenIn: string,
		tokenOut: string,
		amount: BigNumberish
	): Promise<{ amountOut: BigNumber | 0; fee: number }> {
		validateAddress(tokenIn);
		validateAddress(tokenOut);
		amountShouldBeGTZero(amount);

		const fees = Object.values(UniswapPoolFee);

		// Prepare quoute call for each pool fe
		const promises = fees.map((fee) => {
			return this.contract.callStatic.quoteExactInputSingle(tokenIn, tokenOut, fee, amount, 0);
		});

		const result = await Promise.allSettled(promises);

		// Store fees of fulfilled promises
		const fullFilledFees: number[] = [];

		/*eslint no-undef: */
		// Filter fullfilled promises and store their fees
		const fullFilledPromises = result.filter((promise, ind) => {
			if (promise.status === "fulfilled") {
				fullFilledFees.push(fees[+ind]);
				return true;
			} else return false;
		}) as PromiseFulfilledResult<BigNumber>[];

		const bestPrice: { amountOut: BigNumber | 0; fee: number } = {
			amountOut: 0,
			fee: 0
		};

		// If no promises were fullfilled return 0
		if (fullFilledPromises.length === 0) {
			return bestPrice;
		}

		// Find largest amount out and store its fee
		const amountOut = fullFilledPromises.reduce((acc, curr, ind) => {
			if (curr.value.gt(acc)) {
				bestPrice.fee = fullFilledFees[+ind];
				return curr.value;
			}
			return acc;
		}, BigNumber.from(0));

		bestPrice.amountOut = amountOut;

		return bestPrice;
	}
}
