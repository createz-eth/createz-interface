import {
  IERC6551Account__factory,
  type IERC6551Account,
  type IERC6551Executable,
  type IERC6551Registry,
  IERC6551Executable__factory
} from '@createz/contracts/types/ethers-contracts';
import { AddressSchema, type Address, asChecksumAddress } from './common';
import type { ChainEnvironment } from '$lib/chain-context';
import { log } from '$lib/logger';
import type { Signer } from 'ethers';
import { findLog } from '../ethers';
import { addressEquals, zero32Bytes } from '../helpers';
import type { ContractTransactionResponse } from 'ethers';
import type { BaseContract } from 'ethers';
import type { TypedContractMethod } from '@createz/contracts/types/ethers-contracts/common';

async function findErc6551Account(
  registry: IERC6551Registry,
  implementation: Address,
  salt: Uint8Array,
  chainId: number,
  erc721Address: Address,
  tokenId: bigint
): Promise<Address | undefined> {
  // TODO replace with off-chain computation
  const acc = await registry.account(implementation, salt, chainId, erc721Address, tokenId);

  return AddressSchema.parse(acc);
}

export async function findDefaultProfileErc6551Account(
  chainEnv: ChainEnvironment,
  tokenId: bigint
): Promise<Address | undefined> {
  const { erc6551Registry, chainData } = chainEnv;
  const { contracts, chainId } = chainData;
  const { defaultErc6551Implementation, profile } = contracts;
  const acc = await findErc6551Account(
    erc6551Registry,
    defaultErc6551Implementation,
    new Uint8Array(32),
    chainId,
    profile,
    tokenId
  );

  log.debug('Default ERC6551 Account for tokenId', chainEnv, tokenId, acc);

  return acc;
}

export type TokenBoundAccount = [IERC6551Account, IERC6551Executable];

export async function getErc6551Account(
  address: Address,
  signer: Signer
): Promise<TokenBoundAccount | null> {
  const acc = IERC6551Account__factory.connect(address, signer.provider);

  try {
    await acc.state();
  } catch (error) {
    log.debug(
      'Could not call state() from account, there is no account deployed at address',
      address
    );
    return null;
  }

  const exec = IERC6551Executable__factory.connect(address, signer);
  log.debug('Created ERC6551 contracts for address', address);

  return [acc, exec];
}

export async function createErc6551Account(
  registry: IERC6551Registry,
  accountImplementation: Address,
  chainId: number,
  contract: Address,
  tokenId: bigint,
  events?: {
    onTxSubmitted?: (hash: string) => void;
  }
): Promise<Address> {
  let tx;
  try {
    tx = await registry.createAccount(
      accountImplementation,
      zero32Bytes,
      chainId,
      contract,
      tokenId
    );
  } catch (error) {
    log.error('Failed to create ERC6551 Account', error);
    throw error;
  }
  if (events?.onTxSubmitted) events.onTxSubmitted(tx.hash);

  const createEvent = await findLog(tx, registry, registry.filters.ERC6551AccountCreated());
  if (!createEvent) {
    const msg = 'Transaction Log not found';
    log.error(msg);
    throw new Error(msg);
  }
  const account = createEvent.args.account;

  return asChecksumAddress(account);
}

export async function execute<
  C extends BaseContract,
  F extends {
    [P in keyof C]: C[P] extends TypedContractMethod<infer _A, infer _B, infer _C> ? P : never;
  }[keyof C],
  ARGS extends C[F] extends TypedContractMethod<infer A, infer _B, infer _C> ? A : never
>(
  account: IERC6551Executable,
  contract: C,
  func: F & string,
  params: ARGS,
  value: bigint = 0n
): Promise<ContractTransactionResponse> {
  const contractAddress = await contract.getAddress();
  log.debug('ERC6551Execute:', account, contract, contractAddress, func, params, value);

  const encoded = contract.interface.encodeFunctionData(func, params);
  log.debug('ERC6551Execute: encoded', contract, contractAddress, func, params, encoded);

  return await account.execute(contractAddress, value, encoded, 0n);
}

/**
 * determines if `addr` is a valid signer of `potentialTokenboundAcc`
 */
export async function isValidSigner(
  addr: Address,
  potentialTokenboundAcc: Address,
  signer: Signer
): Promise<boolean> {
  log.debug('isValidSigner()', addr, potentialTokenboundAcc);
  // is actually the same address
  if (addressEquals(addr, potentialTokenboundAcc)) {
    log.debug('isValidSigner() addresses match', addr, potentialTokenboundAcc);
    return true;
  }

  // check if is tokenbound account
  const acc = await getErc6551Account(potentialTokenboundAcc, signer);
  if (!acc) {
    log.debug('isValidSigner() not an ERC6551 account', addr, potentialTokenboundAcc);
    return false;
  }
  const [tAcc] = acc;

  const magicValue = '0x523e3260';

  try {
    const res = await tAcc.isValidSigner(addr, '0x00');
    log.debug('isValidSigner() ERC6551 result', addr, potentialTokenboundAcc, res);
    return res === magicValue;
  } catch (error) {
    log.error('Failed to call isValidSigner', addr, potentialTokenboundAcc, error);
    throw error;
  }
}
