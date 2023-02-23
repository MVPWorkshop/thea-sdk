import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";
import { ISO_CODES } from "../utils";

export enum TheaNetwork {
	GANACHE = 1337,
	MUMBAI = 80001,
	POLYGON = 137
}

export type ProviderOrSigner = Provider | Signer | (Signer & TypedDataSigner);
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
export type ContractDetails = {
	name: string;
	address: string;
};

export type TheaERC20Token = "SDG" | "Vintage" | "Rating" | "CurrentNBT" | "Stable";

export type ExactInputSingleParams = {
	tokenIn: string;
	tokenOut: string;
	fee: BigNumberish;
	recipient: string;
	deadline: BigNumberish;
	amountIn: BigNumberish;
	amountOutMinimum: BigNumberish;
	sqrtPriceLimitX96: BigNumberish;
};

export type FungibleERC20Options = {
	tokenIn: TheaERC20Token;
	amountIn: BigNumberish;
};

export type FungibleStableOptions = {
	tokenIn: "Stable";
	amountIn: BigNumberish;
	tokenOut: TheaERC20Token;
};

export const POOL_FEE = 3000;
export type FungibleOptions = FungibleERC20Options | FungibleStableOptions;
export type SwapOptions = {
	slippageTolerance?: number;
	deadline?: number; // Unix timestamp
	recipient?: string;
};
export type RequestId = { requestId?: string };

export enum TokenizationStatus {
	IN_QUEUE = "IN_QUEUE",
	BC_PRE_PENDING = "BC_PRE_PENDING",
	BC_PENDING = "BC_PENDING",
	INTERACTING_WITH_VCC_SERVICE = "INTERACTING_WITH_VCC_SERVICE",
	PERSISTING = "PERSISTING",
	VALIDATING = "VALIDATING",
	VALIDATED = "VALIDATED",
	PAYMENT_REQUESTED = "PAYMENT_REQUESTED",
	PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
	ERROR_PAYMENT_TIMEOUT = "ERROR_PAYMENT_TIMEOUT",
	REFUND_REQUESTED = "REFUND_REQUESTED",
	REFUND_SENT = "REFUND_SENT",
	TRANSFER_REQUESTED = "TRANSFER_REQUESTED",
	VCC_VALIDATION = "VCC_VALIDATION",
	CLIENT_CONFIRMATION = "CLIENT_CONFIRMATION",
	WAITING_VCC_TRANSFER = "WAITING_VCC_TRANSFER",
	VCC_TRANSFER_VALIDATION = "VCC_TRANSFER_VALIDATION",
	ERROR_REJECTED = "ERROR_REJECTED",
	ERROR_INVALID_INPUT = "ERROR_INVALID_INPUT",
	ERROR_GENERAL = "ERROR_GENERAL",
	ERROR_VALIDATION = "ERROR_VALIDATION",
	ERROR_ON_BC_SEND = "ERROR_ON_BC_SEND",
	ERROR_BC_CONFIRMED_BUT_FAILED = "ERROR_BC_CONFIRMED_BUT_FAILED",
	ERROR_ON_VCC_SERVICE_INTERACTION = "ERROR_ON_VCC_SERVICE_INTERACTION",
	ERROR_VCC_SOURCE_EXISTS = "ERROR_VCC_SOURCE_EXISTS",
	ERROR_VCC_SOURCE_CONFLICT = "ERROR_VCC_SOURCE_CONFLICT",
	ERROR_PENDING_TIMEOUT = "ERROR_PENDING_TIMEOUT",
	ERROR_TRANSFER_FAILED = "ERROR_TRANSFER_FAILED",
	PERFORMED = "PERFORMED"
}
export enum TokenizationSource {
	VERRA = "verra"
}
export enum TokenizationError {
	GENERAL_ERROR = "GENERAL_ERROR",
	BAD_INPUT_DATA = "BAD_INPUT_DATA",
	NO_AUTH = "NO_AUTH",
	BAD_CREDS = "BAD_CREDS",
	RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
	RECORD_EXISTS = "RECORD_EXISTS",
	RECORD_CONFLICT = "RECORD_CONFLICT",
	PASSPOLICY_ERROR = "PASSPOLICY_ERROR",
	NO_PRIVS = "NO_PRIVS",
	REFERRED_RECORDS_DETECTED = "REFERRED_RECORDS_DETECTED",
	ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
	DOCUSIGN_ERROR = "DOCUSIGN_ERROR",
	UNABLE_TO_GET_RATING = "UNABLE_TO_GET_RATING",
	VERRA_INTERACTION_ERROR = "VERRA_INTERACTION_ERROR"
}
export type TokenizationState = {
	result: {
		uuid: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		fullName: string;
		ethAddr: string;
		source: TokenizationSource;
		subaccountId: string;
		batchId: string;
		status: TokenizationStatus;
		specInfo: string | null;
		statusMess: string | null;
		transferId: string | null;
		signProcId: string | null;
		signDocPdf: string[] | null;
		signCertPdf: string[] | null;
	} | null;
	error: TokenizationError | null;
	errorMessage: string | null;
};
export type ClientDetails = {
	email: string;
	ethAddr: string;
	fullName: string;
};

