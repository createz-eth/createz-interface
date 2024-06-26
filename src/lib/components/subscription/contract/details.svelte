<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import TokenLogo from '$lib/components/TokenLogo.svelte';
  import { DollarSign, ExternalLink, Activity, Users, Lock, Link } from 'lucide-svelte';
  import PropertyBox from '$lib/components/ui/PropertyBox.svelte';
  import DetailsProperty from '$lib/components/ui/DetailsProperty.svelte';
  import { Button } from '$lib/components/ui/button';
  import CollapsibleBox from '$lib/components/ui/CollapsibleBox.svelte';
  import { ExplorerAccountUrl } from '$lib/components/url';
  import { ExplorerTokenUrl } from '$lib/components/url/explorer';
  import Base from './base.svelte';
  import type { Props } from './base.svelte';
  import { formatUnits } from 'ethers';
  import type { BigNumberish } from '$lib/web3/contracts/common';
  import WarningCollapsible from '$lib/components/ui2/WarningCollapsible.svelte';
  import { convertedEtherPretty } from '$lib/web3/contracts/oracle';

  /**
   * Data of the subscription plan
   */
  export let contractData: Props['contractData'];

  /**
   * Payment token data
   */
  export let paymentTokenData: Props['paymentTokenData'];

  /**
   *  Loads price of payment token
   */
  export let tokenPrice: Props['tokenPrice'];

  /**
   * Warnings about the subscription plan
   */
  export let warnings: Props['warnings'];

  export let contractBalance: BigNumberish;

  /** open the technical details collapsible */
  export let technicalsOpen = false;

  let externalUrl: URL | null;
  try {
    externalUrl = contractData.externalUrl ? new URL(contractData.externalUrl) : null;
  } catch {
    externalUrl = null;
  }

  const formatFromGwei = (amount: BigNumberish) => formatUnits(amount, 18);
  const formatFromToken = (amount: BigNumberish) => formatUnits(amount, paymentTokenData.decimals);

</script>

<Base
  {contractData}
  {paymentTokenData}
  {tokenPrice}
  let:rate
  let:rawRate
  let:totalSupply
  let:activeSubs
