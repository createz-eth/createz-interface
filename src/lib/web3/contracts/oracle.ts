// https://reference-data-directory.vercel.app/feeds-matic-testnet.json

import type { PriceFeeds } from '$lib/chain-config';
import { formatEther, formatUnits, type Signer } from 'ethers';
import type { Address, BigNumberish } from './common';
import { AggregatorV3Interface__factory } from '@createz/contracts/types/ethers-contracts';
import { log } from '$lib/logger';
import { prettyNumber } from '$lib/helpers';

/**
 * tuple of price in USD as an integer and the number of decimals
 */
export type Price = {
  price: BigNumberish;
  decimals: number;
};

export async function findPrice(
  asset: Address,
  priceFeeds: PriceFeeds,
  signer: Signer
): Promise<Price | undefined> {
  const feedAddr = priceFeeds[asset];
  if (!feedAddr) {
    log.debug('Matching price feed not found in local registry', asset, priceFeeds);
    return undefined;
  }

  const feed = AggregatorV3Interface__factory.connect(feedAddr, signer);

  log.debug('Query price feed', feed, asset);

  const decimals = Number(await feed.decimals());
  const { answer } = await feed.latestRoundData();

  log.debug('Found price for asset', asset, answer, decimals);

  return {
    price: answer,
    decimals: decimals
  };
}

/**
 * converts a human readable amount to the currency described by the given price
 * @param amount human readable number
 * @param price conversion price
 */
export function converted(amount: number, price: Price): number {
  const p = Number(formatUnits(price.price, price.decimals));
  return amount * p;
}

/**
 * converts a human readable amount to the currency described by the given price
 * @param amount human readable number
 * @param price conversion price
 * @returns a pretty printed string number
 */
export function convertedPretty(amount: number, price: Price): string {
  const v = converted(amount, price);
  return prettyNumber(v);
}

/**
 * converts a Wei amount to the currency described by the given price
 * @param amount in Wei
 * @param price conversion price
 * @returns a pretty printed string number
 */
export function convertedEtherPretty(amount: bigint, price: Price): string {
    return convertedPretty(Number(formatEther(amount)), price);
}
