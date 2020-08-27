import React from 'react';
import { expect } from 'chai';
import SkinDeep from 'skin-deep';

import SubmittingButton from '../../../../src/js/review/submit-buttons/SubmittingButton';

describe('Schemaform review: <SubmittingButton>', () => {
  const onBack = _event => {
    // no-op
  };
  const onSubmit = _event => {
    // no-op
  };
  const subject = SkinDeep.shallowRender(
    <SubmittingButton onBack={onBack} onSubmit={onSubmit} />,
  );

  it('has an enabled back button', () => {
    const label = 'Back';
    const button = subject.everySubTree('ProgressButton')[0];
    expect(button.props.buttonText).to.equal(label);
    expect(button.props.disabled).to.be.undefined;
    expect(button.props.onButtonClick).to.equal(onBack);
  });

  it('has a disabled in-progress submit button', () => {
    const label = 'Sending...';
    const button = subject.everySubTree('ProgressButton')[1];
    expect(button.props.buttonText).to.equal(label);
    expect(button.props.disabled).to.be.true;
    expect(button.props.onButtonClick).to.equal(onSubmit);
  });
});
