import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Overrides } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";

export enum TheaNetwork {
	MAINNET = 1,
	GOERLI = 5,
	GÖRLI = 5,
	GANACHE = 1337
}

export type ProviderOrSigner = Provider | Signer;
export type PromiseOrValue<T> = T | Promise<T>;
export enum TokenStatus {
	PENDING,
	ACCEPTED,
	REJECTED
}
export type UnwrapTokenState = {
	status: TokenStatus;
	maker: string;
	tokenId: string;
	amount: string;
};
export type TransactionOptions = Overrides & { from?: PromiseOrValue<string> };
export type ContractDetails = {
	name: string;
	address: string;
};
export type TheaERC20Token = "SDG" | "Vintage" | "Rating";
export type UnwrapRequestId = { requestId?: string };
export type ConvertEvent = { id?: string; amount?: string };
export type RecoverEvent = { id?: string; amount?: string };
export * from "./IRegistryContract";
export * from "./IBaseTokenManagerContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";

export type BaseTokenCharactaristics = {
	vintage: BigNumber;
	sdgsCount: BigNumber;
	rating: BigNumber;
};

export type BaseTokenAmounts = {
	btVintage: BigNumber;
	sdg: BigNumber;
	vintage: BigNumber;
	rating: BigNumber;
};
