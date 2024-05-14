import "@mui/lab/themeAugmentation";
import type { Theme } from "@mui/material";
import { alpha, lighten, darken, createTheme } from "@mui/material";

/**
 * The main colors used in both themes.
 * @param light Whether the theme is light or not.
 * @returns The main colors used in the theme.
 */
const generateThemeColors = (light: boolean) => ({
  primary: "#2971D6",
  secondary: light ? "#878787" : "#B0B0B0",
  success: light ? "#57CA22" : "#54AB2B",
  warning: "#FFA319",
  error: "#FF1943",
  info: "#33C2FF",
  black: light ? "#3B3B3B" : "#CFCFCF",
  white: light ? "#ffffff" : "#212121",
  primaryAlt: light ? "#2B2B2B" : "#212121",
  trueWhite: "#ffffff",
  trueBlack: "#000000",
});

/**
 * A variety of colors used in both themes.
 * @param light Whether the theme is light or not.
 * @param themeColors The main colors used in the theme.
 * @returns A variety of colors used in the theme.
 */
const generateColors = (light: boolean, themeColors) => ({
  gradients: {
    blue1: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
    blue2: "linear-gradient(135deg, #ABDCFF 0%, #0396FF 100%)",
    blue3: "linear-gradient(127.55deg, #141E30 3.73%, #243B55 92.26%)",
    blue4: "linear-gradient(-20deg, #2b5876 0%, #4e4376 100%)",
    blue5: "linear-gradient(135deg, #97ABFF 10%, #123597 100%)",
    orange1: "linear-gradient(135deg, #FCCF31 0%, #F55555 100%)",
    orange2: "linear-gradient(135deg, #FFD3A5 0%, #FD6585 100%)",
    orange3: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
    purple1: "linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)",
    purple3: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    pink1: "linear-gradient(135deg, #F6CEEC 0%, #D939CD 100%)",
    pink2: "linear-gradient(135deg, #F761A1 0%, #8C1BAB 100%)",
    green1: "linear-gradient(135deg, #FFF720 0%, #3CD500 100%)",
    green2: "linear-gradient(to bottom, #00b09b, #96c93d)",
    black1: "linear-gradient(100.66deg, #434343 6.56%, #000000 93.57%)",
    black2: "linear-gradient(60deg, #29323c 0%, #485563 100%)",
  },
  shadows: {
    success: "0px 1px 4px rgba(68, 214, 0, 0.25), 0px 3px 12px 2px rgba(68, 214, 0, 0.35)",
    error: "0px 1px 4px rgba(255, 25, 67, 0.25), 0px 3px 12px 2px rgba(255, 25, 67, 0.35)",
    info: "0px 1px 4px rgba(51, 194, 255, 0.25), 0px 3px 12px 2px rgba(51, 194, 255, 0.35)",
    primary: light
      ? "0px 1px 4px rgba(36, 122, 242, 0.25), 0px 3px 12px 2px rgba(36, 122, 242, 0.35)"
      : "0px 1px 4px rgba(112, 99, 192, 0.25), 0px 3px 12px 2px rgba(61, 99, 153, 0.35)",
    warning: "0px 1px 4px rgba(255, 163, 25, 0.25), 0px 3px 12px 2px rgba(255, 163, 25, 0.35)",
    card: light
      ? "0px 9px 16px rgba(176, 176, 176, .18), 0px 2px 2px rgba(176, 176, 176, 0.32)"
      : "0px 0px 2px #828282",
    cardSm: light
      ? "0px 2px 3px rgba(176, 176, 176, .18), 0px 1px 1px rgba(176, 176, 176, 0.32)"
      : "0px 0px 2px #828282",
    cardMd: light ? "0 5rem 14rem 0 rgb(255 255 255 / 30%), 0 0.2rem 0.4rem rgb(0 0 0 / 35%)" : "0px 0px 2px #828282",
    cardLg: light
      ? "0 5rem 14rem 0 rgb(255 255 255 / 30%), 0 0.8rem 2.3rem rgb(0 0 0 / 60%), 0 0.2rem 0.3rem rgb(0 0 0 / 45%)"
      : "0 0rem 14rem 0 rgb(255 255 255 / 10%), " +
        "0 0.8rem 2.3rem rgb(133 133 133 / 3%), " +
        "0 0.2rem 0.7rem rgb(38 38 38 / 15%)",
  },
  layout: {
    general: {
      bodyBg: light ? "#F5F5F5" : "#171717",
    },
    sidebar: {
      background: light ? themeColors.white : themeColors.primaryAlt,
      textColor: themeColors.secondary,
      dividerBg: light ? "#F5F5F5" : "#383838",
      menuItemColor: light ? "#4A4A4A" : themeColors.secondary,
      menuItemColorActive: light ? themeColors.primary : themeColors.trueWhite,
      menuItemBg: light ? themeColors.white : themeColors.primaryAlt,
      menuItemBgActive: light ? "#F5F5F5" : "rgba(61, 61, 61, .6)",
      menuItemIconColor: light ? lighten(themeColors.secondary, 0.3) : "#575757",
      menuItemIconColorActive: light ? themeColors.primary : themeColors.trueWhite,
      menuItemHeadingColor: darken(themeColors.secondary, 0.3),
    },
  },
  alpha: {
    white: {
      5: alpha(themeColors.white, 0.02),
      10: alpha(themeColors.white, 0.1),
      30: alpha(themeColors.white, 0.3),
      50: alpha(themeColors.white, 0.5),
      70: alpha(themeColors.white, light ? 0.75 : 0.65),
      100: themeColors.white,
    },
    trueWhite: {
      5: alpha(themeColors.trueWhite, 0.02),
      10: alpha(themeColors.trueWhite, 0.1),
      30: alpha(themeColors.trueWhite, 0.3),
      50: alpha(themeColors.trueWhite, 0.5),
      70: alpha(themeColors.trueWhite, 0.7),
      100: themeColors.trueWhite,
    },
    black: {
      5: alpha(themeColors.black, 0.02),
      10: alpha(themeColors.black, 0.1),
      30: alpha(themeColors.black, 0.3),
      50: alpha(themeColors.black, 0.5),
      70: alpha(themeColors.black, light ? 0.75 : 0.65),
      100: themeColors.black,
    },
    trueBlack: {
      5: alpha(themeColors.trueBlack, 0.02),
      10: alpha(themeColors.trueBlack, 0.1),
      30: alpha(themeColors.trueBlack, 0.3),
      50: alpha(themeColors.trueBlack, 0.5),
      70: alpha(themeColors.trueBlack, 0.7),
      100: themeColors.trueBlack,
    },
  },
  secondary: {
    lighter: light ? lighten(themeColors.secondary, 0.85) : alpha(themeColors.secondary, 0.85),
    light: light ? lighten(themeColors.secondary, 0.25) : alpha(themeColors.secondary, 0.8),
    main: themeColors.secondary,
    dark: darken(themeColors.secondary, 0.2),
  },
  primary: {
    lighter: light ? lighten(themeColors.primary, 0.85) : alpha(themeColors.primary, 0.85),
    light: light ? lighten(themeColors.primary, 0.3) : alpha(themeColors.primary, 0.8),
    main: themeColors.primary,
    dark: darken(themeColors.primary, 0.2),
  },
  success: {
    lighter: light ? lighten(themeColors.success, 0.85) : alpha(themeColors.success, 0.85),
    light: light ? lighten(themeColors.success, 0.3) : alpha(themeColors.success, 0.8),
    main: themeColors.success,
    dark: darken(themeColors.success, 0.2),
  },
  warning: {
    lighter: light ? lighten(themeColors.warning, 0.85) : alpha(themeColors.warning, 0.85),
    light: light ? lighten(themeColors.warning, 0.3) : alpha(themeColors.warning, 0.8),
    main: themeColors.warning,
    dark: darken(themeColors.warning, 0.2),
  },
  error: {
    lighter: light ? lighten(themeColors.error, 0.85) : alpha(themeColors.error, 0.85),
    light: light ? lighten(themeColors.error, 0.3) : alpha(themeColors.error, 0.8),
    main: themeColors.error,
    dark: darken(themeColors.error, 0.2),
  },
  info: {
    lighter: light ? lighten(themeColors.info, 0.85) : alpha(themeColors.info, 0.85),
    light: light ? lighten(themeColors.info, 0.3) : alpha(themeColors.info, 0.8),
    main: themeColors.info,
    dark: darken(themeColors.info, 0.2),
  },
});

