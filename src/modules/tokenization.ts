import { ClientDetails, TheaNetwork, TokenizationRequest, TokenizationSource, TokenizationState } from "../types";
import { TheaError, validateAddress } from "../utils";
import { HttpClient } from "./shared";

export class Tokenization {
	readonly httpClient: HttpClient;
	constructor(network: TheaNetwork) {
		this.httpClient = new HttpClient(network);
	}

	// TODO: Is registry source and if so is it always "verra"?
	requestTokenization(
		registry: TokenizationSource,
		accountId: string,
		batchId: string,
		client: ClientDetails
	): Promise<TokenizationState> {
		return this.httpClient.post<TokenizationRequest, TokenizationState>(
			`/tokenization/request`,
			this.buildTokenizationRequest(registry, accountId, batchId, client)
		);
	}

	/* eslint-disable  @typescript-eslint/ban-types */
	tokenize(tokenizationId: string): Promise<TokenizationState> {
		this.validateTokenizationId(tokenizationId);
		return this.httpClient.post<{}, TokenizationState>("/tokenization/claimTokens", {}, { id: tokenizationId });
	}

	/**
	 * Query tokenization state by tokenization ID
	 * @param tokenizationId
	 * returns TokenizationState {@link TokenizationState}
	 */
	getTokenizationState(tokenizationId: string): Promise<TokenizationState> {
		this.validateTokenizationId(tokenizationId);
		return this.httpClient.get<TokenizationState>("/tokenization/get", { id: tokenizationId });
	}

	private buildTokenizationRequest(
		source: TokenizationSource,
		accountId: string,
		batchId: string,
		httpClient: ClientDetails
	): TokenizationRequest {
		return {
			source,
			subaccountId: accountId,
			fullName: httpClient.fullName,
			email: this.validateEmail(httpClient.email),
			ethAddr: validateAddress(httpClient.ethAddr),
			batchId: this.validateBatchId(batchId)
		};
	}
	/**
	 * Checks format of tokenization ID
	 * @param id - Tokenization ID
	 */
	private validateTokenizationId = (id: string): void => {
		const regex = /^[0-9a-f]{32}$/;
		const isValid = regex.test(id);
		if (!isValid)
			throw new TheaError({
				type: "INVALID_TOKENIZATION_ID_FORMAT",
				message: "Tokenization ID must be 32 characters long"
			});
	};

	// TODO: Check right rexes for serial number format
	/**
	 * Checks format of batch ID
	 * @param id - Batch ID
	 */
	private validateBatchId = (id: string): string => {
		// const regex = /^[0-9a-f]{32}$/;
		// const isValid = regex.test(id);
		// if (!isValid)
		// 	throw new TheaError({
		// 		type: "INVALID_BATCH_ID_FORMAT",
		// 		message: "Batch ID must be 32 characters long"
		// 	});
		return id;
	};

	/**
	 * Email validation
	 * @param email
	 * @returns
	 */
	private validateEmail = (email: string): string => {
		/* eslint-disable security/detect-unsafe-regex */
		const regex =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		const isValid = regex.test(email);
		if (!isValid)
			throw new TheaError({
				type: "INVALID_EMAIL_FORMAT",
				message: "Email is not valid"
			});
		return email.toLowerCase();
	};
}
