import { writable } from 'svelte/store'

import type { GcpTransformer } from '@allmaps/transform'

export const transformer = writable<GcpTransformer>()