export type TokenizationRequest = ClientDetails & {
	source: TokenizationSource;
	subacconuntId: string;
	batchId: string;
};

export type ConvertEvent = { id?: string; amount?: string };
export type RecoverEvent = { id?: string; amount?: string };
export type RollTokensEvent = { user?: string; vintage?: string; amount?: string };

export type BaseTokenCharactaristics = {
	vintage: BigNumber;
	sdgsCount: BigNumber;
	rating: BigNumber;
};

export type BaseTokenAmounts = {
	cbt: BigNumberish;
	sdg: BigNumberish;
	vintage: BigNumberish;
	rating: BigNumberish;
};

export type Co2DataSet = {
	[key in ISO_CODES]: {
		country: string;
		isoCode: ISO_CODES;
		data: { year: number; co2_per_capita?: number }[];
	};
};
export type FootprintQuery = {
	isoCode: ISO_CODES;
	year: number | null;
};

export type FootprintSummary = {
	country: string;
	isoCode: ISO_CODES;
	from: number;
	to: number;
	co2Emission: number;
};
export type FootprintDetail = {
	year: number;
	co2Emission: number;
	country: string;
	isoCode: string;
};
export type EstimatedFootprint = {
	footprint: number;
	summary: FootprintSummary[];
	details: FootprintDetail[];
};
/* eslint-disable  @typescript-eslint/no-explicit-any */
export type GraphqlQuery = {
	query: string;
	variables?: { [key: string]: any };
};

export type QueryResponse<T> = { data: T };
export type QueryError = Record<string, any>;
export type QueryErrorResponse = { errors: QueryError[] };

export type TokenizationHistory = {
	id: string;
	projectId: string;
	vintage: string;
};
export type TokenInfo = {
	id: string;
	unwrappedAmount: string;
	vintage: string;
	activeAmount: string;
	mintedAmount: string;
	projectId: string;
	retiredAmount: string;
	tokenURI: string;
};

export type TokenizationStats = TokenInfo | null;

export type OffsetHistory = {
	id: string;
	amount: string;
	timestamp: string;
	by: {
		id: string;
	};
};
export type OffsetStats = {
	id: string;
	amount: string;
	timestamp: string;
	by: {
		id: string;
	};
	token: TokenizationStats;
} | null;

export type TheaERC1155Balance = {
	amount: string;
	token: {
		id: string;
	};
};
export type UserBalance = {
	fungible: {
		vintage: string;
		rating: string;
		sdg: string;
		nbt: string;
	};
	nft: Record<string, string>;
};
export * from "./IRegistryContract";
export * from "./IBaseTokenManagerContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";
export * from "./IQuoterContract";
export * from "./ISwapRouterContract";
export * from "./IZeroExContract";
export * from "./ZeroExProtocol";
