import { expect } from 'chai';

import contractTest from 'platform/testing/contract';

import { fetchFormsApi } from '../../api';
import INTERACTIONS from './interactions';

contractTest('Find Forms', 'VA.gov API', mockApi => {
  describe('GET /forms', () => {
    context('when there is one valid form', () => {
      it('responds with a valid form', () => {
        mockApi.addInteraction(INTERACTIONS.oneValidForm);
        expect(fetchFormsApi()).to.eventually.have.lengthOf(1);
      });
    });
  });
});
