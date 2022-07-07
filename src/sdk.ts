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
import { ListingStructOutput } from "./lib/contracts/Marketplacev1";
import {
  generateListingId,
  handleTransaction,
  validateListingParams,
} from "./lib/helpers";
import { ListingId, ListingParams, Network } from "./lib/types";
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

  getListing = async (id: ListingId,index:number = 0) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    if (!id || !utils.isHexString(id)) {
      throw Error("ID is invalid");
    }
    try {
      const listing = await this.contractInstance.getListing(id,index);
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

    const listingIndexes = await this.getListingIndexFromParams(validatedParams)
    if(!listingIndexes){
      return
    }

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buyWithToken(
        listingIndexes.hash,
        listingIndexes.index,
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
    const listingIndexes = await this.getListingIndexFromParams(validatedParams)
    if(!listingIndexes){
      return
    }
    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buy(listingIndexes.hash,listingIndexes.index, validatedParams.quantity);
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

  cancelListingByInfo = async (params: ListingParams) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
 
    const listingIndexes = await this.getListingIndexFromParams(params)
    if(!listingIndexes){
      return
    }
    let receipt = await this.cancelListing(listingIndexes.hash,listingIndexes.index)
    return receipt
  };

  cancelListing = async (id: ListingId,index:number) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }

    this.emit("tx-started");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.cancelList(id,index);
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
  }


  getListingIndexFromParams = async (params: ListingParams):Promise<{hash:ListingId,index:number} | null> => {

    try {
      validateListingParams(params);
    } catch (e: any) {
      this.logger(e);
      return null;
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
      validatedParams.token_id
    );

    // get listings
    let listings:ListingStructOutput[];
    try {
      listings = await this.contractInstance.getListings(id);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emit("error", err);
      return null;
    }

    const listing = listings.find((l)=>{
      return l.quantity.toNumber() == validatedParams.quantity && l.price.toNumber() == validatedParams.price && l.acceptedPayment.toLowerCase() == validatedParams.acceptedPayment.toLowerCase()
    })

    
    if(!listing){
      console.warn('No listing found with the given parameters.')
      return null
    }
    const index = listings.indexOf(listing)
    if(index ==-1){
      console.warn('No listing found with the given parameters.')
      return null
    }

    return {hash:id,index}
  }
}
