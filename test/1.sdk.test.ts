import { ethers } from 'ethers';
import test from 'tape'
import {generateListingId, VoxelsMarketplaceSDK} from '../src/index'
import { askApproval, getIsApproved } from '../src/lib/helpers';
import { ListingInfo, ListingParams } from '../src/lib/types';
const MockERC721JSON = require('./abis/MockERC721.json')

// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:8545";
// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
const signer = provider.getSigner()
const signer2 = provider.getSigner(1)

let mockERC721:ethers.Contract;

const sdk:VoxelsMarketplaceSDK = new VoxelsMarketplaceSDK(signer,'local')
//Custom function to create heeaps of orders
test('Setup()', async (t) => {
    const mockErc721Factory = new ethers.ContractFactory(MockERC721JSON.abi,MockERC721JSON.bytecode,signer)
    mockERC721 = await mockErc721Factory.deploy()
    await mockERC721.mint(1)
    await mockERC721.mint(2)
    t.end()
})

test('Make sure env vars are set', (t) => {
    t.ok(process.env.TOKEN_REGISTRY_CONTRACT)
    t.ok(process.env.MARKETPLACE_CONTRACT)
    t.end()
})

test('Helpers: Approval mockERC721 is false', async (assert) => {
    const wallet = await signer.getAddress()

    let isApproved = await getIsApproved(sdk.contract,mockERC721.address,wallet,'local')
    assert.false(isApproved,"Contract should not be approved")
    assert.end()
})

test('Helpers: ask Approval mockERC721', async (assert) => {
    const wallet = await signer.getAddress()

    let isApproved = await askApproval(sdk.contract,mockERC721.address,wallet,'local',sdk.emit.bind(sdk))
    assert.true(isApproved,"Contract should now be approved")
    assert.end()
})

test('SDK list item', async (assert) => {

    const params:ListingParams = {
        token_id:'1',
        address:mockERC721.address,
        price:0.1,
        quantity:1,
        acceptedPayment:ethers.constants.AddressZero
    }
    
    let listing = await sdk.createListing(params)
    assert.ok(listing)

    let listing2 = await sdk.createListing(Object.assign(params,{token_id:'2'}))
    assert.ok(listing2)
    assert.end()
})


test('SDK Get listing; index 0', async (assert) => {
    const params:ListingParams = {
        token_id:'1',
        address:mockERC721.address,
        price:0.1,
        quantity:1,
        acceptedPayment:ethers.constants.AddressZero
    }
    
    const wallet = await signer.getAddress()
    const id = generateListingId(wallet,params.address,params.token_id)

    let listing = await sdk.getListing(id)
    if(!listing){
        assert.fail('Unexpected: No listing found')
        assert.end()
        return
    }

    assert.equal(listing.acceptedPayment,ethers.constants.AddressZero,'acceptedPayment should be address Zero')
    assert.equal(listing.contractAddress,params.address,'contractAddress should be '+params.address)
    assert.equal(listing.seller,wallet,'Seller should be '+wallet)
    assert.equal(listing.quantity.toNumber(),params.quantity,'Quantity should be '+params.quantity)
    assert.end()

})


test('SDK Buy listing', async (assert) => {
    const wallet = await signer.getAddress()

    const id = generateListingId(wallet,mockERC721.address,'1')
    
    sdk.connect(signer2)
    try{
        await sdk.purchase(id)
        assert.ok(true)
    }catch(e:any){
        assert.fail(e||"Failed to purchase NFT")
        assert.end()
        return
    }
    
    let listing = await sdk.getListing(id)
    if(!listing){
        assert.fail('Unexpected: No listing found')
        assert.end()
        return
    }

    assert.equal(listing.quantity.toNumber(),0,"Quantity should be zero")
    assert.end()

})


test('SDK Cancel listing', async (assert) => {
    const wallet = await signer.getAddress()

    const id = generateListingId(wallet,mockERC721.address,'2')
    
    try{
        await sdk.connect(signer).cancelListing(id)
        assert.ok(true)
    }catch(e:any){
        assert.fail(e||"Failed to cancel NFT listing")
        assert.end()
        return
    }
    
    let listing = await sdk.getListing(id)
    if(!listing){
        assert.fail('Unexpected: No listing found')
        assert.end()
        return
    }

    assert.equal(listing.quantity.toNumber(),0,"Quantity should be zero")
    assert.end()

})