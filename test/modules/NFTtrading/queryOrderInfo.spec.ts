import { TheaNetwork, consts, SearchOrdersParams, QueryOrderInfo } from "../../../src";
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

describe("QueryOrderInfo", () => {
	const queryOrderInfo: QueryOrderInfo = new QueryOrderInfo(TheaNetwork.GANACHE);
	const httpGetSpy = jest.spyOn(queryOrderInfo.orderBook, "get");

	describe("queryOrderInfo", () => {
		it("should return info about orders for specific tokenID from specific owner", async () => {
			const tokenId = priceListingMock.orders[0].nftTokenId;
			const owner = priceListingMock.orders[0].order.maker;
			const result = await queryOrderInfo.queryOrderInfo(tokenId, owner);
			expect(result).toEqual(priceListingMock.orders);
			expect(httpGetSpy).toBeCalledWith("/orders", {
				nftToken: consts[TheaNetwork.GANACHE].theaERC1155Contract,
				chainId: consts[TheaNetwork.GANACHE].chainID,
				nftTokenId: tokenId,
				maker: owner,
				erc20Token: consts[TheaNetwork.GANACHE].stableTokenContract
			} as Partial<SearchOrdersParams>);
		});
	});
});
