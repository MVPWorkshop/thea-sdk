import { ContractReceipt, ContractTransaction, Event } from "@ethersproject/contracts";
import { ContractDetails } from "../../types";
import { TheaTransactionError } from "../../utils";

export const execute = async (
	txPromise: Promise<ContractTransaction>,
	details: ContractDetails & { contractFunction: string }
): Promise<ContractReceipt> => {
	try {
		const tx = await txPromise;
		return tx.wait();
	} catch (error) {
		throw new TheaTransactionError(
			{
				type: "TRANSACTION_FAILED",
				message: error.message
			},
			details
		);
	}
};

export const executeWithResponse = async <T>(
	txPromise: Promise<ContractTransaction>,
	details: ContractDetails & { contractFunction: string },
	responseExtractCb: (events?: Event[]) => T
): Promise<T & ContractReceipt> => {
	const reciept = await execute(txPromise, details);
	return { ...responseExtractCb(reciept.events), ...reciept };
};
