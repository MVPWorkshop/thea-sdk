import { BigNumber } from "@ethersproject/bignumber";
import { ProviderOrSigner, QueryOptions, TheaNetwork } from "../../types";
import { consts, getERC20ContractAddress } from "../../utils";
import { Quoter } from "./quoter";

export class FungibleTrading {
	readonly quoter: Quoter;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.quoter = new Quoter(providerOrSigner, network);
	}

	/**
	 * Get token price by searching all pair pools.
	 * If function returns 0, it means there is no pool for given token pair or something went wrong.
	 * @param token - token in
	 * @param amount - amount of token in
	 * @returns - amount of token out.
	 */
	async queryTokenPrice(options: QueryOptions): Promise<BigNumber | 0> {
		const { tokenIn, tokenOut } = this.getTokenInAndOutAddress(options);
		const result = await this.quoter.quoteBestPrice(tokenIn, tokenOut, options.amount);
		return result;
	}

	/**
	 * Determines tokenIn and tokenOut address based on options for quering token price or swap.
	 * @param options
	 * @returns tokenIn and tokenOut address
	 */
	private getTokenInAndOutAddress(options: QueryOptions): { tokenIn: string; tokenOut: string } {
		const stableTokenAddress = consts[`${this.network}`].stableTokenContract;
		let tokenInAddress = "";
		let tokenOutAddress = "";
		if (options.tokenIn === "Stable") {
			tokenInAddress = stableTokenAddress;
			tokenOutAddress = getERC20ContractAddress(options.tokenOut, this.network);
		} else {
			tokenInAddress = getERC20ContractAddress(options.tokenIn, this.network);
			tokenOutAddress = stableTokenAddress;
		}
		return { tokenIn: tokenInAddress, tokenOut: tokenOutAddress };
	}
}
