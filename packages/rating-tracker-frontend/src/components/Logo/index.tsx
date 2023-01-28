import { Badge, Box, styled } from "@mui/material";
import { Link } from "react-router-dom";
import packageInfo from "../../../package.json";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.sidebar.textColor};
        display: flex;
        text-decoration: none;
        font-weight: ${theme.typography.fontWeightBold};
`
);

const LogoSignWrapper = styled(Box)(
  () => `
        height: 52px;
        transform: scale(.8);
        font-size: 52px;
`
);

const LogoTextWrapper = styled(Box)(
  ({ theme }) => `
        height: 52px;
        padding-left: ${theme.spacing(2)};
`
);

const LogoText = styled(Box)(
  ({ theme }) => `
        font-size: ${theme.typography.pxToRem(15)};
        font-weight: ${theme.typography.fontWeightBold};
`
);

/**
 * The Logo component, shown at the top of the sidebar. Contains the app name and version.
 *
 * @returns {JSX.Element} The Logo component
 */
const Logo = (): JSX.Element => {
  return (
    <LogoWrapper to="/">
      <LogoSignWrapper>
        <Badge
          badgeContent={packageInfo.version}
          color="success"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <QueryStatsIcon fontSize="inherit" />
        </Badge>
      </LogoSignWrapper>
      <LogoTextWrapper display={"flex"} alignItems={"flex-end"}>
        <LogoText>{packageInfo.title}</LogoText>
      </LogoTextWrapper>
    </LogoWrapper>
  );
};

export default Logo;
