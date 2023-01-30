import { TheaNetwork, GetTokenList, consts } from "../../../src";
import { itemsByCollection } from "../../mocks";

jest.mock("../../../src/modules/shared/httpClient", () => {
	return {
		HttpClient: jest.fn().mockImplementation(() => {
			return {
				get: jest.fn().mockReturnValue(itemsByCollection)
			};
		})
	};
});

describe("GetTokenList", () => {
	const getTokenList: GetTokenList = new GetTokenList(TheaNetwork.GOERLI);
	const httpGetSpy = jest.spyOn(getTokenList.httpClient, "get");

	describe("getTokenList", () => {
		it("should return a token ID list", async () => {
			const result = await getTokenList.getTokenList();
			expect(result).toEqual([itemsByCollection.items[0].tokenId]);
			expect(httpGetSpy).toBeCalledWith("/items/byCollection", {
				collection: consts[TheaNetwork.GOERLI].networkName + ":" + consts[TheaNetwork.GOERLI].theaERC1155Contract
			});
		});
	});
});
