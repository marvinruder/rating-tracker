import { Slider, SliderProps, useTheme } from "@mui/material";
import { FC } from "react";

/**
 * A slider that is used to display a 52-week range.
 *
 * @param {SliderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const Range52WSlider: FC<SliderProps> = (props: SliderProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Slider
      {...props}
      sx={{
        ...props.sx,
        "@media (pointer: coarse)": {
          padding: "13px 0",
        },
        "& .MuiSlider-valueLabel": {
          fontSize: theme.typography.body2.fontSize,
          top: 0,
          backgroundColor: "unset",
          color: theme.palette.text.primary,
        },
        "& .MuiSlider-mark": {
          display: "none",
        },
        "& .MuiSlider-markLabel": {
          top: 18,
          transform: "translateX(-100%)",
          "&Active": {
            transform: "translateX(0%)",
          },
        },
      }}
    />
  );
};
