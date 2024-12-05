import { Typography, Grid2 as Grid } from "@mui/material";
import type { FC } from "react";

/**
 * A header for the user list page. It contains the user list filters and column filter.
 * @returns The component.
 */
const UserManagementHeader: FC = (): React.JSX.Element => {
  return (
    <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Grid>
        <Typography variant="h3" component="h3" gutterBottom>
          User Management
        </Typography>
        <Typography variant="subtitle2">
          This list shows all users currently registered for the Rating Tracker.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default UserManagementHeader;
