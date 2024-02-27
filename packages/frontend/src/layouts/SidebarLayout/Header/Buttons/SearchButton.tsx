import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Tooltip, Slide } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import type { Ref, ReactElement } from "react";
import { forwardRef, useState, useEffect, Fragment } from "react";

import PinnedDialog from "../../../../components/dialogs/PinnedDialog";
import SelectStock from "../../../../components/dialogs/stock/SelectStock";

/**
 * A transition for sliding in the search bar.
 */
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * A search bar that can be activated from a button in the header.
 * @returns The component.
 */
export const HeaderSearchButton = (): JSX.Element => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /**
     * Checks whether the search shortcut ⌘F or ⌃F was pressed.
     * @param e The keyboard event.
     * @returns Whether the search shortcut was pressed.
     */
    const isSearchShortcut = (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F");

    /**
     * Opens the search bar when the search shortcut is pressed.
     * @param e The keyboard event.
     */
    const searchShortcutHandler = (e: KeyboardEvent) => {
      if (isSearchShortcut(e)) {
        setOpen(true);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    /**
     * Closes the search bar when the ⎋ key is pressed.
     * @param e The keyboard event.
     */
    const escapeKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", escapeKeyHandler, true);
    window.addEventListener("keydown", searchShortcutHandler);

    return () => {
      window.removeEventListener("keydown", escapeKeyHandler);
      window.removeEventListener("keydown", searchShortcutHandler);
    };
  }, []);

  return (
    <>
      <Tooltip arrow title="Search">
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <SearchIcon />
        </IconButton>
      </Tooltip>
      <PinnedDialog
        open={open}
        TransitionComponent={Transition}
        maxWidth="xs"
        fullWidth
        onClose={() => setOpen(false)}
        PaperProps={{ elevation: 16 }}
      >
        <SelectStock title="Search for a stock by name or symbol" onClose={() => setOpen(false)} />
      </PinnedDialog>
    </>
  );
};
