<script lang="ts">
  import { onMount } from 'svelte'

  import { fetchJson, fetchImageInfo } from '@allmaps/stdlib'
  import { parseAnnotation } from '@allmaps/annotation'

  import type { Map as GeoreferencedMap } from '@allmaps/annotation'
  import { GcpTransformer } from '@allmaps/transform'
  import type { ImageInformationResponse } from 'ol/format/IIIFInfo.js'

  import { transformer } from '$lib/shared/stores/transformer.js'

  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'

  let georeferencedMap: GeoreferencedMap | undefined
  let imageInfo: ImageInformationResponse | undefined

  const annotationUrl = 'https://annotations.allmaps.org/maps/b3d87d457a7a5603'

  onMount(async () => {
    const annotation = await fetchJson(annotationUrl)
    const georeferencedMaps = parseAnnotation(annotation)
    georeferencedMap = georeferencedMaps[0]

    $transformer = new GcpTransformer(georeferencedMap.gcps)

    const imageId = georeferencedMap.resource.id
    imageInfo = (await fetchImageInfo(imageId)) as ImageInformationResponse
  })
</script>

<main class="absolute flex flex-row w-full h-full">
  <div class="w-full relative">
    {#if imageInfo && georeferencedMap}
      <Image {georeferencedMap} {imageInfo} />
    {/if}
  </div>
  <div class="w-full relative">
    {#if georeferencedMap}
      <Map {georeferencedMap} />{/if}
  </div>
</main>
