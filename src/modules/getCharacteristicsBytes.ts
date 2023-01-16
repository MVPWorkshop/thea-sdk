import { ProviderOrSigner, IRegistryContract, TheaNetwork } from "../types";
import { consts, ContractWrapper } from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumberish } from "@ethersproject/bignumber";

export class GetCharacteristicsBytes extends ContractWrapper<IRegistryContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Registry_ABI, consts[`${network}`].registryContract);
	}

	/**
	 * Returns characteristics bytes of the registry.
	 * @returns A promise fulfilled with characteristics bytes.
	 */
	async getCharacteristicsBytes(id: BigNumberish, keys: string[]): Promise<string> {
		const bytes = await this.contract.getCharacteristicsBytes(id, keys);
		return bytes;
	}
}
