<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { ExplorerAccountUrl, ExplorerNftUrl } from '$lib/components/url';
  import type { ProfileData } from '$lib/web3/contracts/profile';
  import { ClipboardCopy, ExternalLink } from 'lucide-svelte';
  import { truncateAddress } from '$lib/helpers';
  import { copyTextToClipboard } from '$lib/clipboard';
  import toast from '$lib/toast';
  import type { Address } from '$lib/web3/contracts/common';

  /** profile data */
  export let profile: ProfileData;

  /** tokenbound account of this profile */
  export let tokenboundAccount: Address | undefined = undefined;

  // TODO extract?
  const toClipboard = (text: string) => async () => {
    await copyTextToClipboard(text);
    toast.info(['Copied to clipboard:', text]);
  };

  const addresses: [string, Address | undefined][] = [
    ['Owner', profile.owner],
    ['Account', tokenboundAccount]
  ];
</script>

<Card.Root class="p-4">
  <div class="flex flex-row gap-x-4">
    <div class="basis-1/4">
      <Avatar.Root class="mr-4 h-auto w-full max-w-[120px]">
        <Avatar.Image src={profile.image} alt={profile.name} />
        <!-- TODO -->
        <Avatar.Fallback>{profile.name}</Avatar.Fallback>
      </Avatar.Root>
    </div>
    <div class="basis-3/4 space-y-3 self-center justify-self-start">
      <div class="flex">
        <Card.Title class="self-center">{profile.name}</Card.Title>
        <ExplorerNftUrl contract={profile.address} tokenId={BigInt(profile.tokenId)} let:url>
          <Button
            size="icon"
            variant="ghost"
            class="ml-auto h-6 w-6 self-center justify-self-end"
            href={url}
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </ExplorerNftUrl>
      </div>
      {#if profile.description}
        <Card.Description>{profile.description}</Card.Description>
      {/if}
    </div>
  </div>
  <div class="mt-2">
    <div class="flex flex-row items-center gap-x-4">
      <div class="basis-1/4 text-sm font-medium">External Link:</div>
      <Button variant="link" class="basis-3/4 justify-start truncate p-0">
        <span class="overflow-hidden truncate">{profile.externalUrl}</span>
      </Button>
    </div>
    {#each addresses as [label, address]}
      {#if address}
        <div class="flex flex-row items-center gap-x-4">
          <div class="basis-1/4 text-sm font-medium">{label}:</div>

          <p class="flex basis-3/4 flex-row justify-start text-sm font-medium">
            <span>{truncateAddress(address)}</span>
            <Button
              size="icon"
              variant="ghost"
              class="ml-2 h-4 w-4 self-center"
              on:click={toClipboard(address)}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
            <ExplorerAccountUrl {address} let:url>
              <Button
                size="icon"
                variant="ghost"
                class="ml-2 h-4 w-4 self-center"
                href={url}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </ExplorerAccountUrl>
          </p>
        </div>
      {/if}
    {/each}
  </div>
</Card.Root>
