import { OrderSide, SearchOrdersParams, SearchOrdersResponsePayload, TheaNetwork } from "src/types";
import { consts } from "src/utils/consts";
import { HttpClient } from "../shared/httpClient";

export class QueryPriceListing {
	readonly orderBook: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.orderBook = new HttpClient("https://api.trader.xyz/orderbook");
	}

	async queryPriceListing(tokenId: string, side: OrderSide) {
		const response = await this.orderBook.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			nftTokenId: tokenId,
			sellOrBuyNft: side,
			status: "open",
			erc20Token: consts[`${this.network}`].stableCoinContract
		} as Partial<SearchOrdersParams>);
		const priceList: number[] = [];
		response.orders.forEach((element) => {
			priceList.push(parseInt(element.nftTokenAmount) / (parseInt(element.erc20TokenAmount) / 10 ** 18));
		});
		return priceList;
	}
}
