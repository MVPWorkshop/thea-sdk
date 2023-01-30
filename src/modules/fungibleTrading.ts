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
import {
	consts,
	ethToWei,
	getToken,
	isSigner,
	signerRequired,
	TheaError,
	theaNetworkToChainId,
	amountShouldBeGTZero
} from "../utils";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { approve, checkBalance, execute } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class FungibleTrading {
	readonly router: AlphaRouter;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.router = new AlphaRouter({
			chainId: theaNetworkToChainId(network),
			provider: this.extractProvider(providerOrSigner)
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

		const amountIn = ethToWei(options.amountIn.toString());
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: amountIn,
			tokenName: options.tokenIn
		});

		const spender = consts[`${this.network}`].swapRouterContract;
		// Approve token in if needed
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			tokenName: options.tokenIn,
			amount: amountIn,
			spender
		});

		if (!route || !route.methodParameters)
			throw new TheaError({
				type: "ERROR_FINDING_SWAP_ROUTE",
				message: "Could not find a swap route"
			});
		const methodParameters = route.methodParameters;

		const signer = this.providerOrSigner as Signer;
		return execute(
			signer.sendTransaction(
				this.buildSwapTransaction(await signer.getAddress(), spender, methodParameters.calldata, methodParameters.value)
			),
			{
				address: spender,
				contractFunction: "tokenSwap",
				name: "SwapRouter"
			}
		);
	}

	async findBestRoute(
		tokenIn: Token,
		tokenOut: Token,
		options: { amountIn: BigNumberish; recipient: string; slippageTolerance: Percent; deadline: number }
	): Promise<SwapRoute | null> {
		amountShouldBeGTZero(options.amountIn);
		const route = await this.router.route(
			CurrencyAmount.fromRawAmount(tokenIn, ethToWei(options.amountIn.toString())),
			tokenOut,
			TradeType.EXACT_INPUT,
			{
				recipient: options.recipient,
				slippageTolerance: options.slippageTolerance,
				deadline: options.deadline,
				type: SwapType.SWAP_ROUTER_02
			}
		);

		return route;
	}

	private buildSwapTransaction = (sender: string, routerAddress: string, calldata: string, value: string) => {
		return {
			data: calldata,
			to: routerAddress,
			value: BigNumber.from(value),
			from: sender
		};
	};
	private getTokens(options: FungibleOptions): { tokenIn: Token; tokenOut: Token } {
		const tokenIn = getToken(this.network, options.tokenIn === "Stable" ? "Stable" : options.tokenIn);
		const tokenOut = getToken(
			this.network,
			options.tokenIn === "Stable" ? (options as FungibleStableOptions).tokenOut : "Stable"
		);

		return { tokenIn, tokenOut };
	}

	private extractSwapOptions(options?: SwapOptions): { slippageTolerance: Percent; deadline: number } {
		return {
			slippageTolerance: options?.slippageTolerance
				? this.getSlippageTolerance(options.slippageTolerance)
				: this.getSlippageTolerance(),
			deadline: this.getDeadline(options?.deadline)
		};
	}

	// Unix timestamp after which the transaction will revert.
	private getDeadline(deadline?: number): number {
		const defaultDeadLine = Math.floor(Date.now() / 1000 + 1800); // 30min
		if (deadline && deadline < defaultDeadLine) {
			throw new TheaError({ type: "INVALID_DEADLINE", message: "Deadline can't be in past" });
		}
		return deadline ? deadline : defaultDeadLine;
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

	private extractProvider(providerOrSigner: ProviderOrSigner): BaseProvider {
		let provider: BaseProvider;
		if (isSigner(providerOrSigner)) {
			if (providerOrSigner.provider) provider = providerOrSigner.provider as BaseProvider;
			else
				throw new TheaError({
					type: "BASE_PROVIDER_REQUIRED",
					message: "Base provider required for getting best swap route"
				});
		} else provider = providerOrSigner as BaseProvider;

		return provider;
	}
}
