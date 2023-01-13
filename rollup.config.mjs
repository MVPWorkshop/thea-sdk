import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json" assert { type: "json" };
import { nodeResolve } from "@rollup/plugin-node-resolve";

const external = [...Object.keys(pkg.peerDependencies)];

export default [
	{
		input: "src/index.ts",
		output: [
			{
				name: "thea-js",
				file: pkg.browser,
				format: "umd",
				sourcemap: true,
				globals: {
					"@ethersproject/abstract-signer": "abstractSigner",
					"@ethersproject/providers": "providers",
					"@ethersproject/wallet": "wallet",
					"@ethersproject/bignumber": "bignumber",
					"@ethersproject/address": "address",
					"@ethersproject/contracts": "contracts",
					"@ethersproject/strings": "strings"
				}
			},
			{ file: pkg.main, format: "cjs", sourcemap: true },
			{ file: pkg.module, format: "es", sourcemap: true }
		],
		plugins: [nodeResolve(), json(), commonjs(), typescript({ tsconfig: "tsconfig.build.json" })],
		external
	},
	{
		input: "src/index.ts",
		output: [{ file: pkg.types, format: "es" }],
		plugins: [json(), typescript({ tsconfig: "tsconfig.build.json" })]
	}
];