/**
 * The scheme for both themes
 * @param light Whether the theme is light or not.
 * @param themeColors The main colors used in the theme.
 * @param colors A variety of colors used in the theme.
 * @returns The scheme for both themes.
 */
const generateScheme = (light: boolean, themeColors, colors) => ({
  colors: {
    gradients: {
      blue1: colors.gradients.blue1,
      blue2: colors.gradients.blue2,
      blue3: colors.gradients.blue3,
      blue4: colors.gradients.blue4,
      blue5: colors.gradients.blue5,
      orange1: colors.gradients.orange1,
      orange2: colors.gradients.orange2,
      orange3: colors.gradients.orange3,
      purple1: colors.gradients.purple1,
      purple3: colors.gradients.purple3,
      pink1: colors.gradients.pink1,
      pink2: colors.gradients.pink2,
      green1: colors.gradients.green1,
      green2: colors.gradients.green2,
      black1: colors.gradients.black1,
      black2: colors.gradients.black2,
    },
    shadows: {
      success: colors.shadows.success,
      error: colors.shadows.error,
      primary: colors.shadows.primary,
      info: colors.shadows.info,
      warning: colors.shadows.warning,
    },
    alpha: {
      white: {
        5: alpha(themeColors.white, 0.02),
        10: alpha(themeColors.white, 0.1),
        30: alpha(themeColors.white, 0.3),
        50: alpha(themeColors.white, 0.5),
        70: alpha(themeColors.white, 0.7),
        100: themeColors.white,
      },
      trueWhite: {
        5: alpha(themeColors.trueWhite, 0.02),
        10: alpha(themeColors.trueWhite, 0.1),
        30: alpha(themeColors.trueWhite, 0.3),
        50: alpha(themeColors.trueWhite, 0.5),
        70: alpha(themeColors.trueWhite, 0.7),
        100: themeColors.trueWhite,
      },
      black: {
        5: alpha(themeColors.black, 0.02),
        10: alpha(themeColors.black, 0.1),
        30: alpha(themeColors.black, 0.3),
        50: alpha(themeColors.black, 0.5),
        70: alpha(themeColors.black, 0.7),
        100: themeColors.black,
      },
    },
    secondary: {
      lighter: alpha(themeColors.secondary, 0.1),
      light: (light ? lighten : alpha)(themeColors.secondary, 0.3),
      main: themeColors.secondary,
      dark: darken(themeColors.secondary, 0.2),
    },
    primary: {
      lighter: alpha(themeColors.primary, 0.1),
      light: (light ? lighten : alpha)(themeColors.primary, 0.3),
      main: themeColors.primary,
      dark: darken(themeColors.primary, 0.2),
    },
    success: {
      lighter: alpha(themeColors.success, 0.1),
      light: (light ? lighten : alpha)(themeColors.success, 0.3),
      main: themeColors.success,
      dark: darken(themeColors.success, 0.2),
    },
    warning: {
      lighter: alpha(themeColors.warning, 0.1),
      light: (light ? lighten : alpha)(themeColors.warning, 0.3),
      main: themeColors.warning,
      dark: darken(themeColors.warning, 0.2),
    },
    error: {
      lighter: alpha(themeColors.error, 0.1),
      light: (light ? lighten : alpha)(themeColors.error, 0.3),
      main: themeColors.error,
      dark: darken(themeColors.error, 0.2),
    },
    info: {
      lighter: alpha(themeColors.info, 0.1),
      light: (light ? lighten : alpha)(themeColors.info, 0.3),
      main: themeColors.info,
      dark: darken(themeColors.info, 0.2),
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
  },
  general: {
    reactFrameworkColor: "#00D8FF",
    borderRadiusSm: "6px",
    borderRadius: "10px",
    borderRadiusLg: "12px",
    borderRadiusXl: "16px",
  },
  sidebar: {
    background: colors.layout.sidebar.background,
    textColor: colors.layout.sidebar.textColor,
    dividerBg: colors.layout.sidebar.dividerBg,
    menuItemColor: colors.layout.sidebar.menuItemColor,
    menuItemColorActive: colors.layout.sidebar.menuItemColorActive,
    menuItemBg: colors.layout.sidebar.menuItemBg,
    menuItemBgActive: colors.layout.sidebar.menuItemBgActive,
    menuItemIconColor: colors.layout.sidebar.menuItemIconColor,
    menuItemIconColorActive: colors.layout.sidebar.menuItemIconColorActive,
    menuItemHeadingColor: colors.layout.sidebar.menuItemHeadingColor,
    boxShadow: light ? "2px 0 3px rgba(176, 176, 176, .18), 1px 0 1px rgba(176, 176, 176, 0.32)" : "1px 0 0 #383838",
    width: "290px",
  },
  header: {
    height: "76px",
    background: light ? colors.alpha.white[100] : themeColors.primaryAlt,
    boxShadow: light ? colors.shadows.cardSm : "0px 1px 0px #383838",
    textColor: colors.secondary.main,
  },
  spacing: 9,
  palette: {
    common: {
      black: colors.alpha.black[100],
      white: colors.alpha.white[100],
    },
    mode: light ? "light" : "dark",
    primary: {
      light: colors.primary.light,
      main: colors.primary.main,
      dark: colors.primary.dark,
    },
    secondary: {
      light: colors.secondary.light,
      main: colors.secondary.main,
      dark: colors.secondary.dark,
    },
    error: {
      light: colors.error.light,
      main: colors.error.main,
      dark: colors.error.dark,
      contrastText: themeColors.trueWhite,
    },
    success: {
      light: colors.success.light,
      main: colors.success.main,
      dark: colors.success.dark,
      contrastText: themeColors.trueWhite,
    },
    info: {
      light: colors.info.light,
      main: colors.info.main,
      dark: colors.info.dark,
      contrastText: themeColors.trueWhite,
    },
    warning: {
      light: colors.warning.light,
      main: colors.warning.main,
      dark: colors.warning.dark,
      contrastText: themeColors.trueWhite,
    },
    text: {
      primary: colors.alpha.black[100],
      secondary: colors.alpha.black[70],
      disabled: colors.alpha.black[50],
    },
    background: {
      paper: colors.alpha.white[100],
      default: colors.layout.general.bodyBg,
    },
    action: {
      active: colors.alpha.black[100],
      // hover: colors.primary.lighter,
      hoverOpacity: 0.1,
      selected: colors.alpha.black[10],
      selectedOpacity: 0.1,
      disabled: colors.alpha.black[50],
      disabledBackground: colors.alpha.black[5],
      disabledOpacity: 0.38,
      focus: colors.alpha.black[10],
      focusOpacity: 0.05,
      activatedOpacity: 0.12,
    },
    ...(light ? { tonalOffset: 0.5 } : {}),
  },
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
        root: {
          backgroundColor: light ? alpha(darken(themeColors.primaryAlt, 0.4), 0.2) : alpha(darken("#171717", 0.5), 0.4),
          backdropFilter: "blur(2px)",

          "&.MuiBackdrop-invisible": {
            backgroundColor: "transparent",
            backdropFilter: "blur(2px)",
          },
        },
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
    ...(light
      ? {}
      : {
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: darken(themeColors.primaryAlt, 0.5),
              },
            },
          },
        }),
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
        ":root": {
          "--swiper-theme-color": colors.primary.main,
          ...(light ? {} : { colorScheme: "dark" }),
        },
        code: {
          background: colors.info.lighter,
          color: light ? colors.info.dark : colors.alpha.black[100],
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
        iconOutlined: {
          color: colors.alpha.black[50],
        },
        icon: {
          top: "calc(50% - 14px)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiInputAdornment-positionEnd.MuiInputAdornment-outlined": {
            paddingRight: 6,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.alpha.black[50],
          },
          "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary.main,
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        colorPrimary: {
          fontWeight: "bold",
          lineHeight: "40px",
          fontSize: 11,
          background: colors.alpha.black[5],
          color: colors.alpha.black[70],
        },
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
        colorSecondary: {
          background: colors.alpha.black[5],
          color: colors.alpha.black[100],

          "&:hover": {
            background: colors.alpha.black[10],
          },
        },
        deleteIcon: {
          color: light ? colors.error.light : colors.alpha.black[50],

          "&:hover": {
            color: light ? colors.error.main : colors.alpha.black[70],
          },
        },
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
        colorDefault: {
          background: colors.alpha.black[30],
          color: themeColors.trueWhite,
        },
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: {
          alignItems: "center",
        },
        avatar: {
          background: colors.alpha.black[10],
          fontSize: 11,
          color: colors.alpha.black[70],
          fontWeight: "bold",

          "&:first-of-type": {
            border: 0,
            background: "transparent",
          },
        },
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
        textPrimary: {
          "&.Mui-selected": {
            boxShadow: colors.shadows.primary,
          },
          "&.MuiButtonBase-root:hover": {
            background: colors.alpha.black[5],
          },
          "&.Mui-selected.MuiButtonBase-root:hover": {
            background: colors.primary.main,
          },
        },
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
        containedPrimary: {
          "&:hover:not(:disabled)": {
            background: darken(colors.primary.main, 0.1),
            ".MuiTouchRipple-child": {
              background: colors.alpha.trueBlack[70],
            },
          },
        },
        textPrimary: {
          backgroundColor: alpha(colors.primary.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.primary.main, 0.2),
          },
        },
        textSecondary: {
          backgroundColor: alpha(colors.secondary.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.secondary.main, 0.2),
          },
        },
        textSuccess: {
          backgroundColor: alpha(colors.success.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.success.main, 0.2),
          },
        },
        textError: {
          backgroundColor: alpha(colors.error.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.error.main, 0.2),
          },
        },
        textWarning: {
          backgroundColor: alpha(colors.warning.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.warning.main, 0.2),
          },
        },
        textInfo: {
          backgroundColor: alpha(colors.info.main, 0.1),
          "&:disabled": {
            backgroundColor: alpha(themeColors.black, 0.05),
          },
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(colors.info.main, 0.2),
          },
        },
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
        root: {
          color: colors.primary.main,
          background: colors.alpha.white[100],
          transition: "all .2s",

          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: themeColors.trueWhite,
            background: colors.primary.main,
          },
        },
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
        root: {
          background: colors.alpha.black[10],
          border: 0,
          height: 1,
        },
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
        wrapper: {
          background: colors.alpha.white[100],
          fontWeight: "bold",
          height: 24,
          lineHeight: "24px",
          marginTop: -12,
          color: "inherit",
          textTransform: "uppercase",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          padding: 0,
        },
        elevation0: {
          boxShadow: "none",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: colors.alpha.black[10],
        },
        elevation: {
          boxShadow: colors.shadows.card,
        },
        elevation2: {
          boxShadow: colors.shadows.cardSm,
        },
        elevation16: {
          boxShadow: colors.shadows.cardMd,
        },
        elevation24: {
          boxShadow: colors.shadows.cardLg,
        },
        outlined: {
          boxShadow: colors.shadows.card,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
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
        root: {
          "& .MuiSlider-valueLabelCircle, .MuiSlider-valueLabelLabel": {
            transform: "none",
          },
          "& .MuiSlider-valueLabel": {
            borderRadius: 6,
            background: colors.alpha.black[100],
            color: colors.alpha.white[100],
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
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
            backgroundColor: light ? alpha(colors.primary.lighter, 0.4) : colors.alpha.black[10],
          },
          "& .MuiMenuItem-root.MuiButtonBase-root:active": {
            backgroundColor: alpha(colors.primary.lighter, light ? 0.4 : 0.2),
          },
          "& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root": {
            opacity: 0.2,
          },
        },
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
        indicator: {
          height: 38,
          minHeight: 38,
          borderRadius: 6,
          border: "1px solid " + colors.primary.dark,
          boxShadow: "0px 2px 10px " + colors.primary.light,
        },
        scrollableX: {
          overflow: "visible !important",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
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
            color: themeColors.trueWhite,
            zIndex: 5,
          },
          "&:hover": {
            color: light ? colors.alpha.black[100] : colors.alpha.trueWhite[70],
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          padding: 8,

          "& .MuiMenuItem-root.MuiButtonBase-root": {
            fontSize: 12,
            marginTop: 1,
            marginBottom: 1,
            transition: "all .2s",
            color: colors.alpha.black[70],

            "& .MuiTouchRipple-root": {
              opacity: 0.2,
            },

            "&:hover, &:active, &.active, &.Mui-selected": {
              color: colors.alpha.black[100],
              background: alpha(colors.primary.lighter, light ? 0.4 : 0.2),
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          paddingLeft: 6,
          paddingRight: 12,
          background: "transparent",
          transition: "all .2s",

          "&:hover, &:active, &.active, &.Mui-selected": {
            color: colors.alpha.black[100],
            background: alpha(colors.primary.lighter, light ? 0.4 : 0.2),
          },
          "&.Mui-selected:hover": {
            background: alpha(colors.primary.lighter, light ? 0.4 : 0.2),
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&.MuiButtonBase-root": {
            color: colors.secondary.main,

            "&:hover, &:active, &.active, &.Mui-selected": {
              color: colors.alpha.black[100],
              background: light ? lighten(colors.primary.lighter, 0.5) : alpha(colors.primary.lighter, 0.2),
            },
          },
        },
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
        },
        clearIndicator: {
          background: light ? colors.error.lighter : alpha(colors.error.lighter, 0.2),
          color: colors.error.main,
          marginRight: 8,

          "&:hover": {
            background: light ? colors.error.lighter : alpha(colors.error.lighter, 0.3),
            ...(light ? { color: colors.error.dark } : {}),
          },
        },
        popupIndicator: {
          color: colors.alpha.black[light ? 50 : 70],

          "&:hover": {
            background: light ? colors.primary.lighter : alpha(colors.primary.lighter, 0.2),
            ...(light ? { color: colors.primary.main } : {}),
          },
        },
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
        head: {
          background: colors.alpha.black[5],
        },
        root: {
          transition: "background-color .2s",

          "&.MuiTableRow-hover:hover": {
            backgroundColor: light ? colors.alpha.black[5] : alpha(colors.alpha.black[5], 0.05),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: colors.alpha.black[10],
          fontSize: 12,
          padding: 6,
          lineHeight: "1rem",
        },
        head: {
          textTransform: "uppercase",
          fontSize: 11,
          fontWeight: "bold",
          color: colors.alpha.black[70],
          lineHeight: "1rem",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          lineHeight: 1.5,
          fontSize: 12,
        },
        standardInfo: {
          color: colors.info.main,
        },
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
        outlined: {
          backgroundColor: colors.alpha.white[100],
          boxShadow: "0 0 0 6px " + colors.alpha.white[100],
        },
        outlinedPrimary: {
          backgroundColor: colors.alpha.white[100],
          boxShadow: "0 0 0 6px " + colors.alpha.white[100],
        },
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          position: "absolute",
          height: "100%",
          top: 0,
          borderRadius: 50,
          backgroundColor: colors.alpha.black[10],
        },
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
        tooltip: {
          backgroundColor: alpha(colors.alpha.black["100"], 0.95),
          padding: "4px 8px",
          fontSize: 11,
          // Fixes a visual glitch with Safari where a short tooltip text would wrap the last word to the next line
          width: "calc(100% + .25px)",
        },
        arrow: {
          color: alpha(colors.alpha.black["100"], 0.95),
        },
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
        thumb: {
          border: "1px solid " + colors.alpha.black[30],
          boxShadow: "0px 9px 14px " + colors.alpha.black[10] + ", 0px 2px 2px " + colors.alpha.black[10],
        },
        track: {
          backgroundColor: colors.alpha.black[5],
          border: "1px solid " + colors.alpha.black[10],
          boxShadow: "inset 0px 1px 1px " + colors.alpha.black[10],
          opacity: 1,
        },
        colorPrimary: {
          "& .MuiSwitch-thumb": {
            backgroundColor: colors.alpha.white[100],
          },

          "&.Mui-checked .MuiSwitch-thumb": {
            backgroundColor: colors.primary.main,
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          paddingTop: 20,
          paddingBottom: 20,
          background: colors.alpha.black[5],
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.MuiStepIcon-completed": {
            color: colors.success.main,
          },
        },
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
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: "wave",
        sx: {
          bgcolor: colors.alpha.black[10],
        },
      },
    },
  },
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
      color: colors.alpha.black[100],
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
      color: colors.alpha.black[50],
    },
    subtitle1: {
      fontSize: 12,
      color: colors.alpha.black[70],
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: 13,
      color: colors.alpha.black[70],
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

/**
 * Creates a theme from a color scheme.
 * @param light Whether the theme should be light or dark.
 * @returns The created theme.
 */
const createThemeFromScheme = (light: boolean): Theme => {
  const themeColors = generateThemeColors(light);
  const colors = generateColors(light, themeColors);
  return createTheme(generateScheme(light, themeColors, colors) as any);
};

export const Dark = createThemeFromScheme(false);
export const Light = createThemeFromScheme(true);
