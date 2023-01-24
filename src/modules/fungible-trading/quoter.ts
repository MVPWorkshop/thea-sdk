import { IQuoterContract, ProviderOrSigner, TheaNetwork, UniswapPoolFee } from "../../types";
import { consts, ContractWrapper, validateAddress } from "../../utils";
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
	async quoteBestPrice(tokenIn: string, tokenOut: string, amount: BigNumberish) {
		validateAddress(tokenIn);
		validateAddress(tokenOut);

		const promises = Object.values(UniswapPoolFee).map((fee) => {
			return this.contract.callStatic.quoteExactInputSingle(tokenIn, tokenOut, fee, amount, 0);
		});

		const result = await Promise.allSettled(promises);
		/*eslint no-undef: 0*/
		const fullFilledPromises = result.filter((r) => r.status === "fulfilled") as PromiseFulfilledResult<BigNumber>[];

		if (fullFilledPromises.length === 0) {
			return 0;
		}

		const bestPrice = fullFilledPromises.reduce((acc, curr) => {
			if (curr.value.gt(acc)) {
				return curr.value;
			}
			return acc;
		}, BigNumber.from(0));

		return bestPrice;
	}
}
