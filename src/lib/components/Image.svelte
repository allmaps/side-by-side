<script lang="ts">
  import { onMount } from 'svelte'

  import Map from 'ol/Map.js'
  import IIIFLayer from '$lib/shared/IIIFLayer.js'

  import { computeBbox } from '@allmaps/stdlib'

  import { pointer, resourceCoordinates } from '$lib/shared/stores/pointer.js'

  import type { ImageInformationResponse } from 'ol/format/IIIFInfo.js'
  import type { Map as GeoreferencedMap } from '@allmaps/annotation'

  import cursor from '$lib/cursors/iiif.svg'

  import 'ol/ol.css'

  export let imageInfo: ImageInformationResponse
  export let georeferencedMap: GeoreferencedMap

  let container: HTMLDivElement
  let map: Map
  let iiifLayer: IIIFLayer | undefined

  let pointerCoordinates: [number, number] | undefined

  $: {
    if (map && $pointer.type === 'map') {
      if ($resourceCoordinates) {
        pointerCoordinates = map.getPixelFromCoordinate([
          $resourceCoordinates[0],
          -$resourceCoordinates[1]
        ]) as [number, number]
      }
    } else {
      pointerCoordinates = undefined
    }
  }

  function handleMousemove(event: MouseEvent) {
    if (map) {
      const coordinate = map.getCoordinateFromPixel([
        event.clientX,
        event.clientY
      ])
      const point = [coordinate[0], -coordinate[1]] as [number, number]

      pointer.set({
        point,
        type: 'image'
      })
    }
  }

  onMount(() => {
    iiifLayer = new IIIFLayer()

    map = new Map({
      target: container,
      controls: [],
      layers: [iiifLayer]
    })

    iiifLayer.setImageInfo(imageInfo as ImageInformationResponse)

    const resourceMaskBbox = computeBbox(georeferencedMap.resourceMask)
    const iiifLayerResourceMaskBbox = [
      resourceMaskBbox[0],
      -resourceMaskBbox[3],
      resourceMaskBbox[2],
      -resourceMaskBbox[1]
    ]

    map.getView().fit(iiifLayerResourceMaskBbox, {
      padding: [25, 25, 25, 25]
    })
  })
</script>

<div
  role="img"
  style:cursor={`url("${cursor}"), auto`}
  on:mousemove={handleMousemove}
  bind:this={container}
  class="w-full h-full"
/>
{#if pointerCoordinates}
  <img
    alt="cursor"
    src={cursor}
    style:top={pointerCoordinates[1] + 'px'}
    style:left={pointerCoordinates[0] + 'px'}
    class="absolute w-8"
  />
{/if}
