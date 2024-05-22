import { Autocomplete, TextField } from "@mui/material";
import { countryArray, type Country, countryNameWithFlag, countryName, isCountry } from "@rating-tracker/commons";
import { useState } from "react";

/**
 * An autocomplete component for selecting a country.
 * @param props The properties of the component.
 * @returns The component.
 */
const CountryAutocomplete = (props: CountryAutocompleteProps): JSX.Element => {
  // The value of the text field in the country autocomplete.
  const [countryInputValue, setCountryInputValue] = useState<string>("");

  return (
    <Autocomplete
      options={countryArray}
      autoHighlight
      getOptionLabel={(option) => countryNameWithFlag[option]}
      inputValue={countryInputValue}
      onInputChange={(_, value) => setCountryInputValue(value)}
      multiple={false}
      value={props.value}
      onChange={props.onChange}
      onInvalid={props.onInvalid}
      filterOptions={(options) => {
        const currentInputValue = countryInputValue.trim().toUpperCase();
        // Filter the country names by the input value.
        const filteredOptions = options.filter(
          (option) => countryName[option].toUpperCase().startsWith(currentInputValue) && option != currentInputValue,
        );
        // If the text input is a valid country code, we show it as the first option.
        isCountry(currentInputValue) && filteredOptions.unshift(currentInputValue);
        // If the text input is identical to a complete option label (this happens when opening the dropdown for the
        // first time), we show it as the first option.
        countryNameWithFlag[props.value] === countryInputValue.trim() && filteredOptions.unshift(props.value);
        return filteredOptions;
      }}
      disableClearable
      selectOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          label="Country"
          error={props.error}
          helperText={props.helperText}
          inputRef={props.inputRef}
          required={props.required}
        />
      )}
    />
  );
};

/**
 * Properties for the CountryAutocomplete component.
 */
interface CountryAutocompleteProps {
  /**
   * The value of the autocomplete.
   */
  value: Country;
  /**
   * The change handler of the autocomplete.
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: Country) => void;
  /**
   * The invalid handler of the Autocomplete component.
   */
  onInvalid?: (event: React.SyntheticEvent<Element, Event>) => void;
  /**
   * Whether the input value is invalid.
   */
  error: boolean;
  /**
   * The helper text of the input element.
   */
  helperText: string;
  /**
   * The ref of the input element.
   */
  inputRef?: React.RefObject<HTMLInputElement>;
  /**
   * Whether the field is required.
   */
  required?: boolean;
}

export default CountryAutocomplete;
