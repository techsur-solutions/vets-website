import React from 'react';
import { connect } from 'react-redux';
import Scroll from 'react-scroll';
import _ from 'lodash';
import classNames from 'classnames';

import {
  clearAutocompleteSuggestions,
  fetchProgramAutocompleteSuggestions,
  fetchProgramSearchResults,
  institutionFilterChange,
  setPageTitle,
  toggleFilter,
  updateAutocompleteSearchTerm,
  eligibilityChange,
  showModal,
} from '../actions';

import LoadingIndicator from '@department-of-veterans-affairs/formation-react/LoadingIndicator';
import Pagination from '@department-of-veterans-affairs/formation-react/Pagination';
import { getScrollOptions, focusElement } from 'platform/utilities/ui';
import VetTecProgramSearchResult from '../components/vet-tec/VetTecProgramSearchResult';
import VetTecSearchForm from '../components/vet-tec/VetTecSearchForm';
import { renderVetTecLogo, renderSearchResultsHeader } from '../utils/render';
import ServiceError from '../components/ServiceError';
import { isMobileView } from '../utils/helpers';
import environment from 'platform/utilities/environment';
import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { searchWithFilters } from '../utils/search';

const { Element: ScrollElement, scroller } = Scroll;

export class VetTecSearchPage extends React.Component {
  componentDidMount() {
    let title = 'Search Results';
    const searchTerm = this.props.autocomplete.term;
    if (searchTerm) {
      title += ` - ${searchTerm}`;
    }
    this.props.setPageTitle(title);
    this.updateSearchResults();
  }

  componentDidUpdate(prevProps) {
    const currentlyInProgress = this.props.search.inProgress;

    const shouldUpdateSearchResults =
      !currentlyInProgress &&
      !_.isEqual(this.props.location.query, prevProps.location.query);

    if (shouldUpdateSearchResults) {
      this.updateSearchResults();
    }

    // prod flag for bah-8821
    if (environment.isProduction()) {
      if (currentlyInProgress !== prevProps.search.inProgress) {
        scroller.scrollTo('searchPage', getScrollOptions());
      }
    } else if (
      !isMobileView() &&
      currentlyInProgress !== prevProps.search.inProgress
    ) {
      scroller.scrollTo('searchPage', getScrollOptions());
    }

    if (
      !currentlyInProgress &&
      !_.isEqual(this.props.search.results, prevProps.search.results)
    ) {
      focusElement('.search-results-count > h1');
    }
  }

  getQueryFilterFields = () => {
    const booleanFilterParams = [
      'preferredProvider',
      'excludeWarnings',
      'excludeCautionFlags',
    ];

    const stringFilterParams = ['version', 'country', 'state', 'type'];

    const stringSearchParams = ['page', 'name'];

    let providerQueryVal = this.props.location.query.provider
      ? this.props.location.query.provider
      : [];

    if (typeof providerQueryVal === 'string') {
      providerQueryVal = [providerQueryVal];
    }

    const queryParams = _.pick(this.props.location.query, [
      ...stringSearchParams,
      ...stringFilterParams,
      ...booleanFilterParams,
    ]);

    const query = {
      ...queryParams,
      provider: providerQueryVal || [],
    };

    // Update form selections based on query.
    const institutionFilter = _.omit(query, stringSearchParams);

    // Convert string to bool for params associated with checkboxes.
    booleanFilterParams.forEach(filterKey => {
      const filterValue = institutionFilter[filterKey];
      institutionFilter[filterKey] = filterValue === 'true';
    });

    return {
      institutionFilter,
      query,
    };
  };

  updateSearchResults = () => {
    const queryFilterFields = this.getQueryFilterFields();
    if (!_.isEqual(this.props.search.query, queryFilterFields.query)) {
      this.props.institutionFilterChange(queryFilterFields.institutionFilter);
      this.props.fetchProgramSearchResults(
        queryFilterFields.query,
        this.props.gibctSearchEnhancements,
      );
    }
  };

  handlePageSelect = page => {
    this.props.router.push({
      ...this.props.location,
      query: { ...this.props.location.query, page },
    });
  };

  handleProviderFilterChange = provider => {
    this.handleFilterChange('provider', provider.provider);
  };

  handleFilterChange = (field, value, additionalFields = []) => {
    const removedWhenAllFields = ['country', 'state', 'type'];
    additionalFields.push({ field, value });
    searchWithFilters(this.props, additionalFields, removedWhenAllFields);
  };

