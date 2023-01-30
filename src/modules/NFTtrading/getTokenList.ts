import { TheaNetwork, TokenListResponsePayload, TokenResponseFromRaribleAPI } from "src/types";
import { consts, TOKEN_LIST_FETCHING_URL } from "src/utils/consts";
import { HttpClient } from "../shared";

export class GetTokenList {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.httpClient = new HttpClient(TOKEN_LIST_FETCHING_URL);
	}
	async getTokenList() {
		const response = await this.httpClient.get<TokenListResponsePayload>("/items/byCollection", {
			collection: consts[`${this.network}`].networkName + ":" + consts[`${this.network}`].theaERC1155Contract
		});
		const tokenIdsList = response.items.map((item: TokenResponseFromRaribleAPI) => item.tokenId);
		return tokenIdsList;
	}
}
