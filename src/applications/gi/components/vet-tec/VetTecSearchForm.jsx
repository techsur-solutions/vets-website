import React from 'react';

import KeywordSearch from '../search/KeywordSearch';
import CheckboxGroup from '../CheckboxGroup';
import {
  addAllOption,
  getStateNameForCode,
  handleInputFocusWithPotentialOverLap,
  isMobileView,
} from '../../utils/helpers';
import PropTypes from 'prop-types';
import Dropdown from '../Dropdown';
import VetTecFilterBy from './VetTecFilterBy';
import CautionaryWarningsFilter from '../search/CautionaryWarningsFilter';
import environment from 'platform/utilities/environment';

class VetTecSearchForm extends React.Component {
  static propTypes = {
    eligibilityChange: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    search: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    filtersClass: PropTypes.string.isRequired,
    autocomplete: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    clearAutocompleteSuggestions: PropTypes.func.isRequired,
    fetchAutocompleteSuggestions: PropTypes.func.isRequired,
    handleFilterChange: PropTypes.func.isRequired,
    handleProviderFilterChange: PropTypes.func.isRequired,
    updateAutocompleteSearchTerm: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired,
    eligibility: PropTypes.object.isRequired,
  };

  handleDropdownChange = e => {
    const { name: field, value } = e.target;
    this.props.handleFilterChange(field, value);
  };

  handleOnlineClassesChange = e => {
    const { name: field, checked: value } = e.target;
    const { learningFormat } = this.props.eligibility;
    learningFormat[field] = value;

    this.props.eligibilityChange({
      target: {
        name: 'learningFormat',
        value: learningFormat,
      },
    });
  };

  handleCheckboxChange = e => {
    const { name: field, checked: value } = e.target;
    this.props.handleFilterChange(field, value);
  };

  handleSearchInputFocus = fieldId => {
    // prod flag for bah-8821
    if (environment.isProduction() && isMobileView()) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.scrollIntoView();
      }
    } else {
      const seeResultsButtonFieldId = 'see-results-button';
      const scrollableFieldId = 'vet-tec-search';
      handleInputFocusWithPotentialOverLap(
        fieldId,
        seeResultsButtonFieldId,
        scrollableFieldId,
      );
    }
  };

  renderLearningFormat = () => {
    const { inPerson, online } = this.props.eligibility.learningFormat;

    const options = [
      {
        name: 'inPerson',
        label: (
          <div>
            In Person &nbsp; <i className="fas fa-user" aria-hidden="true" />
          </div>
        ),
        checked: inPerson,
      },
      {
        name: 'online',
        label: (
          <div>
            Online &nbsp; <i className="fas fa-laptop" aria-hidden="true" />
          </div>
        ),
        checked: online,
      },
    ];
    return (
      <CheckboxGroup
        label="Learning Format"
        options={options}
        onChange={this.handleOnlineClassesChange}
        onFocus={this.handleSearchInputFocus}
      />
    );
  };

  renderCountryFilter = () => {
    const options = this.props.search.facets.country.map(country => ({
      value: country.name,
      label: country.name,
    }));
    return (
      <Dropdown
        label="Country"
        name="country"
        alt="Filter results by country"
        options={addAllOption(options)}
        value={this.props.filters.country}
        onChange={this.handleDropdownChange}
        onFocus={this.handleSearchInputFocus}
        visible
      />
    );
  };

  renderStateFilter = () => {
    const options = Object.keys(this.props.search.facets.state)
      .sort()
      .map(state => ({
        value: state,
        label: getStateNameForCode(state),
      }));

    return (
      <Dropdown
        label="State"
        name="state"
        alt="Filter results by state"
        options={addAllOption(options)}
        value={this.props.filters.state}
        onChange={this.handleDropdownChange}
        onFocus={this.handleSearchInputFocus}
        visible
      />
    );
  };

  renderFilterBy = () => (
    <VetTecFilterBy
      showModal={this.props.showModal}
      filters={this.props.filters}
      providers={this.props.search.facets.provider}
      handleFilterChange={this.props.handleFilterChange}
      handleProviderFilterChange={this.props.handleProviderFilterChange}
      handleInputFocus={this.handleSearchInputFocus}
    />
  );

  render() {
    return (
      <div className="row">
        <div id="vet-tec-search" className={this.props.filtersClass}>
          <div className="filters-sidebar-inner">
            {this.props.search.filterOpened && <h1>Filter your search</h1>}
            <h2>Refine search</h2>
            <KeywordSearch
              autocomplete={this.props.autocomplete}
              label={
                this.props.gibctSearchEnhancements
                  ? 'Program, provider, or location'
                  : 'City, VET TEC program or provider'
              }
              location={this.props.location}
              onClearAutocompleteSuggestions={
                this.props.clearAutocompleteSuggestions
              }
              onFetchAutocompleteSuggestions={
                this.props.fetchAutocompleteSuggestions
              }
              onFilterChange={this.props.handleFilterChange}
              onUpdateAutocompleteSearchTerm={
                this.props.updateAutocompleteSearchTerm
              }
            />

            {this.renderCountryFilter()}
            {this.renderStateFilter()}
            {
              <CautionaryWarningsFilter
                excludeWarnings={this.props.filters.excludeWarnings}
                excludeCautionFlags={this.props.filters.excludeCautionFlags}
                onChange={this.handleCheckboxChange}
                showModal={this.props.showModal}
                handleInputFocus={this.handleSearchInputFocus}
              />
            }
            {this.renderFilterBy()}
          </div>
          <div id="see-results-button" className="results-button">
            <button className="usa-button" onClick={this.props.toggleFilter}>
              See Results
            </button>
          </div>
        </div>
        {this.props.searchResults}
      </div>
    );
  }
}

export default VetTecSearchForm;
