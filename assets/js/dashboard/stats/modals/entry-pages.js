import React, { useCallback } from "react";
import Modal from './modal'
import { hasGoalFilter, isRealTimeDashboard } from "../../util/filters";
import { addFilter } from '../../query'
import BreakdownModal from "./breakdown-modal";
import * as metrics from '../reports/metrics'
import * as url from '../../util/url';
import { useQueryContext } from "../../query-context";
import { useSiteContext } from "../../site-context";
import { SortDirection } from "../../hooks/use-order-by";

function EntryPagesModal() {
  const { query } = useQueryContext();
  const site = useSiteContext();

  const reportInfo = {
    title: 'Entry Pages',
    dimension: 'entry_page',
    endpoint: url.apiPath(site, '/entry-pages'),
    dimensionLabel: 'Entry page',
    defaultOrder: ["visitors", SortDirection.desc]
  }

  const getFilterInfo = useCallback((listItem) => {
    return {
      prefix: reportInfo.dimension,
      filter: ["is", reportInfo.dimension, [listItem.name]]
    }
  }, [reportInfo.dimension])

  const addSearchFilter = useCallback((query, searchString) => {
    return addFilter(query, ['contains', reportInfo.dimension, [searchString]])
  }, [reportInfo.dimension])

  function chooseMetrics() {
    if (hasGoalFilter(query)) {
      return [
        metrics.createTotalVisitors(),
        metrics.createVisitors({ renderLabel: () => 'Conversions', width: 'w-28' }),
        metrics.createConversionRate()
      ]
    }

    if (isRealTimeDashboard(query)) {
      return [
        metrics.createVisitors({ renderLabel: () => 'Current visitors', width: 'w-36' })
      ]
    }

    return [
      metrics.createVisitors({ renderLabel: () => "Visitors" }),
      metrics.createVisits({ renderLabel: () => "Total Entrances", width: 'w-36' }),
      metrics.createVisitDuration()
    ]
  }

  return (
    <Modal>
      <BreakdownModal
        reportInfo={reportInfo}
        metrics={chooseMetrics()}
        getFilterInfo={getFilterInfo}
        addSearchFilter={addSearchFilter}
      />
    </Modal>
  )
}

export default EntryPagesModal
