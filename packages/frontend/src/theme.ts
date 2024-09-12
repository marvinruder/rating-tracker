import "@mui/lab/themeAugmentation";
import type { Theme, ThemeOptions } from "@mui/material";
import { alpha, lighten, darken, createTheme } from "@mui/material";
import type { PaletteOptions } from "@mui/material/styles";

/**
 * Generates the main colors for both color schemes.
 * @param light Whether the theme is light or not.
 * @returns The main colors used in the theme.
 */
const generateThemeColors = (light: boolean) =>
  ({
    primary: "#2971D6",
    secondary: light ? "#878787" : "#B0B0B0",
    success: light ? "#57CA22" : "#54AB2B",
    warning: "#FFA319",
    error: "#FF1943",
    info: "#33C2FF",
    black: light ? "#3B3B3B" : "#CFCFCF",
    white: light ? "#ffffff" : "#212121",
    trueWhite: "#ffffff",
    trueBlack: "#000000",
  }) as const;

/**
 * Generates the color palette for both color schemes.
 * @param light Whether the theme is light or not.
 * @returns The color palette for the theme.
 */
const generatePalette = (light: boolean): PaletteOptions => {
  const themeColors = generateThemeColors(light);
  return {
    common: {
      black: themeColors.black,
      white: themeColors.white,
    },
    primary: {
      lighter: light ? lighten(themeColors.primary, 0.85) : alpha(themeColors.primary, 0.85),
      light: light ? lighten(themeColors.primary, 0.3) : alpha(themeColors.primary, 0.8),
      main: themeColors.primary,
      dark: darken(themeColors.primary, 0.2),
      alpha5: alpha(themeColors.primary, 0.02),
      alpha10: alpha(themeColors.primary, 0.1),
      alpha30: alpha(themeColors.primary, 0.3),
      alpha50: alpha(themeColors.primary, 0.5),
      alpha70: alpha(themeColors.primary, light ? 0.75 : 0.65),
      shadow: `0px 1px 4px rgb(41 113 214 / 25%), 0px 3px 12px 2px rgb(41 113 214 / 35%)`,
    },
    secondary: {
      lighter: light ? lighten(themeColors.secondary, 0.85) : alpha(themeColors.secondary, 0.85),
      light: light ? lighten(themeColors.secondary, 0.25) : alpha(themeColors.secondary, 0.8),
      main: themeColors.secondary,
      dark: darken(themeColors.secondary, 0.2),
      alpha5: alpha(themeColors.secondary, 0.02),
      alpha10: alpha(themeColors.secondary, 0.1),
      alpha30: alpha(themeColors.secondary, 0.3),
      alpha50: alpha(themeColors.secondary, 0.5),
      alpha70: alpha(themeColors.secondary, light ? 0.75 : 0.65),
    },
    success: {
      lighter: light ? lighten(themeColors.success, 0.85) : alpha(themeColors.success, 0.85),
      light: light ? lighten(themeColors.success, 0.3) : alpha(themeColors.success, 0.8),
      main: themeColors.success,
      dark: darken(themeColors.success, 0.2),
      alpha5: alpha(themeColors.success, 0.02),
      alpha10: alpha(themeColors.success, 0.1),
      alpha30: alpha(themeColors.success, 0.3),
      alpha50: alpha(themeColors.success, 0.5),
      alpha70: alpha(themeColors.success, light ? 0.75 : 0.65),
      shadow:
        `0px 1px 4px ${light ? "rgb(87 202 34 / 25%)" : "rgb(84 171 43 / 25%)"}, ` +
        `0px 3px 12px 2px ${light ? "rgb(87 202 34 / 35%)" : "rgb(84 171 43 / 35%)"}`,
    },
    warning: {
      lighter: light ? lighten(themeColors.warning, 0.85) : alpha(themeColors.warning, 0.85),
      light: light ? lighten(themeColors.warning, 0.3) : alpha(themeColors.warning, 0.8),
      main: themeColors.warning,
      dark: darken(themeColors.warning, 0.2),
      alpha5: alpha(themeColors.warning, 0.02),
      alpha10: alpha(themeColors.warning, 0.1),
      alpha30: alpha(themeColors.warning, 0.3),
      alpha50: alpha(themeColors.warning, 0.5),
      alpha70: alpha(themeColors.warning, light ? 0.75 : 0.65),
      shadow: "0px 1px 4px rgb(255 163 25 / 25%), 0px 3px 12px 2px rgb(255 163 25 / 35%)",
    },
    error: {
      lighter: light ? lighten(themeColors.error, 0.85) : alpha(themeColors.error, 0.85),
      light: light ? lighten(themeColors.error, 0.3) : alpha(themeColors.error, 0.8),
      main: themeColors.error,
      dark: darken(themeColors.error, 0.2),
      alpha5: alpha(themeColors.error, 0.02),
      alpha10: alpha(themeColors.error, 0.1),
      alpha30: alpha(themeColors.error, 0.3),
      alpha50: alpha(themeColors.error, 0.5),
      alpha70: alpha(themeColors.error, light ? 0.75 : 0.65),
      shadow: "0px 1px 4px rgb(255 25 67 / 25%), 0px 3px 12px 2px rgb(255 25 67 / 35%)",
    },
    info: {
      lighter: light ? lighten(themeColors.info, 0.85) : alpha(themeColors.info, 0.85),
      light: light ? lighten(themeColors.info, 0.3) : alpha(themeColors.info, 0.8),
      main: themeColors.info,
      dark: darken(themeColors.info, 0.2),
      alpha5: alpha(themeColors.info, 0.02),
      alpha10: alpha(themeColors.info, 0.1),
      alpha30: alpha(themeColors.info, 0.3),
      alpha50: alpha(themeColors.info, 0.5),
      alpha70: alpha(themeColors.info, light ? 0.75 : 0.65),
      shadow: "0px 1px 4px rgb(51 194 255 / 25%), 0px 3px 12px 2px rgb(51 194 255 / 35%)",
    },
    white: {
      lighter: light ? lighten(themeColors.white, 0.85) : alpha(themeColors.white, 0.85),
      light: light ? lighten(themeColors.white, 0.3) : alpha(themeColors.white, 0.8),
      main: themeColors.white,
      dark: darken(themeColors.white, 0.2),
      alpha5: alpha(themeColors.white, 0.02),
      alpha10: alpha(themeColors.white, 0.1),
      alpha30: alpha(themeColors.white, 0.3),
      alpha50: alpha(themeColors.white, 0.5),
      alpha70: alpha(themeColors.white, light ? 0.75 : 0.65),
    },
    trueWhite: {
      lighter: themeColors.trueWhite,
      light: themeColors.trueWhite,
      main: themeColors.trueWhite,
      dark: themeColors.trueWhite,
      alpha5: alpha(themeColors.trueWhite, 0.02),
      alpha10: alpha(themeColors.trueWhite, 0.1),
      alpha30: alpha(themeColors.trueWhite, 0.3),
      alpha50: alpha(themeColors.trueWhite, 0.5),
      alpha70: alpha(themeColors.trueWhite, 0.7),
    },
    black: {
      lighter: light ? lighten(themeColors.black, 0.85) : alpha(themeColors.black, 0.85),
      light: light ? lighten(themeColors.black, 0.3) : alpha(themeColors.black, 0.8),
      main: themeColors.black,
      dark: darken(themeColors.black, 0.2),
      alpha5: alpha(themeColors.black, 0.02),
      alpha10: alpha(themeColors.black, 0.1),
      alpha30: alpha(themeColors.black, 0.3),
      alpha50: alpha(themeColors.black, 0.5),
      alpha70: alpha(themeColors.black, light ? 0.75 : 0.65),
    },
    trueBlack: {
      lighter: themeColors.trueBlack,
      light: themeColors.trueBlack,
      main: themeColors.trueBlack,
      dark: themeColors.trueBlack,
      alpha5: alpha(themeColors.trueBlack, 0.02),
      alpha10: alpha(themeColors.trueBlack, 0.1),
      alpha30: alpha(themeColors.trueBlack, 0.3),
      alpha50: alpha(themeColors.trueBlack, 0.5),
      alpha70: alpha(themeColors.trueBlack, 0.7),
    },
    sidebar: {
      boxShadow:
        `2px 0px 3px ${light ? "rgb(176 176 176 / 18%)" : "transparent"}, ` +
        `1px 0px 1px ${light ? "rgb(176 176 176 / 32%)" : "transparent"}, ` +
        `1px 0px 0px ${light ? "transparent" : "#383838"}`,
    },
    header: {
      background: themeColors.white,
    },
    text: {
      primary: themeColors.black,
      secondary: alpha(themeColors.black, light ? 0.75 : 0.65),
      disabled: alpha(themeColors.black, 0.5),
    },
    background: {
      paper: themeColors.white,
      default: light ? "#F5F5F5" : "#171717",
    },
    action: {
      active: themeColors.black,
      hoverOpacity: 0.1,
      selected: alpha(themeColors.black, 0.1),
      selectedOpacity: 0.1,
      disabled: alpha(themeColors.black, 0.5),
      disabledBackground: alpha(themeColors.black, 0.02),
      disabledOpacity: 0.38,
      focus: alpha(themeColors.black, 0.1),
      focusOpacity: 0.05,
      activatedOpacity: 0.12,
    },
    region: {
      EMEA: light ? "#EF7622" : "#DA6410",
      Americas: light ? "#518428" : "#65A432",
      Asia: light ? "#1F55A5" : "#4F88DE",
    },
    sector: {
      Cyclical: light ? "#EF7622" : "#DA6410",
      Defensive: light ? "#518428" : "#65A432",
      Sensitive: light ? "#1F55A5" : "#4F88DE",
    },
    consensus: {
      Sell: "#D60A22",
      Underperform: "#EA7034",
      Hold: "#FFD747",
      Outperform: "#81A949",
      Buy: "#037B66",
    },
    msci: {
      Leader: "#007567",
      Average: "#FFB500",
      Laggard: "#CF333B",
      Aligned1: "#5a84c3",
      Aligned2: "#fdc32d",
      Misaligned: "#f08908",
      StronglyMisaligned: "#e44261",
    },
    sustainalytics: {
      negligible: light ? "#CCCCCC" : "#333333",
      low: light ? "#F9DD99" : "#654A06",
      medium: light ? "#F6CD5C" : "#A07708",
      high: light ? "#F3BC33" : "#CA940C",
      severe: light ? "#F0AB00" : "#FFBB0F",
    },
    switchSelector: {
      selected: light ? themeColors.primary : themeColors.black,
      unselected: themeColors.white,
    },
    trend: {
      up: light ? "#10A892" : "#28EBCF",
      down: light ? "#C7320D" : "#F79880",
    },
  } as const;
};

