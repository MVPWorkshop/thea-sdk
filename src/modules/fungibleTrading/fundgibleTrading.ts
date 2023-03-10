import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractReceipt } from "@ethersproject/contracts";
import {
	ProviderOrSigner,
	FungibleOptions,
	TheaNetwork,
	ExactInputSingleParams,
	FungibleStableOptions,
	SwapOptions,
	POOL_FEE
} from "../../types";
import {
	consts,
	DEFAULT_SLIPPAGE_TOLERANCE,
	getAddress,
	getERC20ContractAddress,
	signerRequired,
	TheaError
} from "../../utils";
import { Quoter } from "./quoter";
import { SwapRouter } from "./swapRouter";

export class FungibleTrading {
	readonly quoter: Quoter;
	readonly swapRouter: SwapRouter;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.quoter = new Quoter(providerOrSigner, network);
		this.swapRouter = new SwapRouter(providerOrSigner, network);
	}

	/**
	 * Function to swap Thea tokens from ERC20 to stable coin, or vice versa
	 * @param options.tokenIn - token in name
	 * @param options.tokenOut - token out name
	 * @param options.amount - amount in
	 * @param swapOptions.slippageTolerance - slippage tolerance. Default is 0.5%
	 * @param swapOptions.deadline - deadline of swap exectution
	 * @param swapOptions.recipient - specify recipient address
	 * @returns ContractReceipt
	 */
	async swapTokens(options: FungibleOptions, swapOptions?: SwapOptions): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		const { tokenIn, tokenOut } = this.getTokenInAndOutAddress(options);

		const amountOut = await this.quoter.quoteBestPrice(tokenIn, tokenOut, options.amountIn);

		if (amountOut.eq(BigNumber.from(0))) {
			throw new TheaError({ type: "INVALID_TOKEN_PRICE", message: "Coudn't fetch best token price from pair pools" });
		}

		const { slippageTolerance, deadline, recipient } = this.extractSwapOptions(
			await getAddress(this.providerOrSigner as Signer),
			swapOptions
		);

		const amountOutMinimum = this.getAmountOutMinimum(amountOut, slippageTolerance);

		const swapParams: ExactInputSingleParams = {
			tokenIn,
			tokenOut,
			fee: POOL_FEE,
			recipient,
			deadline,
			amountIn: options.amountIn,
			amountOutMinimum,
			sqrtPriceLimitX96: 0
		};

		return this.swapRouter.swap(swapParams, options.tokenIn);
	}
	/**
	 * Get token price by querying specific pair's pool
	 * @param token - token in @see TheaERC20Token
	 * @param amount - amount of token in
	 * @returns - amount of token out in WEI
	 */
	async queryTokenPrice(options: FungibleOptions): Promise<string> {
		const { tokenIn, tokenOut } = this.getTokenInAndOutAddress(options);
		const amountOut = await this.quoter.quoteBestPrice(tokenIn, tokenOut, options.amountIn);
		return amountOut.toString();
	}

	/**
	 * Determines tokenIn and tokenOut address based on options for quering token price or swap.
	 * @param options
	 * @returns tokenIn and tokenOut address
	 */
	private getTokenInAndOutAddress(options: FungibleOptions): { tokenIn: string; tokenOut: string } {
		const stableTokenAddress = consts[`${this.network}`].stableTokenContract;
		let tokenInAddress = "";
		let tokenOutAddress = "";
		if (options.tokenIn === "Stable") {
			tokenInAddress = stableTokenAddress;
			tokenOutAddress = getERC20ContractAddress((options as FungibleStableOptions).tokenOut, this.network);
		} else {
			tokenInAddress = getERC20ContractAddress(options.tokenIn, this.network);
			tokenOutAddress = stableTokenAddress;
		}
		return { tokenIn: tokenInAddress, tokenOut: tokenOutAddress };
	}

	private extractSwapOptions(recipient: string, options?: SwapOptions): Required<SwapOptions> {
		return {
			slippageTolerance: options?.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE,
			deadline: this.getDeadline(options?.deadline),
			recipient: options?.recipient ?? recipient
		};
	}

	// Calculates minimum amount of token out based on slippage tolerance.
	private getAmountOutMinimum(amountOut: BigNumber, slippageTolerance: number): BigNumber {
		slippageTolerance = this.checkSlippageTollerance(slippageTolerance);

		const percent = BigNumber.from(slippageTolerance * 100);

		return amountOut.sub(amountOut.mul(percent).div(10000));
	}

	// Slippage tolerance is a number between 0 and 1 and it can have only 2 decimal places.
	private checkSlippageTollerance(slippageTolerance: number): number {
		if (slippageTolerance > 1 || slippageTolerance < 0) {
			throw new TheaError({
				type: "INVALID_SLIPPAGE_TOLERANCE_VALUE",
				message: "Slippage tolerance can't be greater than 1 or less then 0"
			});
		}

		return Number(slippageTolerance.toString().substring(0, 4));
	}

	// Unix timestamp after which the transaction will revert.
	private getDeadline(deadline?: number): number {
		const defaultDeadLine = Math.floor(Date.now() / 1000 + 1800); // 30min
		if (deadline && deadline < defaultDeadLine) {
			throw new TheaError({ type: "INVALID_DEADLINE", message: "Deadline can't be in past" });
		}
		return deadline ? deadline : defaultDeadLine;
	}
}
