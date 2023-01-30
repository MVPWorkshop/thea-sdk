import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";

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
// TODO: Remove link from list after testing
// TODO: Check is DAI stable coin
export type TheaERC20Token = "SDG" | "Vintage" | "Rating" | "LINK" | "CurrentNBT" | "Stable";

// TODO: Remove link from list after testing
export type SwapTokens = "SDG" | "Vintage" | "LINK" | "CurrentNBT" | "Stable";
export const UniswapPoolFee = {
	LOWEST: 100, // 0.01%
	LOW: 500, // 0.05%
	MEDIUM: 3000, // 0.3%
	HIGH: 10000 // 1%
};

type FungibleERC20Options = {
	tokenIn: SwapTokens;
	amountIn: BigNumber;
	recipient: string;
};
// TODO: Should we use one hardcoded stable coin or support multiple stable coins?
export type FungibleStableOptions = {
	tokenIn: "Stable";
	amountIn: BigNumber;
	tokenOut: SwapTokens;
	recipient: string;
};

export type SwapOptions = {
	slippageTolerance?: number;
	deadline?: number; // Unix timestamp
};

export type FungibleOptions = FungibleERC20Options | FungibleStableOptions;

export enum TradeType {
	EXACT_INPUT = 0,
	EXACT_OUTPUT = 1
}

export type UnwrapRequestId = { requestId?: string };

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

export type TokenListResponsePayload = {
	continuation: string;
	items: TokenResponseFromRaribleAPI[];
};
export type TokenResponseFromRaribleAPI = {
	id: string;
	blockchain: string;
	collection: string;
	contract: string;
	tokenId: string;
	creators: [{ account: string; value: number }];
	lazySupply: string;
	pending: [];
	mintedAt: string;
	lastUpdatedAt: string;
	supply: string;
	meta: {
		name: string;
		description: string;
		tags: [];
		genres: [];
		attributes: [{ key: string; value: string }];
		content: [
			{
				"@type": "IMAGE";
				url: string;
				representation: string;
				mimeType: string;
				size: number;
				width: number;
				height: number;
			}
		];
		restrictions: [];
	};
	deleted: true;
	originOrders: [];
	ammOrders: { ids: [] };
	auctions: [];
	totalStock: string;
	sellers: number;
	suspicious: boolean;
};
export * from "./IRegistryContract";
export * from "./IBaseTokenManagerContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";
export * from "./IQuoterContract";
export * from "./IZeroExContract";
export * from "./ZeroExProtocol";
