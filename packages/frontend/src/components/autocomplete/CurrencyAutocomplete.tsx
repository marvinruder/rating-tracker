import { Autocomplete, TextField } from "@mui/material";
import type { Currency } from "@rating-tracker/commons";
import { currencyArray, currencyName, currencyNameWithFlagAndCode, isCurrency } from "@rating-tracker/commons";
import { useState } from "react";

/**
 * An autocomplete component for selecting a currency.
 * @param props The properties of the component.
 * @returns The component.
 */
const CurrencyAutocomplete = (props: CurrencyAutocompleteProps): JSX.Element => {
  // The value of the text field in the currency autocomplete.
  const [currencyInputValue, setCurrencyInputValue] = useState<string>("");

  return (
    <Autocomplete
      options={currencyArray}
      autoHighlight
      getOptionLabel={(option) => currencyNameWithFlagAndCode[option]}
      inputValue={currencyInputValue}
      onInputChange={(_, value) => setCurrencyInputValue(value)}
      multiple={false}
      value={props.value as Currency}
      onChange={props.onChange}
      onInvalid={props.onInvalid}
      filterOptions={(options) => {
        const currentInputValue = currencyInputValue.trim().toUpperCase();
        // Filter the currency names by the input value.
        const filteredOptions = options.filter(
          (option) => currencyName[option].toUpperCase().startsWith(currentInputValue) && option != currentInputValue,
        );
        // If the text input is a valid currency, we show it as the first option.
        isCurrency(currentInputValue) && filteredOptions.unshift(currentInputValue);
        // If the text input is identical to a complete option label (this happens when opening the dropdown for the
        // first time), we show it as the first option.
        currencyNameWithFlagAndCode[props.value!] === currencyInputValue.trim() &&
          filteredOptions.unshift(props.value!);
        return filteredOptions;
      }}
      disableClearable
      selectOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          label="Currency"
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
 * Properties for the CurrencyAutocomplete component.
 */
interface CurrencyAutocompleteProps {
  /**
   * The value of the autocomplete.
   */
  value: Currency | null;
  /**
   * The change handler of the autocomplete.
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: Currency) => void;
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

export default CurrencyAutocomplete;
