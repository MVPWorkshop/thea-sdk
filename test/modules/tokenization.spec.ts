import { ClientDetails, TheaError, TheaNetwork, Tokenization, TokenizationSource } from "../../src";
import { tokenizationState, WALLET_ADDRESS } from "../mocks";

jest.mock("../../src/modules/shared/httpClient", () => {
	return {
		HttpClient: jest.fn().mockImplementation(() => {
			return {
				get: jest.fn().mockReturnValue(tokenizationState),
				post: jest.fn().mockReturnValue(tokenizationState)
			};
		})
	};
});

describe("Tokenization", () => {
	const tokenization: Tokenization = new Tokenization(TheaNetwork.GOERLI);
	const tokenizationId = "00000185b7153c46c4dca62b4ebcd490";
	const accountId = "12274";
	const batchId = "11158-289118799-289118805-VCS-VCU-263-VER-KH-14-1748-01012019-31122019-1";
	const httpGetSpy = jest.spyOn(tokenization.httpClient, "get");
	const httpPostSpy = jest.spyOn(tokenization.httpClient, "post");

	describe("getTokenizationState", () => {
		it("should return a tokenization state", async () => {
			const result = await tokenization.getTokenizationState(tokenizationId);
			expect(result).toEqual(tokenizationState);
			expect(httpGetSpy).toBeCalledWith("/tokenization/get", { id: tokenizationId });
		});

		it("should throw error if tokenizationId has invalid format", async () => {
			try {
				await tokenization.getTokenizationState("123");
			} catch (error) {
				expect(error).toEqual(
					new TheaError({
						type: "INVALID_TOKENIZATION_ID_FORMAT",
						message: "Tokenization ID must be 32 characters long and contain lowercase characters"
					})
				);
			}
		});
	});

	describe("tokenize", () => {
		it("should return a tokenization state", async () => {
			const result = await tokenization.tokenize(tokenizationId);
			expect(result).toEqual(tokenizationState);
			expect(httpPostSpy).toBeCalledWith("/tokenization/claimTokens", {}, { id: tokenizationId });
		});

		it("should throw error if tokenizationId has invalid format", async () => {
			try {
				await tokenization.tokenize("123");
			} catch (error) {
				expect(error).toEqual(
					new TheaError({
						type: "INVALID_TOKENIZATION_ID_FORMAT",
						message: "Tokenization ID must be 32 characters long and contain lowercase characters"
					})
				);
			}
		});
	});

	describe("requestTokenization", () => {
		let client: ClientDetails = {
			fullName: "John Doe",
			email: "johndoe@gmail.com",
			ethAddr: WALLET_ADDRESS
		};

		afterEach(() => {
			client = {
				fullName: "John Doe",
				email: "johndoe@gmail.com",
				ethAddr: WALLET_ADDRESS
			};
		});
		it("should return a tokenization state", async () => {
			const result = await tokenization.requestTokenization(TokenizationSource.VERRA, accountId, batchId, client);
			expect(result).toEqual(tokenizationState);
			expect(httpPostSpy).toBeCalledWith("/tokenization/request", {
				source: TokenizationSource.VERRA,
				subacconuntId: accountId,
				fullName: client.fullName,
				email: client.email,
				ethAddr: client.ethAddr.toLowerCase(),
				batchId: batchId
			});
		});

		it("should throw error if email has invalid format", async () => {
			client.email = "@gmail.com";
			try {
				await tokenization.requestTokenization(TokenizationSource.VERRA, accountId, batchId, client);
			} catch (error) {
				expect(error).toEqual(
					new TheaError({
						type: "INVALID_EMAIL_FORMAT",
						message: "Email is not valid"
					})
				);
			}
		});

		it("should throw error if ethAddress has invalid format", async () => {
			try {
				client.ethAddr = "0x123";
				await tokenization.requestTokenization(TokenizationSource.VERRA, accountId, batchId, client);
			} catch (error) {
				expect(error).toEqual(
					new TheaError({
						type: "INVALID_ADDRESS",
						message: "Passed address is not valid ethereum address"
					})
				);
			}
		});
	});
});
