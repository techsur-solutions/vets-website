import React from 'react';

const VRECounselorNotification = () => (
  <div className="vads-u-margin-top--2 vads-u-background-color--primary-alt-lightest vads-u-padding--3">
    <p className="vads-u-margin-top--0">
      Please contact your vocational rehabilitation counselor to learn more
      about how to get Chapter 31 career planning and guidance benefits.
    </p>
    <a
      href="https://www.benefits.va.gov/benefits/offices.asp"
      target="_blank"
      rel="noopener noreferrer"
    >
      Contact a vocational rehabilitation counselor
    </a>
  </div>
);

export default {
  name: 'VRECounselorNotification',
  component: VRECounselorNotification,
};
