import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Grid, LinearProgress, Typography, useTheme } from "@mui/material";

import { formatPercentage } from "../../utils/formatters";

/**
 * A component showing a difference between two values using a progress bar.
 * @param props The properties of the component.
 * @returns The component.
 */
const DiffProgressBar = (props: DiffProgressBarProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <Typography variant="subtitle1" sx={{ display: "flex", justifyContent: "space-between" }}>
        <span>
          <span style={{ fontWeight: "bold" }}>{props.name}</span>
          {`\u2002${formatPercentage(props.actual, { fixed: 1 })}`}
        </span>
        <span>Target: {formatPercentage(props.target, { fixed: 1 })}</span>
      </Typography>
      <Grid container display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Grid item flexGrow={1} mr={1}>
          <LinearProgress
            aria-valuenow={props.actual}
            aria-label={`Actual percentage of “${props.name}”`}
            variant="buffer"
            value={Math.min(props.actual, props.target) * 100}
            valueBuffer={Math.max(props.actual, props.target) * 100}
            sx={{
              ".MuiLinearProgress-bar": { transition: "none" },
              ".MuiLinearProgress-bar1Buffer": { backgroundColor: theme.palette.primary.main },
              ".MuiLinearProgress-bar2Buffer": {
                backgroundColor: props.actual > props.target ? theme.palette.success.main : theme.palette.error.main,
              },
              ".MuiLinearProgress-dashed": {
                animation: "none",
                backgroundImage: "none",
                backgroundColor: theme.colors.primary.lighter,
              },
            }}
          />
        </Grid>
        <Grid item minWidth={55}>
          <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="flex-end">
            {Math.abs(props.actual - props.target) < 0.0005 ? (
              "\u00b10\u2009%"
            ) : (
              <>
                {props.actual > props.target ? (
                  <KeyboardArrowUpIcon color="success" fontSize="inherit" />
                ) : (
                  <KeyboardArrowDownIcon color="error" fontSize="inherit" />
                )}
                {` ${formatPercentage(props.actual - props.target, { fixed: 1, forceSign: true })}`}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

/**
 * Properties for the DiffProgressBar component.
 */
interface DiffProgressBarProps {
  /**
   * The name of the property to show the difference for.
   */
  name: string;
  /**
   * The target value.
   */
  target: number;
  /**
   * The actual value.
   */
  actual: number;
}

export default DiffProgressBar;
