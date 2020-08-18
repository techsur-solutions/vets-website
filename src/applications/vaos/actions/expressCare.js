import moment from 'moment';
import recordEvent from 'platform/monitoring/record-event';

import {
  selectVet360EmailAddress,
  selectVet360HomePhoneString,
  selectVet360MobilePhoneString,
} from 'platform/user/selectors';
import newExpressCareRequestFlow from '../newExpressCareRequestFlow';
import {
  getPreferences,
  updatePreferences,
  getFacilitiesBySystemAndTypeOfCare,
  submitRequest,
  getRequestEligibilityCriteria,
  getParentFacilities,
  getRequestLimits,
} from '../api';

import {
  transformFormToExpressCareRequest,
  createPreferenceBody,
} from '../utils/data';
import {
  selectSystemIds,
  selectActiveExpressCareWindows,
  selectExpressCareNewRequest,
} from '../utils/selectors';
import { captureError } from '../utils/error';
import {
  EXPRESS_CARE,
  GA_PREFIX,
  EXPRESS_CARE_ERROR_REASON,
} from '../utils/constants';
import { resetDataLayer } from '../utils/events';
import {
  EXPRESS_CARE_FORM_SUBMIT_SUCCEEDED,
  STARTED_NEW_EXPRESS_CARE_FLOW,
} from './sitewide';

export const FORM_PAGE_OPENED = 'expressCare/FORM_PAGE_OPENED';
export const FORM_DATA_UPDATED = 'expressCare/FORM_DATA_UPDATED';
export const FORM_PAGE_CHANGE_STARTED = 'expressCare/FORM_PAGE_CHANGE_STARTED';
export const FORM_PAGE_CHANGE_COMPLETED =
  'expressCare/FORM_PAGE_CHANGE_COMPLETED';
export const FORM_FETCH_REQUEST_LIMITS =
  'expressCare/FORM_FETCH_REQUEST_LIMITS';
export const FORM_FETCH_REQUEST_LIMITS_FAILED =
  'expressCare/FORM_FETCH_REQUEST_LIMITS_FAILED';
export const FORM_FETCH_REQUEST_LIMITS_SUCCEEDED =
  'expressCare/FORM_FETCH_REQUEST_LIMITS_SUCCEEDED';
export const FORM_SET_FACILITY_ID = 'expressCare/FORM_SET_FACILITY_ID';
export const FORM_RESET = 'expressCare/FORM_RESET';
export const FORM_SUBMIT = 'expressCare/FORM_SUBMIT';
export const FORM_SUBMIT_SUCCEEDED = EXPRESS_CARE_FORM_SUBMIT_SUCCEEDED;
export const FORM_SUBMIT_FAILED = 'expressCare/FORM_SUBMIT_FAILED';
export const FETCH_EXPRESS_CARE_WINDOWS =
  'expressCare/FETCH_EXPRESS_CARE_WINDOWS';
export const FETCH_EXPRESS_CARE_WINDOWS_FAILED =
  'expressCare/FETCH_EXPRESS_CARE_WINDOWS_FAILED';
export const FETCH_EXPRESS_CARE_WINDOWS_SUCCEEDED =
  'expressCare/FETCH_EXPRESS_CARE_WINDOWS_SUCCEEDED';
export const FORM_ADDITIONAL_DETAILS_PAGE_OPENED =
  'expressCare/FORM_ADDITIONAL_DETAILS_PAGE_OPENED';

export function openFormPage(page, uiSchema, schema) {
  return {
    type: FORM_PAGE_OPENED,
    page,
    uiSchema,
    schema,
  };
}

export function updateFormData(page, uiSchema, data) {
  return {
    type: FORM_DATA_UPDATED,
    page,
    uiSchema,
    data,
  };
}

export function openAdditionalDetailsPage(page, uiSchema, schema) {
  return (dispatch, getState) => {
    const state = getState();
    const email = selectVet360EmailAddress(state);
    const homePhone = selectVet360HomePhoneString(state);
    const mobilePhone = selectVet360MobilePhoneString(state);
    const phoneNumber = mobilePhone || homePhone;
    dispatch({
      type: FORM_ADDITIONAL_DETAILS_PAGE_OPENED,
      page,
      uiSchema,
      schema,
      email,
      phoneNumber,
    });
  };
}

export function fetchExpressCareWindows() {
  return async (dispatch, getState) => {
    dispatch({
      type: FETCH_EXPRESS_CARE_WINDOWS,
    });

    const initialState = getState();
    const userSiteIds = selectSystemIds(initialState);

    try {
      const settings = await getRequestEligibilityCriteria(userSiteIds);
      dispatch({
        type: FETCH_EXPRESS_CARE_WINDOWS_SUCCEEDED,
        settings,
        nowUtc: moment.utc(),
      });
    } catch (error) {
      captureError(error);
      dispatch({
        type: FETCH_EXPRESS_CARE_WINDOWS_FAILED,
      });
    }
  };
}

/**
 * Fetches request limits for all active windows and selects the first one
 * where the user has not reached their request limit
 */
