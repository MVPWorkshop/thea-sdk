import { ContractReceipt, ContractTransaction, Event } from "@ethersproject/contracts";
import { ContractDetails, execute, executeWithResponse, TheaTransactionError } from "../../../src";

describe("Execute", () => {
	const details: ContractDetails & { contractFunction: string } = {
		contractFunction: "test",
		address: "0x123",
		name: "test"
	};
	const contractReceipt: Partial<ContractReceipt> = {
		to: "0x123"
	};

	const tx: Partial<ContractTransaction> = {
		hash: "0x123",
		from: "0x123",
		wait: () => Promise.resolve(contractReceipt as ContractReceipt)
	};

	it("should throw error if transaction fails", async () => {
		const txPromise = Promise.reject(new Error("Transaction failed"));

		await expect(execute(txPromise, details)).rejects.toThrow(
			new TheaTransactionError(
				{
					type: "TRANSACTION_FAILED",
					message: "Transaction failed"
				},
				details
			)
		);
	});

	it("should return contract receipt", async () => {
		const txPromise = Promise.resolve(tx as ContractTransaction);
		const waitSpy = jest.spyOn(tx, "wait");

		const result = await execute(txPromise, details);

		expect(result).toMatchObject(contractReceipt);
		expect(waitSpy).toHaveBeenCalled();
	});

	it("should return contract receipt with response", async () => {
		const event: Partial<Event> = {
			event: "Test",
			args: [1]
		};
		contractReceipt.events = [event as Event];

		const txPromise = Promise.resolve(tx as ContractTransaction);
		const responseCallback = (events?: Event[]): { value?: string } => {
			const response: { value?: string } = {};
			if (events) {
				const event = events.find((e) => e.event === "Test");
				if (event) {
					response.value = event.args?.[0].toString();
				}
			}
			return response;
		};
		const result = await executeWithResponse<{ value?: string }>(txPromise, details, responseCallback);
		expect(result).toMatchObject({ ...contractReceipt, value: "1" });
	});
});
