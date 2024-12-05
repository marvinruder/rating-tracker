import type { ListItemProps } from "@mui/material";
import { Autocomplete, CircularProgress, InputAdornment, TextField } from "@mui/material";
import type { Stock, YahooStockStub } from "@rating-tracker/commons";
import { handleResponse, isCountry } from "@rating-tracker/commons";
import type { SyntheticEvent } from "react";
import React, { useEffect, useState } from "react";

import proxyClient from "../../api/proxy";
import { StockPreview } from "../stock/layouts/StockPreview";

/**
 * An autocomplete component for selecting a stock stub from the Yahoo Finance API.
 * @param props The properties of the component.
 * @returns The component.
 */
const YahooStockStubAutocomplete = (props: YahooStockStubAutocompleteProps): React.JSX.Element => {
  // The value of the text field in the autocomplete.
  const [queryInputValue, setQueryInputValue] = useState<string>("");
  const [stockStubs, setStockStubs] = useState<YahooStockStub[]>([]);
  const [stockStubsFinal, setStockStubsFinal] = useState<boolean>(true);

  const isLoading = !stockStubsFinal && !!queryInputValue;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only search if the search value is not empty and the search input did not change in the last 200ms.
      if (queryInputValue.trim()) getStockStubs(queryInputValue);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [queryInputValue]);

  /**
   * Handles the change of the query input.
   * @param event The change event.
   * @param value The new value of the query input.
   */
  const handleQueryInputChange = (event: SyntheticEvent<Element, Event>, value: string) => {
    if (event === null) return;
    setQueryInputValue(value);

    if (value.trim()) setStockStubsFinal(false);
    else setStockStubs([]);
  };

  /**
   * Handles side effects of having selected a stock stub.
   */
  const handleSelect = () => {
    setQueryInputValue("");
    setStockStubs([]);
  };

  /**
   * Fetches a list of stock stubs matching the query input from the Yahoo Finance API.
   * @param currentQueryInput The current query input.
   */
  const getStockStubs = (currentQueryInput: string) => {
    proxyClient.yahoofinance
      .$get({ query: { q: currentQueryInput.trim() } })
      .then(handleResponse)
      .then((res) => setStockStubs(res.data))
      .catch(() => setStockStubs([]))
      .finally(() => setStockStubsFinal(true));
  };

  return (
    <Autocomplete
      value={null}
      loading={isLoading}
      loadingText="Loading…"
      options={isLoading ? [] : stockStubs}
      getOptionKey={(option: YahooStockStub) => option.ticker}
      getOptionLabel={(option: YahooStockStub) => option.name}
      renderOption={(props: ListItemProps & { key: string }, option) => {
        const { key, ...listItemProps } = props;
        return <StockPreview key={key} {...listItemProps} stock={option} />;
      }}
      noOptionsText={queryInputValue ? "No stocks found." : "Type to see results…"}
      filterOptions={(options) => options}
      inputValue={queryInputValue}
      onInputChange={handleQueryInputChange}
      multiple={false}
      onChange={(event, value) => {
        if (!value) return;
        handleSelect();
        const stockStubWithISIN: YahooStockStub & { isin?: Stock["isin"] } = { ...value };
        if (
          queryInputValue.toUpperCase().match(/[A-Z]{2}[A-Z0-9]{10}/) &&
          isCountry(queryInputValue.substring(0, 2).toUpperCase())
        )
          stockStubWithISIN.isin = queryInputValue;
        props.onChange(event, stockStubWithISIN);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: isLoading ? (
                <InputAdornment position="end">
                  <CircularProgress color="inherit" size={16} aria-label="Loading results…" />
                </InputAdornment>
              ) : null,
            },
            htmlInput: { ...params.inputProps, inputMode: "search" },
          }}
          label="Search for a stock by name, ISIN or ticker symbol…"
        />
      )}
      autoHighlight
      blurOnSelect
    />
  );
};

/**
 * Properties for the YahooStockStubAutocomplete component.
 */
interface YahooStockStubAutocompleteProps {
  /**
   * The change handler of the autocomplete.
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, value: YahooStockStub & { isin?: Stock["isin"] }) => void;
}

export default YahooStockStubAutocomplete;
