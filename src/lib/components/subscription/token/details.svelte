<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Coins, Droplet, ExternalLink, Gem, Hourglass, Percent, PiggyBank } from 'lucide-svelte';
  import TrafficLight from '$lib/components/TrafficLight.svelte';
  import PropertyBox from '$lib/components/ui/PropertyBox.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';
  import CollapsibleBox from '$lib/components/ui/CollapsibleBox.svelte';
  import DetailsProperty from '$lib/components/ui/DetailsProperty.svelte';
  import type { Props } from './base.svelte';
  import Base from './base.svelte';

  type $$Props = Props;

  /** Data of the subscription */
  export let subscriptionData: $$Props['subscriptionData'];

  /** rate of spending in the subscription plan, based on 18 decimals */
  export let rate: $$Props['rate'];

  export let paymentToken: $$Props['paymentToken'];


  /** open the technical details collapsible */
  export let technicalsOpen = false;

  // TODO
  const multiplier = subscriptionData.multiplier;
  const multiplierActive = multiplier > 100;
</script>

<Base {subscriptionData} {rate} {paymentToken} let:unspent let:timeLeft let:timeLeftDays>
  <div class="p-4 text-foreground">
    <!-- header -->
    <div class="flex items-center gap-4 pt-2">
      <TrafficLight />
      <div>
        <h2>{subscriptionData.name}</h2>
        <p class="text-muted-foreground">{subscriptionData.description}</p>
      </div>
    </div>

    <!-- Main Properties -->
    <div class="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-4">
      <PropertyBox title="Remaining" titleLogo={Hourglass} value="3d 2h 22m" />
      <PropertyBox title="Remaining funds" titleLogo={Coins} value="$4.2342" />
      <PropertyBox title="Total deposited" titleLogo={Gem} value="$100.00" />
      <PropertyBox title="Total tipped" titleLogo={PiggyBank} value="$33.00" />
    </div>

    <!-- rate + multiplier, withdrawable, paused, token logo, subcontract name -->
    <div class="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
      <PropertyBox rootClass="border-0" title="Rate" titleLogo={Percent}>
        <div slot="value" class="flex items-center gap-4 pt-2">
          <TokenLogo
            class="basis-1/7 h-12 w-12"
            address={subscriptionData.address}
            fallbackSymbol="TEST"
          />
          <div>
            {#if multiplierActive}
              <h4>Default</h4>
            {/if}
            <p class="text-sm font-medium leading-none">
              <span class="text-xl font-bold">0.02</span>
              UST / month
            </p>
            <p class="text-xs text-muted-foreground">$2.02 / month</p>
          </div>
          {#if multiplierActive}
            <div>
              <h4>Multiplier {multiplier / 100}x</h4>
              <div>
                <p class="text-sm font-medium leading-none">
                  <span class="text-xl font-bold">0.04</span>
                  UST / month
                </p>
                <p class="text-xs text-muted-foreground">$2.55 / month</p>
              </div>
            </div>
          {/if}
        </div>
      </PropertyBox>
      <PropertyBox rootClass="border-0" title="Liquid funds" titleLogo={Droplet}>
        <div slot="value" class="flex items-center gap-4 pt-2">
          <div class="basis-1/2">
            <h4>Withdrawable</h4>
            <p class="text-2xl font-bold">4</p>
          </div>
          <div class="basis-1/2 pl-6">
            <h4>Locked</h4>
            <p class="text-2xl font-bold">10</p>
          </div>
        </div>
      </PropertyBox>
    </div>

    <!-- technicals -->
    <CollapsibleBox rootClass="mt-4" title="Technical Details" open={technicalsOpen}>
      <DetailsProperty title="Address" help="The address of this contract">
        <div slot="value" class="flex items-center gap-2">
          <div>
            {subscriptionData.address}
          </div>
          <Button
            variant="link"
            target="_blank"
            href={'https://example.com/' + subscriptionData.address}
            class="h-0 px-0 py-0"
          >
            <ExternalLink class="h-4 w-4" />
          </Button>
        </div>
      </DetailsProperty>
      <DetailsProperty title="Token Id" help="Id of the token">
        <div slot="value" class="flex items-center gap-2">
          <div>
            {subscriptionData.tokenId}
          </div>
          <Button
            variant="link"
            target="_blank"
            href={'https://example.com/' + subscriptionData.tokenId}
            class="h-0 px-0 py-0"
          >
            <ExternalLink class="h-4 w-4" />
          </Button>
        </div>
      </DetailsProperty>
      <DetailsProperty title="TODO" value={'TODO'} help="TODO" />
    </CollapsibleBox>
  </div>
</Base>