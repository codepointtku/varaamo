import { shallow } from 'enzyme';
import React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import RBFormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';

import InfoPopover from 'shared/info-popover';
import FormControl from './FormControl';

describe('shared/form-fields/FormControl', () => {
  const defaultProps = {
    controlProps: { someProp: 'some', otherProp: 'other' },
    fieldName: 'email',
    id: 'email',
    label: 'Enter your email',
    labelErrorPrefix: 'Error: ',
    type: 'text',
    validationState: 'error',
  };

  function getWrapper(props) {
    return shallow(<FormControl {...defaultProps} {...props} />);
  }

  describe('FormGroup component', () => {
    test('is rendered', () => {
      const formGroup = getWrapper().find(FormGroup);
      expect(formGroup.length).toBe(1);
    });

    test('gets correct props', () => {
      const actualProps = getWrapper().find(FormGroup).props();
      expect(actualProps.controlId).toBe(defaultProps.id);
      expect(actualProps.validationState).toBe(defaultProps.validationState);
    });
  });

  describe('Col components', () => {
    test('renders 2 Col components', () => {
      const cols = getWrapper().find(Col);
      expect(cols.length).toBe(2);
    });

    describe('the first Col', () => {
      function getColWrapper(props) {
        return getWrapper(props).find(Col).at(0);
      }

      test('gets correct props', () => {
        expect(getColWrapper().props().componentClass).toBe(ControlLabel);
        expect(getColWrapper().props().sm).toBe(3);
      });

      test('contains the label text given in props', () => {
        expect(
          getColWrapper().props().children
        ).toEqual(expect.arrayContaining([defaultProps.label]));
      });

      describe('labelErrorPrefix text', () => {
        test('is included in label text when field has an error', () => {
          expect(
            getColWrapper().props().children
          ).toEqual(expect.arrayContaining([defaultProps.labelErrorPrefix]));
        });

        test('is not included in label text when field doesnt have an error', () => {
          expect(
            getColWrapper({ validationState: undefined }).props().children
          ).toEqual(expect.not.arrayContaining([defaultProps.labelErrorPrefix]));
        });
      });

      test('does not contain InfoPopover if info not given', () => {
        const popover = getColWrapper().find(InfoPopover);
        expect(popover).toHaveLength(0);
      });

      test('contains InfoPopover if info is given', () => {
        const info = 'Some info';
        const popover = getColWrapper({ info }).find(InfoPopover);
        expect(popover).toHaveLength(1);
        expect(popover.prop('text')).toBe(info);
      });
    });

    describe('the second Col', () => {
      let col;

      beforeAll(() => {
        col = getWrapper().find(Col).at(1);
      });

      test('gets correct props', () => {
        expect(col.props().sm).toBe(9);
      });

      test('contains React Bootstrap FormControl', () => {
        const rbFormControl = col.find(RBFormControl);
        expect(rbFormControl.length).toBe(1);
      });
    });
  });

  describe('React Bootstrap FormControl component', () => {
    test('is rendered', () => {
      const rbFormControl = getWrapper().find(RBFormControl);
      expect(rbFormControl.length).toBe(1);
      expect(rbFormControl.prop('name')).toEqual(defaultProps.fieldName);
    });

    describe('when input error has occurred', () => {
      test('gets correct aria props', () => {
        const rbFormControl = getWrapper({ validationState: 'error' }).find(RBFormControl);
        expect(rbFormControl.length).toBe(1);
        expect(rbFormControl.prop('aria-invalid')).toBe('true');
        expect(rbFormControl.prop('aria-describedby')).toEqual(`${defaultProps.id}-help-block`);
      });
    });

    describe('when input error has not occurred', () => {
      test('gets correct aria props', () => {
        const rbFormControl = getWrapper({ validationState: undefined }).find(RBFormControl);
        expect(rbFormControl.length).toBe(1);
        expect(rbFormControl.prop('aria-invalid')).toBe('false');
        expect(rbFormControl.prop('aria-describedby')).toEqual(`${defaultProps.id}-help-block`);
      });
    });

    describe('when type of the control is "textarea"', () => {
      test('gets correct props', () => {
        const type = 'textarea';
        const actualProps = getWrapper({ type }).find(RBFormControl).props();
        Object.keys(defaultProps.controlProps).forEach((key) => {
          expect(actualProps[key]).toBe(defaultProps.controlProps[key]);
        });
        expect(actualProps.componentClass).toBe('textarea');
        expect(actualProps.type).toBeUndefined();
      });
    });

    describe('when type of the control is anything but "textarea"', () => {
      test('gets correct props', () => {
        const type = 'text';
        const actualProps = getWrapper({ type }).find(RBFormControl).props();
        Object.keys(defaultProps.controlProps).forEach((key) => {
          expect(actualProps[key]).toBe(defaultProps.controlProps[key]);
        });
        expect(actualProps.type).toBe(type);
      });
    });
  });

  describe('HelpBlock component', () => {
    const help = 'some help';

    test('is rendered', () => {
      const helpBlock = getWrapper({ help }).find(HelpBlock);
      expect(helpBlock.length).toBe(1);
      expect(helpBlock.prop('id')).toEqual(`${defaultProps.id}-help-block`);
    });

    test('displays the help text given in props', () => {
      const helpBlock = getWrapper({ help }).find(HelpBlock);
      expect(helpBlock.props().children).toBe(help);
    });
  });
});
