import { TheaAPICallError, TheaError, TheaContractCallError, TheaSubgraphError } from "../../src/utils";
import { CONTRACT_ADDRESS } from "../mocks";

describe("Thea errors", () => {
	it("should return the correct error message and type for TheaError", () => {
		const error = new TheaError({ message: "error message", type: "EMPTY_OPTIONS" });
		expect(error.message).toBe("error message");
		expect(error.type).toBe("EMPTY_OPTIONS");
		expect(error instanceof Error).toBe(true);
	});

	it("should return the correct error message, type and contract details for TheaContractCallError", () => {
		const error = new TheaContractCallError(
			{ message: "error message", type: "TRANSACTION_FAILED" },
			{ address: CONTRACT_ADDRESS, contractFunction: "unwrap", name: "Registry" }
		);
		expect(error.message).toBe("error message");
		expect(error.type).toBe("TRANSACTION_FAILED");
		expect(error instanceof TheaError).toBe(true);
	});

	it("should return the correct error message, type, method and endpoint path details for TheaAPICallError", () => {
		const error = new TheaAPICallError("404 not found", "GET", "/api/v1/");
		expect(error.message).toBe("404 not found");
		expect(error.type).toBe("API_CALL_ERROR");
		expect(error.endpoint).toBe("/api/v1/");
		expect(error.method).toBe("GET");
		expect(error instanceof TheaError).toBe(true);
	});

	it("should return the correct error message, type and QueryError array for TheaSubgraphError", () => {
		const error = new TheaSubgraphError("Subgraph call error", [{ message: "error message", locations: [], path: [] }]);
		expect(error.message).toBe("Subgraph call error");
		expect(error.type).toBe("SUBGRAPH_CALL_ERROR");
		expect(error.queryErrors.length).toBe(1);

		expect(error instanceof TheaError).toBe(true);
	});
});
