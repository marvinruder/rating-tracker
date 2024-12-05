import type { DialogProps } from "@mui/material";
import { Dialog } from "@mui/material";

/**
 * A MUI Dialog that is pinned to the top of the screen.
 * @param props The properties of the component.
 * @returns The component.
 */
const PinnedDialog = (props: DialogProps): React.JSX.Element => {
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
              ".MuiDialogContent-root": { maxHeight: "calc(100dvh - 256px)" },
            },
          })}
    />
  );
};

export default PinnedDialog;
