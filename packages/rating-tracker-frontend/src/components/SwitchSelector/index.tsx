import { Typography, useTheme } from "@mui/material";
import { default as SwitchSelectorBase } from "react-switch-selector";
import "./switchSelector.css";

const SwitchSelector = (props: SwitchSelectorProps) => {
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
            props.value === option.value
              ? theme.colors.switchSelector.selected
              : theme.colors.switchSelector.unselected
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

interface SwitchSelectorProps {
  value: string;
  setValue: (value: string) => void;
  leftValue: string;
  leftLabel: string;
  rightValue: string;
  rightLabel: string;
}

export default SwitchSelector;
