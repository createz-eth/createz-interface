<script lang="ts">
  import onboard, { currentAccount, isAccountConnected, primaryWallet } from '$lib/web3/onboard';
  import { truncateAddress } from './helpers';

  const connect = async () => {
    await onboard.connectWallet();
  };

  const disconnect = async () => {
    await onboard.disconnectWallet({ label: $primaryWallet?.label + '' });
  };
</script>

{#if $isAccountConnected}
  <button on:click={disconnect}>
    {truncateAddress($currentAccount + '')}
  </button>
{:else}
  <button on:click={connect}>Connect Wallet</button>
{/if}

<style>
</style>
