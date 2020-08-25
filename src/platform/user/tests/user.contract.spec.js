import { Matchers } from '@pact-foundation/pact';
import { expect } from 'chai';
import sinon from 'sinon';

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
                va_profile: {
                  status: 'OK',
                  birth_date: '19511118',
                  family_name: 'Hunter',
                  gender: 'M',
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
