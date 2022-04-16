import { atom, atomFamily, RecoilState, selector, selectorFamily, useSetRecoilState } from "recoil";
import { Address } from "../helper/types";
import { zero } from "../helper/util";
import { getAccountQuery, web3State } from "./web3State";

/**
 * stores address of vault in detail view
 */
// export const vaultAddressState: RecoilState<Address | ""> = atom({
//   key: 'vaultDetailAddress',
//   default: ""
// });

/**
 * request id tied to vault address to trigger reloads
 */
const vaultValuesRequestIdState = atomFamily<number, Address>({
  key: 'vaultValuesRequestId',
  default: 0
});

/**
 * request id tied to vault address to trigger reloads of deposit
 */
const vaultDepositRequestIdState = atomFamily<number, Address>({
    key: 'vaultDepositRequestId',
    default: 0
  });

/**
 * increments request id to trigger reload of dependent values
 */
export const useRefreshVaultValues = (address: Address) => {
  const setVaultValuesRequestId = useSetRecoilState(
    vaultValuesRequestIdState(address));

  return () => {
    console.debug(`Updating vault request id for refresh`, address);
    setVaultValuesRequestId(id => id + 1);
  }
}

/**
 * constructs vault service from vault address and web3Connection
 */
export const vaultServiceState = selectorFamily({
  key: 'vaultService',
  get: (address: Address) => async ({ get }) => {
    const web3Connection = get(web3State);

    return web3Connection.getVault(address);
  }
});

/**
 * vault values loaded from vault backend
 */
export const vaultValuesState = selectorFamily({
  key: 'vaultValues',
  get: (address: Address) => async ({ get }) => {
    const vaultService = get(vaultServiceState(address));
    // register dependency on requestId
    get(vaultValuesRequestIdState(vaultService.address));

    try {
      const values = await vaultService.getValues();
      console.debug(`Loaded values from vault contract`, values, vaultService);
      return values;

    } catch (error) {
      console.error(`Unable to load vault values from vault contract`, vaultService);
      throw error;
    }
  }
});

export const vaultDepositState = selectorFamily({
  key: 'vaultDeposit',
  get: (address: Address) => async ({ get }) => {

    const account = get(getAccountQuery)
    const vaultService = get(vaultServiceState(address));
    // create dep on request counter for reloads if account is set
    if (account !== null) {
      get(vaultDepositRequestIdState(vaultService.address))
    }

    if (account === null) {
      return zero;
    }
    const deposit = await vaultService.depositOf(account);

    return deposit;
  }
})

export const useRefreshVaultDeposit = (vault: Address) => {
  const setVaultDepositRequestId = useSetRecoilState(
    vaultDepositRequestIdState(vault)
  );

  return () => {
    console.debug(`Updating vault deposit request id for refresh`, vault);
    setVaultDepositRequestId(id => id + 1);
  };
}
