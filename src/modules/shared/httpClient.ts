import axios, { AxiosInstance } from "axios";
import { TheaAPICallError } from "../../utils";

export class HttpClient {
	readonly client: AxiosInstance;
	constructor(url: string) {
		this.client = axios.create({
			baseURL: url,
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async get<TResponse>(path: string, params?: Record<string, any>): Promise<TResponse> {
		try {
			const response = await this.client.get<TResponse>(path, { params });
			return response.data;
		} catch (error) {
			throw new TheaAPICallError(error.message, "GET", path);
		}
	}
}
