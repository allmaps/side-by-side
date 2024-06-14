<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { fetchJson, fetchImageInfo } from '@allmaps/stdlib'
  import { parseAnnotation } from '@allmaps/annotation'

  import { Header, URLInput, URLType, Loading, urlStore } from '@allmaps/ui'
  import type { Map as GeoreferencedMap } from '@allmaps/annotation'
  import { GcpTransformer } from '@allmaps/transform'
  import type { ImageInformationResponse } from 'ol/format/IIIFInfo.js'

  import { transformer } from '$lib/shared/stores/transformer.js'

  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'

  const defaultUrl =
    'https://annotations.allmaps.org/maps/b1798f1dba50ee1b@350c252b41b0b20b'

  $urlStore = defaultUrl

  let georeferencedMap: GeoreferencedMap | undefined
  let imageInfo: ImageInformationResponse | undefined

  let url: string | undefined = get(urlStore)

  async function loadUrl(newUrl: string = defaultUrl) {
    const annotation = await fetchJson(newUrl)
    const georeferencedMaps = parseAnnotation(annotation)
    georeferencedMap = georeferencedMaps[0]

    $transformer = new GcpTransformer(georeferencedMap.gcps)

    const imageId = georeferencedMap.resource.id
    imageInfo = (await fetchImageInfo(imageId)) as ImageInformationResponse

    url = newUrl
    urlStore.set(url)
  }

  onMount(async () => {
    urlStore.subscribe((value) => {
      loadUrl(value)
    })
  })
</script>

<div class="absolute flex flex-col w-full h-full">
  <Header appName="Cursors">
    {#if url}
      <URLInput />
    {/if}
  </Header>

  <main class="flex flex-row w-full h-full">
    {#key url}
      <div class="w-1/2 relative overflow-hidden">
        {#if imageInfo && georeferencedMap}
          <Image {georeferencedMap} {imageInfo} />
        {/if}
      </div>
      <div class="w-1/2 relative overflow-hidden">
        {#if georeferencedMap}
          <Map {georeferencedMap} />{/if}
      </div>
    {/key}
  </main>
</div>