>
  <div class="p-4 text-foreground">
    <!-- header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <TokenLogo
          class="mr-4"
          address={contractData.token}
          fallbackSymbol={paymentTokenData.symbol}
        />
        <div>
          <h2>{contractData.name}</h2>
        </div>
      </div>
      {#if warnings.isPending}
        TODO Loading
      {/if}
      {#if warnings.isSuccess}
        <WarningCollapsible messages={warnings.data} />
      {/if}
    </div>
    <!-- Main Properties -->
    <div class="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-4">
      <PropertyBox title="Fee" titleLogo={DollarSign}>
        <p slot="value" class="text-sm font-medium leading-none">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <span class="text-xl font-bold">{rate}</span>
            </Tooltip.Trigger>
            <Tooltip.Content>{rawRate}</Tooltip.Content>
          </Tooltip.Root>
          {paymentTokenData.symbol}
          / month
        </p>
        <p slot="subValue" class="text-xs text-muted-foreground">
          {#if tokenPrice.isPending}
            ...
          {/if}
          {#if tokenPrice.isError}
            ???
          {/if}
          {#if tokenPrice.isSuccess && tokenPrice.data}
            ${convertedEtherPretty(rawRate, tokenPrice.data)} / month
          {/if}
        </p>
      </PropertyBox>
      <PropertyBox title="Funds" titleLogo={Activity}>
        <p slot="value" class="text-sm font-medium leading-none">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <span class="text-xl font-bold">{formatFromToken(contractBalance)}</span>
            </Tooltip.Trigger>
            <Tooltip.Content>{String(contractBalance)}</Tooltip.Content>
          </Tooltip.Root>
          {paymentTokenData.symbol}
        </p>
        <p slot="subValue" class="text-xs text-muted-foreground">
          {#if tokenPrice.isPending}
            ...
          {/if}
          {#if tokenPrice.isError}
            ???
          {/if}
          {#if tokenPrice.isSuccess && tokenPrice.data}
            ${convertedEtherPretty(BigInt(contractBalance), tokenPrice.data)}
          {/if}
        </p>
      </PropertyBox>
      <PropertyBox title="Active Subs" titleLogo={Users}>
        <p slot="value" class="text-xl font-bold">
          {String(activeSubs)}
        </p>
        <p slot="subValue" class="text-xs text-muted-foreground">
          Total Subs: {String(totalSupply)}
        </p>
      </PropertyBox>
      <PropertyBox title="Lockup" titleLogo={Lock} value={`${contractData.lock / 100}%`} />
    </div>
    <!-- Description -->
    {#if contractData.image || contractData.description || externalUrl}
      <Card.Root class="mt-4 pt-2">
        <Card.Header>
          <Card.Title>Details</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if contractData.image || contractData.description}
            <div class="flex items-center gap-2 pt-2">
              {#if contractData.image}
                <div class="max-h-50 max-w-50 flex-initial basis-1/4">
                  <img src={contractData.image} alt={contractData.name} />
                </div>
              {/if}
              {#if contractData.description}
                <div class="basis-3/4 whitespace-pre-line">
                  <p>{contractData.description}</p>
                </div>
              {/if}
            </div>
          {/if}
          {#if externalUrl}
            <div class="flex items-center gap-2 pt-2">
              <div>
                <Button variant="link" target="_blank" href={externalUrl.href}>
                  <Link class="mr-2 h-4 w-4" />
                  {externalUrl.host}
                </Button>
              </div>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    {/if}

    <!-- TODO claim, tips and spent -->

    <CollapsibleBox rootClass="mt-4" title="Technical Details" open={technicalsOpen}>
      <DetailsProperty title="Address" help="The address of this contract">
        <div slot="value" class="flex items-center gap-2">
          <div>
            {contractData.address}
          </div>
          <ExplorerAccountUrl address={contractData.address} let:url>
            <Button variant="link" target="_blank" href={url} class="h-0 px-0 py-0">
              <ExternalLink class="h-4 w-4" />
            </Button>
          </ExplorerAccountUrl>
        </div>
      </DetailsProperty>
      <DetailsProperty title="Owner" help="The owner of this contract">
        <div slot="value" class="flex items-center gap-2">
          <div>
            {contractData.owner}
          </div>
          <ExplorerAccountUrl address={contractData.owner} let:url>
            <Button variant="link" target="_blank" href={url} class="h-0 px-0 py-0">
              <ExternalLink class="h-4 w-4" />
            </Button>
          </ExplorerAccountUrl>
        </div>
      </DetailsProperty>
      <DetailsProperty title="Payment Token" help="The address of the payment token">
        <div slot="value" class="flex items-center gap-2">
          <div>
            {contractData.token}
          </div>
          <ExplorerTokenUrl contract={contractData.token} let:url>
            <Button variant="link" target="_blank" href={url} class="h-0 px-0 py-0">
              <ExternalLink class="h-4 w-4" />
            </Button>
          </ExplorerTokenUrl>
        </div>
      </DetailsProperty>

      <DetailsProperty
        title="Rate"
        value={`${formatFromGwei(contractData.rate)}`}
        help="The internal payment rate of token funds in gwei for a given time unit"
      />
      <DetailsProperty
        title="Lock"
        value={`${contractData.lock}`}
        help="The internal representation (10000 == 100%) of the amount of funds getting locked in the contract on deposit"
      />
      <!-- TODO determine time unit -->
      <DetailsProperty
        title="Epoch Size"
        value={`${contractData.epochSize} seconds`}
        help="The length of an epoch in time units"
      />

      <DetailsProperty
        title="Total Supply"
        value={`${contractData.totalSupply}`}
        help="The current total supply of minted subscription tokens"
      />
      <DetailsProperty
        title="Max Supply"
        value={`${contractData.maxSupply}`}
        help="The maximum supply of subscription tokens that can be minted"
      />
      <DetailsProperty
        title="Active Shares"
        value={`${contractData.activeShares}`}
        help="Subscriptions are internally represented as shares based on 100 shares equaling 1 subscription. Larger values represent a subscription with an applied multiplier"
      />

      <DetailsProperty
        title="Minting Paused"
        value={`${contractData.mintingPaused}`}
        help="Minting of new subscriptions is paused"
      />
      <DetailsProperty
        title="Renewal Paused"
        value={`${contractData.renewalPaused}`}
        help="Renewal of existing subscriptions is paused"
      />
      <DetailsProperty
        title="Tipping Paused"
        value={`${contractData.tippingPaused}`}
        help="Tipping on subscriptions is paused"
      />

      <DetailsProperty
        title="Claimable Funds"
        value={`${formatFromToken(contractData.claimable)} ${paymentTokenData.symbol}`}
        help="Currently unclaimed funds from subscriptions"
      />
      <DetailsProperty
        title="Claimed Subscription Funds"
        value={`${formatFromToken(contractData.depositsClaimed)} ${paymentTokenData.symbol}`}
        help="Claimed funds from subscriptions"
      />
      <DetailsProperty
        title="Claimed Tips"
        value={`${formatFromToken(contractData.tipsClaimed)} ${paymentTokenData.symbol}`}
        help="Claimed funds from tips"
      />
    </CollapsibleBox>
  </div>
</Base>
