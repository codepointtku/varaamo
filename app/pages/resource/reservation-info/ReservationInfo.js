import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import iconUser from 'hel-icons/dist/shapes/user-o.svg';

import iconCalendar from 'assets/icons/calendar.svg';
import iconClock from 'assets/icons/clock-o.svg';
import WrappedText from 'shared/wrapped-text';
import { getMaxPeriodText } from 'utils/resourceUtils';
import { injectT } from 'i18n';
import userManager from 'utils/userManager';

async function handleLoginClick(currentLanguage, addNotification) {
  try {
    await userManager.signinRedirect({
      data: {
        redirectUrl: window.location.pathname
      },
      extraQueryParams: {
        ui_locales: currentLanguage
      },
    });
  } catch (error) {
    addNotification({
      messageId: 'Notifications.loginErrorMessage',
      type: 'error',
      timeOut: 10000,
    });
  }
}

function renderLoginText(
  addNotification, currentLanguage, isLoggedIn, isStrongAuthSatisfied, resource, t
) {
  // login text should never be shown when resource is not reservable
  if (!resource.reservable) {
    return null;
  }
  // login text should be shown if strong auth requirement is not met
  if (isStrongAuthSatisfied) {
    if (isLoggedIn || resource.authentication === 'unauthenticated') {
      return null;
    }
  }

  // fetch login text and split it with given separator
  const message = isStrongAuthSatisfied ? t('ReservationInfo.loginMessage') : t('ReservationInfo.loginMessageStrongAuth');
  const messageParts = message.split('<a>');

  // if message has three parts e.g. "start of message <a>link text<a> end of message"
  if (messageParts.length === 3) {
    return (
      <p className="login-text">
        {messageParts[0]}
        <Button bsStyle="link" className="login-button" onClick={() => handleLoginClick(currentLanguage, addNotification)}>{messageParts[1]}</Button>
        {messageParts[2]}
      </p>
    );
  }
  // else create a button of the whole message
  return (
    <p className="login-text">
      <Button bsStyle="link" className="login-button" onClick={() => handleLoginClick(addNotification)}>{message}</Button>
    </p>
  );
}

/**
 * Converts given daysInAdvance number into a text element with an icon.
 * @param {number} daysInAdvance
 * @param {function} t
 */
function renderEarliestResDay(daysInAdvance, t) {
  if (!daysInAdvance) {
    return null;
  }

  // create a date (today + daysInAdvace) and use it to create written "days in advance" text.
  const date = moment().add(daysInAdvance, 'days');

  return (
    <p className="reservable-after-text">
      <img alt="" className="app-ResourceHeader__info-icon" src={iconCalendar} />
      <strong>{t('ReservationInfo.reservationEarliestDays', { time: moment(date).toNow(true) })}</strong>
    </p>
  );
}

function renderMaxPeriodText(resource, t) {
  if (!resource.maxPeriod) {
    return null;
  }
  const maxPeriodText = getMaxPeriodText(t, resource);
  return (
    <p className="max-length-text">
      <img alt="" className="app-ResourceHeader__info-icon" src={iconClock} />
      <strong>{t('ReservationInfo.reservationMaxLength')}</strong>
      {` ${maxPeriodText}`}
    </p>
  );
}

function renderMaxReservationsPerUserText(maxReservationsPerUser, t) {
  if (!maxReservationsPerUser) {
    return null;
  }
  return (
    <p className="max-number-of-reservations-text">
      <img alt="" className="app-ResourceHeader__info-icon" src={iconUser} />
      <strong>{t('ReservationInfo.maxNumberOfReservations')}</strong>
      {` ${maxReservationsPerUser}`}
    </p>
  );
}

function ReservationInfo({
  addNotification, currentLanguage, isLoggedIn, isStrongAuthSatisfied, resource, t
}) {
  return (
    <div className="app-ReservationInfo">
      <WrappedText allowNamedLinks openLinksInNewTab text={resource.reservationInfo} />
      {renderEarliestResDay(resource.reservableMinDaysInAdvance, t)}
      {renderMaxPeriodText(resource, t)}
      {renderMaxReservationsPerUserText(resource.maxReservationsPerUser, t)}
      {renderLoginText(
        addNotification, currentLanguage, isLoggedIn, isStrongAuthSatisfied, resource, t
      )}
    </div>
  );
}

ReservationInfo.propTypes = {
  addNotification: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isStrongAuthSatisfied: PropTypes.bool.isRequired,
  resource: PropTypes.shape({
    maxPeriod: PropTypes.string,
    maxReservationsPerUser: PropTypes.number,
    reservable: PropTypes.bool,
    reservationInfo: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default injectT(ReservationInfo);
