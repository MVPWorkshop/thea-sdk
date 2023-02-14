import { JsonRpcProvider } from "@ethersproject/providers";
import {
	CarbonInfo,
	offsetHistoryQuery,
	OffsetStats,
	offsetStatsQuery,
	QueryError,
	TheaError,
	TheaNetwork,
	tokenizationHistoryQuery,
	TokenizationStats,
	tokenizationStatsQuery
} from "../../src";
import { offsetHistory, offsetStats, tokenizationHistory, tokenizationStats } from "../mocks";
jest.mock("../../src/co2dataset.json", () => {
	return {
		USA: {
			country: "United states",
			isoCode: "USA",
			data: [
				{ year: 2016, co2_per_capita: 0.261795312166214 },
				{ year: 2017, co2_per_capita: 0.27685248851776123 },
				{ year: 2018, co2_per_capita: 0.2948758602142334 },
				{ year: 2019, co2_per_capita: 0.2934013605117798 },
				{ year: 2020, co2_per_capita: 0.2997458577156067 },
				{ year: 2021, co2_per_capita: 0.29611897468566895 }
			]
		},
		ALA: {
			country: "Aland Islands",
			isoCode: "ALA",
			data: [{ year: 2016 }, { year: 2017 }, { year: 2018 }, { year: 2019 }, { year: 2020 }, { year: 2021 }]
		},
		DZA: {
			country: "Algeria",
			isoCode: "DZA",
			data: [
				{ year: 2016, co2_per_capita: 3.9353251457214355 },
				{ year: 2017, co2_per_capita: 4.045341491699219 },
				{ year: 2018, co2_per_capita: 4.147960662841797 },
				{ year: 2019, co2_per_capita: 4.203331470489502 },
				{ year: 2020, co2_per_capita: 3.9700307846069336 },
				{ year: 2021, co2_per_capita: 3.9899773597717285 }
			]
		}
	};
});

jest.mock("../../src/modules/shared/httpClient");

