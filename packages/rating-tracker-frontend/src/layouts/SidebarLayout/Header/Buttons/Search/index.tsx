/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  forwardRef,
  Ref,
  useState,
  ReactElement,
  ChangeEvent,
  useEffect,
} from "react";
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
import {
  baseUrl,
  logoEndpoint,
  stockAPI,
  stockListEndpoint,
} from "../../../../../endpoints";
import { emojiFlag, Stock } from "rating-tracker-commons";
import useNotification from "../../../../../helpers/useNotification";
import SectorIcon from "../../../../../components/SectorIcon/";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

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

const DialogTitleWrapper = styled(DialogTitle)(
  ({ theme }) => `
    background: ${theme.colors.alpha.black[5]};
    padding: ${theme.spacing(3)}
`
);

const HoverListItem = styled(ListItem)(
  ({ theme }) => `
  &.MuiListItem-root {
    padding-top: 13.5px;
    padding-bottom: 13.5px;
  }

  &.MuiListItem-root:hover {
    background-color: ${theme.colors.alpha.black[5]};
  }
    `
);

const HeaderSearch = () => {
  const [searchValue, setSearchValue] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [count, setCount] = useState<number>(0);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);

  const { setNotification } = useNotification();
  const theme = useTheme();

  useEffect(() => {
    const isSearchShortcut = (e: KeyboardEvent) =>
      (e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F");

    const searchShortcutHandler = (e: KeyboardEvent) => {
      if (isSearchShortcut(e)) {
        setOpen(true);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", searchShortcutHandler);

    return () => {
      window.removeEventListener("keydown", searchShortcutHandler);
    };
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);

    if (event.target.value) {
      getStocks(event.target.value);
    } else {
      setStocks([]);
      setCount(0);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setSearchValue("");
    setStocks([]);
    setCount(0);
    setOpen(false);
  };

  const getStocks = (currentSearchValue: string) => {
    setStocksFinal(false);
    axios
      .get(baseUrl + stockAPI + stockListEndpoint, {
        params: {
          sortBy: "name",
          name: currentSearchValue,
        },
      })
      .then((res) => {
        setStocks(res.data.stocks.map((stock: any) => new Stock(stock)));
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
        {(searchValue || count > 0) && (
          <DialogContent sx={{ maxHeight: "calc(100vh - 240px)" }}>
            {searchValue && (
              <>
                <Box
                  sx={{ pt: 0, pb: 1 }}
                  display="flex"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" component="span">
                    {stocksFinal ? (
                      <>
                        <Typography
                          sx={{ fontWeight: "bold" }}
                          variant="body1"
                          component="span"
                        >
                          {count}
                        </Typography>{" "}
                        search results
                      </>
                    ) : (
                      "Searching"
                    )}{" "}
                    for{" "}
                    <Typography
                      sx={{ fontWeight: "bold" }}
                      variant="body1"
                      component="span"
                    >
                      {searchValue}
                    </Typography>
                    {!stocksFinal && "…"}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}
            {/* TODO: Make this a skeleton */}
            <List disablePadding>
              {stocksFinal
                ? stocks.map((stock) => (
                    <React.Fragment key={stock.ticker}>
                      <HoverListItem
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          handleClose();
                          window.open(`/#/stock/${stock.ticker}`, "_self");
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
                              baseUrl +
                              stockAPI +
                              logoEndpoint +
                              `/${stock.ticker}?dark=${
                                theme.palette.mode === "dark"
                              }`
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
                          <SectorIcon
                            industry={stock.industry}
                            length={24}
                            type={"Sector"}
                          />
                        </Box>
                      </HoverListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                : [...Array(count || 1)].map((_, index) => (
                    <React.Fragment key={index}>
                      <HoverListItem>
                        <ListItemAvatar>
                          <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <Box flex="1" sx={{ width: "calc(100% - 193px)" }}>
                          <Skeleton variant="text" width="100%" />
                          <Skeleton variant="text" width={40} />
                        </Box>
                        <Skeleton
                          variant="rectangular"
                          width={24}
                          height={24}
                          sx={{ ml: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={24}
                          height={24}
                          sx={{ ml: 1 }}
                        />
                      </HoverListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
            </List>
          </DialogContent>
        )}
      </DialogWrapper>
    </>
  );
};

export default HeaderSearch;
