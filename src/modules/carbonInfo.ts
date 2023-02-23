import { consts, getERC20ContractAddress, ISO_CODES, TheaError, TheaSubgraphError } from "../utils";
import co2dataset from "../co2dataset.json";
import {
	Co2DataSet,
	EstimatedFootprint,
	FootprintDetail,
	FootprintQuery,
	FootprintSummary,
	GraphqlQuery,
	OffsetHistory,
	OffsetStats,
	ProviderOrSigner,
	QueryError,
	QueryErrorResponse,
	QueryResponse,
	TheaERC1155Balance,
	TheaERC20Token,
	TheaNetwork,
	TokenizationHistory,
	TokenizationStats,
	UserBalance
} from "../types";
import { HttpClient, TheaERC20 } from "./shared";

export const tokenizationHistoryQuery: GraphqlQuery = {
	query: `{
		tokens {
			id
			projectId
			vintage
		}
	}`
};
export const tokenizationStatsQuery = (id: string): GraphqlQuery => ({
	query: `
			query ($id: ID!){
				token(id: $id) {
					id
					projectId
					vintage
					tokenURI
					activeAmount
					mintedAmount
					retiredAmount
					unwrappedAmount
				}
			}
		  `,
	variables: {
		id
	}
});
export const offsetHistoryQuery: GraphqlQuery = {
	query: `{
		retireds {
		  id
		  amount
		  timestamp
		}
	  }`
};
export const offsetStatsQuery = (tokenId: string): GraphqlQuery => ({
	query: `
			query ($token: String!){
				retireds(where: {token: $token}) {
					id
					amount
					timestamp
					token {
						id
						projectId
						vintage
						tokenURI
						activeAmount
						mintedAmount
						retiredAmount
						unwrappedAmount
					}
					by {
						id
					}
				}
			}
		  `,
	variables: {
		token: tokenId
	}
});

