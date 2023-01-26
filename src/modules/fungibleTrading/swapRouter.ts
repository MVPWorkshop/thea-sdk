import { ExactInputSingleParams, ProviderOrSigner, ISwapRouterContract, SwapTokens, TheaNetwork } from "../../types";
import { consts, ContractWrapper, signerRequired, validateAddress } from "../../utils";
import SwapRouter_ABI from "../../abi/SwapRouter_ABI.json";
import { ContractReceipt } from "@ethersproject/contracts";
import { approve, checkBalance, execute } from "../shared";
import { Signer } from "@ethersproject/abstract-signer";

export class SwapRouter extends ContractWrapper<ISwapRouterContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, SwapRouter_ABI, consts[`${network}`].swapRouterContract);
	}

	/**
	 * Function calls exactInputSingle function of SwapRouter contract to swap tokens
	 * @param params.tokenIn - token in address
	 * @param params.tokenOut - token out address
	 * @param params.fee - pool fee
	 * @param params.recipient - recipient address
	 * @param params.amountIn - amount in
	 * @param params.amountOutMinimum - minimum amount out
	 * @param params.deadline - deadline
	 * @param params.sqrtPriceLimitX96 - sqrt price limit
	 * @returns ContractTransaction
	 */
	async swap(params: ExactInputSingleParams, tokenIn: SwapTokens): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		[params.tokenIn, params.tokenOut, params.recipient].forEach((address) => validateAddress(address));

		// Check balance of token in
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: params.amountIn,
			tokenName: tokenIn
		});

		// Approve token in if needed
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			tokenName: tokenIn,
			amount: params.amountIn,
			spender: this.contractDetails.address
		});

		return execute(this.contract.exactInputSingle(params), {
			...this.contractDetails,
			contractFunction: "exactInputSingle"
		});
	}
}
