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

	async post<TRequest, TResponse>(
		path: string,
		payload: TRequest,
		params?: Record<string, string>
	): Promise<TResponse> {
		try {
			const response = await this.client.post<TResponse>(path, payload, { params });
			return response.data;
		} catch (error) {
			throw new TheaAPICallError(error.message, "POST", path);
		}
	}

	async get<TResponse>(path: string, params?: Record<string, string>): Promise<TResponse> {
		try {
			const response = await this.client.get<TResponse>(path, { params });
			return response.data;
		} catch (error) {
			throw new TheaAPICallError(error.message, "GET", path);
		}
	}
}
