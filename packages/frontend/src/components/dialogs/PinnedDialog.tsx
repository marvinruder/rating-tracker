import type { DialogProps } from "@mui/material";
import { Dialog, useTheme } from "@mui/material";

/**
 * A MUI Dialog that is pinned to the top of the screen.
 * @param props The properties of the component.
 * @returns The component.
 */
const PinnedDialog = (props: DialogProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Dialog
      {...props}
      {...(props.fullScreen
        ? {}
        : {
            sx: {
              ...props.sx,
              ".MuiDialog-container": { height: "auto" },
              ".MuiDialog-paperScrollPaper": { maxHeight: "calc(100dvh - 64px)" },
              ".MuiDialogTitle-root": { background: theme.palette.mode === "dark" && theme.colors.alpha.black[5] },
              ".MuiDialogContent-root": { maxHeight: "calc(100dvh - 256px)" },
            },
          })}
    />
  );
};

export default PinnedDialog;
