import React from 'react';
import _ from 'lodash/fp'; // eslint-disable-line no-restricted-imports
import shallowEqual from 'recompose/shallowEqual';
import environment from 'platform/utilities/environment';

import SegmentedProgressBar from './SegmentedProgressBar';

import {
  createFormPageList,
  createPageList,
  getActiveExpandedPages,
} from '../helpers';

import PropTypes from 'prop-types';
import { REVIEW_APP_DEFAULT_MESSAGE } from '../constants';

export default class FormNav extends React.Component {
  // The formConfig transforming is a little heavy, so skip it if we can
  shouldComponentUpdate(newProps) {
    return !shallowEqual(this.props, newProps);
  }
  render() {
    const { formConfig, currentPath, formData } = this.props;

    console.log("FormNav  *********  formConfig  ****** ",formConfig);
    console.log("FormNav  *********  currentPath  ****** ",currentPath);
    console.log("FormNav  *********  formData  ****** ",formData);
    // This is converting the config into a list of pages with chapter keys,
    // finding the current page, then getting the chapter name using the key
    const formPages = createFormPageList(formConfig);
    console.log("FormNav  *********  formPages  ****** ", formData);
    const pageList = createPageList(formConfig, formPages);
    console.log("FormNav  *********  pageList  ****** ", formData);

    const eligiblePageList = getActiveExpandedPages(pageList, formData);
    console.log("FormNav  *********  eligiblePageList  ****** ", eligiblePageList);

    const chapters = _.uniq(
      eligiblePageList.map(p => p.chapterKey).filter(key => !!key),
    );

    console.log("FormNav  *********  chapters  ****** ",chapters);


    //let page = eligiblePageList.filter(p => p.path === currentPath)[0];   actual condition

    let page = eligiblePageList[0];

    console.log("FormNav  *********  page  ****** ", page);
    // If the page isn’t active, it won’t be in the eligiblePageList
    // This is a fallback to still find the chapter name if you open the page directly
    // (the chapter index will probably be wrong, but this isn’t a scenario that happens in normal use)
    if (!page) {
      page = formPages.find(
        p => `${formConfig.urlPrefix}${p.path}` === currentPath,
      );
    }

    console.log("FormNav  *********  page 57  ****** ", page);
    let current;
    let chapterName;
    if (page) {
      current = chapters.indexOf(page.chapterKey) + 1;
      // The review page is always part of our forms, but isn’t listed in chapter list
      chapterName =
        page.chapterKey === 'review'
          ? formConfig?.customText?.reviewPageTitle ||
            REVIEW_APP_DEFAULT_MESSAGE
          : formConfig.chapters[page.chapterKey].title;
          console.log("FormNav  *********  chapterName ****** ", chapterName);
      if (typeof chapterName === 'function') {
        chapterName = chapterName();
      }
    }
    console.log("FormNav  *********  chapterName 73 ****** ", chapterName+" *******    "+chapters.length);
    console.log("FormNav current *********** ",current);
    return (
      <div>
        <SegmentedProgressBar total={chapters.length} current={current} />
        <div className="schemaform-chapter-progress">
          <div
            aria-valuenow={current}
            aria-valuemin="1"
            aria-valuetext={`Step ${current} of ${
              chapters.length
            }: ${chapterName}`}
            aria-valuemax={chapters.length}
            className="nav-header nav-header-schemaform"
          >
            {!environment.isProduction() ? (
              <h2 className="vads-u-font-size--h4">
                {`Step ${current} of ${chapters.length}: ${chapterName}`}
              </h2>
            ) : (
              <h2 className="vads-u-font-size--h4">
                <span className="form-process-step current">{current}</span>{' '}
                <span className="form-process-total">of {chapters.length}</span>{' '}
                {chapterName}
              </h2>
            )}
          </div>
        </div>
      </div>
    );
  }
}

FormNav.defaultProps = {
  formConfig: {
    customText: {
      reviewPageTitle: '',
    },
  },
  currentPath: '',
  formData: {},
};

FormNav.propTypes = {
  formConfig: PropTypes.shape({
    customText: PropTypes.shape({
      reviewPageTitle: PropTypes.string,
    }),
  }).isRequired,
};
