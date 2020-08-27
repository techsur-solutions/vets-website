import React from 'react';
import ProgressButton from '../../components/ProgressButton';
import PropTypes from 'prop-types';
import { Column, Row } from 'platform/forms/components/common/grid';

export default function SubmittingButton(props) {
  const { onBack, onSubmit } = props;

  return (
    <>
      <Row>
        <Column role="alert" />
      </Row>
      <Row classNames="form-progress-buttons">
        <Column classNames="small-6 medium-5">
          <ProgressButton
            onButtonClick={onBack}
            buttonText="Back"
            buttonClass="usa-button-secondary"
            beforeText="«"
          />
        </Column>
        <Column classNames="small-6 medium-5">
          <ProgressButton
            onButtonClick={onSubmit}
            buttonText="Sending..."
            disabled
            buttonClass="usa-button-disabled"
          />
        </Column>
        <Column classNames="small-1 medium-1 end">
          <div className="hidden">&nbsp;</div>
        </Column>
      </Row>
    </>
  );
}

SubmittingButton.propTypes = {
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
};
