import { consts, HttpClient, TheaAPICallError, TheaNetwork } from "../../../src";
import axios from "axios";
jest.mock("axios", () => {
	return {
		create: jest.fn().mockReturnValue({
			get: jest.fn(),
			post: jest.fn()
		})
	};
});

describe("httpClient", () => {
	let httpClient: HttpClient;
	class DummyResponseClass {
		constructor(readonly message: string) {}
	}

	const httpResponse = new DummyResponseClass("Welcome to Thea API");
	beforeEach(() => {
		httpClient = new HttpClient(consts[TheaNetwork.GOERLI].theaApiBaseUrl);
	});

	it("should create http client on class initialization", () => {
		const baseURL = "http://test.com";
		httpClient = new HttpClient(baseURL);
		const axiosCreateSpy = jest.spyOn(axios, "create");
		expect(axiosCreateSpy).toBeCalledWith({
			baseURL: baseURL,
			headers: {
				"Content-Type": "application/json"
			}
		});
		expect(httpClient.client).toBeDefined();
	});
	describe("GET", () => {
		it("should return the correct response for GET request", async () => {
			jest.spyOn(httpClient.client, "get").mockResolvedValue({ data: httpResponse });

			const response = await httpClient.get<DummyResponseClass>("/api/v1/");

			expect(response).toEqual({
				message: "Welcome to Thea API"
			});
			expect(response).toBeInstanceOf(DummyResponseClass);
		});

		it("should throw TheaAPICallError for GET request", async () => {
			jest.spyOn(httpClient.client, "get").mockRejectedValue({ message: "Error" });

			await expect(httpClient.get<DummyResponseClass>("/api/v1/")).rejects.toThrow(
				new TheaAPICallError("Error", "GET", "/api/v1/")
			);
		});
	});

	describe("POST", () => {
		it("should return the correct response for POST request", async () => {
			jest.spyOn(httpClient.client, "post").mockResolvedValue({ data: httpResponse });

			const response = await httpClient.post<DummyResponseClass, DummyResponseClass>("/api/v1/", httpResponse);

			expect(response).toEqual({
				message: "Welcome to Thea API"
			});
			expect(response).toBeInstanceOf(DummyResponseClass);
		});

		it("should throw TheaAPICallError for POST request", async () => {
			jest.spyOn(httpClient.client, "post").mockRejectedValue({ message: "Error" });

			await expect(
				httpClient.post<DummyResponseClass, DummyResponseClass>(
					"/api/v1/",
					new DummyResponseClass("Welcome to Thea API")
				)
			).rejects.toThrow(new TheaAPICallError("Error", "POST", "/api/v1/"));
		});
	});
});
