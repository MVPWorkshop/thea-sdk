import { consts, ISO_CODES, TheaError } from "../utils";
import co2dataset from "../co2dataset.json";
import {
	Co2DataSet,
	EstimatedFootprint,
	FootprintDetail,
	FootprintQuery,
	FootprintSummary,
	GraphqlQuery,
	TheaNetwork,
	TokenizationHistory
} from "../types";
import { HttpClient } from "./shared";
/* eslint-disable  @typescript-eslint/no-explicit-any */
type QueryResponse<T> = { data: T };
type QueryError = Record<string, any>;
type QueryErrorResponse = { errors: QueryError[] };

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
export class CarbonInfo {
	private dataSet: Co2DataSet;
	private lastYearInDataset: number;
	private httpClient: HttpClient;
	constructor(network: TheaNetwork) {
		this.dataSet = co2dataset as Co2DataSet;
		this.lastYearInDataset = this.dataSet["USA"].data[this.dataSet["USA"].data.length - 1].year;
		this.httpClient = new HttpClient(consts[`${network}`].subGraphUrl);
	}

	async queryTokenizationHistory(): Promise<TokenizationHistory[] | QueryError[]> {
		const query: GraphqlQuery = {
			query: `{
				tokens {
					id
					unwrappedAmount
					vintage
				}
			}`
		};
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ tokens: TokenizationHistory[] }> | QueryErrorResponse
		>("", query);

		return this.handleResponse<{ tokens: TokenizationHistory[] }, TokenizationHistory[]>(response, "tokens");
	}

	async queryTokenizationStats(id: string): Promise<TokenizationHistory | QueryError[]> {
		const query: GraphqlQuery = {
			query: `
				query ($id: ID!){
					token(id: $id) {
					vintage
					unwrappedAmount
					id
					}
				}
			  `,
			variables: {
				id
			}
		};

		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ token: TokenizationHistory }> | QueryErrorResponse
		>("", query);

		return this.handleResponse<{ token: TokenizationHistory }, TokenizationHistory>(response, "token");
	}
	private handleResponse<T, Response>(
		response: QueryResponse<T> | QueryErrorResponse,
		responseProperty: keyof T
	): QueryError[] | Response {
		if ("errors" in response) {
			return response.errors;
		}
		// eslint-disable-next-line security/detect-object-injection
		return response.data[responseProperty] as Response;
	}

	/**
	 * Estimates foorprint based on co2 emission per capita using co2 emission dataset
	 * It accepts a ordered list (array) of countries and years.
	 * @param yearOfBirth Year of birth of the person for which we are calculating co2 emission
	 * @param query Array of countries and years
	 * @param query.year Year of specified country to which we are calculating co2 emission. If null, it will use the last year in the dataset
	 * @param query.isoCode ISO code of the country {@link ISO_CODES}
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
