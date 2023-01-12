import axios, { AxiosInstance } from "axios";
import { TheaNetwork } from "../../types";
import { consts, TheaAPICallError } from "../../utils";

export class HttpClient {
	readonly client: AxiosInstance;
	constructor(network: TheaNetwork) {
		this.client = axios.create({
			baseURL: consts[`${network}`].theaApiBaseUrl,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	// TODO: Add error handling here or in API call implementation
	async post<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
		try {
			const response = await this.client.post<TResponse>(path, payload);
			return response.data;
		} catch (error) {
			throw new TheaAPICallError(error.message, "POST", path);
		}
	}

	async get<TResponse>(path: string): Promise<TResponse> {
		try {
			const response = await this.client.get<TResponse>(path);
			return response.data;
		} catch (error) {
			throw new TheaAPICallError(error.message, "GET", path);
		}
	}
}
