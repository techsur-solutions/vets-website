import React from 'react';

//import { withRouter } from 'react-router';
//import { connect } from 'react-redux';
import Scroll from 'react-scroll';

import FormNav from '../components/FormNav';
import FormTitle from '../components/FormTitle';
import { isInProgress } from '../helpers';
import { setGlobalScroll } from '../utilities/ui';

const Element = Scroll.Element;

/*
 * Primary component for a schema generated form app.
 */
class FormApp extends React.Component {
  /* eslint-disable-next-line camelcase */
  UNSAFE_componentWillMount() {
    console.log("in form App ********  UNSAFE_componentWillMount  ");
    
    const { additionalRoutes } = this.props.formConfig;
    console.log("in form App ********  UNSAFE_componentWillMount additionalRoutes ",additionalRoutes);
    this.nonFormPages = [];
    if (additionalRoutes) {
      this.nonFormPages = additionalRoutes.map(route => route.path);
    }
    console.log("in form App ********    ");
    setGlobalScroll();

    if (window.History) {
      window.History.scrollRestoration = 'manual';
    }
    console.log("in form App ********    ");
  }

  render() {
    const { currentLocation, formConfig, children, formData } = this.props;
    //const { currentLocation, formConfig, children } = this.props
    //const formData={};
    console.log("in form App ********    ");
    console.log("in form App ********  formData  ***** ",formData);
    const trimmedPathname = currentLocation.pathname;
    const lastPathComponent = currentLocation.pathname.split('/').pop();
    const isIntroductionPage = trimmedPathname.endsWith('introduction');
    const isNonFormPage = this.nonFormPages.includes(lastPathComponent);
    const Footer = formConfig.footerContent;
    const title = 
      typeof formConfig.title === 'function'
        ? formConfig.title(this.props)
        : formConfig.title;

    let formTitle;
    let formNav;
    let renderedChildren = children;

    console.log(formTitle+"  48th formApp *******  ",renderedChildren);
    // Show title only if:
    // 1. we're not on the intro page *or* one of the additionalRoutes
    //    specified in the form config
    // 2. there is a title specified in the form config
    if (!isIntroductionPage && !isNonFormPage && title) {
      formTitle = <FormTitle title={title} subTitle={formConfig.subTitle} />;
    }

    // Show nav only if we're not on the intro, form-saved, error, confirmation
    // page or one of the additionalRoutes specified in the form config
    // Also add form classes only if on an actual form page


    console.log(isNonFormPage+"      in FormApp going to render formNav ******* ",trimmedPathname);
    if (!isNonFormPage && isInProgress(trimmedPathname)) {
      console.log("      in FormApp going to render formData ******* ",formData);
      console.log("      in FormApp going to render formConfig ******* ",formConfig);
      console.log("      in FormApp going to render trimmedPathname ******* ",trimmedPathname);
     
      formNav = (
        <FormNav
          formData={formData}
          formConfig={formConfig}
          currentPath={trimmedPathname}
        />
      );

      renderedChildren = (
        <div className="progress-box progress-box-schemaform">{children}</div>
      );
    }

    let footer;
    if (Footer && !isNonFormPage) {
      footer = (
        <Footer formConfig={formConfig} currentLocation={currentLocation} />
      );
    }

    return (
      <div>
        <div className="row">
          <div className="usa-width-two-thirds medium-8 columns">
            <Element name="topScrollElement" />
            {formTitle}
          {formNav}
          {console.log(formNav)}
            {renderedChildren}
          </div>
        </div>
        {footer}
        <span
          className="js-test-location hidden"
          data-location={trimmedPathname}
          hidden
        />
      </div>
    );
  }
}

// const mapStateToProps = state => ({
//   formData: state.form.data,
// });

// export default connect(mapStateToProps)(FormApp);

export default FormApp;
