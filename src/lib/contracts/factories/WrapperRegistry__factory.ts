/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  WrapperRegistry,
  WrapperRegistryInterface,
} from "../WrapperRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_accessControlImpl",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "implementation_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wrapper",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "Registered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "Unregistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "fromAddress",
    outputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "implementation_",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrapper_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "fromImplementationAddress",
    outputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "implementation_",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrapper_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name__",
        type: "string",
      },
    ],
    name: "fromName",
    outputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "implementation_",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrapper_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getWrapper",
    outputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrapper",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "isRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_impl",
        type: "address",
      },
    ],
    name: "isWrapped",
    outputs: [
      {
        internalType: "bool",
        name: "_isWrapped",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation_",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrapper_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
    ],
    name: "register",
    outputs: [
      {
        internalType: "bool",
        name: "registered",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "togglePause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "unregister",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class WrapperRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): WrapperRegistryInterface {
    return new utils.Interface(_abi) as WrapperRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WrapperRegistry {
    return new Contract(address, _abi, signerOrProvider) as WrapperRegistry;
  }
}
