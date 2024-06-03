import { writable, derived } from 'svelte/store'

import { transformer } from '$lib/shared/stores/transformer.js'

type Pointer = {
  point: [number, number]
  type: 'image' | 'map'
}

export const pointer = writable<Pointer>({
  point: [0, 0],
  type: 'map'
})

export const mapCoordinates = derived(
  [pointer, transformer],
  ([$pointer, $transformer]) => {
    if ($pointer.type === 'map') {
      return $pointer.point
    } else {
      return $transformer?.transformToGeo($pointer.point)
    }
  }
)

export const resourceCoordinates = derived(
  [pointer, transformer],
  ([$pointer, $transformer]) => {
    if ($pointer.type === 'image') {
      return $pointer.point
    } else {
      return $transformer?.transformToResource($pointer.point)
    }
  }
)
