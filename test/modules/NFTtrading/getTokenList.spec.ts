import { TheaNetwork, GetTokenList, tokenInfo, TheaSubgraphError, QueryError } from "../../../src";
import { subgraphResponse } from "../../mocks";

jest.mock("../../../src/modules/shared/httpClient", () => {
	return {
		HttpClient: jest.fn().mockImplementation(() => {
			return {
				post: jest.fn().mockReturnValue(subgraphResponse)
			};
		})
	};
});

describe("GetTokenList", () => {
	const getTokenList: GetTokenList = new GetTokenList(TheaNetwork.GANACHE);
	const httpPostSpy = jest.spyOn(getTokenList.httpClient, "post");

	it("should throw error with list of query errors", async () => {
		const expectedResult = { errors: [{ error: "indexing_error" }] };
		jest.spyOn(getTokenList.httpClient, "post").mockResolvedValueOnce(expectedResult);

		await expect(getTokenList.getTokenList()).rejects.toThrow(
			new TheaSubgraphError("Subgraph call error", [{ error: "indexing_error" }] as QueryError[])
		);
	});

	describe("getTokenList", () => {
		it("should return a token ID list", async () => {
			const result = await getTokenList.getTokenList();
			expect(result).toEqual({
				[`${subgraphResponse.data.tokens[0].projectId}`]: [subgraphResponse.data.tokens[0]],
				[`${subgraphResponse.data.tokens[1].projectId}`]: [
					subgraphResponse.data.tokens[1],
					subgraphResponse.data.tokens[2]
				]
			});
			expect(httpPostSpy).toBeCalledWith("", tokenInfo);
		});
	});
});
