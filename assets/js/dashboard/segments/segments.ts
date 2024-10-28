/** @format */

import { Filter } from '../query'
import { remapFromApiFilters } from '../util/filters'

export type SavedSegment = {
  id: number
  name: string
  personal: boolean
}

export type SegmentData = {
  filters: Filter[]
  labels: Record<string, string>
}

export type EditingSegmentState = {
  editingSegmentId: number
}

const SEGMENT_LABEL_KEY_PREFIX = 'segment-'

export function isSegmentIdLabelKey(labelKey: string): boolean {
  return labelKey.startsWith(SEGMENT_LABEL_KEY_PREFIX)
}

export function formatSegmentIdAsLabelKey(id: number): string {
  return `${SEGMENT_LABEL_KEY_PREFIX}${id}`
}

export const isSegmentFilter = (f: Filter): boolean => f[1] === 'segment'

export const parseApiSegmentData = ({
  filters,
  ...rest
}: SegmentData): SegmentData => ({
  filters: remapFromApiFilters(filters),
  ...rest
})
