import { Matchers } from '@pact-foundation/pact';
import { expect } from 'chai';
import sinon from 'sinon';

import { VA_FORM_IDS } from 'platform/forms/constants';
import contractTest from 'platform/testing/contract';
import { refreshProfile } from 'platform/user/profile/actions';

const { like } = Matchers;

contractTest('User', 'VA.gov API', mockApi => {
  describe('GET /v0/user', () => {
    it('responds with 200', async () => {
      /* eslint-disable camelcase */
      await mockApi.addInteraction({
        state: 'user is authenticated',
        uponReceiving: 'a request for current user data',
        withRequest: {
          method: 'GET',
          path: '/v0/user',
        },
        willRespondWith: {
          status: 200,
          body: like({
            data: {
              attributes: {
                profile: {
                  sign_in: {
                    service_name: 'idme',
                  },
                  email: 'fake@fake.com',
                  loa: { current: 3 },
                  first_name: 'Jane',
                  middle_name: '',
                  last_name: 'Doe',
                  gender: 'F',
                  birth_date: '1985-01-01',
                  verified: true,
                },
                veteran_status: {
                  status: 'OK',
                  is_veteran: true,
                  served_in_military: true,
                },
                in_progress_forms: [
                  {
                    form: VA_FORM_IDS.FORM_10_10EZ,
                    metadata: {},
                  },
                ],
                prefills_available: [VA_FORM_IDS.FORM_21_526EZ],
                services: [
                  'facilities',
                  'hca',
                  'edu-benefits',
                  'evss-claims',
                  'form526',
                  'user-profile',
                  'health-records',
                  'rx',
                  'messaging',
                ],
                va_profile: {
                  status: 'OK',
                  birth_date: '19511118',
                  family_name: 'Hunter',
                  gender: 'M',
                  given_names: ['Julio', 'E'],
                  active_status: 'active',
                  facilities: [
                    {
                      facility_id: '983',
                      isCerner: false,
                    },
                    {
                      facility_id: '984',
                      isCerner: false,
                    },
                  ],
                },
              },
            },
            meta: { errors: null },
          }),
        },
      });
      /* eslint-enable camelcase */

      const dispatch = sinon.spy();
      await refreshProfile()(dispatch);

      const [action] = dispatch.firstCall.args;
      expect(action.type).to.eq('UPDATE_PROFILE_FIELDS');
    });
  });
});
