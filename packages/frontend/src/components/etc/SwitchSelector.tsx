import { Typography, useTheme } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { default as SwitchSelectorBase } from "react-switch-selector";

/**
 * A component that renders a switch selector with two options. The clickable areas of the options contain their labels.
 * @param props The properties of the component.
 * @returns The component.
 */
export const SwitchSelector = (props: SwitchSelectorProps): JSX.Element => {
  const theme = useTheme();

  const switchOptions = [
    { label: props.leftLabel, value: props.leftValue },
    { label: props.rightLabel, value: props.rightValue },
  ].map((option: { label: string; value: string }) => {
    return {
      label: (
        <Typography
          padding={0.5}
          variant="button"
          color={
            props.value === option.value ? theme.colors.switchSelector.selected : theme.colors.switchSelector.unselected
          }
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
      selectedBackgroundColor={theme.colors.alpha.white[100]}
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
