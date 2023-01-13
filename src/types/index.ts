import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Overrides } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";

export enum TheaNetwork {
	MAINNET = 1,
	ROPSTEN = 3,
	RINKEBY = 4,
	GOERLI = 5,
	GÖRLI = 5,
	KOVAN = 42,
	LOCAL = 1337
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
export type RecoverEvent = { id?: string; amount?: string; msgSender?: string };
export * from "./IRegistryContract";
export * from "./IBaseTokenManagerContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";

export type BaseTokenCharactaristics = {
	vintage: BigNumberish;
	sdgsCount: BigNumberish;
	rating: BigNumberish;
};

export type BaseTokenAmounts = {
	btVintage: BigNumber;
	sdg: BigNumber;
	vintage: BigNumber;
	rating: BigNumber;
};
