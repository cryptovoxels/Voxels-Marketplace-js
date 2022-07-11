import { ethers } from 'ethers';
import fs from 'fs'
const marketplaceABIJSON = require('./abis/Marketplace.json')
const WrappersRegistryABIJSON = require('./abis/WrappersRegistryV1.json')
const CryptovoxelsAccessControlABIJSON = require('./abis/CryptovoxelsAccessControl.json')
const TokenRegistryABIJSON = require('./abis/TokenRegistry.json')

/**
 * Script to deploy all the needed contracts to a local network
 * To work properly, the newest ABI JSON is needed and a local network should be running
 */


// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:8545";
// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
//@internal
export const deployLocal = async ()=>{

const signer = provider.getSigner()
console.log(signer)
const accessControlFactory = new ethers.ContractFactory(CryptovoxelsAccessControlABIJSON.abi,CryptovoxelsAccessControlABIJSON.bytecode,signer)
const accessControl = await accessControlFactory.deploy()

const tokenRegistryFactory = new ethers.ContractFactory(TokenRegistryABIJSON.abi,TokenRegistryABIJSON.bytecode,signer)
const tokenRegistry = await tokenRegistryFactory.deploy()

const registryFactory = new ethers.ContractFactory(WrappersRegistryABIJSON.abi,WrappersRegistryABIJSON.bytecode,signer)
const wrapperRegistry = await registryFactory.deploy(accessControl.address)

const marketplaceFactory = new ethers.ContractFactory(marketplaceABIJSON.abi,marketplaceABIJSON.bytecode,signer)
const marketplace = await marketplaceFactory.deploy()
await marketplace.initialize(tokenRegistry.address,wrapperRegistry.address,ethers.constants.AddressZero)

console.log('Contract Marketplace deployed')
console.log('addresses:')
console.log('marketplace: ', marketplace.address)
const json = {
  marketplace,
  wrapperRegistry,
  tokenRegistry,
  accessControl
}
const envEdit =`
TOKEN_REGISTRY_CONTRACT:${tokenRegistry.address}
MARKETPLACE_CONTRACT:${marketplace.address}
WRAPPER_REGISTRY_CONTRACT:${wrapperRegistry.address}`
// edit env file

try {
  console.log('Writing env...')
  // Write the addresses to env;
  // To be honest that's pretty disgusting, but it works
  fs.writeFile(__dirname + '/../.env', envEdit,(err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  // file written successfully
} catch (err) {
  console.error(err);
}
return json
}

deployLocal()