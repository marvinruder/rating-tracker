import { Slider, SliderMarkLabel, useTheme } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { currencyMinorUnits } from "@rating-tracker/commons";
import React from "react";

/**
 * A slider that is used to display a 52-week range.
 * @param props The properties of the component.
 * @returns The component.
 */
export const Range52WSlider = (props: Range52WSliderProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Slider
      {...props}
      aria-label={`52 Week Range of “${props.stock.name}”`}
      size="small"
      sx={{
        mb: `${-0.5 * (theme.typography.body2.fontSize as number)}px`,
        mt: `${0.5 * (theme.typography.body2.fontSize as number)}px`,
        width: props.width,
        "@media (pointer: coarse)": { padding: "13px 0" },
        "& .MuiSlider-valueLabel": {
          fontSize: theme.typography.body2.fontSize,
          top: 0,
          backgroundColor: "unset",
          color: theme.palette.text.primary,
        },
      }}
      value={props.stock.lastClose}
      min={props.stock.low52w}
      max={props.stock.high52w}
      marks={[
        {
          value: props.stock.low52w,
          label: props.stock.low52w?.toFixed(currencyMinorUnits[props.stock.currency]),
        },
        {
          value: props.stock.high52w,
          label: props.stock.high52w?.toFixed(currencyMinorUnits[props.stock.currency]),
        },
      ]}
      valueLabelDisplay="on"
      valueLabelFormat={(value) => value.toFixed(currencyMinorUnits[props.stock.currency])}
      disabled
      slots={{
        mark: () => undefined, // no marks
        markLabel: (props: { style: React.CSSProperties }) => {
          const style = props.style ?? {};
          style.top = 18;
          // Align the labels based directly on the value
          const position = Number(props.style.left.toString().replace("%", ""));
          if (position <= Number.EPSILON) style.transform = "translateX(0%)";
          if (position >= 100 * (1 - Number.EPSILON)) style.transform = "translateX(-100%)";
          return <SliderMarkLabel {...props} style={style} />;
        },
      }}
    />
  );
};

/**
 * Properties for the Range52WSlider component.
 */
interface Range52WSliderProps {
  /**
   * The stock to display the 52-week range for.
   */
  stock: Stock;
  /**
   * The width of the slider.
   */
  width?: number;
}
