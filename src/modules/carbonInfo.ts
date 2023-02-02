import { ISO_CODES, TheaError } from "../utils";
import co2dataset from "../co2dataset.json";
export type Co2DataSet = {
	[key in ISO_CODES]: {
		country: string;
		isoCode: ISO_CODES;
		data: { year: number; co2_per_capita?: number }[];
	};
};
type FootprintQuery = {
	country: ISO_CODES;
	year: number | null;
};

export class CarbonInfo {
	private dataSet: Co2DataSet;
	constructor() {
		this.dataSet = co2dataset as Co2DataSet;
	}

	estimateFoorprint(): number {
		return 5;
	}

	countries(): { country: string; isoCode: ISO_CODES }[] {
		return Object.values(this.dataSet).map((data) => ({ country: data.country, isoCode: data.isoCode }));
	}

	// TODO: Check this year range
	private validateYear(year: number) {
		if (year < 2015 || year > new Date().getFullYear() - 2) {
			throw new TheaError({ type: "INVALID_YEAR", message: "Allowed year range is between 1911 till current year" });
		}
	}

	private validateLocationYearOrder(locations: FootprintQuery[]) {
		for (let i = 0; i < locations.length - 1; i++) {
			const firstYear = locations[`${i}`].year;
			const secondYear = locations[`${i + 1}`].year;
			if (firstYear === null || secondYear === null) {
				throw new TheaError({
					type: "INVALID_YEAR_IN_QUERY",
					message: "Year cannot be null in the middle of the query. Null value is allowed only for last element"
				});
			}

			if (firstYear > secondYear) {
				return false;
			}
		}
		return true;
	}
}
