import { Wallet } from "@ethersproject/wallet";
import { GetCharacteristicsBytes, IRegistryContract, TheaNetwork } from "../../src";
import { PRIVATE_KEY } from "../mocks";

describe("GetCharacteristicsBytes.ts", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let getCharacteristicsBytes: GetCharacteristicsBytes;
	const tokenId = "1";
	const keys = ["0x000", "0x111", "0x222"];

	const mockContract: Partial<IRegistryContract> = {
		getCharacteristicsBytes: jest.fn().mockResolvedValue("0x0000010x0000010x000001")
	};

	beforeEach(() => {
		getCharacteristicsBytes = new GetCharacteristicsBytes(providerOrSigner, TheaNetwork.GOERLI);
		getCharacteristicsBytes.contract = mockContract as IRegistryContract;
	});

	describe("getCharacteristicsBytes", () => {
		it("should call getCharacteristicsBytes method from contract", async () => {
			const getCharacteristicsBytesSpy = jest.spyOn(getCharacteristicsBytes.contract, "getCharacteristicsBytes");

			const result = await getCharacteristicsBytes.getCharacteristicsBytes(tokenId, keys);

			expect(result).toEqual("0x0000010x0000010x000001");
			expect(getCharacteristicsBytesSpy).toHaveBeenCalledWith(tokenId, keys);
		});
	});
});