describe("Carbon info", () => {
	const carbonInfo: CarbonInfo = new CarbonInfo(new JsonRpcProvider(), TheaNetwork.GANACHE);

	describe("countries", () => {
		it("should return list of countries and iso codes", () => {
			const countries = carbonInfo.countries();
			expect(countries.length).toBe(3);
			expect(countries[0].country).toBe("United states");
			expect(countries[0].isoCode).toBe("USA");
		});
	});

	describe("estimateFootprint", () => {
		it("should object with footprint 0 and empty arrays for summary and details", () => {
			const footprint = carbonInfo.estimateFootprint(2016, []);
			expect(footprint.footprint).toBe(0);
			expect(footprint.summary.length).toBe(0);
			expect(footprint.details.length).toBe(0);
		});

		it("should fail if year of birth isn't in year range", () => {
			expect(() => carbonInfo.estimateFootprint(1800, [{ year: 2017, isoCode: "USA" }])).toThrow(
				new TheaError({
					type: "INVALID_YEAR",
					message: `Allowed year range is between 1911 till 2021`
				})
			);
		});

		it("should throw error if any of years in query is null except last", () => {
			expect(() =>
				carbonInfo.estimateFootprint(2016, [
					{ year: null, isoCode: "USA" },
					{ year: null, isoCode: "USA" }
				])
			).toThrow(
				new TheaError({
					type: "INVALID_YEAR_IN_QUERY",
					message: "Year cannot be null in the middle of the query. Null value is allowed only for last element"
				})
			);
		});

		it("should throw error if location query dates are not in ascending order", () => {
			expect(() =>
				carbonInfo.estimateFootprint(2016, [
					{ year: 2017, isoCode: "USA" },
					{ year: 2016, isoCode: "USA" }
				])
			).toThrow(
				new TheaError({
					type: "INVALID_YEAR_ORDER",
					message: "Year in query should be in ascending order"
				})
			);
		});

		it("should estimate footprint", () => {
			const result = carbonInfo.estimateFootprint(2016, [
				{ year: 2017, isoCode: "USA" },
				{ year: 2018, isoCode: "ALA" },
				{ year: null, isoCode: "DZA" }
			]);
			expect(result.footprint).toBe(16.849948078393936);
			expect(result.summary.length).toBe(3);
			expect(result.summary[0].co2Emission).toBe(0.5386478006839752);
			expect(result.summary[0].isoCode).toBe("USA");
			expect(result.summary[1].co2Emission).toBe(0);
			expect(result.summary[1].isoCode).toBe("ALA");
			expect(result.summary[2].co2Emission).toBe(16.31130027770996);
			expect(result.summary[2].isoCode).toBe("DZA");
		});

		it("should throw error if first date in query if less then date of birth", () => {
			expect(() => carbonInfo.estimateFootprint(2016, [{ year: 2015, isoCode: "USA" }])).toThrow(
				new TheaError({
					type: "YEAR_OF_BIRTH_GREATER_THAN_FIRST_LOCATION_YEAR",
					message: "Year of birth cannot be greater than first location year"
				})
			);
		});
	});

	describe("tokenization query", () => {
		it("should query tokenization history", async () => {
			const httpClient = jest
				.spyOn(carbonInfo.httpClient, "post")
				.mockResolvedValueOnce({ data: { tokens: tokenizationHistory } });

			const result = await carbonInfo.queryTokenizationHistory();
			expect(result.length).toBe(3);
			expect(result[0].id).toBe(tokenizationHistory[0].id);
			expect(httpClient).toBeCalledWith("", tokenizationHistoryQuery);
		});

		it("should list of errors if something went wrong", async () => {
			const expectedResult = { errors: [{ error: "indexing_error" }] };
			jest.spyOn(carbonInfo.httpClient, "post").mockResolvedValueOnce(expectedResult);

			const result: QueryError = await carbonInfo.queryTokenizationHistory();
			expect(result.length).toBe(1);
			expect(result[0].error).toBe("indexing_error");
		});

		/* eslint-disable  @typescript-eslint/no-non-null-assertion */
		it("should return tokenization stats", async () => {
			const httpClient = jest
				.spyOn(carbonInfo.httpClient, "post")
				.mockResolvedValueOnce({ data: { token: tokenizationStats } });

			const result = (await carbonInfo.queryTokenizationStats("1")) as TokenizationStats;

			expect(result!.id).toBe(tokenizationStats!.id);
			expect(result!.mintedAmount).toBe(tokenizationStats!.mintedAmount);
			expect(httpClient).toBeCalledWith("", tokenizationStatsQuery("1"));
		});

		it("should return null if tokenization stats doesn't exists", async () => {
			jest.spyOn(carbonInfo.httpClient, "post").mockResolvedValueOnce({ data: { token: null } });

			const result = (await carbonInfo.queryTokenizationStats("1")) as TokenizationStats;

			expect(result).toBeNull();
		});
	});

	describe("offset query", () => {
		it("should query offset history", async () => {
			const httpClient = jest
				.spyOn(carbonInfo.httpClient, "post")
				.mockResolvedValueOnce({ data: { retireds: offsetHistory } });

			const result = await carbonInfo.queryOffsetHistory();

			expect(result.length).toBe(2);
			expect(result[0].id).toBe(offsetHistory[0].id);
			expect(httpClient).toBeCalledWith("", offsetHistoryQuery);
		});

		it("should list of errors if something went wrong", async () => {
			const expectedResult = { errors: [{ error: "indexing_error" }] };
			jest.spyOn(carbonInfo.httpClient, "post").mockResolvedValueOnce(expectedResult);

			const result: QueryError = await carbonInfo.queryOffsetHistory();
			expect(result.length).toBe(1);
			expect(result[0].error).toBe("indexing_error");
		});

		it("should return offset stats", async () => {
			const httpClient = jest
				.spyOn(carbonInfo.httpClient, "post")
				.mockResolvedValueOnce({ data: { retired: offsetStats } });

			const result = (await carbonInfo.queryOffsetStats("1-1360-0")) as OffsetStats;

			expect(result!.id).toBe(offsetStats!.id);
			expect(result!.token!.mintedAmount).toBe(offsetStats!.token!.mintedAmount);
			expect(httpClient).toBeCalledWith("", offsetStatsQuery("1-1360-0"));
		});

		it("should return null if offset stats doesn't exists", async () => {
			jest.spyOn(carbonInfo.httpClient, "post").mockResolvedValueOnce({ data: { retired: null } });

			const result = (await carbonInfo.queryOffsetStats("1")) as OffsetStats;

			expect(result).toBeNull();
		});
	});
});
