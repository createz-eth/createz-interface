<script lang="ts">
  import SubscriptionTeaser from '$lib/components/subscription/SubscriptionTeaser.svelte';
  import { ethersSigner } from '$lib/web3/ethers';
  import { Subscription__factory } from '@createz/contracts/types/ethers-contracts';
  import type { PageData } from './$types';
  import { currentAccount } from '$lib/web3/onboard';
  import SubscriptionDeposit from '$lib/components/subscription/action/SubscriptionDeposit.svelte';
  import SubscriptionWithdrawal from '$lib/components/subscription/action/SubscriptionWithdrawal.svelte';

  export let data: PageData;

  const addr = data.subscriptionAddr;
  const tokenId = data.tokenId;

  $: subContract = $ethersSigner ? Subscription__factory.connect(addr, $ethersSigner) : null;
</script>

<h1>Subscription Details</h1>

<div>
  <div>
    <!-- LEFT -->
    {#if subContract}
      <!-- TODO proper details -->
      <SubscriptionTeaser contract={subContract} {tokenId} />
      <!-- Subscription token details -->
      <!-- sub contract details -->
      <!-- Contract owner teaser -->
    {/if}
  </div>

  <div>
    <!-- RIGHT -->

    <!-- subscription controls -->
    <!-- deposit(renew) / tip -->
    <!-- withdraw / cancel -->
    {#if subContract && $currentAccount}
      <SubscriptionDeposit
        {subContract}
        currentAccount={$currentAccount}
        subscriptionId={tokenId}
      />
      <SubscriptionWithdrawal {subContract} subscriptionId={tokenId} />
    {/if}
  </div>
</div>