export const theaERC1155BalancesQuery = (owner: string) => ({
	query: `
			query ($owner: String!){
				theaERC1155Balances(
				  where: {owner: $owner}
				) {
				  amount
				  token {
					id
				  }
				}
			  }
		  `,
	variables: {
		owner
	}
});
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
export class CarbonInfo {
	private dataSet: Co2DataSet;
	private lastYearInDataset: number;
	readonly httpClient: HttpClient;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.dataSet = co2dataset as Co2DataSet;
		this.lastYearInDataset = this.dataSet["USA"].data[this.dataSet["USA"].data.length - 1].year;
		this.httpClient = new HttpClient(consts[`${network}`].subGraphUrl);
	}

	/**
	 * Returns summary history of tokenizations from subgraph
	 * @returns TokenizationHistory[] @see TokenizationHistory
	 */
	async queryTokenizationHistory(): Promise<TokenizationHistory[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ tokens: TokenizationHistory[] }> | QueryErrorResponse
		>("", tokenizationHistoryQuery);

		return this.handleResponse<{ tokens: TokenizationHistory[] }, TokenizationHistory[]>(response, "tokens");
	}

	/**
	 * Returns stats info of tokenization by passing ID from subgraph
	 * @param id - id of token
	 * @returns TokenizationStats @see TokenizationStats
	 */
	async queryTokenizationStats(id: string): Promise<TokenizationStats> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ token: TokenizationStats }> | QueryErrorResponse
		>("", tokenizationStatsQuery(id));

		return this.handleResponse<{ token: TokenizationStats }, TokenizationStats>(response, "token");
	}

	/**
	 * Returns summary history of offsets from subgraph
	 * @returns OffsetHistory[] @see OffsetHistory
	 */
	async queryOffsetHistory(): Promise<OffsetHistory[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ retireds: OffsetHistory[] }> | QueryErrorResponse
		>("", offsetHistoryQuery);

		return this.handleResponse<{ retireds: OffsetHistory[] }, OffsetHistory[]>(response, "retireds");
	}

	/**
	 * Returns stats info of offset by passing ID from subgraph
	 * @param id - id of token
	 * @returns OffsetStats @see OffsetStats
	 */
	async queryOffsetStats(id: string): Promise<OffsetStats[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ retireds: OffsetStats[] }> | QueryErrorResponse
		>("", offsetStatsQuery(id));

		return this.handleResponse<{ retireds: OffsetStats[] }, OffsetStats[]>(response, "retireds");
	}

	/**
	 * Returns balances of ERC20 and ERC1155 tokens for a given wallet address
	 * @param walletAddress - wallet address of user
	 * @returns UserBalance @see UserBalance
	 */
	async getUsersBalance(walletAddress: string): Promise<UserBalance> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ theaERC1155Balances: TheaERC1155Balance[] }> | QueryErrorResponse
		>("", theaERC1155BalancesQuery(walletAddress));

		if ("errors" in response)
			throw new TheaSubgraphError(
				`Subgraph call error when trying to query theaERC1155Balances`,
				response.errors as QueryError[]
			);

		const balances = response.data.theaERC1155Balances;

		const nft = this.getNFTAmounts(balances);
		const fungible = await this.getFungibleAmounts(walletAddress);
		const userBalance: UserBalance = {
			fungible,
			nft
		};
		return userBalance;
	}

	private getNFTAmounts(balances: TheaERC1155Balance[]): Record<string, string> {
		return balances.reduce((acc, cur: TheaERC1155Balance) => {
			const tokenId = cur.token.id;
			acc[`${tokenId}`] = cur.amount;
			return acc;
		}, {} as Record<string, string>);
	}

	private async getFungibleAmounts(walletAddress: string): Promise<{
		vintage: string;
		rating: string;
		sdg: string;
		nbt: string;
	}> {
		const tokens = ["SDG", "Vintage", "Rating", "CurrentNBT"];
		const fungible: {
			vintage: string;
			rating: string;
			sdg: string;
			nbt: string;
		} = {
			vintage: "0",
			rating: "0",
			sdg: "0",
			nbt: "0"
		};
		for (const token of tokens) {
			const response = await new TheaERC20(
				this.providerOrSigner,
				getERC20ContractAddress(token as TheaERC20Token, this.network)
			).getBalance(walletAddress);
			const amount = response.toString();
			switch (token) {
				case "SDG":
					fungible.sdg = amount;
					break;
				case "Vintage":
					fungible.vintage = amount;
					break;
				case "Rating":
					fungible.rating = amount;
					break;
				default:
					fungible.nbt = amount;
					break;
			}
		}

		return fungible;
	}
	private handleResponse<T, Response>(
		response: QueryResponse<T> | QueryErrorResponse,
		responseProperty: keyof T
	): Response {
		if ("errors" in response)
			throw new TheaSubgraphError(
				`Subgraph call error when trying to query ${responseProperty.toString()}`,
				response.errors as QueryError[]
			);

		// eslint-disable-next-line security/detect-object-injection
		return response.data[responseProperty] as Response;
	}

	/**
	 * Estimates foorprint based on co2 emission per capita using co2 emission dataset
	 * It accepts a ordered list (array) of countries and years.
	 * @param yearOfBirth Year of birth of the person for which we are calculating co2 emission
	 * @param query Array of countries and years
	 * @param query.year Year of specified country to which we are calculating co2 emission. If null, it will use the last year in the dataset
	 * @param query.isoCode ISO code of the country @see ISO_CODES
	 * @returns
	 */
	estimateFootprint(yearOfBirth: number, query: FootprintQuery[]): EstimatedFootprint {
		if (query.length === 0) return { footprint: 0, summary: [], details: [] };
		this.validateYear(yearOfBirth);
		this.validateFootprintQuery(yearOfBirth, query);

		const summaries: FootprintSummary[] = [];
		const details: FootprintDetail[] = [];
		let footprint = 0;
		for (let i = 0; i < query.length; i++) {
			const isoCode = query[`${i}`].isoCode;
			const to = query[`${i}`].year;
			let from = yearOfBirth;
			if (i !== 0) {
				from = query[i - 1].year!;
			}

			const { summary, countryDetails } = this.buildFootprintSummary(from, to, isoCode);

			summaries.push(summary as FootprintSummary);
			details.push(...countryDetails);
			footprint += summary.co2Emission;
		}
		return { footprint, summary: summaries, details };
	}

	/**
	 * @returns List of countries with iso code
	 */
	countries(): { country: string; isoCode: ISO_CODES }[] {
		return Object.values(this.dataSet).map((data) => ({ country: data.country, isoCode: data.isoCode }));
	}

	private buildFootprintSummary(
		from: number,
		to: number | null,
		isoCode: ISO_CODES
	): { summary: FootprintSummary; countryDetails: FootprintDetail[] } {
		const toYear = to ?? this.lastYearInDataset;

		const countryDataSet = this.dataSet[`${isoCode}`];
		const data = countryDataSet.data.filter((data) => data.year >= from && data.year <= toYear);
		const co2Emission = data.reduce(function (acc, obj) {
			return acc + (obj.co2_per_capita ?? 0);
		}, 0);

		const summary = {
			country: countryDataSet.country,
			isoCode,
			from,
			to: toYear,
			co2Emission
		};
		const details: FootprintDetail[] = data.map((d) => {
			return {
				year: d.year,
				co2Emission: d.co2_per_capita ?? 0,
				country: countryDataSet.country,
				isoCode
			};
		});
		return { summary, countryDetails: details };
	}
	private validateYear(year: number) {
		if (year < 1911 || year > this.lastYearInDataset) {
			throw new TheaError({
				type: "INVALID_YEAR",
				message: `Allowed year range is between 1911 till ${this.lastYearInDataset}`
			});
		}

		return;
	}

	// Check if the year is in ascending order. It allows null value for last element which represents last year in dataset
	private validateFootprintQuery(yearOfBirth: number, query: FootprintQuery[]): void {
		// Check if year of birth is bigger then first year in location
		if (query[0].year && yearOfBirth > query[0].year)
			throw new TheaError({
				type: "YEAR_OF_BIRTH_GREATER_THAN_FIRST_LOCATION_YEAR",
				message: "Year of birth cannot be greater than first location year"
			});

		for (let i = 0; i < query.length - 1; i++) {
			const firstYear = query[`${i}`].year;
			const secondYear = query[`${i + 1}`].year;

			if (!firstYear || (!secondYear && i !== query.length - 2)) {
				throw new TheaError({
					type: "INVALID_YEAR_IN_QUERY",
					message: "Year cannot be null in the middle of the query. Null value is allowed only for last element"
				});
			}

			if (!secondYear && i === query.length - 2) continue;

			if (firstYear > secondYear!) {
				throw new TheaError({
					type: "INVALID_YEAR_ORDER",
					message: "Year in query should be in ascending order"
				});
			}

			this.validateYear(firstYear);
			this.validateYear(secondYear!);
		}

		return;
	}
}
