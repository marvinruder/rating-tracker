import { Typography, Grid } from "@mui/material";

import { FC } from "react";

const PageHeader: FC = (): JSX.Element => {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Your Watchlists
        </Typography>
        <Typography variant="subtitle2">View and organize your favorite or otherwise noteworthy stocks.</Typography>
      </Grid>
    </Grid>
  );
};

export default PageHeader;
