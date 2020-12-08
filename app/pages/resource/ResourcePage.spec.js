import React from 'react';
import Immutable from 'seamless-immutable';
import simple from 'simple-mock';
import Lightbox from 'lightbox-react';
import Panel from 'react-bootstrap/lib/Panel';

import NotFoundPage from 'pages/not-found/NotFoundPage';
import PageWrapper from 'pages/PageWrapper';
import ResourceCalendar from 'shared/resource-calendar';
import ResourceMap from 'shared/resource-map';
import Resource from 'utils/fixtures/Resource';
import Unit from 'utils/fixtures/Unit';
import { getResourcePageUrl } from 'utils/resourceUtils';
import { shallowWithIntl } from 'utils/testUtils';
import { UnconnectedResourcePage as ResourcePage } from './ResourcePage';
import ResourceHeader from './resource-header';
import ResourceInfo from './resource-info';
import ResourceMapInfo from './resource-map-info';

describe('pages/resource/ResourcePage', () => {
  const unit = Unit.build();
  const history = { replace: () => { }, goBack: () => { } };
  const resource = Resource.build({
    images: [
      {
        caption: 'caption 1',
        url: 'url 1',
        type: 'main',
      },
      {
        caption: 'caption 2',
        url: 'url 2',
        type: 'other',
      },
      {
        caption: 'caption 3',
        url: 'url 3',
        type: 'other',
      },
    ],
    unit: Unit.id,
    equipment: [
      {
        name: 'equipment 1'
      },
      {
        name: 'equipment 2'
      },
      {
        name: 'equipment 3'
      },
    ]
  });
  const defaultProps = {
    history,
    actions: {
      clearReservations: () => null,
      fetchResource: () => null,
      toggleResourceMap: () => null,
      fetchResourceOutlookCalendarLinks: () => null,
      createResourceOutlookCalendarLink: () => null,
      removeResourceOutlookCalendarLink: () => null,
    },
    date: '2015-10-10',
    id: resource.id,
    isFetchingResource: false,
    isLoggedIn: true,
    location: { search: 'date' },
    match: { params: {} },
    resource: Immutable(resource),
    showMap: false,
    unit: Immutable(unit),
    contrast: '',
    currentLanguage: 'fi',
  };

  function getWrapper(props) {
    return shallowWithIntl(<ResourcePage {...defaultProps} {...props} />);
  }

  describe('render', () => {
    test('renders PageWrapper with correct props', () => {
      const pageWrapper = getWrapper().find(PageWrapper);
      expect(pageWrapper).toHaveLength(1);
      expect(pageWrapper.prop('canonicalUrl')).toBe(window.location.origin + window.location.pathname);
      expect(pageWrapper.prop('title')).toBe(defaultProps.resource.name);
      expect(pageWrapper.prop('transparent')).toBe(true);
    });

    test('renders panel with correct props', () => {
      const panel = getWrapper().find(Panel);
      expect(panel).toHaveLength(1);
      expect(panel.prop('header')).toBe('ResourceInfo.reserveTitle');
    });

    test('renders panel.heading.title with correct props', () => {
      const header = getWrapper().find(Panel).find(Panel.Heading).find(Panel.Title);
      expect(header).toHaveLength(1);
      expect(header.prop('children')).toBe('ResourceCalendar.header');
      expect(header.prop('componentClass')).toBe('h2');
    });


    test('renders ResourceHeader with correct props', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      const resourceInfo = wrapper.find(ResourceHeader);
      expect(resourceInfo).toHaveLength(1);
      expect(resourceInfo.prop('onBackClick')).toBe(instance.handleBackButton);
      expect(resourceInfo.prop('onMapClick')).toEqual(defaultProps.actions.toggleResourceMap);
      expect(resourceInfo.prop('resource')).toEqual(defaultProps.resource);
      expect(resourceInfo.prop('showMap')).toEqual(defaultProps.showMap);
      expect(resourceInfo.prop('unit')).toEqual(defaultProps.unit);
      expect(resourceInfo.prop('contrast')).toEqual(defaultProps.contrast);
    });

    test('renders ResourceInfo with correct props', () => {
      const resourceInfo = getWrapper().find(ResourceInfo);
      const equipmentList = ['equipment 1', 'equipment 2', 'equipment 3'];
      expect(resourceInfo).toHaveLength(1);
      expect(resourceInfo.prop('resource')).toEqual(defaultProps.resource);
      expect(resourceInfo.prop('unit')).toEqual(defaultProps.unit);
      expect(resourceInfo.prop('equipment')).toEqual(equipmentList);
      expect(resourceInfo.prop('currentLanguage')).toBe(defaultProps.currentLanguage);
    });

    test('renders ResourceCalendar with correct props', () => {
      const wrapper = getWrapper();
      const calendar = wrapper.find(ResourceCalendar);
      expect(calendar).toHaveLength(1);
      expect(calendar.prop('onDateChange')).toBe(wrapper.instance().handleDateChange);
      expect(calendar.prop('resourceId')).toBe(defaultProps.resource.id);
      expect(calendar.prop('selectedDate')).toBe(defaultProps.date);
    });

    test('renders resource images with thumbnail urls', () => {
      const images = getWrapper().find('.app-ResourceInfo__image');
      // The first image is rendered twice
      expect(images).toHaveLength(defaultProps.resource.images.length + 1);

      images.forEach((image, index) => {
        const imageProps = defaultProps.resource.images[index > 0 ? index - 1 : 0];
        expect(image.props().alt).toBe(imageProps.caption);
        expect(image.props().src).toBe(`${imageProps.url}?dim=700x420`);
      });
    });

    test(
      'renders NotFoundPage when resource empty and not fetching resource',
      () => {
        const notFoundPage = getWrapper({
          isFetchingResource: false,
          resource: {},
        }).find(NotFoundPage);
        expect(notFoundPage).toHaveLength(1);
      }
    );

    describe('handleBackButton', () => {
      let historyMock;

      beforeAll(() => {
        const instance = getWrapper().instance();
        historyMock = simple.mock(history, 'goBack');
        instance.handleBackButton();
      });

      afterAll(() => {
        simple.restore();
      });

      test('calls history goBack', () => {
        expect(historyMock.callCount).toBe(1);
      });
    });

    describe('with showMap prop', () => {
      function getShowMapWrapper(props = {}) {
        return getWrapper({ ...props, showMap: true });
      }

      test('renders a ResourceMapInfo', () => {
        const wrapper = getShowMapWrapper();
        const resourceMapInfo = wrapper.find(ResourceMapInfo);
        expect(resourceMapInfo).toHaveLength(1);
        expect(resourceMapInfo.prop('unit')).toBe(defaultProps.unit);
        expect(resourceMapInfo.prop('currentLanguage')).toBe(defaultProps.currentLanguage);
      });

      test('renders a ResourceMap', () => {
        const wrapper = getShowMapWrapper();
        const resourceMap = wrapper.find(ResourceMap);
        expect(resourceMap).toHaveLength(1);
        expect(resourceMap.prop('location')).toBe(defaultProps.location);
        expect(resourceMap.prop('resourceIds')).toEqual([defaultProps.resource.id]);
        expect(resourceMap.prop('selectedUnitId')).toBe(defaultProps.unit.id);
        expect(resourceMap.prop('showMap')).toBe(true);
      });

      test('does not render a ResourceInfo', () => {
        const wrapper = getShowMapWrapper();
        const resourceInfo = wrapper.find(ResourceInfo);
        expect(resourceInfo).toHaveLength(0);
      });

      test('does not render a ResourceCalendar', () => {
        const wrapper = getShowMapWrapper();
        const resourceCalendar = wrapper.find(ResourceCalendar);
        expect(resourceCalendar).toHaveLength(0);
      });
    });
  });

  describe('componentDidMount', () => {
    test('calls clearReservations and fetchResource', () => {
      const clearReservations = simple.mock();
      const fetchResource = simple.mock();
      const instance = getWrapper({
        actions: { ...defaultProps.actions, clearReservations }
      }).instance();
      instance.fetchResource = fetchResource;
      instance.componentDidMount();

      expect(clearReservations.callCount).toBe(1);
      expect(clearReservations.lastCall.args).toEqual([]);
      expect(fetchResource.callCount).toBe(1);
      expect(fetchResource.lastCall.args).toEqual([]);
    });

    test('calls window.scrollTo', () => {
      const scrollToMock = simple.mock();
      simple.mock(window, 'scrollTo', scrollToMock);
      const instance = getWrapper().instance();
      instance.componentDidMount();

      expect(scrollToMock.callCount).toBe(1);
      const args = scrollToMock.lastCall.args;
      expect(args).toHaveLength(2);
      expect(args[0]).toBe(0);
      expect(args[1]).toBe(0);
    });
  });

  describe('componentWillUpdate', () => {
    describe('if date changed', () => {
      const nextProps = { date: '2016-12-12', isLoggedIn: defaultProps.isLoggedIn };
      const fetchResource = simple.mock();

      beforeAll(() => {
        const instance = getWrapper().instance();
        instance.fetchResource = fetchResource;
        instance.componentWillUpdate(nextProps);
      });

      test('fetches resource data with new date', () => {
        const actualArgs = fetchResource.lastCall.args;

        expect(fetchResource.callCount).toBe(1);
        expect(actualArgs[0]).toBe(nextProps.date);
      });
    });

    describe('if date did not change', () => {
      const nextProps = { date: defaultProps.date, isLoggedIn: defaultProps.isLoggedIn };
      const fetchResource = simple.mock();

      beforeAll(() => {
        const instance = getWrapper().instance();
        instance.fetchResource = fetchResource;
        instance.componentWillUpdate(nextProps);
      });

      test('does not fetch resource data', () => {
        expect(fetchResource.callCount).toBe(0);
      });
    });

    describe('if isLoggedIn changed', () => {
      const nextProps = { date: defaultProps.date, isLoggedIn: !defaultProps.isLoggedIn };
      const fetchResource = simple.mock();

      beforeAll(() => {
        const instance = getWrapper().instance();
        instance.fetchResource = fetchResource;
        instance.componentWillUpdate(nextProps);
      });

      test('fetches resource data correct date', () => {
        const actualArgs = fetchResource.lastCall.args;

        expect(fetchResource.callCount).toBe(1);
        expect(actualArgs[0]).toBe(nextProps.date);
      });
    });

    describe('if isLoggedIn did not change', () => {
      const nextProps = { date: defaultProps.date, isLoggedIn: defaultProps.isLoggedIn };
      const fetchResource = simple.mock();

      beforeAll(() => {
        const instance = getWrapper({ actions: { fetchResource } }).instance();
        instance.componentWillUpdate(nextProps);
      });

      test('does not fetch resource data', () => {
        expect(fetchResource.callCount).toBe(0);
      });
    });
  });

  describe('fetchResource', () => {
    test('fetches resource with correct arguments', () => {
      const fetchResource = simple.mock();
      const instance = getWrapper({ actions: { fetchResource } }).instance();
      instance.fetchResource();
      const actualArgs = fetchResource.lastCall.args;

      expect(fetchResource.callCount).toBe(1);
      expect(actualArgs[0]).toBe(defaultProps.id);
      expect(actualArgs[1].start).toContain('2015-08-01');
      expect(actualArgs[1].end).toContain('2015-12-31');
    });

    test('fetches resource with correct arguments with a passed date', () => {
      const fetchResource = simple.mock();
      const instance = getWrapper({ actions: { fetchResource } }).instance();
      instance.fetchResource('2015-11-11');
      const actualArgs = fetchResource.lastCall.args;

      expect(fetchResource.callCount).toBe(1);
      expect(actualArgs[0]).toBe(defaultProps.id);
      expect(actualArgs[1].start).toContain('2015-09-01');
      expect(actualArgs[1].end).toContain('2016-01-31');
    });
  });

  describe('disableDays', () => {
    describe('resource.reservableAfter is not defined', () => {
      const instance = getWrapper().instance();

      test('returns true when the day is before today', () => {
        const isDisabled = instance.disableDays('1990-03-06T00:00:00Z');
        expect(isDisabled).toBe(true);
      });

      test('returns false when the day is today', () => {
        const today = new Date();
        const isDisabled = instance.disableDays(today.toISOString());
        expect(isDisabled).toBe(false);
      });

      test('returns false when the day is after today', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);

        const tomorrow = date.toISOString();
        const isDisabled = instance.disableDays(tomorrow);

        expect(isDisabled).toBe(false);
      });
    });

    describe('resource.reservableAfter is defined', () => {
      const instance = getWrapper({ resource: { reservableAfter: '2019-03-09T00:00:00Z' } }).instance();

      test('returns true if the day is before reservableAfter', () => {
        const dayBefore = '2019-03-06T00:00:00Z';
        const isDisabled = instance.disableDays(dayBefore);
        expect(isDisabled).toBe(true);
      });

      test('returns false if the day is after reservableAfter', () => {
        const dayAfter = '2019-03-12T00:00:00Z';
        const isDisabled = instance.disableDays(dayAfter);
        expect(isDisabled).toBe(false);
      });
    });
  });

  describe('handleDateChange', () => {
    const newDate = new Date('2015-12-24');
    const instance = getWrapper().instance();
    let historyMock;

    beforeAll(() => {
      historyMock = simple.mock(history, 'replace');
      instance.handleDateChange(newDate);
    });

    afterAll(() => {
      simple.restore();
    });

    test('calls history.replace with correct path', () => {
      const actualPath = historyMock.lastCall.args[0];
      const expectedPath = getResourcePageUrl(resource, '2015-12-24');

      expect(historyMock.callCount).toBe(1);
      expect(actualPath).toBe(expectedPath);
    });
  });

  describe('Full sized image', () => {
    test('is opened when an image is clicked', () => {
      const wrapper = getWrapper();
      wrapper
        .find('.app-ResourceInfo__image-button')
        .first()
        .simulate('click');

      const lightbox = wrapper.find(Lightbox);
      expect(lightbox.length).toBe(1);
    });
  });
});
