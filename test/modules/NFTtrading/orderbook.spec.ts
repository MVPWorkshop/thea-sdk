import { TheaNetwork, consts, SearchOrdersParams, Orderbook, PostOrderRequestPayload } from "../../../src";
import { postOrderResponseMock, priceListingMock } from "../../mocks";

jest.mock("../../../src/modules/shared/httpClient", () => {
	return {
		HttpClient: jest.fn().mockImplementation(() => {
			return {
				get: jest.fn().mockReturnValue(priceListingMock),
				post: jest.fn().mockReturnValue(postOrderResponseMock)
			};
		})
	};
});

describe("Orderbook", () => {
	const orderbook: Orderbook = new Orderbook(TheaNetwork.GOERLI);
	const httpGetSpy = jest.spyOn(orderbook.httpClient, "get");
	const httpPostSpy = jest.spyOn(orderbook.httpClient, "post");

	describe("queryOrderInfo", () => {
		it("should return info about orders for specific tokenID from specific owner", async () => {
			const tokenId = priceListingMock.orders[0].nftTokenId;
			const owner = priceListingMock.orders[0].order.maker;
			const result = await orderbook.queryOrdersInfo(tokenId, owner);
			expect(result).toEqual(priceListingMock.orders);
			expect(httpGetSpy).toBeCalledWith("/orders", {
				nftToken: consts[TheaNetwork.GOERLI].theaERC1155Contract,
				chainId: TheaNetwork.GOERLI.toString(),
				nftTokenId: tokenId,
				maker: owner,
				status: "all",
				erc20Token: consts[TheaNetwork.GOERLI].stableTokenContract
			} as Partial<SearchOrdersParams>);
		});
	});

	describe("queryOrderByNonce", () => {
		it("should return info about order for specific nonce", async () => {
			const nonce = priceListingMock.orders[0].order.nonce;
			const result = await orderbook.queryOrderByNonce(nonce);
			expect(result).toEqual(priceListingMock.orders[0]);
			expect(httpGetSpy).toBeCalledWith("/orders", {
				nftToken: consts[TheaNetwork.GOERLI].theaERC1155Contract,
				chainId: TheaNetwork.GOERLI.toString(),
				nonce: nonce,
				status: "all",
				erc20Token: consts[TheaNetwork.GOERLI].stableTokenContract
			} as Partial<SearchOrdersParams>);
		});
	});

	describe("postOrder", () => {
		it("should post signed order to orderbook", async () => {
			const signedOrder = {
				erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				direction: 0,
				erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
				erc20TokenAmount: "12000000000000000000",
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				erc1155TokenProperties: [],
				fees: [],
				expiry: "2524604400",
				nonce: "100133271337000000000000000000000000000206548818982333778442832641797464560524",
				taker: "0x0000000000000000000000000000000000000000",
				signature: {
					signatureType: 2,
					r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
					s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
					v: 27
				}
			};
			const serializedNftOrder = {
				erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				direction: 0,
				erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
				erc20TokenAmount: "12000000000000000000",
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				erc1155TokenProperties: [],
				fees: [],
				expiry: "2524604400",
				nonce: "100133271337000000000000000000000000000206548818982333778442832641797464560524",
				taker: "0x0000000000000000000000000000000000000000",
				signature: {
					signatureType: 2,
					r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
					s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
					v: 27
				}
			};
			const result = await orderbook.postOrder(signedOrder);
			expect(result).toEqual(postOrderResponseMock);
			expect(httpPostSpy).toBeCalledWith("/order", {
				order: serializedNftOrder,
				chainId: TheaNetwork.GOERLI.toString()
			} as Partial<PostOrderRequestPayload>);
		});
	});

	describe("getPriceListing", () => {
		it("should return a sorted price listing for specific token ID and buy side", async () => {
			const tokenId = priceListingMock.orders[0].nftTokenId;
			const side = "buy";
			const result = await orderbook.queryPriceListing(tokenId, side);
			expect(result).toEqual([
				{
					priceForOneNFT: 0.1,
					nftTokenAmount: priceListingMock.orders[0].nftTokenAmount,
					orderId: priceListingMock.orders[0].order.nonce
				},
				{
					priceForOneNFT: 0.01,
					nftTokenAmount: priceListingMock.orders[1].nftTokenAmount,
					orderId: priceListingMock.orders[1].order.nonce
				}
			]);
			expect(httpGetSpy).toBeCalledWith("/orders", {
				nftToken: consts[TheaNetwork.GOERLI].theaERC1155Contract,
				chainId: TheaNetwork.GOERLI.toString(),
				nftTokenId: tokenId,
				sellOrBuyNft: side,
				status: "open",
				erc20Token: consts[TheaNetwork.GOERLI].stableTokenContract
			} as Partial<SearchOrdersParams>);
		});
	});
	it("should return sorted a price listing for specific token ID and sell side", async () => {
		const tokenId = priceListingMock.orders[0].nftTokenId;
		const side = "sell";
		const result = await orderbook.queryPriceListing(tokenId, side);
		expect(result).toEqual([
			{
				priceForOneNFT: 0.01,
				nftTokenAmount: priceListingMock.orders[1].nftTokenAmount,
				orderId: priceListingMock.orders[1].order.nonce
			},
			{
				priceForOneNFT: 0.1,
				nftTokenAmount: priceListingMock.orders[0].nftTokenAmount,
				orderId: priceListingMock.orders[0].order.nonce
			}
		]);
		expect(httpGetSpy).toBeCalledWith("/orders", {
			nftToken: consts[TheaNetwork.GOERLI].theaERC1155Contract,
			chainId: TheaNetwork.GOERLI.toString(),
			nftTokenId: tokenId,
			sellOrBuyNft: side,
			status: "open",
			erc20Token: consts[TheaNetwork.GOERLI].stableTokenContract
		} as Partial<SearchOrdersParams>);
	});
});
