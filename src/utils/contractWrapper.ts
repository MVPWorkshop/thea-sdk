import { ContractDetails, ProviderOrSigner } from "../types";
import { Contract } from "@ethersproject/contracts";
import { castAbiInterface } from "./utils";

export abstract class ContractWrapper<T extends Contract> {
	contract: T;
	contractDetails: ContractDetails;

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	constructor(
		readonly providerOrSigner: ProviderOrSigner,
		private readonly contractABI: any,
		private readonly address: string
	) {
		this.contractInit();
		this.contractDetails = {
			name: contractABI.contractName,
			address: this.address
		};
	}

	private contractInit() {
		this.contract = new Contract(this.address, castAbiInterface(this.contractABI.abi), this.providerOrSigner) as T;
	}
}
