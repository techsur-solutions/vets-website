import React from 'react';

import Telephone, {
  CONTACTS,
} from '@department-of-veterans-affairs/formation-react/Telephone';

const GetFormHelp = () => (
  <p className="help-talk">
    Need help filling out the form or have questions about eligibility? Please
    call VA Benefits and Services at{' '}
    <Telephone contact={CONTACTS.VA_BENEFITS} />.<br />
    <br />
    If you have hearing loss, call{' '}
    <a href="tel:711" aria-label="TTY. 7 1 1.">
      TTY: 711
    </a>
    .
  </p>
);

export default GetFormHelp;
