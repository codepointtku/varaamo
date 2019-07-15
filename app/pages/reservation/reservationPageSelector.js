import { createSelector, createStructuredSelector } from 'reselect';
import first from 'lodash/first';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import queryString from 'query-string';

import ApiClient from '../../../src/common/api/client';
import AppConstants from '../../constants/AppConstants';
import ActionTypes from '../../constants/ActionTypes';
import {
  createIsStaffSelector,
  currentUserSelector,
  isAdminSelector,
} from '../../state/selectors/authSelectors';
import { createResourceSelector, unitsSelector } from '../../state/selectors/dataSelectors';
import dateSelector from '../../state/selectors/dateSelector';
import requestIsActiveSelectorFactory from '../../state/selectors/factories/requestIsActiveSelectorFactory';

const selectedSelector = state => orderBy(state.ui.reservations.selected, 'begin');
const createdSelector = (state) => {
  const toShow = orderBy(state.ui.reservations.toShow, 'begin');
  return !isEmpty(toShow) ? first(toShow) : null;
};
const editedSelector = (state) => {
  const toShowEdited = orderBy(state.ui.reservations.toShowEdited, 'begin');
  return !isEmpty(toShowEdited) ? first(toShowEdited) : null;
};
const toEditSelector = state => first(state.ui.reservations.toEdit);
const resourceIdSelector = (state, props) => {
  const query = props && props.location ? queryString.parse(props.location.search) : {};
  return query.resource;
};
const resourceSelector = createResourceSelector(resourceIdSelector);
const unitSelector = createSelector(
  resourceSelector,
  unitsSelector,
  (resource, units) => units[resource.unit] || {}
);
const apiClientSelector = (state) => {
  const authToken = get(state, 'auth.token');
  return new ApiClient(AppConstants.API_URL, authToken);
};

const reservationPageSelector = createStructuredSelector({
  apiClient: apiClientSelector,
  date: dateSelector,
  isAdmin: isAdminSelector,
  isStaff: createIsStaffSelector(resourceSelector),
  isFetchingResource: requestIsActiveSelectorFactory(ActionTypes.API.RESOURCE_GET_REQUEST),
  isMakingReservations: requestIsActiveSelectorFactory(ActionTypes.API.RESERVATION_POST_REQUEST),
  selected: selectedSelector,
  resourceId: resourceIdSelector,
  resource: resourceSelector,
  reservationToEdit: toEditSelector,
  reservationCreated: createdSelector,
  reservationEdited: editedSelector,
  unit: unitSelector,
  user: currentUserSelector,
});

export default reservationPageSelector;
