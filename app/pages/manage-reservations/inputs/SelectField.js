import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import Select from 'react-select';

import injectT from '../../../i18n/injectT';

export const getOption = (value, options) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(item => options.find(option => option.value === item));
  }

  return options.find(option => option.value === value);
};

function SelectField({
  t,
  id,
  label,
  isClearable,
  isMulti,
  isSearchable,
  onChange,
  placeholder = t('common.select'),
  options,
  value,
}) {
  return (
    <div className="app-SelectField">
      <FormGroup controlId={id}>
        {label && <ControlLabel>{label}</ControlLabel>}
        <Select
          className="app-Select"
          classNamePrefix="app-Select"
          inputId={id}
          isClearable={isClearable}
          isMulti={isMulti}
          isSearchable={isSearchable}
          noOptionsMessage={() => t('SelectControl.noOptions')}
          onChange={(selected, { action }) => {
            if (action === 'clear') {
              onChange(isMulti ? [] : {}, action);
              return;
            }

            onChange(selected, action);
          }}
          options={options}
          placeholder={placeholder}
          value={getOption(value, options)}
        />
      </FormGroup>
    </div>
  );
}

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  isClearable: PropTypes.bool,
  isSearchable: PropTypes.bool,
  isMulti: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.number,
  ]),
};

export default injectT(SelectField);
