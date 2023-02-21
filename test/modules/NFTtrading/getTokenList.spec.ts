import { TheaNetwork, GetTokenList, tokenInfo } from "../../../src";
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

	describe("getTokenList", () => {
		it("should return a token ID list", async () => {
			const result = await getTokenList.getTokenList();
			expect(result).toEqual({
				[`${subgraphResponse.data.tokens[0].projectId}`]: [subgraphResponse.data.tokens[0]]
			});
			expect(httpPostSpy).toBeCalledWith("", tokenInfo);
		});
	});
});
