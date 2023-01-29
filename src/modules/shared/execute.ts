import { ContractReceipt, ContractTransaction, Event } from "@ethersproject/contracts";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { ContractDetails } from "../../types";
import { TheaContractCallError } from "../../utils";

export const execute = async (
	txPromise: Promise<ContractTransaction | TransactionResponse>,
	details: ContractDetails & { contractFunction: string }
): Promise<ContractReceipt | TransactionReceipt> => {
	try {
		const tx = await txPromise;
		return tx.wait();
	} catch (error) {
		throw new TheaContractCallError(
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
	const reciept: ContractReceipt = await execute(txPromise, details);
	return { ...responseExtractCb(reciept.events), ...reciept };
};
