import { ERC20__factory, type ERC20 } from '@createz/contracts/types/ethers-contracts';
import type { EventDispatcher } from 'svelte';
import { type Hash, AddressSchema, type Address } from './common';
import { z } from 'zod';
import type { Signer } from 'ethers';
import { log } from '$lib/logger';


export type ApprovalEvents = {
  approvalTxSubmitted: Hash;
  approved: [bigint, Hash];
};

const Erc20DataSchema = z.object({
  address: AddressSchema,
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

export type Erc20Data = z.infer<typeof Erc20DataSchema>;

export function getErc20Contract(address: Address, signer: Signer): ERC20 {
  log.debug("Created ERC20 contract for", address, signer);
  return ERC20__factory.connect(address, signer);
}

export async function getErc20Data(contract: ERC20): Promise<Erc20Data> {
  log.debug("Retrieving ERC20 Data from contract", contract);
  const address = AddressSchema.parse(await contract.getAddress());

  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = Number(await contract.decimals());

  return {
    address: address,
    name: name,
    symbol: symbol,
    decimals: decimals,
  }
}

export function approveFunc(token: ERC20, spender: string) {
  return async (amount: bigint, dispatch: EventDispatcher<ApprovalEvents>): Promise<bigint> => {
    if (amount > 0 && token) {
      const apprTx = await token.approve(spender, amount);
      dispatch('approvalTxSubmitted', apprTx.hash);
      const receipt = await apprTx.wait();
      dispatch('approved', [amount, receipt?.hash ?? apprTx.hash]);
      return amount;
    } else {
      throw new Error('Approval of 0 amount or token not found');
    }
  };
}
