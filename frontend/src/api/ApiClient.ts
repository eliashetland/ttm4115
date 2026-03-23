import { queryClient } from "../queryClient";

export interface IHttpApiResponse<T> {
	data: T;
	statusCode: number;
}

/**
 * ApiClient is a wrapper around fetch that handles the common use cases for the API
 */
export class ApiClient {
	static baseUrl: string = "/api"

	public static async get<T>(url: string): Promise<T> {
		return await this.customFetch<T>({
			url,
			method: "get",
		});
	}

	public static async post<T>(url: string, queryKeys: unknown[], body: unknown): Promise<T> {
		queryClient.invalidateQueries({ queryKey: queryKeys });

		return await this.customFetch<T>({
			url,
			method: "post",
			body: JSON.stringify(body),
		});
	}

	public static async put<T>(url: string, queryKeys: unknown[], body: unknown): Promise<T> {
		queryClient.invalidateQueries({ queryKey: queryKeys });

		return await this.customFetch<T>({
			url,
			method: "put",
			body: JSON.stringify(body),
		});
	}

	public static async delete<T>(url: string, queryKeys: unknown[], body?: unknown): Promise<T> {
		queryClient.invalidateQueries({ queryKey: queryKeys });

		return await this.customFetch<T>({
			url,
			method: "delete",
			body: JSON.stringify(body),
		});
	}

	public static async postRawBody<T>(url: string, body?: BodyInit): Promise<T> {
		return await this.customFetch<T>({
			url,
			method: "post",
			body: body,
			contentType: null, // Browser must set content type so it also adds boundry
		});
	}

	/**
	 * Low level implementation of fetch to handle common use cases, used by public methods in this class.
	 * With custom headers, that among other things handle user auth
	 */
	private static async customFetch<T>(props: { url: string; method: string; body?: BodyInit; contentType?: string | null }): Promise<T> {
		const headers: HeadersInit = {};

		if (props.body) {
			headers["Accept"] = "application/json";
		}

		if (props.contentType) {
			headers["Content-Type"] = props.contentType;
		} else if (props.body && props.contentType !== null) {
			headers["Content-Type"] = "application/json";
		}

		const options: RequestInit = {
			credentials: "include",
			headers,
			method: props.method,
		};

		if (props.body) {
			options["body"] = props.body;
		}

		const response = await fetch(
            `http://localhost:3000${this.baseUrl}${props.url}`, options);

		if (!response.ok) {
			return Promise.reject(response);
		}

		const text = await response.text();
		const data = text ? JSON.parse(text) : {};

		return data;
	}
}