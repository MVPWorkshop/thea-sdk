import { SearchOrdersParams, SearchOrdersResponsePayload, TheaNetwork } from "src/types";
import { consts, ORDERBOOK_URL } from "src/utils/consts";
import { HttpClient } from "../shared/httpClient";

export class QueryOrderInfo {
	readonly orderBook: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.orderBook = new HttpClient(ORDERBOOK_URL);
	}

	async queryOrderInfo(tokenId: string, owner: string) {
		const response = await this.orderBook.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			chainId: consts[`${this.network}`].chainID,
			nftTokenId: tokenId,
			maker: owner,
			erc20Token: consts[`${this.network}`].stableTokenContract
		} as Partial<SearchOrdersParams>);

		return response.orders;
	}
}
