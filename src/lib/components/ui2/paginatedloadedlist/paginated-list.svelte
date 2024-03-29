<script lang="ts" generics="T">
  import { LIST } from '$lib/query/keys';

  import { writable, derived } from 'svelte/store';
  import { log } from '$lib/logger';
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query';

  import * as Pagination from '$lib/components/ui/pagination';

  // interface $$Slots /* eslint-disable-line @typescript-eslint/no-unused-vars */ {
  //   default: {
  //     items: Array<T> /* eslint-disable-line no-undef */;
  //     isLoading: boolean;
  //   };
  //   loading: Record<string, never>;
  //   error: Record<string, never>;
  // }
  /**
   * Load function that retrieves a list of items based on the page number
   */
  export let load: (page: number) => Promise<Array<T>>; /* eslint-disable-line no-undef */

  /**
   * page to display
   */
  export let page: number = 1;
  /**
   * total number of items in result set
   */
  export let totalItems: number;

  /**
   * number of items per page
   */
  export let pageSize: number;

  /**
   * query key for the cache
   */
  export let queryKeys: string[] = [];

  const p = writable(page);

  $: {
    p.set(page);
  }

  // we need to keep the query so it can find its previous data
  const list = createQuery(
    derived(p, (p) => {
      // convert to 0 based calls
      const page = p - 1;
      return {
        queryKey: queryKeys.concat([LIST, String(page)]),
        queryFn: async () => {
          log.debug('Loading page from list', page);
          try {
            return await load(page);
          } catch (err) {
            log.error('Loading paged data failed', page, err);
            throw err;
          }
        },
        staleTime: 3 * 60 * 1000,
        placeholderData: keepPreviousData
      };
    })
  );

  $: items = $list.data!; // for the type!
</script>

<div>
  <div>
    {#if $list.isPending}
      <slot name="loading">Loading list data</slot>
    {/if}
    {#if $list.isError}
      <slot name="error">
        Failed to load list: {$list.error.message}
      </slot>
    {/if}
    {#if $list.isSuccess}
      <slot {items} isLoading={$list.isPlaceholderData} />
    {/if}
  </div>
  <Pagination.Root
    count={totalItems == 0 ? 1 : totalItems}
    perPage={pageSize}
    let:pages
    let:currentPage
    bind:page={$p}
  >
    <Pagination.Content class="text-foreground">
      <Pagination.Item>
        <Pagination.PrevButton />
      </Pagination.Item>
      {#each pages as page (page.key)}
        {#if page.type === 'ellipsis'}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
        {:else}
          <Pagination.Item>
            <Pagination.Link {page} isActive={currentPage == page.value}>
              {page.value}
            </Pagination.Link>
          </Pagination.Item>
        {/if}
      {/each}
      <Pagination.Item>
        <Pagination.NextButton />
      </Pagination.Item>
    </Pagination.Content>
  </Pagination.Root>
</div>
