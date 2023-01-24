import { TheaNetwork, QueryPriceListing, consts, SearchOrdersParams } from "../../../src";
import { priceListingMock } from "../../mocks";

jest.mock("../../../src/modules/shared/httpClient", () => {
	return {
		HttpClient: jest.fn().mockImplementation(() => {
			return {
				get: jest.fn().mockReturnValue(priceListingMock)
			};
		})
	};
});

describe("Tokenization", () => {
	const queryPriceListing: QueryPriceListing = new QueryPriceListing(TheaNetwork.GANACHE);
	const httpGetSpy = jest.spyOn(queryPriceListing.orderBook, "get");

	describe("getTokenList", () => {
		it("should return a price listing for specific token ID", async () => {
			const tokenId = priceListingMock.orders[0].nftTokenId;
			const side = "buy";
			const result = await queryPriceListing.queryPriceListing(tokenId, side);
			expect(result).toEqual([10]);
			expect(httpGetSpy).toBeCalledWith("/orders", {
				nftToken: consts[TheaNetwork.GANACHE].theaERC1155Contract,
				nftTokenId: tokenId,
				sellOrBuyNft: side,
				status: "open",
				erc20Token: consts[TheaNetwork.GANACHE].stableTokenContract
			} as Partial<SearchOrdersParams>);
		});
	});
});
