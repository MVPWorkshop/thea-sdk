import { FungibleOptions, FungibleStableOptions, ProviderOrSigner, TheaNetwork, TradeType } from "../types";
import { AlphaRouter, CurrencyAmount, SwapType, SwapRoute } from "@uniswap/smart-order-router";
import { Percent, Token } from "@uniswap/sdk-core";
import { BaseProvider } from "@ethersproject/providers";
import { ethToWei, getToken, theaNetworkToChainId } from "../utils";
import { parseEther } from "@ethersproject/units";

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
			amountIn: <string>options.amountIn,
			recipient: options.recipient,
			slippageTolerance: this.defaultSlippageTolerance(),
			deadline: this.getDeadline()
		});

		if (route) return ethToWei(route.quote.toExact());
		else return null;
	}

	async findBestRoute(
		tokenIn: Token,
		tokenOut: Token,
		options: { amountIn: string; recipient: string; slippageTolerance: Percent; deadline: number }
	): Promise<SwapRoute | null> {
		const route = await this.router.route(
			CurrencyAmount.fromRawAmount(tokenIn, parseEther(options.amountIn).toString()),
			tokenOut,
			TradeType.EXACT_INPUT,
			{
				...options,
				type: SwapType.SWAP_ROUTER_02
			}
		);

		return route;
	}

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

	// Unix timestamp after which the transaction will revert.
	private getDeadline(): number {
		return Math.floor(Date.now() / 1000 + 1800); // 30min
	}

	private defaultSlippageTolerance() {
		return new Percent("50", "10000"); // 0.5%
	}
}