/**
 * The Rating Tracker theme.
 */
export const theme = createTheme({
  colorSchemes: {
    light: { palette: generatePalette(true) },
    dark: { palette: generatePalette(false) },
  },
  sidebar: {
    width: "290px",
  },
  spacing: 9,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1840,
    },
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.trueBlack.alpha30,
          backdropFilter: "blur(2px)",
          "&.MuiBackdrop-invisible": {
            backgroundColor: "transparent",
            backdropFilter: "blur(2px)",
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          textTransform: "none",
          marginLeft: 8,
          marginRight: 8,
          fontWeight: "bold",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          ...theme.applyStyles("light", {
            backgroundColor: theme.palette.white.main,
          }),
          ...theme.applyStyles("dark", {
            backgroundColor: darken(theme.palette.background.default, 0.1),
          }),
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "html, body": {
          width: "100%",
          height: "100%",
        },
        body: {
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
          flex: 1,
          fontFeatureSettings: '"dlig", "tnum", "ss01", "ss02", "ss03"',
        },
        "#root": {
          width: "100%",
          height: "100%",
          display: "flex",
          flex: 1,
          flexDirection: "column",
        },
        html: {
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
          MozOsxFontSmoothing: "grayscale",
          WebkitFontSmoothing: "antialiased",
        },
        ".child-popover .MuiPaper-root .MuiList-root": {
          flexDirection: "column",
        },
        code: {
          // backgroundColor: theme.palette.info.lighter,
          // ...theme.applyStyles("light", {
          //   color: theme.palette.info.dark,
          // }),
          // ...theme.applyStyles("dark", {
          //   color: theme.palette.black.main,
          // }),
          borderRadius: 4,
          padding: 4,
        },
        "@keyframes ripple": {
          "0%": {
            transform: "scale(.8)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(2.8)",
            opacity: 0,
          },
        },
        "@keyframes float": {
          "0%": {
            transform: "translate(0%, 0%)",
          },
          "100%": {
            transform: "translate(3%, 3%)",
          },
        },
        ".backgroundlogo > svg": {
          width: "100%",
          height: "100%",
        },
        "div.react-switch-selector-wrapper::before, .react-switch-selector-option-label > .MuiTypography-button": {
          transitionDuration: "0.2s",
          transitionTimingFunction: "ease",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        iconOutlined: ({ theme }) => ({
          color: theme.palette.black.alpha50,
        }),
        icon: {
          top: "calc(50% - 14px)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "&[type=number]": {
            MozAppearance: "textfield",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiInputAdornment-positionEnd.MuiInputAdornment-outlined": {
            paddingRight: 6,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.black.alpha50,
          },
          "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          fontWeight: "bold",
          lineHeight: "40px",
          fontSize: 11,
          backgroundColor: theme.palette.black.alpha5,
          color: theme.palette.black.alpha70,
        }),
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        action: {
          marginTop: -5,
          marginBottom: -5,
        },
        title: {
          fontSize: 13,
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha5,
          color: theme.palette.black.main,
          "&:hover": {
            backgroundColor: theme.palette.black.alpha10,
          },
        }),
        deleteIcon: ({ theme }) => ({
          ...theme.applyStyles("light", {
            color: theme.palette.error.light,
          }),
          ...theme.applyStyles("dark", {
            color: theme.palette.black.alpha50,
          }),
          "&:hover": {
            ...theme.applyStyles("light", {
              color: theme.palette.error.main,
            }),
            ...theme.applyStyles("dark", {
              color: theme.palette.black.alpha70,
            }),
          },
        }),
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&.Mui-expanded": {
            margin: 0,
          },
          "&::before": {
            display: "none",
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: "bold",
        },
        colorDefault: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha30,
          color: theme.palette.trueWhite.main,
        }),
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: {
          alignItems: "center",
        },
        avatar: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha10,
          fontSize: 11,
          color: theme.palette.black.alpha70,
          fontWeight: "bold",
          "&:first-of-type": {
            border: 0,
            backgroundColor: "transparent",
          },
        }),
      },
    },
    MuiListItemAvatar: {
      styleOverrides: {
        alignItemsFlexStart: {
          marginTop: 0,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        page: {
          fontSize: 11,
          fontWeight: "bold",
          transition: "all .2s",
        },
        textPrimary: ({ theme }) => ({
          "&.Mui-selected": {
            boxShadow: theme.palette.primary.shadow,
          },
          "&.MuiButtonBase-root:hover": {
            backgroundColor: theme.palette.black.alpha5,
          },
          "&.Mui-selected.MuiButtonBase-root:hover": {
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
          textTransform: "none",
          paddingLeft: 16,
          paddingRight: 16,
          ".MuiSvgIcon-root": {
            transition: "all .2s",
          },
        },
        containedPrimary: ({ theme }) => ({
          "&:hover:not(:disabled)": {
            backgroundColor: darken(theme.palette.primary.main, 0.1),
            ".MuiTouchRipple-child": {
              backgroundColor: theme.palette.trueBlack.alpha70,
            },
          },
        }),
        textPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.alpha10,
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
          },
        }),
        textSecondary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.secondary.main, 0.2),
          },
        }),
        textSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.success.main, 0.2),
          },
        }),
        textError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.error.main, 0.2),
          },
        }),
        textWarning: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.warning.main, 0.2),
          },
        }),
        textInfo: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(theme.palette.black.main, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(theme.palette.info.main, 0.2),
          },
        }),
        endIcon: {
          marginRight: -8,
        },
        sizeSmall: {
          padding: "6px 16px",
          lineHeight: 1.5,
        },
        sizeMedium: {
          padding: "8px 20px",
        },
        sizeLarge: {
          padding: "11px 24px",
        },
        outlinedSizeSmall: {
          padding: "5px 15px",
        },
        outlinedSizeMedium: {
          padding: "7px 19px",
        },
        outlinedSizeLarge: {
          padding: "10px 23px",
        },
        textSizeSmall: {
          padding: "6px 16px",
          lineHeight: 1.5,
        },
        textSizeMedium: {
          padding: "8px 20px",
        },
        textSizeLarge: {
          padding: "11px 24px",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.white.main,
          transition: "all .2s",
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: theme.palette.trueWhite.main,
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "& .MuiTouchRipple-root": {
            borderRadius: 8,
          },
        },
        sizeSmall: {
          padding: 2,
        },
      },
    },
    MuiListItemText: {
      defaultProps: {
        primaryTypographyProps: {
          variant: "body1",
          color: "text.primary",
        },
        secondaryTypographyProps: {
          variant: "body2",
          color: "text.secondary",
        },
      },
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          "& .MuiTouchRipple-root": {
            opacity: 0.3,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha10,
          border: 0,
          height: 1,
        }),
        vertical: {
          height: "auto",
          width: 1,
          "&.MuiDivider-flexItem.MuiDivider-fullWidth": {
            height: "auto",
          },
          "&.MuiDivider-absolute.MuiDivider-fullWidth": {
            height: "100%",
          },
        },
        withChildren: {
          "&:before, &:after": {
            border: 0,
          },
        },
        wrapper: ({ theme }) => ({
          backgroundColor: theme.palette.white.main,
          fontWeight: "bold",
          height: 24,
          lineHeight: "24px",
          marginTop: -12,
          color: "inherit",
          textTransform: "uppercase",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          padding: 0,
        },
        elevation0: ({ theme }) => ({
          boxShadow: "none",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: theme.palette.black.alpha10,
        }),
        elevation: ({ theme }) => ({
          ...theme.applyStyles("light", {
            boxShadow: "0px 9px 16px rgb(176 176 176 / 18%), 0px 2px 2px rgb(176 176 176 / 32%)",
          }),
          ...theme.applyStyles("dark", {
            boxShadow: "0px 0px 2px #828282",
          }),
        }),
        elevation2: ({ theme }) => ({
          ...theme.applyStyles("light", {
            boxShadow: "0px 2px 3px rgb(176 176 176 / 18%), 0px 1px 1px rgb(176 176 176 / 32%)",
          }),
          ...theme.applyStyles("dark", {
            boxShadow: "0px 0px 2px #828282",
          }),
        }),
        elevation16: ({ theme }) => ({
          ...theme.applyStyles("light", {
            boxShadow: "0px 4px 8px rgb(0 0 0 / 30%)",
          }),
          ...theme.applyStyles("dark", {
            boxShadow: "0px 0px 2px #828282",
          }),
        }),
        elevation24: ({ theme }) => ({
          ...theme.applyStyles("light", {
            boxShadow: "0px 12px 36px rgb(0 0 0 / 40%), 0px 4px 8px rgb(0 0 0 / 20%)",
          }),
          ...theme.applyStyles("dark", {
            boxShadow: "0px 0px 2px #828282, 0px 80px 224px rgb(255 255 255 / 5%)",
          }),
        }),
        outlined: ({ theme }) => ({
          ...theme.applyStyles("light", {
            boxShadow: "0px 9px 16px rgb(176 176 176 / 18%), 0px 2px 2px rgb(176 176 176 / 32%)",
          }),
          ...theme.applyStyles("dark", {
            boxShadow: "0px 0px 2px #828282",
          }),
        }),
      },
    },
    MuiChartsTooltip: {
      styleOverrides: {
        container: ({ theme }: { theme: Theme }) => ({
          boxShadow: "none",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: theme.palette.black.alpha10,
        }),
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "none",
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 6,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiSlider-valueLabelCircle, .MuiSlider-valueLabelLabel": {
            transform: "none",
          },
          "& .MuiSlider-valueLabel": {
            borderRadius: 6,
            backgroundColor: theme.palette.black.main,
            color: theme.palette.white.main,
          },
        }),
      },
    },
    MuiList: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0,
          "& .MuiListItem-button": {
            transition: "all .2s",
            "& > .MuiSvgIcon-root": {
              minWidth: 34,
            },
            "& .MuiTouchRipple-root": {
              opacity: 0.2,
            },
          },
          "& .MuiListItem-root.MuiButtonBase-root.Mui-selected": {
            ...theme.applyStyles("light", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.4),
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: theme.palette.black.alpha10,
            }),
          },
          "& .MuiMenuItem-root.MuiButtonBase-root:active": {
            ...theme.applyStyles("light", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.4),
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
            }),
          },
          "& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root": {
            opacity: 0.2,
          },
        }),
        padding: {
          padding: 8,
          "& .MuiListItem-button": {
            borderRadius: 6,
            margin: "1px 0",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          height: 38,
          minHeight: 38,
          overflow: "visible",
        },
        indicator: ({ theme }) => ({
          height: 38,
          minHeight: 38,
          borderRadius: 6,
          border: `1px solid ${theme.palette.primary.dark}`,
          boxShadow: `0px 2px 10px ${theme.palette.primary.light}`,
        }),
        scrollableX: {
          overflow: "visible !important",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0,
          height: 38,
          minHeight: 38,
          borderRadius: 6,
          transition: "color .2s",
          textTransform: "capitalize",
          "&.MuiButtonBase-root": {
            minWidth: "auto",
            paddingLeft: 20,
            paddingRight: 20,
            marginRight: 4,
          },
          "&.Mui-selected, &.Mui-selected:hover": {
            color: theme.palette.trueWhite.main,
            zIndex: 5,
          },
          "&:hover": {
            ...theme.applyStyles("light", {
              backgroundColor: theme.palette.black.main,
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: theme.palette.trueWhite.alpha70,
            }),
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: ({ theme }) => ({
          padding: 8,
          "& .MuiMenuItem-root.MuiButtonBase-root": {
            fontSize: 12,
            marginTop: 1,
            marginBottom: 1,
            transition: "all .2s",
            color: theme.palette.black.alpha70,
            "& .MuiTouchRipple-root": {
              opacity: 0.2,
            },
            "&:hover, &:active, &.active, &.Mui-selected": {
              color: theme.palette.black.main,
              ...theme.applyStyles("light", {
                backgroundColor: alpha(theme.palette.primary.lighter!, 0.4),
              }),
              ...theme.applyStyles("dark", {
                backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
              }),
            },
          },
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: 6,
          paddingRight: 12,
          backgroundColor: "transparent",
          transition: "all .2s",
          "&:hover, &:active, &.active, &.Mui-selected": {
            color: theme.palette.black.main,
            ...theme.applyStyles("light", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.4),
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
            }),
          },
          "&.Mui-selected:hover": {
            ...theme.applyStyles("light", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.4),
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
            }),
          },
        }),
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiButtonBase-root": {
            color: theme.palette.secondary.main,
            "&:hover, &:active, &.active, &.Mui-selected": {
              color: theme.palette.black.main,
              ...theme.applyStyles("light", {
                backgroundColor: alpha(theme.palette.primary.lighter!, 0.5),
              }),
              ...theme.applyStyles("dark", {
                backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
              }),
            },
          },
        }),
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          margin: 1,
        },
        root: {
          ".MuiAutocomplete-inputRoot.MuiOutlinedInput-root .MuiAutocomplete-endAdornment": {
            right: 14,
          },
          ".MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
            minWidth: 45,
          },
        },
        clearIndicator: ({ theme }) => ({
          transition:
            "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          ...theme.applyStyles("light", {
            backgroundColor: theme.palette.error.lighter,
          }),
          ...theme.applyStyles("dark", {
            backgroundColor: alpha(theme.palette.error.lighter!, 0.2),
          }),
          color: theme.palette.error.main,
          marginRight: 8,
          "&:hover": {
            ...theme.applyStyles("light", {
              backgroundColor: theme.palette.error.lighter,
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.error.lighter!, 0.3),
            }),
            color: theme.palette.error.dark,
          },
        }),
        popupIndicator: ({ theme }) => ({
          transition:
            "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          ...theme.applyStyles("light", {
            color: theme.palette.black.alpha50,
          }),
          ...theme.applyStyles("dark", {
            color: theme.palette.black.alpha70,
          }),
          "&:hover": {
            ...theme.applyStyles("light", {
              backgroundColor: theme.palette.primary.lighter,
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.primary.lighter!, 0.2),
            }),
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          "& .MuiIconButton-root": {
            padding: 8,
          },
        },
        select: {
          "&:focus": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "0 !important",
          padding: "0 !important",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha5,
        }),
        root: ({ theme }) => ({
          transition: "background-color .2s",
          "&.MuiTableRow-hover:hover": {
            ...theme.applyStyles("light", {
              backgroundColor: theme.palette.black.alpha5,
            }),
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(theme.palette.black.alpha5!, 0.05),
            }),
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottomColor: theme.palette.black.alpha10,
          fontSize: 12,
          padding: 6,
          lineHeight: "1rem",
        }),
        head: ({ theme }) => ({
          textTransform: "uppercase",
          fontSize: 11,
          fontWeight: "bold",
          color: theme.palette.black.alpha70,
          lineHeight: "1rem",
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          lineHeight: 1.5,
          fontSize: 12,
        },
        standardInfo: ({ theme }) => ({
          color: theme.palette.info.main,
        }),
      },
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          margin: 0,
          zIndex: 5,
          position: "absolute",
          top: "50%",
          marginTop: -6,
          left: -6,
        },
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.white.main,
          boxShadow: `0 0 0 6px ${theme.palette.white.main}`,
        }),
        outlinedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.white.main,
          boxShadow: `0 0 0 6px ${theme.palette.white.main}`,
        }),
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: ({ theme }) => ({
          position: "absolute",
          height: "100%",
          top: 0,
          borderRadius: 50,
          backgroundColor: theme.palette.black.alpha10,
        }),
      },
    },
    MuiTimelineItem: {
      styleOverrides: {
        root: {
          minHeight: 0,
          padding: "8px 0",
          "&:before": {
            display: "none",
          },
        },
        missingOppositeContent: {
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.black.main, 0.95),
          padding: "4px 8px",
          fontSize: 11,
          // Fixes a visual glitch with Safari where a short tooltip text would wrap the last word to the next line
          width: "calc(100% + .25px)",
        }),
        arrow: ({ theme }) => ({
          color: alpha(theme.palette.black.main, 0.95),
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          height: 33,
          overflow: "visible",
          "& .MuiButtonBase-root": {
            position: "absolute",
            padding: 6,
            transition: "left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          },
          "& .MuiIconButton-root": {
            borderRadius: 100,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            opacity: 0.3,
          },
        },
        thumb: ({ theme }) => ({
          border: `1px solid ${theme.palette.black.alpha30}`,
          boxShadow: `0px 9px 14px ${theme.palette.black.alpha10}, 0px 2px 2px ${theme.palette.black.alpha10}`,
        }),
        track: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha5,
          border: `1px solid ${theme.palette.black.alpha10}`,
          boxShadow: `inset 0px 1px 1px ${theme.palette.black.alpha10}`,
          opacity: 1,
        }),
        colorPrimary: ({ theme }) => ({
          "& .MuiSwitch-thumb": {
            backgroundColor: theme.palette.white.main,
          },
          "&.Mui-checked .MuiSwitch-thumb": {
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: 20,
          paddingBottom: 20,
          backgroundColor: theme.palette.black.alpha5,
        }),
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiStepIcon-completed": {
            color: theme.palette.success.main,
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "div",
          h4: "div",
          h5: "div",
          h6: "div",
          subtitle1: "div",
          subtitle2: "div",
          body1: "div",
          body2: "div",
        },
      },
      styleOverrides: {
        root: {
          ul: {
            paddingInlineStart: "2em",
          },
        },
        gutterBottom: {
          marginBottom: 2,
        },
        paragraph: {
          fontSize: 15,
          lineHeight: 1.7,
        },
        h3: ({ theme }) => ({
          color: theme.palette.black.main,
        }),
        caption: ({ theme }) => ({
          color: theme.palette.black.alpha50,
        }),
        subtitle1: ({ theme }) => ({
          color: theme.palette.black.alpha70,
        }),
        subtitle2: ({ theme }) => ({
          color: theme.palette.black.alpha70,
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.black.alpha10,
        }),
      },
      defaultProps: {
        animation: "wave",
      },
    },
  } as ThemeOptions["components"] & { MuiChartsTooltip: unknown },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '"InterVariable", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, ' +
      '"Apple Color Emoji", "Segoe UI Emoji"',
    h1: {
      fontWeight: 700,
      fontSize: 30,
    },
    h2: {
      fontWeight: 700,
      fontSize: 26,
    },
    h3: {
      fontWeight: 700,
      fontSize: 21,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 700,
      fontSize: 14,
    },
    h5: {
      fontWeight: 700,
      fontSize: 12,
    },
    h6: {
      fontSize: 13,
    },
    body1: {
      fontSize: 12,
    },
    body2: {
      fontSize: 12,
    },
    button: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 11,
      textTransform: "uppercase",
    },
    subtitle1: {
      fontSize: 12,
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: 13,
    },
    overline: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
    },
  },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
});
