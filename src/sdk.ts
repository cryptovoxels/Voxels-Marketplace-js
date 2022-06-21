import { Networkish } from "@ethersproject/networks";
import {
  constants,
  Contract,
  getDefaultProvider,
  providers,
  utils,
} from "ethers";
import { EventEmitter } from "events";
import { MARKETPLACE_CONTRACT_RINKEBY } from "./lib/constants";
import { Marketplacev1 } from "./lib/contracts";
import {
  generateListingId,
  handleTransaction,
  validateListingParams,
} from "./lib/helpers";
import { ListingParams, Network } from "./lib/types";
const marketplaceAbi = require("../abi/marketplacev1.json");

export class VoxelsMarketplace extends EventEmitter {
  private provider: any;
  private contractInstance: Marketplacev1;
  private logger: (args: string) => void = console.log;
  constructor(
    provider: any,
    network: Network = "mainnet",
    logger?: (args: string) => void
  ) {
    super();
    this.provider =
      new providers.Web3Provider(provider) || getDefaultProvider(network);
    this.contractInstance = new Contract(
      network == "rinkeby" ? MARKETPLACE_CONTRACT_RINKEBY : network,
      marketplaceAbi,
      this.provider
    ) as Marketplacev1;
    if (logger) {
      this.logger = logger;
    }
  }

  getListing = async (id: string) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    if (!id || !utils.isHexString(id)) {
      throw Error("ID is invalid");
    }
    try {
      const listing = await this.contractInstance.getListing(id);
      console.log(listing);
      return listing;
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
  };

  listItem = async (params: ListingParams) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }

    try {
      validateListingParams(params);
    } catch (e: any) {
      this.logger(e);
      return;
    }
    const validatedParams: ListingParams = params as ListingParams;
    // check ownership of asset

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.list(
        validatedParams.address,
        validatedParams.token_id,
        validatedParams.price,
        validatedParams.quantity || 1,
        validatedParams.acceptedPayment || constants.AddressZero
      );
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-mined", { hash: receipt.transactionHash });
    return receipt;
  };

  purchaseItem = async (params: ListingParams) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }

    try {
      validateListingParams(params);
    } catch (e: any) {
      this.logger(e);
      return;
    }
    const validatedParams = {
      ...params,
      quantity: params.quantity || 1,
      acceptedPayment: params.acceptedPayment || constants.AddressZero,
    } as ListingParams;

    if (validatedParams.acceptedPayment !== constants.AddressZero) {
      this.buyWithToken(validatedParams);
    } else {
      this.buyWithNativeToken(validatedParams);
    }
  };

  private buyWithToken = async (validatedParams: ListingParams) => {
    if (!validatedParams.seller) {
      throw Error("Seller address is undefined");
    }
    let id = generateListingId(
      validatedParams.seller,
      validatedParams.address,
      validatedParams.token_id,
      validatedParams.price,
      validatedParams.quantity,
      validatedParams.acceptedPayment
    );

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buyWithToken(
        id,
        validatedParams.quantity
      );
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-mined", { hash: receipt.transactionHash });
    return receipt;
  };

  private buyWithNativeToken = async (validatedParams: ListingParams) => {
    if (!validatedParams.seller) {
      throw Error("Seller address is undefined");
    }
    let id = generateListingId(
      validatedParams.seller,
      validatedParams.address,
      validatedParams.token_id,
      validatedParams.price,
      validatedParams.quantity,
      validatedParams.acceptedPayment
    );

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buy(id, validatedParams.quantity);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-mined", { hash: receipt.transactionHash });
    return receipt;
  };

  cancelListing = async (params: ListingParams) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    try {
      validateListingParams(params);
    } catch (e: any) {
      this.logger(e);
      return;
    }
    const validatedParams = {
      ...params,
      quantity: params.quantity || 1,
      acceptedPayment: params.acceptedPayment || constants.AddressZero,
      seller: params.seller || constants.AddressZero,
    };
    let id = generateListingId(
      validatedParams.seller,
      validatedParams.address,
      validatedParams.token_id,
      validatedParams.price,
      validatedParams.quantity,
      validatedParams.acceptedPayment
    );

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.cancelList(id);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return;
    }
    this.emit("tx-mined", { hash: receipt.transactionHash });
    return receipt;
  };
}
