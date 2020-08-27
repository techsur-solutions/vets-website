// import fullSchema from 'vets-json-schema/dist/28-8832-schema.json';

import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';

import { hasSession } from 'platform/user/profile/utilities';

import { statusSelection } from './chapters/status-selection';
import { staticInformation } from './chapters/static-information/';
import {
  veteranInformation,
  veteranAddress,
} from './chapters/veteran-information';
import {
  dependentInformation,
  dependentAddress,
} from './chapters/dependent-information';
import { isDependent, isVeteran } from './helpers';

const formConfig = {
  urlPrefix: '/',
  submitUrl: '/v0/api',
  trackingPrefix: '28-8832-planning-and-career-guidance-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  formId: '28-8832',
  version: 0,
  prefillEnabled: true,
  savedFormMessages: {
    notFound: 'Please start over to apply for Planning and career guidance.',
    noAuth:
      'Please sign in again to continue your application for Planning and career guidance.',
  },
  title: '28-8832-planning-and-guidance',
  defaultDefinitions: {},
  chapters: {
    statusSelection: {
      title: 'Your Status',
      pages: {
        wizard: {
          path: 'your-status',
          title: 'Your Status',
          uiSchema: statusSelection.uiSchema,
          schema: statusSelection.schema,
        },
      },
    },
    staticInformation: {
      title: 'Claimant Information',
      pages: {
        staticClaimantInformation: {
          path: 'claimant-information',
          title: 'Claimant Information',
          uiSchema: staticInformation.uiSchema,
          schema: staticInformation.schema,
        },
      },
    },
    dependentInformation: {
      title: 'Dependent Information',
      pages: {
        dependentInformation: {
          depends: formData => isDependent(formData) && !hasSession(),
          path: 'dependent-information',
          title: 'Dependent Information',
          uiSchema: dependentInformation.uiSchema,
          schema: dependentInformation.schema,
        },
        dependentAddress: {
          depends: formData => isDependent(formData),
          path: 'dependent-address',
          title: 'Dependent Address',
          uiSchema: dependentAddress.uiSchema,
          schema: dependentAddress.schema,
        },
      },
    },
    veteranDetails: {
      title: 'Service member or Veteran information',
      pages: {
        veteranInformation: {
          depends: formData => isVeteran(formData) && !hasSession(),
          path: 'personal-information',
          title: 'Personal Information',
          uiSchema: veteranInformation.uiSchema,
          schema: veteranInformation.schema,
        },
        veteranAddress: {
          path: 'veteran-address',
          title: 'Veteran Address',
          uiSchema: veteranAddress.uiSchema,
          schema: veteranAddress.schema,
        },
      },
    },
  },
};

export default formConfig;
