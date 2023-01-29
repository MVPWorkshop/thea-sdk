import { ContractDetails } from "../types";

export type ErrorType =
	| "EMPTY_OPTIONS"
	| "MISSING_PROVIDER"
	| "MISSING_INIT_OPTIONS"
	| "INVALID_TOKEN_AMOUNT_VALUE"
	| "INVALID_REQUEST_ID_VALUE"
	| "INVALID_ADDRESS"
	| "INVALID_TOKEN_ID"
	| "SIGNER_REQUIRED"
	| "TRANSACTION_FAILED"
	| "INSUFFICIENT_FUNDS"
	| "NOT_SUPPORED_TOKEN_TYPE"
	| "API_CALL_ERROR"
	| "INVALID_TOKENIZATION_ID_FORMAT"
	| "INVALID_BATCH_ID_FORMAT"
	| "NFT_ORDER_SERILIZATION_ERROR"
	| "INVALID_EMAIL_FORMAT"
	| "INVALID_SLIPPAGE_TOLERANCE_VALUE"
	| "ERROR_FINDING_SWAP_ROUTE";

export type ErrorProps = {
	type: ErrorType;
	message: string;
};
export class TheaError extends Error {
	readonly type: ErrorType;
	constructor(props: ErrorProps) {
		super(props.message);
		this.type = props.type;
		Object.setPrototypeOf(this, TheaError.prototype);
	}
}

export class TheaContractCallError extends TheaError {
	readonly contractDetails: ContractDetails & { contractFunction: string };
	constructor(props: ErrorProps, details: ContractDetails & { contractFunction: string }) {
		super(props);
		this.contractDetails = details;
		Object.setPrototypeOf(this, TheaContractCallError.prototype);
	}
}

export class TheaAPICallError extends TheaError {
	constructor(readonly message: string, readonly method: "GET" | "POST", readonly endpoint: string) {
		super({ type: "API_CALL_ERROR", message });
		Object.setPrototypeOf(this, TheaAPICallError.prototype);
	}
}