export function fetchRequestLimits() {
  return async (dispatch, getState) => {
    dispatch({
      type: FORM_FETCH_REQUEST_LIMITS,
    });

    try {
      const activeFacilityIds = selectActiveExpressCareWindows(
        getState(),
        moment(),
      ).map(win => win.facilityId);

      // Temporarily limit concurrent calls to 5 while we
      // wait for a new endpoint that will accept multiple facilityIds
      const requestLimits = await Promise.all(
        activeFacilityIds
          .slice(0, 5)
          .map(facilityId => getRequestLimits(facilityId, EXPRESS_CARE)),
      );

      const eligibleFacility = requestLimits.find(
        limit => limit.numberOfRequests < limit.requestLimit,
      );

      const isUnderRequestLimit = !!eligibleFacility;

      dispatch({
        type: FORM_FETCH_REQUEST_LIMITS_SUCCEEDED,
        facilityId: eligibleFacility?.id || null,
        siteId: eligibleFacility?.id?.substring(0, 3) || null,
        isUnderRequestLimit,
      });

      return isUnderRequestLimit;
    } catch (error) {
      captureError(error);
      dispatch({
        type: FORM_FETCH_REQUEST_LIMITS_FAILED,
      });
      return false;
    }
  };
}

export function routeToPageInFlow(flow, router, current, action) {
  return async (dispatch, getState) => {
    dispatch({
      type: FORM_PAGE_CHANGE_STARTED,
    });

    const nextAction = flow[current][action];
    let nextPage;

    if (typeof nextAction === 'string') {
      nextPage = flow[nextAction];
    } else {
      const nextStateKey = await nextAction(getState(), dispatch);
      nextPage = flow[nextStateKey];
    }

    if (nextPage?.url) {
      dispatch({
        type: FORM_PAGE_CHANGE_COMPLETED,
      });
      router.push(nextPage.url);
    } else if (nextPage) {
      throw new Error(`Tried to route to a page without a url: ${nextPage}`);
    } else {
      throw new Error('Tried to route to page that does not exist');
    }
  };
}

export function routeToNextAppointmentPage(router, current) {
  return routeToPageInFlow(newExpressCareRequestFlow, router, current, 'next');
}

export function routeToPreviousAppointmentPage(router, current) {
  return routeToPageInFlow(
    newExpressCareRequestFlow,
    router,
    current,
    'previous',
  );
}

async function buildPreferencesDataAndUpdate(email) {
  const preferenceData = await getPreferences();
  const preferenceBody = createPreferenceBody(preferenceData, email);
  return updatePreferences(preferenceBody);
}

async function getFacilityName(id) {
  const systemId = id.substring(0, 3);
  const parents = await getParentFacilities([systemId]);

  const matchingParent = parents.find(parent => parent.institutionCode === id);
  if (matchingParent) {
    return matchingParent.authoritativeName;
  }

  const facilityLists = await Promise.all(
    parents.map(parent =>
      getFacilitiesBySystemAndTypeOfCare(
        systemId,
        parent.institutionCode,
        EXPRESS_CARE,
      ),
    ),
  );

  return []
    .concat(...facilityLists)
    .find(facility => facility.institutionCode === id)?.authoritativeName;
}

export function submitExpressCareRequest(router) {
  return async (dispatch, getState) => {
    const newRequest = selectExpressCareNewRequest(getState());
    const { facilityId, siteId, data } = newRequest;
    let facilityWindowIsActive;
    let additionalEventData = {};

    try {
      dispatch({
        type: FORM_SUBMIT,
      });

      const activeWindows = selectActiveExpressCareWindows(
        getState(),
        moment(),
      );

      facilityWindowIsActive = !!activeWindows.find(
        window => window.facilityId === facilityId,
      );

      additionalEventData = {
        'health-expressCareReason': data.reason,
      };

      recordEvent({
        event: `${GA_PREFIX}-express-care-submission`,
        ...additionalEventData,
      });

      if (!facilityWindowIsActive) {
        throw new Error('No facilities available for Express Care request');
      }

      const facilityName = await getFacilityName(facilityId);

      const requestBody = transformFormToExpressCareRequest(getState(), {
        facilityId,
        siteId,
        name: facilityName,
      });
      const responseData = await submitRequest('va', requestBody);

      try {
        await buildPreferencesDataAndUpdate(data.contactInfo.email);
      } catch (error) {
        // These are ancillary updates, the request went through if the first submit
        // succeeded
        captureError(error, false, 'Express Care preferences error');
      }

      dispatch({
        type: FORM_SUBMIT_SUCCEEDED,
        responseData,
      });

      recordEvent({
        event: `${GA_PREFIX}-express-care-submission-successful`,
        ...additionalEventData,
      });
      resetDataLayer();
      router.push('/new-express-care-request/confirmation');
    } catch (error) {
      const errorReason = !facilityWindowIsActive
        ? EXPRESS_CARE_ERROR_REASON.noActiveFacility
        : EXPRESS_CARE_ERROR_REASON.error;
      captureError(error, true, 'Express Care submission failure', {
        errorReason,
      });
      dispatch({
        type: FORM_SUBMIT_FAILED,
        errorReason,
      });

      recordEvent({
        event: `${GA_PREFIX}-express-care-submission-failed`,
        ...additionalEventData,
      });
      resetDataLayer();
    }
  };
}

export function startNewExpressCareFlow() {
  return {
    type: STARTED_NEW_EXPRESS_CARE_FLOW,
  };
}