  autocomplete = (value, version) => {
    if (value) {
      this.props.fetchProgramAutocompleteSuggestions(
        value,
        _.omit(this.props.search.query, 'name'),
        version,
      );
    }
  };

  filterResultsByProvider = result =>
    this.props.filters.provider.length === 0 ||
    this.props.filters.provider.includes(result.institutionName);

  searchResults = () => {
    const { search } = this.props;
    const {
      pagination: { currentPage, totalPages },
    } = search;

    const resultsClass = classNames(
      'search-results',
      'small-12',
      'medium-9',
      'columns',
      { opened: !search.filterOpened },
    );

    let searchResults;

    // Filter button on mobile.
    const filterButton = (
      <button
        className="filter-button usa-button-secondary"
        onClick={this.props.toggleFilter}
      >
        Filter
      </button>
    );

    if (search.inProgress) {
      searchResults = (
        <div className={resultsClass}>
          {filterButton}
          <LoadingIndicator message="Loading search results..." />
        </div>
      );
    } else {
      searchResults = (
        <div className={resultsClass}>
          {filterButton}
          <div>
            {search.results.filter(this.filterResultsByProvider).map(result => (
              <VetTecProgramSearchResult
                version={this.props.location.query.version}
                id={`${result.facilityCode}-${result.description}`}
                key={`${result.facilityCode}-${result.description}`}
                result={result}
                constants={this.props.constants}
              />
            ))}
          </div>

          <Pagination
            onPageSelect={this.handlePageSelect.bind(this)}
            page={currentPage}
            pages={totalPages}
          />
        </div>
      );
    }

    return searchResults;
  };

  render() {
    const { search, filters } = this.props;

    const filtersClass = classNames(
      'filters-sidebar',
      'small-12',
      'medium-3',
      'columns',
      'mobile-vettec-logo',
      { opened: search.filterOpened },
    );

    const searchResults = this.searchResults();

    return (
      <ScrollElement name="searchPage" className="search-page">
        {search.error ? (
          <ServiceError />
        ) : (
          <div>
            <div className="vads-u-display--block single-column-display-none  vettec-logo-container">
              {renderVetTecLogo(classNames('vettec-logo-search'))}
            </div>
            <div className="vads-l-row vads-u-justify-content--space-between vads-u-align-items--flex-end vads-u-margin-top--neg3">
              <div className="vads-l-col--9 search-results-count">
                {renderSearchResultsHeader(this.props.search)}
              </div>
              <div className="vads-l-col--3">
                <div className="vads-u-display--none single-column-display-block vettec-logo-container">
                  {renderVetTecLogo(classNames('vettec-logo-search'))}
                </div>
              </div>
            </div>

            <VetTecSearchForm
              filtersClass={filtersClass}
              search={this.props.search}
              autocomplete={this.props.autocomplete}
              location={this.props.location}
              clearAutocompleteSuggestions={
                this.props.clearAutocompleteSuggestions
              }
              fetchAutocompleteSuggestions={this.autocomplete}
              handleFilterChange={this.handleFilterChange}
              handleProviderFilterChange={this.handleProviderFilterChange}
              updateAutocompleteSearchTerm={
                this.props.updateAutocompleteSearchTerm
              }
              filters={filters}
              toggleFilter={this.props.toggleFilter}
              searchResults={searchResults}
              eligibility={this.props.eligibility}
              showModal={this.props.showModal}
              eligibilityChange={this.props.eligibilityChange}
              gibctSearchEnhancements={this.props.gibctSearchEnhancements}
            />
          </div>
        )}
      </ScrollElement>
    );
  }
}

VetTecSearchPage.defaultProps = {};

const mapStateToProps = state => ({
  autocomplete: state.autocomplete,
  constants: state.constants.constants,
  filters: state.filters,
  search: state.search,
  eligibility: state.eligibility,
  gibctSearchEnhancements: toggleValues(state)[
    FEATURE_FLAG_NAMES.gibctSearchEnhancements
  ],
});

const mapDispatchToProps = {
  clearAutocompleteSuggestions,
  fetchProgramAutocompleteSuggestions,
  fetchProgramSearchResults,
  institutionFilterChange,
  setPageTitle,
  toggleFilter,
  updateAutocompleteSearchTerm,
  eligibilityChange,
  showModal,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VetTecSearchPage);
