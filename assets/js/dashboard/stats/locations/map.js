import React from 'react';
import Datamap from 'datamaps'
import * as d3 from "d3"

import numberFormatter from '../../util/number-formatter'
import FadeIn from '../../fade-in'
import LazyLoader from '../../components/lazy-loader'
import MoreLink from '../more-link'
import * as api from '../../api'
import { navigateToQuery } from '../../query'
import { cleanLabels, replaceFilterByPrefix } from '../../util/filters';
import { countriesRoute } from '../../router';
import { useAppNavigate } from '../../navigation/use-app-navigate';
import { useQueryContext } from '../../query-context';

class Countries extends React.Component {
  constructor(props) {
    super(props)
    this.resizeMap = this.resizeMap.bind(this)
    this.drawMap = this.drawMap.bind(this)
    this.getDataset = this.getDataset.bind(this)
    this.state = {
      loading: true,
      darkTheme: document.querySelector('html').classList.contains('dark') || false
    }
    this.onVisible = this.onVisible.bind(this)
    this.updateCountries = this.updateCountries.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ loading: true, countries: null })
      this.fetchCountries(this.drawMap)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeMap);
    document.removeEventListener('tick', this.updateCountries);
  }

  onVisible() {
    this.fetchCountries(this.drawMap)
    window.addEventListener('resize', this.resizeMap);
    if (this.props.query.period === 'realtime') {
      document.addEventListener('tick', this.updateCountries)
    }
  }

  getDataset() {
    const dataset = {};

    var onlyValues = this.state.countries.map(function(obj) { return obj.visitors });
    var maxValue = Math.max.apply(null, onlyValues);

    // eslint-disable-next-line no-undef
    const paletteScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([
        this.state.darkTheme ? "#2e3954" : "#f3ebff",
        this.state.darkTheme ? "#6366f1" : "#a779e9"
      ])

    this.state.countries.forEach(function(item) {
      dataset[item.alpha_3] = { numberOfThings: item.visitors, fillColor: paletteScale(item.visitors) };
    });

    return dataset
  }

  updateCountries() {
    this.fetchCountries(() => { this.map.updateChoropleth(this.getDataset(), { reset: true }) })
  }

  fetchCountries(cb) {
    return api.get(`/api/stats/${encodeURIComponent(this.props.site.domain)}/countries`, this.props.query, { limit: 300 })
      .then((response) => {
        if (this.props.afterFetchData) {
          this.props.afterFetchData(response)
        }

        this.setState({ loading: false, countries: response.results }, cb)
      })
  }

  resizeMap() {
    this.map && this.map.resize()
  }

  drawMap() {
    const dataset = this.getDataset();
    const label = this.props.query.period === 'realtime' ? 'Current visitors' : 'Visitors'
    const defaultFill = this.state.darkTheme ? '#2d3747' : '#f8fafc'
    const highlightFill = this.state.darkTheme ? '#374151' : '#F5F5F5'
    const borderColor = this.state.darkTheme ? '#1f2937' : '#dae1e7'
    const highlightBorderColor = this.state.darkTheme ? '#4f46e5' : '#a779e9'

    this.map = new Datamap({
      element: document.getElementById('map-container'),
      responsive: true,
      projection: 'mercator',
      fills: { defaultFill },
      data: dataset,
      geographyConfig: {
        borderColor,
        highlightBorderWidth: 2,
        highlightFillColor: (geo) => geo.fillColor || highlightFill,
        highlightBorderColor,
        popupTemplate: (geo, data) => {
          if (!data) { return null; }
          const pluralizedLabel = data.numberOfThings === 1 ? label.slice(0, -1) : label
          return ['<div class="hoverinfo dark:bg-gray-800 dark:shadow-gray-850 dark:border-gray-850 dark:text-gray-200">',
            '<strong>', geo.properties.name, ' </strong>',
            '<br><strong class="dark:text-indigo-400">', numberFormatter(data.numberOfThings), '</strong> ', pluralizedLabel,
            '</div>'].join('');
        }
      },
      done: (datamap) => {
        datamap.svg.selectAll('.datamaps-subunit').on('click', (geography) => {
          const country = this.state.countries.find(c => c.alpha_3 === geography.id)
          const filters = replaceFilterByPrefix(this.props.query, "country", ["is", "country", [country.code]])
          const labels = cleanLabels(filters, this.props.query.labels, "country", { [country.code]: country.name })

          if (country) {
            this.props.onClick()

            navigateToQuery(
              this.props.navigate,
              this.props.query,
              {
                filters,
                labels
              }
            )
          }

        })
      }
    });
  }

  geolocationDbNotice() {
    if (this.props.site.isDbip) {
      return (
        <span className="text-xs text-gray-500 absolute bottom-4 right-3">IP Geolocation by <a target="_blank" href="https://db-ip.com" rel="noreferrer" className="text-indigo-600">DB-IP</a></span>
      )
    }

    return null
  }

  renderBody() {
    if (this.state.countries) {
      return (
        <>
          <div className="mx-auto mt-4" style={{ width: '100%', maxWidth: '475px', height: '335px' }} id="map-container"></div>
          <MoreLink list={this.state.countries} linkProps={{ path: countriesRoute.path, search: (search) => search }} />
          {this.geolocationDbNotice()}
        </>
      )
    }

    return null
  }

  render() {
    return (
      <LazyLoader onVisible={this.onVisible}>
        {this.state.loading && <div className="mx-auto my-32 loading"><div></div></div>}
        <FadeIn show={!this.state.loading}>
          {this.renderBody()}
        </FadeIn>
      </LazyLoader>
    )
  }
}

export default function CountriesWithRouter(props) {const {query} = useQueryContext(); const navigate = useAppNavigate();
return (<Countries {...props} query={query} navigate={navigate}/>)}
