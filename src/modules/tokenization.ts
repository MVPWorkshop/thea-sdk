import { ClientDetails, TheaNetwork, TokenizationRequest, TokenizationSource, TokenizationState } from "../types";
import { TheaError, validateAddress } from "../utils";
import { HttpClient } from "./shared";

export class Tokenization {
	readonly httpClient: HttpClient;
	constructor(network: TheaNetwork) {
		this.httpClient = new HttpClient(network);
	}

	/**
	 * Requests tokenization
	 * @param registry {@link TokenizationSource}
	 * @param accountId - Subaccount ID
	 * @param batchId
	 * @param client.email
	 * @param client.ethAddr
	 * @param client.fullName
	 * @returns TokenizationState {@link TokenizationState}
	 */
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

	/**
	 * Used to claim tokens after tokenization request is performed and admin approves it
	 * @param tokenizationId - Tokenization ID
	 * @returns TokenizationState {@link TokenizationState}
	 */
	tokenize(tokenizationId: string): Promise<TokenizationState> {
		this.validateTokenizationId(tokenizationId);
		/* eslint-disable  @typescript-eslint/ban-types */
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

	/**
	 * Tokenization request builder function. Returns TokenizationRequest {@link TokenizationRequest} and validates input fields
	 * @param source - {@link TokenizationSource}
	 * @param accountId - Subaccount ID
	 * @param batchId
	 * @param client - client details
	 * @returns TokenizationRequest {@link TokenizationRequest}
	 */
	private buildTokenizationRequest(
		source: TokenizationSource,
		accountId: string,
		batchId: string,
		client: ClientDetails
	): TokenizationRequest {
		return {
			source,
			subacconuntId: accountId,
			fullName: client.fullName,
			email: this.validateEmail(client.email),
			ethAddr: validateAddress(client.ethAddr),
			batchId
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
				message: "Tokenization ID must be 32 characters long and contain lowercase characters"
			});
	};

	/**
	 * Email validation
	 * @param email
	 * @returns string
	 */
	private validateEmail = (email: string): string => {
		/* eslint-disable security/detect-unsafe-regex */
		/* eslint-disable no-useless-escape */
		const regex =
			/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
		const isValid = regex.test(email);
		if (!isValid)
			throw new TheaError({
				type: "INVALID_EMAIL_FORMAT",
				message: "Email is not valid"
			});
		return email.toLowerCase();
	};
}
