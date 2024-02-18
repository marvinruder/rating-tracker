import { Autocomplete, TextField } from "@mui/material";
import {
  currencyArray,
  currencyName,
  currencyNameWithFlagAndCode,
  isCurrency,
  type Currency,
} from "@rating-tracker/commons";
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
      value={props.value}
      onChange={props.onChange}
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
        currencyNameWithFlagAndCode[props.value] === currencyInputValue.trim() && filteredOptions.unshift(props.value);
        return filteredOptions;
      }}
      disableClearable
      selectOnFocus
      renderInput={(params) => <TextField {...params} label="Currency" error={props.error} />}
    />
  );
};

interface CurrencyAutocompleteProps {
  /**
   * The value of the autocomplete.
   */
  value: Currency;
  /**
   * The change handler of the autocomplete.
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: Currency) => void;
  /**
   * Whether the input value is invalid.
   */
  error: boolean;
}

export default CurrencyAutocomplete;
