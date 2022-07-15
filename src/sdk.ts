require("dotenv").config();
import { constants, Contract, ethers, getDefaultProvider, utils } from "ethers";
import { EventEmitter } from "events";
import { Marketplacev1 } from "./lib/contracts";
import { ListingStructOutput } from "./lib/contracts/Marketplacev1";
import {
  askApproval,
  getAddressFromSigner,
  getContractsByNetwork,
  getIsApproved,
  handleTransaction,
  isProvider,
  validateListingParams,
} from "./lib/helpers";
import {
  EventNames,
  IndexingObject,
  ListingId,
  ListingParams,
  Network,
  ProviderOrSigner,
} from "./lib/types";
const marketplaceAbi = require("./abis/marketplacev1.json");

export class VoxelsMarketplace extends EventEmitter {
  private providerOrSigner: ProviderOrSigner;
  private contractInstance: Marketplacev1;
  private network: Network;
  private logger: (args: string) => void = console.log;
  private emitEvent = (eventName:EventNames,...args:any[])=>this.emit(eventName,args)
  constructor(
    providerOrSigner: ProviderOrSigner,
    network: Network = "mainnet",
    logger?: (args: string) => void
  ) {
    super();

    this.providerOrSigner = this.handleProviderOrSigner(
      providerOrSigner,
      network
    );
    this.network = network;
    this.contractInstance = new Contract(
      getContractsByNetwork(network).marketplace,
      marketplaceAbi,
      this.providerOrSigner
    ) as Marketplacev1;
    if (logger) {
      this.logger = logger;
    }
  }
  /**
   * handles the given provider or signer from constructor
   * @param providerOrSigner ethers Provider or Signer
   * @param network a network; see Network types;
   * @returns
   */
  private handleProviderOrSigner(
    providerOrSigner: ProviderOrSigner,
    network: Network
  ) {
    if (!providerOrSigner) {
      return getDefaultProvider(network);
    }
    return providerOrSigner;
  }
  /**
   * Get a listing from the contract directly given a hash id and index
   * @param id a hash representing the listings list for given user+contract+tokenid
   * @param index index of the listing inside the listings[] array (default 0)
   * @returns
   */
  getListing = async (id: ListingId, index: number = 0) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    if (!id || !utils.isHexString(id)) {
      throw Error("ID is invalid");
    }

    try {
      const listing = await this.contractInstance.getListing(id, index);
      return listing;
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
  };
  /**
   * list an NFT given the parameters
   * @param params an object containing parameters about the listing: token_id, address,price,quantity,acceptedPayment
   * @returns
   */
  createListing = async (params: ListingParams) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }

    if (isProvider(this.providerOrSigner)) {
      throw Error("Use a Signer to list an item");
    }

    try {
      validateListingParams(params);
    } catch (e: any) {
      this.logger(e);
      return;
    }
    const validatedParams: ListingParams = params as ListingParams;

    const userWallet = await getAddressFromSigner(
      this.providerOrSigner as ethers.Signer
    );
    //Check approval of the implementation contract
    let isApproved = await getIsApproved(
      this.contractInstance,
      validatedParams.address,
      userWallet,
      this.network
    );
    if (!isApproved) {
      isApproved = await askApproval(
        this.contractInstance,
        validatedParams.address,
        userWallet,
        this.network,
        this.emitEvent.bind(this)
      );
      if (!isApproved) {
        // Cannot list if not approved
        throw new Error("Cannot list if contract is not approved");
      }
    }

    this.emitEvent("@:tx-start");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.list(
        validatedParams.address,
        validatedParams.token_id,
        ethers.utils.parseEther(validatedParams.price.toString()),
        validatedParams.quantity || 1,
        validatedParams.acceptedPayment || constants.AddressZero
      );
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-mined", { hash: receipt.transactionHash });
    return receipt;
  };

  /**
   * Purchase an NFT listed given an id or its listing parameters.
   * @param id hash representing the id of the list of listings for the given user+contract+tokenId
   * @param index index of the listing inside the list of listings
   * @param quantityToPurchase Quantity of the NFT to purchase
   * @returns
   */
  purchase = async (
    id: ListingId,
    index: number = 0,
    quantityToPurchase: number = 1
  ) => {
    const indexingObject: IndexingObject = { id, index };

    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    if (isProvider(this.providerOrSigner)) {
      throw Error("Use a Signer to purchase an item");
    }
    let listing = undefined as ListingStructOutput | undefined;

    if (indexingObject.id) {
      listing = await this.getListing(indexingObject.id, indexingObject.index);
    }

    if (!listing) {
      throw new Error("Could not find listing.");
    }

    if (listing.acceptedPayment !== constants.AddressZero) {
      return this.buyWithToken(indexingObject, quantityToPurchase);
    } else {
      return this.buyWithNativeToken(
        indexingObject,
        listing.price.toString(),
        quantityToPurchase
      );
    }
  };

  private buyWithToken = async (
    indexes: IndexingObject,
    quantityToPurchase: number
  ) => {
    this.emitEvent("@:tx-start");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buyWithToken(
        indexes.id,
        indexes.index,
        quantityToPurchase
      );
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-mined", { hash: receipt.transactionHash });
    return receipt.status;
  };

  private buyWithNativeToken = async (
    indexes: IndexingObject,
    value: string,
    quantityToPurchase: number
  ) => {
    this.emitEvent("@:tx-start");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.buy(
        indexes.id,
        indexes.index,
        quantityToPurchase,
        { value }
      );
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-mined", { hash: receipt.transactionHash });
    return receipt.status;
  };

  cancelListing = async (id: ListingId, index: number = 0) => {
    if (!this.contractInstance) {
      throw Error("SDK not initialized");
    }
    if (isProvider(this.providerOrSigner)) {
      throw Error("Use a Signer to cancel a listing");
    }
    this.emitEvent("@:tx-start");
    //list item
    let tx;
    try {
      tx = await this.contractInstance.cancelList(id, index);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-hash", { hash: tx.hash });
    let receipt;
    try {
      receipt = await handleTransaction(tx);
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      this.logger(err);
      this.emitEvent("error", err);
      return;
    }
    this.emitEvent("@:tx-mined", { hash: receipt.transactionHash });
    return receipt.status;
  };

  connect(signer: ethers.Signer) {
    if (signer._isSigner) {
      this.providerOrSigner = signer;
      this.contractInstance = this.contractInstance.connect(signer);
    }
    return this;
  }

  get contract() {
    return this.contractInstance;
  }
}
