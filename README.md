# Voxels (cryptovoxels) Marketplace js

<b>WORK IN PROGRESS</b>

A package to allow anyone to interact with the Voxels marketplace contracts.

The contracts are based [here](https://github.com/cryptovoxels/Marketplace)
The graph repo is based [here](https://github.com/cryptovoxels/marketplace-subgraph)


## Setting up Dev environment.

0. Clone repo `get clone https://github.com/cryptovoxels/marketplace-js.git`

1. `npm i` to install the dependencies. If you encounter some issues, try LTS node v14.

2. Run `npm run abi-type-gen` to generate the types of the contract given the ABIs.


## Contributing

0. Setup your environment

1. Create a branch and do your changes

2. Make sure your code is formatted using `npm run format`

3. Also make sure your code builds using `npm run build`

4. Make sure you add tests and that tests run smoothly with `npm run test` (see test section below)

5. Create a Pull request at https://github.com/cryptovoxels/Voxels-Scripting-Server .

## Testing

For testing, you need `ganache` to run a local network.
Run `npm i -g ganache` to install ganache globally. If you encounter issues, try the command again with a lower version of NodeJS; (LTS v14 works fine)

1. Run ganache by running the command `ganache` in a separate console

2. Run `npm run test`

At the moment, `npm run test` is setup to deploy the abis of `test/abis/**.json` on the local network and then dynamically creates a `.env` file.
It's not a great behavior especially if we need a sticky `env` file in the future.

## How to use

1. install with `npm i @cryptovoxels/marketplace-js`

2. Import and use

### Using the Marketplace class

```js
import { Marketplace } from '@cryptovoxels/marketplace-js'

const provider = ethers.providers.Web3Provider(window.ethereum);

// All of these are optional; the default is console.log
const myHandlers={
    onTxStart: () => ...,
    onApprovalTxStart: () => ...,
    onTxHash: (hash: string) => console.log(hash),
    onApprovalTxHash: (hash: string) => ...,
    onTxMined: (hash: string) => ...,
    onApprovalTxMined: (hash: string) => ...,
    onError: (err: any) => ....
}
const network = 'mainnet' // See types for the networks: mainnet,mumbai,polygon,rinkeby

// Given we're calling `createListing` in this example, we use a Signer. Functions that reads (not write) from the blochain can run on a provider. 
const marketplace = new Marketplace(provider.getSigner(),myHandlers,network);

const myItemToList = {
  token_id: 1;
  address: '0x...';
  price: 0.5;
  quantity: 1;
}

await marketplace.createListing(myItemToList)
// emits events
// Will log "{hash:0x...}" given our onTxHash

```

**Purchasing an NFT**
```js

import {generateListingId} from '@cryptovoxels/marketplace-js'

const idOfListings= generateListingId(walletOfSeller,ContractAddress,TokenId)

// purchase takes 3 arguments: 2 optional and one required;
// idOfListings is a unique hash by seller+ContractAddress+tokenId;
// The second argument is the index within the list of listings  (by default 0)
// The third argument is the quantity to purchase
await marketplace.purchase(idOfListings,0,1)
```

### Using the SDK:


```js
import { VoxelsMarketplaceSDK,generateListingId } from '@cryptovoxels/marketplace-js'

const provider = ethers.providers.Web3Provider(window.ethereum);

const network = 'mainnet' // See types for the networks: mainnet,mumbai,polygon,rinkeby

// Given we're calling `createListing` in this example, we use a Signer. Functions that reads (not write) from the blochain can run on a provider. 
const marketplaceSDK = new VoxelsMarketplaceSDK(provider.getSigner(),network);

const myItemToList = {
  token_id: 1;
  address: '0x...';
  price: 0.5;
  quantity: 1;
}

await marketplaceSDK.createListing(myItemToList)
// emits events approval:tx-start -> approval:tx-hash -> approval:tx-mined
// emits events @:tx-start -> @:tx-hash -> @:tx-mined


// Purchasing:


const idOfListings= generateListingId(walletOfSeller,ContractAddress,TokenId)

// purchase takes 3 arguments: 2 optional and one required;
// idOfListings is a unique hash by seller+ContractAddress+tokenId;
// The second argument is the index within the list of listings  (by default 0)
// The third argument is the quantity to purchase
await marketplace.purchase(idOfListings,0,1)
```

## Todo:

- [x] Write tests (and tests on localhost blockchain network)
- [ ] Handle all errors and display them appropriately
- [ ] Make examples on how to use
- [ ] add other chains contracts
- [ ] add GSN support if possible
- [ ] Maybe test if we can integrate payments via GSN
- [ ] Add api calls to an api (subgraph?);
- [ ] Optimize?
