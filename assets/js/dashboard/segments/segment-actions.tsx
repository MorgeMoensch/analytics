/** @format */

import React, { useState, useCallback } from 'react'
import { useAppNavigate } from '../navigation/use-app-navigate'
import { useQueryContext } from '../query-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardQuery } from '../query'
import { useSiteContext } from '../site-context'
import {
  cleanLabels,
  plainFilterText,
  remapToApiFilters
} from '../util/filters'
import {
  formatSegmentIdAsLabelKey,
  parseApiSegmentData,
  SavedSegment
} from './segments'
import { CreateSegmentModal, UpdateSegmentModal } from './segment-modals'

type M = 'create segment' | 'update segment'
type O =
  | { type: 'create segment' }
  | { type: 'update segment'; segment: SavedSegment }

export const SaveSegmentAction = ({ options }: { options: O[] }) => {
  const site = useSiteContext()
  const { query } = useQueryContext()
  const [modal, setModal] = useState<M | null>(null)
  const navigate = useAppNavigate()
  const openCreateSegment = useCallback(() => {
    return setModal('create segment')
  }, [])
  const openUpdateSegment = useCallback(() => {
    return setModal('update segment')
  }, [])
  const close = useCallback(() => {
    return setModal(null)
  }, [])
  const queryClient = useQueryClient()
  const createSegment = useMutation({
    mutationFn: ({
      name,
      personal,
      segment_data
    }: {
      name: string
      personal: boolean
      segment_data: {
        filters: DashboardQuery['filters']
        labels: DashboardQuery['labels']
      }
    }) => {
      return fetch(
        `/internal-api/${encodeURIComponent(site.domain)}/segments`,
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            personal,
            segment_data: {
              filters: remapToApiFilters(segment_data.filters),
              labels: cleanLabels(segment_data.filters, segment_data.labels)
            }
          }),
          headers: { 'content-type': 'application/json' }
        }
      )
        .then((res) => res.json())
        .then((d) => ({
          ...d,
          segment_data: parseApiSegmentData(d.segment_data)
        }))
    },
    onSuccess: async (d) => {
      navigate({
        search: (search) => {
          const filters = [['is', 'segment', [d.id]]]
          const labels = cleanLabels(filters, {}, 'segment', {
            [formatSegmentIdAsLabelKey(d.id)]: d.name
          })
          return {
            ...search,
            filters,
            labels
          }
        }
      })
      close()
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    }
  })

  const patchSegment = useMutation({
    mutationFn: ({
      id,
      name,
      personal,
      segment_data
    }: {
      id: number
      name?: string
      personal?: boolean
      segment_data?: {
        filters: DashboardQuery['filters']
        labels: DashboardQuery['labels']
      }
    }) => {
      return fetch(
        `/internal-api/${encodeURIComponent(site.domain)}/segments/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name,
            personal,
            ...(segment_data && {
              segment_data: {
                filters: remapToApiFilters(segment_data.filters),
                labels: cleanLabels(segment_data.filters, segment_data.labels)
              }
            })
          }),
          headers: {
            'content-type': 'application/json',
            accept: 'application/json'
          }
        }
      )
        .then((res) => res.json())
        .then((d) => ({
          ...d,
          segment_data: parseApiSegmentData(d.segment_data)
        }))
    },
    onSuccess: async (d) => {
      navigate({
        search: (search) => {
          const filters = [['is', 'segment', [d.id]]]
          const labels = cleanLabels(filters, {}, 'segment', {
            [formatSegmentIdAsLabelKey(d.id)]: d.name
          })
          return {
            ...search,
            filters,
            labels
          }
        }
      })
      close()
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    }
  })

  const segmentNamePlaceholder = query.filters.reduce(
    (combinedName, filter) =>
      combinedName.length > 100
        ? combinedName
        : `${combinedName}${combinedName.length ? ' and ' : ''}${plainFilterText(query, filter)}`,
    ''
  )

  const option = options.find((o) => o.type === modal)

  const getSegment = useQuery({
    enabled:
      typeof options.find((o) => o.type === 'update segment')?.segment.id ===
      'number',
    queryKey: [
      'segments',
      options.find((o) => o.type === 'update segment')?.segment.id
    ],
    queryFn: ({ queryKey: [_, id] }) => {
      return fetch(
        `/internal-api/${encodeURIComponent(site.domain)}/segments/${id}`,
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json'
          }
        }
      )
        .then((res) => res.json())
        .then((d) => ({
          ...d,
          segment_data: parseApiSegmentData(d.segment_data)
        }))
        .then(() => navigate({ search: (s) => ({ ...s,  }) }))
    }
  })

  return (
    <div>
      {options.map((o) => {
        if (o.type === 'create segment') {
          return (
            <button
              key={o.type}
              className="whitespace-nowrap rounded font-medium text-sm leading-tight px-2 py-2 h-9 hover:text-indigo-700 dark:hover:text-indigo-500"
              onClick={openCreateSegment}
            >
              Save segment
            </button>
          )
        }
        if (o.type === 'update segment') {
          return (
            <button
              key={o.type}
              className="whitespace-nowrap rounded font-medium text-sm leading-tight px-2 py-2 h-9 hover:text-indigo-700 dark:hover:text-indigo-500"
              onClick={openUpdateSegment}
            >
              Update segment
            </button>
          )
        }
      })}
      {modal === 'create segment' && (
        <CreateSegmentModal
          namePlaceholder={segmentNamePlaceholder}
          close={close}
          onSave={({ name, personal }) =>
            createSegment.mutate({
              name,
              personal,
              segment_data: {
                filters: query.filters,
                labels: query.labels
              }
            })
          }
        />
      )}
      {option?.type === 'update segment' && (
        <UpdateSegmentModal
          segment={option.segment}
          namePlaceholder={option.segment.name}
          close={close}
          onSave={({ id, name, personal }) =>
            patchSegment.mutate({
              id,
              name,
              personal
              // segment_data: {
              //   filters: query.filters,
              //   labels: query.labels
              // }
            })
          }
        />
      )}
    </div>
  )
}
