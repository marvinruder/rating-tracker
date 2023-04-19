import React, { forwardRef, Ref, useState, ReactElement, ChangeEvent, useEffect } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Skeleton,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { TransitionProps } from "@mui/material/transitions";
import SearchIcon from "@mui/icons-material/Search";

import axios from "axios";
import { baseUrl } from "../../../../../router";
import { emojiFlag, Stock, stockListEndpointPath, stockLogoEndpointPath } from "rating-tracker-commons";
import { useNotification } from "../../../../../contexts/NotificationContext";
import SectorIcon from "../../../../../components/SectorIcon/";
import { NavLink, useNavigate } from "react-router-dom";

/**
 * A transition for sliding in the search bar.
 */
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * A wrapper for the search dialog.
 */
const DialogWrapper = styled(Dialog)(
  () => `
    .MuiDialog-container {
        height: auto;
    }
    
    .MuiDialog-paperScrollPaper {
        max-height: calc(100vh - 64px)
    }
`
);

/**
 * A wrapper for the search dialog’s title.
 */
const DialogTitleWrapper = styled(DialogTitle)(
  ({ theme }) => `
    background: ${theme.colors.alpha.black[5]};
    padding: ${theme.spacing(3)}
`
);

/**
 * A search bar that can be activated from a button in the header.
 *
 * @returns {JSX.Element} The component.
 */
const HeaderSearch = (): JSX.Element => {
  const [searchValue, setSearchValue] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [count, setCount] = useState<number>(0);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);

  const { setNotification } = useNotification();
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Checks whether the search shortcut ⌘F or ⌃F was pressed.
     *
     * @param {KeyboardEvent} e The keyboard event.
     * @returns {boolean} Whether the search shortcut was pressed.
     */
    const isSearchShortcut = (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F");

    /**
     * Opens the search bar when the search shortcut is pressed.
     *
     * @param {KeyboardEvent} e The keyboard event.
     */
    const searchShortcutHandler = (e: KeyboardEvent) => {
      if (isSearchShortcut(e)) {
        setOpen(true);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    /**
     * Navigates to the first stock in the search results when the ↩︎ key is pressed.
     *
     * @param {KeyboardEvent} e The keyboard event.
     */
    const enterKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (stocks.length) {
          handleClose();
          navigate(`/stock/${stocks[0].ticker}`);
        }
      }
    };

    /**
     * Closes the search bar when the ⎋ key is pressed.
     *
     * @param {KeyboardEvent} e The keyboard event.
     */
    const escapeKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", escapeKeyHandler, true);
    window.addEventListener("keydown", searchShortcutHandler);
    window.addEventListener("keydown", enterKeyHandler);

    return () => {
      window.removeEventListener("keydown", escapeKeyHandler);
      window.removeEventListener("keydown", searchShortcutHandler);
      window.removeEventListener("keydown", enterKeyHandler);
    };
  }, [stocks]);

  /**
   * Handles the change of the search input.
   *
   * @param {ChangeEvent<HTMLInputElement>} event The change event.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);

    if (event.target.value) {
      setStocksFinal(false);
    } else {
      setStocks([]);
      setCount(0);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchValue) {
        // Only search if the search value is not empty and the search input did not change in the last 200ms.
        getStocks(searchValue);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const [open, setOpen] = useState(false);

  /**
   * Handles a click on the search bar button in the header, which opens the search bar.
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Handles a click on the close button in the search dialog.
   */
  const handleClose = () => {
    setSearchValue("");
    setStocks([]);
    setCount(0);
    setOpen(false);
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  };

  /**
   * Fetches a list of stocks matching the search value.
   *
   * @param {string} currentSearchValue The current search value.
   */
  const getStocks = (currentSearchValue: string) => {
    axios
      .get(baseUrl + stockListEndpointPath, {
        params: {
          name: currentSearchValue,
          sortBy: "ticker",
        },
      })
      .then((res) => {
        const upperCaseSearchValue = currentSearchValue.toLocaleUpperCase();
        setStocks(
          res.data.stocks
            .sort(
              // Sort stocks to the top if their ticker starts with the search value (case-insensitive)
              (a: Stock, b: Stock) =>
                +b.ticker.toLocaleUpperCase().startsWith(upperCaseSearchValue) -
                +a.ticker.toLocaleUpperCase().startsWith(upperCaseSearchValue)
            )
            .slice(0, 10) // Only use the first 10 results
        );
        setCount(res.data.count);
      })
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching stock information",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
        setStocks([]);
        setCount(0);
      })
      .finally(() => setStocksFinal(true));
  };

  return (
    <>
      <Tooltip arrow title="Search">
        <IconButton color="primary" onClick={handleClickOpen}>
          <SearchIcon />
        </IconButton>
      </Tooltip>

      <DialogWrapper
        open={open}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="xs"
        fullWidth
        scroll="paper"
        onClose={handleClose}
      >
        <DialogTitleWrapper>
          <TextField
            value={searchValue}
            inputRef={(input) => {
              if (input !== null && open) {
                input.focus();
              }
            }}
            disabled={!open}
            onChange={handleSearchChange}
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
        </DialogTitleWrapper>
        <Divider />
        {searchValue && (
          <DialogContent sx={{ maxHeight: "calc(100vh - 240px)" }}>
            <Box sx={{ pt: 0, pb: 1 }} display="flex" justifyContent="space-between">
              <Typography variant="body2" component="span">
                {stocksFinal ? (
                  <>
                    <Typography sx={{ fontWeight: "bold" }} variant="body1" component="span">
                      {count}
                    </Typography>{" "}
                    search results
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
                ? stocks.map((stock) => (
                    <React.Fragment key={stock.ticker}>
                      <ListItem
                        component={NavLink}
                        to={`/stock/${stock.ticker}`}
                        onClick={handleClose}
                        sx={{
                          py: 1.5,
                          color: "inherit",
                          "&:hover": {
                            background: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              m: "-20px",
                              background: "none",
                            }}
                            src={
                              baseUrl + stockLogoEndpointPath + `/${stock.ticker}?dark=${theme.palette.mode === "dark"}`
                            }
                            alt=" "
                          />
                        </ListItemAvatar>
                        <Box flex="1" sx={{ width: "calc(100% - 193px)" }}>
                          <Typography variant="h5">{stock.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stock.ticker}
                          </Typography>
                        </Box>
                        <Typography sx={{ ml: 1 }} fontSize={18}>
                          {emojiFlag(stock.country)}
                        </Typography>
                        <Box width={24} height={24} ml={1}>
                          <SectorIcon industry={stock.industry} length={24} type="Sector" />
                        </Box>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                : [...Array(count || 1)].map((_, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <Box flex="1" sx={{ width: "calc(100% - 193px)" }}>
                          <Skeleton variant="text" width="100%" />
                          <Skeleton variant="text" width={40} />
                        </Box>
                        <Skeleton variant="rectangular" width={24} height={24} sx={{ ml: 1 }} />
                        <Skeleton variant="rectangular" width={24} height={24} sx={{ ml: 1 }} />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
            </List>
            {stocksFinal && count > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Only the first 10 results are shown. Refine your search parameter to show additional results.
              </Typography>
            )}
          </DialogContent>
        )}
      </DialogWrapper>
    </>
  );
};

export default HeaderSearch;
