import type { BigNumberish, Hash } from '$lib/web3/contracts/common';
import type { TxFailedEvents  } from '$lib/components/common-events';
export { type TxFailedEvents };

export type ApprovalEvents = {
  approvalTxSubmitted: Hash;
  approved: [bigint, Hash];
};

export type MintEvents = {
  mintTxSubmitted: Hash;
  minted: [bigint, Hash];
};
export type MintSubscriptionEvents = MintEvents & ApprovalEvents & TxFailedEvents;

export type DepositEvents = {
  depositTxSubmitted: Hash;
  deposited: [bigint, Hash];
};

export type WithdrawalEvents = {
  withdrawTxSubmitted: Hash;
  withdrawn: [bigint, Hash];
};

export type ClaimEvents = {
  claimTxSubmitted: Hash;
  claimed: [BigNumberish, Hash];
};

export type FlagsChangeEvents = {
  flagsTxSubmitted: Hash;
  flagsChanged: [BigNumberish, Hash];
};

export type DescriptionChangeEvents = {
  descriptionTxSubmitted: Hash;
  descriptionChanged: [string, Hash];
};

export type ImageChangeEvents = {
  imageTxSubmitted: Hash;
  imageChanged: [string, Hash];
};

export type ExternalUrlChangeEvents = {
  externalUrlTxSubmitted: Hash;
  externalUrlChanged: [string, Hash];
};

export type DepositSubscriptionEvents = DepositEvents & ApprovalEvents & TxFailedEvents;

export type WithdrawSubscriptionEvents = WithdrawalEvents & TxFailedEvents;

export type ClaimSubscriptionContractEvents = ClaimEvents & TxFailedEvents;

export type FlagsChangeContractEvents = FlagsChangeEvents & TxFailedEvents;

export type MetadataChangeContractEvents = DescriptionChangeEvents &
  ImageChangeEvents &
  ExternalUrlChangeEvents &
  TxFailedEvents;
