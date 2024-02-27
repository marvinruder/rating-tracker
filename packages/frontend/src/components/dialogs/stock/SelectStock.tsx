import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  TextField,
  Typography,
  DialogContent,
  DialogTitle,
  Skeleton,
  ListItemText,
  Tooltip,
} from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { stocksEndpointPath } from "@rating-tracker/commons";
import type { ChangeEvent } from "react";
import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";
import { pluralize } from "../../../utils/formatters";
import { StockPreview } from "../../stock/layouts/StockPreview";

/**
 * A search area fetching stocks from the backend based on the user’s input, from which one can be selected.
 * @param props The properties of the component.
 * @returns The component.
 */
const SelectStock = (props: SelectStockProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [count, setCount] = useState<number>(0);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [didFocus, setDidFocus] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Navigates to the first stock in the search results when the ↩︎ key is pressed.
     * @param e The keyboard event.
     */
    const enterKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (stocks.length) {
          if (props.validate && !props.validate()) return;
          handleSelect();
          props.onSelect ? props.onSelect(stocks[0]) : navigate(`${stocksEndpointPath}/${stocks[0].ticker}`);
        }
      }
    };

    window.addEventListener("keydown", enterKeyHandler);

    return () => {
      window.removeEventListener("keydown", enterKeyHandler);
    };
  }, [stocks, props.validate]);

  /**
   * Handles the change of the search input.
   * @param event The change event.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);

    if (event.target.value) {
      setStocksFinal(false);
    } else {
      setStocks([]);
      setCount(0);
    }
  };

  /**
   * Handles side effects of having selected a stock.
   */
  const handleSelect = () => {
    setSearchValue("");
    setStocks([]);
    setCount(0);
    // const activeElement = document.activeElement;
    // if (activeElement instanceof HTMLElement) {
    //   activeElement.blur();
    // }
    props.onClose();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only search if the search value is not empty and the search input did not change in the last 200ms.
      if (searchValue) getStocks(searchValue);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  /**
   * Fetches a list of stocks matching the search value.
   * @param currentSearchValue The current search value.
   */
  const getStocks = (currentSearchValue: string) => {
    api
      .get(stocksEndpointPath, { params: { name: currentSearchValue.trim(), sortBy: "ticker" } })
      .then((res) => {
        const upperCaseSearchValue = currentSearchValue.toLocaleUpperCase();
        setStocks(
          res.data.stocks
            .sort(
              // Sort stocks to the top if their ticker starts with the search value (case-insensitive)
              (a: Stock, b: Stock) =>
                +b.ticker.toLocaleUpperCase().startsWith(upperCaseSearchValue) -
                +a.ticker.toLocaleUpperCase().startsWith(upperCaseSearchValue),
            )
            .slice(0, 10), // Only display the first 10 results
        );
        setCount(res.data.count);
      })
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching stocks");
        setStocks([]);
        setCount(0);
      })
      .finally(() => setStocksFinal(true));
  };

  return (
    <>
      <DialogTitle sx={props.disablePadding ? { px: 0, pt: 0 } : {}} component="div">
        <Typography variant="h4" pb={2.5}>
          {props.title}
        </Typography>
        <TextField
          value={searchValue}
          inputRef={(input) => {
            if (input !== null && !didFocus) {
              input.focus();
              setDidFocus(true);
            }
          }}
          onChange={handleSearchChange}
          inputProps={{ inputMode: "search", autoCapitalize: "characters" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Enter a stock name or symbol…"
          fullWidth
          label="Search"
        />
      </DialogTitle>
      {searchValue && (
        <>
          <Divider />
          <DialogContent sx={props.disablePadding ? { px: 0, pb: 0 } : {}}>
            <Box sx={{ pt: 0, pb: 1 }} display="flex" justifyContent="space-between">
              <Typography variant="body2" component="span">
                {stocksFinal ? (
                  <>
                    <Typography sx={{ fontWeight: "bold" }} variant="body1" component="span">
                      {count}
                    </Typography>{" "}
                    search result{pluralize(count)}
                  </>
                ) : (
                  "Searching"
                )}{" "}
                for{" "}
                <Typography sx={{ fontWeight: "bold" }} variant="body1" component="span">
                  {searchValue}
                </Typography>
                {!stocksFinal && "…"}
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {stocksFinal
                ? stocks.map((stock) => {
                    const disabled = props.disabledStocks?.some(
                      (disabledStock) => disabledStock.ticker === stock.ticker,
                    );
                    return (
                      <Fragment key={stock.ticker}>
                        {disabled ? (
                          <Tooltip
                            key={stock.ticker}
                            title={props.stockDisabledReason}
                            slotProps={{ popper: { modifiers: [{ name: "offset", options: { offset: [0, -24] } }] } }}
                            arrow
                          >
                            <Box sx={{ opacity: 0.5 }}>
                              <StockPreview stock={stock} />
                            </Box>
                          </Tooltip>
                        ) : (
                          <StockPreview
                            stock={stock}
                            {...(props.onSelect
                              ? {
                                  onClick: () => {
                                    if (props.validate && !props.validate()) return;
                                    handleSelect();
                                    props.onSelect(stock);
                                  },
                                }
                              : { onClick: handleSelect, navLink: true })}
                          />
                        )}
                        <Divider component="li" />
                      </Fragment>
                    );
                  })
                : [...Array(count || 3)].map((_, index) => (
                    <Fragment key={index}>
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Skeleton width="100%" sx={{ maxWidth: 160 }} />}
                          secondary={<Skeleton width="48px" />}
                        />
                        <Skeleton variant="rectangular" width={24} height={24} sx={{ ml: 1 }} />
                        <Skeleton variant="rectangular" width={24} height={24} sx={{ ml: 1 }} />
                      </ListItem>
                      <Divider component="li" />
                    </Fragment>
                  ))}
            </List>
            {stocksFinal && count > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Only the first 10 results are shown. Refine your search parameter to show additional results.
              </Typography>
            )}
          </DialogContent>
        </>
      )}
    </>
  );
};

interface SelectStockProps {
  /**
   * A title for the dialog, shown above the search input field.
   */
  title: string;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A custom method that is called when a stock is selected. If none is provided, the stock’s page will be navigated
   * to.
   */
  onSelect?: (stock: Stock) => void;
  /**
   * A method to validate input fields before calling the `onSelect` method.
   * @returns Whether the input fields are valid.
   */
  validate?: () => boolean;
  /**
   * A list of stocks that cannot be selected.
   */
  disabledStocks?: Pick<Stock, "ticker">[];
  /**
   * An explanatory message that is shown when a stock is disabled.
   */
  stockDisabledReason?: string;
  /**
   * If `true`, vertical padding is removed from the component.
   */
  disablePadding?: boolean;
}

export default SelectStock;
