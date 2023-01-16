import { Signer } from "@ethersproject/abstract-signer";
import { Provider, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Convert, GetCharacteristicsBytes, Recover, Tokenization, Unwrap } from "../modules";
import { TheaNetwork, ProviderOrSigner } from "../types";
import { TheaError } from "../utils";

// SDK initialization options
export type InitOptions = {
	network: TheaNetwork;
	provider?: Provider;
	privateKey?: string;
	signer?: Signer;
	web3Provider?: Web3Provider;
};

export class TheaSDK {
	readonly unwrap: Unwrap;
	readonly tokenization: Tokenization;
	readonly convert: Convert;
	readonly recover: Recover;

	private constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.unwrap = new Unwrap(this.providerOrSigner);
		this.convert = new Convert(this.providerOrSigner);
		const registry = new GetCharacteristicsBytes(this.providerOrSigner);
		this.recover = new Recover(this.providerOrSigner, registry);
	}

	/**
	 * Function to initialize TheaSDK. It accepts a variety of options to instantiate provider or signer which will be used
	 * to call Thea protocol.
	 * @param options.network Thea network to connect to {@link TheaNetwork}
	 * @param options.provider Any ethers provider
	 * @param options.privateKey Private key for instantiating a wallet
	 * @param options.signer Passed as ethers.Signer (ethers.Wallet)
	 * @param options.web3Provider Web3 provider
	 * @returns Initialized TheaSDK instance
	 */
	static init(options: InitOptions): TheaSDK {
		let providerOrSigner: ProviderOrSigner;

		if (options.web3Provider) providerOrSigner = options.web3Provider.getSigner() as Signer;
		else if (options.signer) providerOrSigner = options.signer;
		else if (options.privateKey) {
			if (!options.provider) {
				throw new TheaError({
					type: "MISSING_PROVIDER",
					message: "You must pass in a provider together with private key"
				});
			}

			providerOrSigner = new Wallet(options.privateKey, options.provider);
		} else if (options.provider) providerOrSigner = options.provider;
		else throw new TheaError({ type: "EMPTY_OPTIONS", message: "Non of optional parameters were provided" });

		return new TheaSDK(providerOrSigner, options.network);
	}
}
