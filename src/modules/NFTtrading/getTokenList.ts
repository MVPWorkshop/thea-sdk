import { TheaNetwork, TokenListResponsePayload } from "src/types";
import { consts } from "src/utils/consts";
import { HttpClient } from "../shared";

export class GetTokenList {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.httpClient = new HttpClient("https://api.rarible.org/v0.1");
	}
	async getTokenList() {
		const response = await this.httpClient.get<TokenListResponsePayload>("/items/byCollection", {
			collection: consts[`${this.network}`].networkName + ":" + consts[`${this.network}`].theaERC1155Contract
		});
		// eslint-disable-next-line no-var
		var tokenIdsList: string[] = [];
		if (response.items.length > 0) {
			response.items.forEach((item) => {
				tokenIdsList.push(item.tokenId);
			});
		}

		return tokenIdsList;
	}
}
