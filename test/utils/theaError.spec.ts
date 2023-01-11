import { TheaError, TheaTransactionError } from "../../src/utils";
import { CONTRACT_ADDRESS } from "../mocks";

describe("Thea errors", () => {
	it("should return the correct error message and type for TheaError", () => {
		const error = new TheaError({ message: "error message", type: "EMPTY_OPTIONS" });
		expect(error.message).toBe("error message");
		expect(error.type).toBe("EMPTY_OPTIONS");
		expect(error instanceof Error).toBe(true);
	});

	it("should return the correct error message, type and contract details for TheaTransactionError", () => {
		const error = new TheaTransactionError(
			{ message: "error message", type: "TRANSACTION_FAILED" },
			{ address: CONTRACT_ADDRESS, contractFunction: "unwrap", name: "Registry" }
		);
		expect(error.message).toBe("error message");
		expect(error.type).toBe("TRANSACTION_FAILED");
		expect(error instanceof TheaError).toBe(true);
	});
});
