import {
  FETCH_BACKEND_STATUSES_FAILURE,
  FETCH_BACKEND_STATUSES_SUCCESS,
  LOADING_BACKEND_STATUSES,
} from './actions';

const INITIAL_STATE = {
  loading: false,
  statuses: null,
};

export default function externalServiceStatuses(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOADING_BACKEND_STATUSES:
      return { ...state, loading: true };
    // drive with external config with window
    case FETCH_BACKEND_STATUSES_FAILURE:
      return {
        ...state,
        loading: false,
        statuses: action.globalDowntimeActive
          ? [
              {
                service: 'Global',
                serviceId: 'global',
                status: 'maintenance',
              },
            ]
          : [],
      };

    case FETCH_BACKEND_STATUSES_SUCCESS: {
      const { statuses } = action.data.attributes;
      return { ...state, loading: false, statuses };
    }

    default:
      return state;
  }
}
