import { Button, ButtonGroup, Grid, useTheme } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import type { Stock } from "@rating-tracker/commons";
import { useState } from "react";

import { YahooNavigator } from "../../etc/Navigators";

/**
 * An array of time intervals for which price information is available for a stock.
 */
const intervalArray = ["1y", "1mo"] as const;

/**
 * A time interval for which price information is available for a stock.
 */
type Interval = (typeof intervalArray)[number];

/**
 * A graph visualizing the price of the stock over the last year or month, depending on the selected interval.
 * @param props The properties of the component.
 * @returns The component.
 */
export const Sparkline = (props: SparklineProps): JSX.Element => {
  const [interval, setInterval] = useState<Interval>("1y");

  const toggleInterval = () => setInterval((prev) => intervalArray.at(intervalArray.indexOf(prev) - 1));

  const theme = useTheme();

  /**
   * The price data for the selected interval.
   */
  const data = props.stock["prices" + interval];

  const [start, min, max, end]: number[] = [data.at(0), Math.min(...data), Math.max(...data), data.at(-1)];
  const trend = (end - start) / (max - min) || 0; // 1: largest possible increase, -1: largest possible decrease
  const color = `color-mix(in srgb, ${theme.colors.alpha.black[50]}, ${
    theme.colors.trend[trend > 0 ? "up" : "down"]
  } ${100 * Math.abs(trend)}%)`; // chooses a color from red (down) to grey (steady) to green (up) based on the trend

  return (
    <Grid container direction="row-reverse" width={props.width} height={props.height}>
      <Grid item width={30}>
        <ButtonGroup orientation="vertical" size="small" sx={{ height: "100%" }} fullWidth>
          {intervalArray.map((buttonInterval) => (
            <Button
              sx={{ p: 0, fontSize: theme.typography.caption.fontSize, height: "50%", minWidth: "unset !important" }}
              key={buttonInterval}
              onClick={toggleInterval}
              variant={interval === buttonInterval ? "contained" : "outlined"}
              fullWidth
            >
              {buttonInterval.toUpperCase().substring(0, 2)}
            </Button>
          ))}
        </ButtonGroup>
      </Grid>
      <Grid item width="calc(100% - 30px)">
        <YahooNavigator stock={props.stock}>
          <SparkLineChart data={data} colors={[color]} height={props.height} yAxis={{ min, max }} />
        </YahooNavigator>
      </Grid>
    </Grid>
  );
};

/**
 * Properties for the Sparkline component.
 */
interface SparklineProps {
  /**
   * The stock to display the sparkline for.
   */
  stock: Stock;
  /**
   * The width of the sparkline.
   */
  width: number;
  /**
   * The height of the sparkline.
   */
  height: number;
}
