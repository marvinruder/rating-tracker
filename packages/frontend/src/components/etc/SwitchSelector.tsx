import { Typography, useTheme } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
// @ts-expect-error
import { default as SwitchSelectorBase } from "react-switch-selector";

/**
 * A component that renders a switch selector with two options. The clickable areas of the options contain their labels.
 * @param props The properties of the component.
 * @returns The component.
 */
export const SwitchSelector = (props: SwitchSelectorProps): React.JSX.Element => {
  const theme = useTheme();

  const switchOptions = [
    { label: props.leftLabel, value: props.leftValue },
    { label: props.rightLabel, value: props.rightValue },
  ].map((option: { label: string; value: string }) => {
    return {
      label: (
        <Typography
          variant="button"
          sx={{
            padding: 0.5,
            color:
              props.value === option.value
                ? theme.palette.switchSelector.selected
                : theme.palette.switchSelector.unselected,
          }}
        >
          {option.label}
        </Typography>
      ),
      value: option.value,
    };
  });

  return (
    <SwitchSelectorBase
      options={switchOptions}
      backgroundColor={theme.palette.primary.main}
      selectedBackgroundColor={theme.palette.white.main}
      onChange={props.setValue}
    />
  );
};

/**
 * Properties for the SwitchSelector component.
 */
interface SwitchSelectorProps {
  /**
   * The current value of the switch selector.
   */
  value: string;
  /**
   * A method to set the value of the switch selector.
   * @param value The new value.
   */
  setValue: Dispatch<SetStateAction<string>>;
  /**
   * The value of the left option.
   */
  leftValue: string;
  /**
   * The label of the left option.
   */
  leftLabel: string;
  /**
   * The value of the right option.
   */
  rightValue: string;
  /**
   * The label of the right option.
   */
  rightLabel: string;
}
