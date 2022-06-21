# Voxels (cryptovoxels) Marketplace js

<b>WORK IN PROGRESS</b>

A package to allow anyone to interact with the Voxels marketplace contracts.

The contracts are based at [here](https://github.com/cryptovoxels/Marketplace)

## How to

1. install with `npm i voxels-marketplace-js`

2. Use

```js
const provider = window.ethereum;

const marketplaceSDK = new VoxelsMarketplace(window.ethereum);

const myItemToList = {
  token_id: 1;
  address: '0x...';
  price: 0.5;
  quantity: 1;
}

await marketplace.list(myItemToList)
// emits events
```

## Todo:

- [] Write tests (and tests on localhost blockchain network)
- [] Make examples on how to use
- [] Maybe test if we can integrate payments via GSN
- [] Add api calls to an api;
- [] Optimize?

## Contributing

0. Clone repo `git pull

1. Create a branch and do your changes

2. Make sure your code is formatted using `npm run format`

3. Also make sure your code builds using `npm run build`

4. Create a Pull request at https://github.com/cryptovoxels/Voxels-Scripting-Server .
