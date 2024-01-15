import type { SliderProps } from "@mui/material";
import { Slider, SliderMarkLabel, useTheme } from "@mui/material";
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
      slots={{
        mark: () => undefined, // no marks
        markLabel: (props) => {
          const style = props.style ?? {};
          style.top = 18;
          // Align the labels based directly on the value
          const position = Number(props.style.left.replace("%", ""));
          if (position <= Number.EPSILON) style.transform = "translateX(0%)";
          if (position >= 100 * (1 - Number.EPSILON)) style.transform = "translateX(-100%)";
          return <SliderMarkLabel {...props} style={style} />;
        },
      }}
      sx={{
        ...props.sx,
        "@media (pointer: coarse)": { padding: "13px 0" },
        "& .MuiSlider-valueLabel": {
          fontSize: theme.typography.body2.fontSize,
          top: 0,
          backgroundColor: "unset",
          color: theme.palette.text.primary,
        },
      }}
    />
  );
};
