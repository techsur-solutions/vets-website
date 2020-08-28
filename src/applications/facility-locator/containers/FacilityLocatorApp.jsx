import { connect } from 'react-redux';
import { Link } from 'react-router';
import React from 'react';
import appendQuery from 'append-query';
import DowntimeNotification, {
  externalServices,
} from 'platform/monitoring/DowntimeNotification';
import { validateIdString } from '../utils/helpers';
import Breadcrumbs from '@department-of-veterans-affairs/formation-react/Breadcrumbs';

class FacilityLocatorApp extends React.Component {
  renderBreadcrumbs(location, selectedResult) {
    // Map and name props for the search query object
    const {
      currentPage: page,
      context,
      facilityType,
      searchString: address,
      serviceType,
      zoomLevel,
    } = this.props.searchQuery;

    // Build the query object in the expected order
    const searchQueryObj = {
      zoomLevel,
      page,
      address,
      location: `${location.latitude},${location.longitude}`,
      context,
      facilityType,
      serviceType,
    };

    const crumbs = [
      <a href="/" key="home">
        Home
      </a>,
      <Link to={appendQuery('/', searchQueryObj)} key="facility-locator">
        Find Locations
      </Link>,
    ];

    if (validateIdString(location.pathname, '/facility') && selectedResult) {
      crumbs.push(
        <Link to={`/${selectedResult.id}`} key={selectedResult.id}>
          Facility Details
        </Link>,
      );
    } else if (
      validateIdString(location.pathname, '/provider') &&
      selectedResult
    ) {
      crumbs.push(
        <Link to={`/${selectedResult.id}`} key={selectedResult.id}>
          Provider Details
        </Link>,
      );
    }

    return crumbs;
  }

  otherToolsLink = () => (
    <div id="other-tools">
      Can’t find what you’re looking for?&nbsp;&nbsp;
      {/* Add a line break for mobile, which uses white-space: pre-line */}
      {'\n'}
      <a href="https://www.va.gov/directory/guide/home.asp">
        Try using our other tools to search.
      </a>
    </div>
  );

  render() {
    const { location, selectedResult, results } = this.props;

    return (
      <div>
        <Breadcrumbs selectedFacility={selectedResult}>
          {this.renderBreadcrumbs(location, selectedResult)}
        </Breadcrumbs>
        <div className="row">
          <DowntimeNotification
            appTitle="facility locator tool"
            dependencies={[externalServices.arcgis]}
          >
            <div className="facility-locator">{this.props.children}</div>
          </DowntimeNotification>
        </div>
        {results && results.length > 0 && this.otherToolsLink()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedResult: state.searchResult.selectedResult,
    searchQuery: state.searchQuery,
    results: state.searchResult.results,
  };
}

export default connect(
  mapStateToProps,
  null,
)(FacilityLocatorApp);
