import { useContext } from "react";

import { Avatar, Box, Button, Hidden, Typography } from "@mui/material";

import SidebarContext from "packages/rating-tracker-frontend/src/contexts/SidebarContext.js";

const HeaderUserbox = (): JSX.Element => {
  const user = useContext(SidebarContext).user;

  return (
    <Box sx={{ ml: 1, my: 1 }}>
      <Button color="secondary" sx={{ px: 1 }}>
        <Avatar
          variant="rounded"
          alt={user?.name}
          src={user?.avatar ? `data:image/png;base64, ${user?.avatar}` : ""}
        />
        <Hidden mdDown>
          <Box pl={1} textAlign="left">
            <Typography variant="body1" fontWeight="bold">
              {user?.name}
            </Typography>
            <Typography variant="body2">{user?.email}</Typography>
          </Box>
        </Hidden>
      </Button>
    </Box>
  );
};

export default HeaderUserbox;
