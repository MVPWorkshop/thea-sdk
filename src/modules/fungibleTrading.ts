import {
	FungibleOptions,
	FungibleStableOptions,
	ProviderOrSigner,
	SwapOptions,
	TheaNetwork,
	TradeType
} from "../types";
import { AlphaRouter, CurrencyAmount, SwapType, SwapRoute } from "@uniswap/smart-order-router";
import { Percent, Token } from "@uniswap/sdk-core";
import { BaseProvider, TransactionReceipt } from "@ethersproject/providers";
import { consts, ethToWei, getToken, signerRequired, TheaError, theaNetworkToChainId } from "../utils";
import { BigNumber } from "@ethersproject/bignumber";
import { approve, checkBalance, execute } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class FungibleTrading {
	readonly router: AlphaRouter;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.router = new AlphaRouter({
			chainId: theaNetworkToChainId(network),
			provider: providerOrSigner as BaseProvider
		});
	}

	async queryTokenPrice(options: FungibleOptions): Promise<string | null> {
		const { tokenIn, tokenOut } = this.getTokens(options);
		const route = await this.findBestRoute(tokenIn, tokenOut, {
			amountIn: options.amountIn,
			recipient: options.recipient,
			slippageTolerance: this.getSlippageTolerance(),
			deadline: this.getDeadline()
		});

		if (route) return ethToWei(route.quote.toExact());
		else return null;
	}

	async swapTokens(options: FungibleOptions, swapOptions?: SwapOptions): Promise<TransactionReceipt> {
		signerRequired(this.providerOrSigner);
		const { tokenIn, tokenOut } = this.getTokens(options);
		const { slippageTolerance, deadline } = this.extractSwapOptions(swapOptions);
		const route = await this.findBestRoute(tokenIn, tokenOut, {
			amountIn: options.amountIn,
			recipient: options.recipient,
			slippageTolerance,
			deadline
		});

		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: options.amountIn,
			tokenName: options.tokenIn
		});

		const spender = consts[`${this.network}`].swapRouterContract;
		// Approve token in if needed
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			tokenName: options.tokenIn,
			amount: options.amountIn,
			spender
		});

		if (route?.methodParameters?.calldata) {
			const signer = this.providerOrSigner as Signer;
			return execute(signer.sendTransaction(this.buildSwapTransaction(await signer.getAddress(), spender, route)), {
				address: spender,
				contractFunction: "exactInputSingle",
				name: "SwapRouter"
			});
		}

		throw new TheaError({
			type: "ERROR_FINDING_SWAP_ROUTE",
			message: "Could not find a swap route"
		});
	}

	async findBestRoute(
		tokenIn: Token,
		tokenOut: Token,
		options: { amountIn: BigNumber; recipient: string; slippageTolerance: Percent; deadline: number }
	): Promise<SwapRoute | null> {
		const route = await this.router.route(
			CurrencyAmount.fromRawAmount(tokenIn, options.amountIn.toString()),
			tokenOut,
			TradeType.EXACT_INPUT,
			{
				...options,
				type: SwapType.SWAP_ROUTER_02
			}
		);

		return route;
	}

	private buildSwapTransaction = (sender: string, routerAddress: string, route: SwapRoute) => {
		return {
			data: route.methodParameters?.calldata,
			to: routerAddress,
			value: BigNumber.from(route?.methodParameters?.value),
			from: sender,
			gasPrice: BigNumber.from(route.gasPriceWei),
			gasLimit: BigNumber.from(route.estimatedGasUsed).div(100).mul(115) // Add a 15% buffer on top.
		};
	};
	private getTokens(options: FungibleOptions): { tokenIn: Token; tokenOut: Token } {
		let tokenIn: Token;
		let tokenOut: Token;
		if (options.tokenIn === "DAI") {
			tokenIn = getToken(this.network, "DAI");
			tokenOut = getToken(this.network, (options as FungibleStableOptions).tokenOut);
		} else {
			tokenIn = getToken(this.network, options.tokenIn);
			tokenOut = getToken(this.network, "DAI");
		}

		return { tokenIn, tokenOut };
	}

	private extractSwapOptions(options?: SwapOptions): { slippageTolerance: Percent; deadline: number } {
		return {
			slippageTolerance: options?.slippageTolerance
				? this.getSlippageTolerance(options.slippageTolerance)
				: this.getSlippageTolerance(),
			deadline: options?.deadline ?? this.getDeadline()
		};
	}

	// Unix timestamp after which the transaction will revert.
	private getDeadline(): number {
		return Math.floor(Date.now() / 1000 + 1800); // 30min
	}

	// Default slippage tolerance is 0.5%
	private getSlippageTolerance(slippageTolerance = 0.5): Percent {
		return new Percent(this.checkSlippageTollerance(slippageTolerance) * 100, 10000);
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
}
