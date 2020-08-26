import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import AlertBox from '@department-of-veterans-affairs/formation-react/AlertBox';

export default function AppUnavailable() {
  return (
    <>
      <Breadcrumbs />
      <div className="vads-l-row">
        <div className="vads-l-col--12 medium-screen:vads-l-col--8 vads-u-margin-bottom--4">
          <AlertBox
            status="warning"
            headline="We’re sorry, the new VA online scheduling application isn’t available right now"
            className="vads-u-margin-top--0"
          >
            If you need to schedule an appointment, please contact your{' '}
            <a href="/find-locations">nearest VA facility</a>.
          </AlertBox>
        </div>
      </div>
    </>
  );
}
