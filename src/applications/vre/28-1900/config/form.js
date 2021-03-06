import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import { hasSession } from 'platform/user/profile/utilities';
import VeteranInformationViewComponent from '../components/VeteranInformationViewComponent';
import { additionalInformation } from './chapters/additional-information';
import { communicationPreferences } from './chapters/communication-preferences';
import { veteranInformation, veteranAddress } from './chapters/veteran';
import StaticInformationReviewField from '../containers/StaticInformationReviewField';

const formConfig = {
  urlPrefix: '/',
  submitUrl: '/v0/api',
  trackingPrefix: '28-1900-chapter-31-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  formId: '28-1900',
  version: 0,
  prefillEnabled: true,
  // TODO: Currently if a user is logged in, veteran information does NOT get sent to the backend with the payload. We can either add it in
  // transformForSubmit, OR add it once the payload reaches vets-api.
  savedFormMessages: {
    notFound:
      'Please start over to apply for Veteran Readiness and Employment.',
    noAuth:
      'Please sign in again to continue your application for Vocational Readiness and Employment.',
  },
  title: '28-1900 Vocational Readiness and Employment',
  defaultDefinitions: {},
  chapters: {
    veteranInformation: {
      title: 'Veteran Information',
      reviewDescription: StaticInformationReviewField,
      pages: {
        veteranStaticInformation: {
          depends: () => hasSession(),
          path: 'veteran-information-review',
          title: 'Veteran Information Review',
          hideHeaderRow: true,
          schema: {
            type: 'object',
            properties: {
              isLoggedIn: {
                type: 'boolean',
                default: false,
              },
            },
          },
          uiSchema: {
            'ui:description': VeteranInformationViewComponent,
            'ui:reviewField': StaticInformationReviewField,
            'ui:options': {
              hideOnReview: true,
            },
            isLoggedIn: {
              'ui:options': {
                hideOnReview: true,
                widgetClassNames: 'vads-u-display--none',
              },
            },
          },
        },
        veteranInformation: {
          depends: () => !hasSession(),
          path: 'veteran-information',
          title: 'Veteran Information',
          uiSchema: veteranInformation.uiSchema,
          schema: veteranInformation.schema,
        },
        contactInformation: {
          path: 'veteran-contact-information',
          title: 'Veteran Contact Information',
          uiSchema: veteranAddress.uiSchema,
          schema: veteranAddress.schema,
        },
      },
    },
    additionalInformation: {
      title: 'Additional Information',
      pages: {
        additionalInformation: {
          path: 'additional-information',
          title: 'Additional Information',
          uiSchema: additionalInformation.uiSchema,
          schema: additionalInformation.schema,
        },
      },
    },
    communicationPreferences: {
      title: 'Communication Preferences',
      pages: {
        communicationPreferences: {
          path: 'communication-preferences',
          title: 'VR&E Communication Preferences',
          uiSchema: communicationPreferences.uiSchema,
          schema: communicationPreferences.schema,
        },
      },
    },
  },
};

export default formConfig;
