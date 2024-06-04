<script lang="ts">
  import { onMount } from 'svelte'

  import { Map, addProtocol } from 'maplibre-gl'
  import getProtomapsTheme from 'protomaps-themes-base'
  import { Protocol } from 'pmtiles'
  import { WarpedMapLayer } from '@allmaps/maplibre'

  import type { Map as GeoreferencedMap } from '@allmaps/annotation'

  import { pointer, mapCoordinates } from '$lib/shared/stores/pointer.js'

  import cursor from '$lib/cursors/allmaps.svg'

  export let georeferencedMap: GeoreferencedMap

  let container: HTMLDivElement
  let map: Map | undefined
  let warpedMapLayer: WarpedMapLayer | undefined
  let pointerCoordinates: [number, number] | undefined

  let opacity = 1

  $: {
    if (warpedMapLayer) {
      warpedMapLayer.setOpacity(opacity)
    }
  }

  $: {
    if (map && $pointer.type === 'image') {
      if ($mapCoordinates) {
        const point = map.project($mapCoordinates)
        pointerCoordinates = [point.x, point.y]
      }
    } else {
      pointerCoordinates = undefined
    }
  }

  onMount(() => {
    const protocol = new Protocol()
    addProtocol('pmtiles', protocol.tile)

    map = new Map({
      container,
      style: {
        version: 8,
        glyphs:
          'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sources: {
          protomaps: {
            type: 'vector',
            tiles: [
              'https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=ca7652ec836f269a'
            ],
            maxzoom: 14,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: getProtomapsTheme('protomaps', 'light')
      },
      center: [0, 0],
      zoom: 7,
      maxPitch: 0,
      preserveDrawingBuffer: true,
      attributionControl: false
    })

    map.on('load', async () => {
      if (map) {
        warpedMapLayer = new WarpedMapLayer()
        map.addLayer(warpedMapLayer)

        await warpedMapLayer.addGeoreferencedMap(georeferencedMap)

        const bounds = warpedMapLayer.getBounds()
        if (bounds) {
          map.fitBounds(bounds, { padding: 20, animate: false })
        }
      }
    })

    map.on('mousemove', (event) => {
      pointer.set({
        point: [event.lngLat.lng, event.lngLat.lat],
        type: 'map'
      })
    })
  })
</script>

<div
  bind:this={container}
  style:cursor={`url("${cursor}"), auto`}
  class="w-full h-full ring-0"
  tabindex="-1"
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
<div class="absolute bottom-0 w-full p-3 flex justify-center">
  <div class="rounded-full bg-white p-3 flex">
    <input bind:value={opacity} min="0" max="1" step="0.01" type="range" />
  </div>
</div>
