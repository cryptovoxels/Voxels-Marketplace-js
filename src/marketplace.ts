import { Network, EventNames } from "./lib/types";
import { VoxelsMarketplaceSDK } from "./sdk";

export interface marketplaceHandlersOptions {
  onTxStart?: () => void;
  onApprovalTxStart?: () => void;
  onTxHash?: (hash: string) => void;
  onApprovalTxHash?: (hash: string) => void;
  onTxMined?: (hash: string) => void;
  onApprovalTxMined?: (hash: string) => void;
  onError?: (err: any) => void;
}

/**
 * Class for easy implementation of the Marketplace SDK.
 * It handles events fired by the SDK class;
 */
export class Marketplace extends VoxelsMarketplaceSDK {
  onTxStart?: () => void = () => console.log("Transaction started");
  onApprovalTxStart?: () => void = () => console.log("Transaction started");
  onTxHash?: (hash: string) => void = console.log;
  onApprovalTxHash?: (hash: string) => void = console.log;
  onTxMined?: (hash: string) => void = console.log;
  onApprovalTxMined?: (hash: string) => void = console.log;
  onError?: (err: any) => void = console.error;

  constructor(
    providerOrSigner: any,
    handlers: marketplaceHandlersOptions,
    network: Network
  ) {
    super(providerOrSigner, network);

    Object.assign(this, handlers);
    this.init();
  }

  init() {
    this.createListeners();
  }

  private createListeners = () => {
    this.removeListeners();
    this.onTxStart && this.on("@:tx-start" as EventNames, this.onTxStart);
    this.onTxHash && this.on("@:tx-hash" as EventNames, this.onTxHash);
    this.onTxMined && this.on("@:tx-mined" as EventNames, this.onTxMined);
    this.onApprovalTxStart &&
      this.on("approval:tx-start" as EventNames, this.onApprovalTxStart);
    this.onApprovalTxHash &&
      this.on("approval:tx-hash" as EventNames, this.onApprovalTxHash);
    this.onApprovalTxMined &&
      this.on("approval:tx-mined" as EventNames, this.onApprovalTxMined);
    this.onError && this.on("error" as EventNames, this.onError);
  };

  private removeListeners = () => {
    this.removeAllListeners();
  };

  dispose = () => {
    this.removeListeners();
  };
}
