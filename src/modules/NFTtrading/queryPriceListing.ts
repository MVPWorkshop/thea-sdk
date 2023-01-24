import { OrderSide, SearchOrdersParams, SearchOrdersResponsePayload, TheaNetwork } from "src/types";
import { consts, ORDERBOOK_URL } from "src/utils/consts";
import { HttpClient } from "../shared/httpClient";

export class QueryPriceListing {
	readonly orderBook: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.orderBook = new HttpClient(ORDERBOOK_URL);
	}

	async queryPriceListing(tokenId: string, side: OrderSide) {
		const response = await this.orderBook.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			chainId: consts[`${this.network}`].chainID,
			nftTokenId: tokenId,
			sellOrBuyNft: side,
			status: "open",
			erc20Token: consts[`${this.network}`].stableTokenContract
		} as Partial<SearchOrdersParams>);
		const priceList = response.orders.map(
			(element) => parseInt(element.nftTokenAmount) / (parseInt(element.erc20TokenAmount) / 10 ** 18)
		);
		return priceList;
	}
}
