import { Signer } from "@ethersproject/abstract-signer";
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

export * from "./IRegistryContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";
