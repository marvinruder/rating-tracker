import { Slider, styled } from "@mui/material";

const Range52WSlider = styled(Slider)(({ theme }) => ({
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
}));

export default Range52WSlider;
