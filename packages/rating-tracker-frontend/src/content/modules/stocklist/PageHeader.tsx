import { Typography, Button, Grid, Tooltip } from "@mui/material";

import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";

function PageHeader() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Stock List
        </Typography>
        <Typography variant="subtitle2">
          This list shows all stocks currently available in this service
        </Typography>
      </Grid>
      <Grid item>
        <Tooltip title="Not yet implemented" arrow>
          <span>
            <Button
              sx={{ mt: { xs: 2, md: 0 } }}
              variant="contained"
              startIcon={<AddTwoToneIcon fontSize="small" />}
              disabled
            >
              New Stock
            </Button>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
