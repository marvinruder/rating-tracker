import DeleteIcon from "@mui/icons-material/Delete";
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  Dialog,
  FormControl,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { User } from "@rating-tracker/commons";
import {
  messageTypeArray,
  messageTypeName,
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
  ADMINISTRATIVE_ACCESS,
  usersAPIPath,
} from "@rating-tracker/commons";
import { useState } from "react";

import { DeleteUser } from "../../../components/dialogs/user/DeleteUser";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

const accessRightArray = [GENERAL_ACCESS, WRITE_STOCKS_ACCESS, ADMINISTRATIVE_ACCESS] as const;
type AccessRight = (typeof accessRightArray)[number];

const accessRightLabel: Record<AccessRight, string> = {
  [GENERAL_ACCESS]: "General Access",
  [WRITE_STOCKS_ACCESS]: "Write Stocks",
  [ADMINISTRATIVE_ACCESS]: "Administrative Access",
};

/**
 * This component displays information about a user in a table row that is used in the user list.
 * @param props The properties of the component.
 * @returns The component.
 */
const UserRow = (props: UserRowProps): JSX.Element => {
  const theme = useTheme();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  /**
   * A dropdown menu for the access rights.
   * @returns The component.
   */
  const AccessRightSelect = (): JSX.Element => {
    const [accessRights, setAccessRights] = useState<number>(props.user.accessRights);

    const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

    return (
      <Select
        slotProps={{ input: { "aria-label": `Access rights of user “${props.user.name}”` } }}
        size="small"
        multiple
        value={[props.user.accessRights]}
        onClose={() =>
          accessRights !== props.user.accessRights && // Only send the request if the access rights have changed
          api
            .patch(usersAPIPath + `/${props.user.email}`, {
              params: { accessRights: accessRights },
            })
            .then(
              () => (
                props.refetchUsers(),
                setNotification({
                  severity: "success",
                  title: "User access rights updated",
                  message:
                    `Access rights for the user ${props.user.name} ` +
                    `(${props.user.email}) have been updated successfully`,
                })
              ),
            ) // Update the user in the table, show a notification, and close the dialog on success.
            .catch((e) => setErrorNotificationOrClearSession(e, "updating user"))
        }
        renderValue={() => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {accessRightArray
              .filter((accessRight) => props.user.hasAccessRight(accessRight))
              .map((accessRight) => (
                <Chip key={accessRight} label={accessRightLabel[accessRight]} size="small" />
              ))}
          </Box>
        )}
      >
        {accessRightArray.map((accessRight) => (
          <MenuItem
            key={accessRight}
            value={accessRightLabel[accessRight]}
            sx={{ p: 0 }}
            onClick={() => setAccessRights(accessRights ^ accessRight)}
          >
            <Checkbox
              inputProps={{ "aria-labelledby": `access-right-${accessRight}-label` }}
              checked={(accessRights & accessRight) === accessRight}
              disableRipple
            />
            <ListItemText id={`access-right-${accessRight}-label`} primary={accessRightLabel[accessRight]} />
          </MenuItem>
        ))}
      </Select>
    );
  };

  return props.user ? (
    // Actual user row
    <TableRow hover sx={{ height: 89 }}>
      {/* Name and Logo */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{ width: 64, height: 64, m: "4px", background: "none" }}
            src={props.user.avatar}
            alt={props.user.name}
            slotProps={{ img: { loading: "lazy" } }}
          />
          <Box width={8} />
          <Box>
            <Typography variant="body1" fontWeight="bold" color="text.primary" width={160} noWrap>
              {props.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" width={160} noWrap>
              {props.user.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {/* Phone Number */}
      <TableCell>
        <Typography variant="body1" color="text.primary" width={135} noWrap>
          {props.user.phone}
        </Typography>
      </TableCell>
      {/* Subscriptions */}
      <TableCell>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            listStyle: "none",
            p: 0,
            m: -0.5,
            width: 250,
          }}
          component="ul"
        >
          {messageTypeArray
            .filter((messageType) => props.user.hasSubscribedTo(messageType))
            .map((messageType) => (
              <li key={messageType} style={{ margin: 0, padding: theme.spacing(0.5) }}>
                <Chip key={messageType} label={messageTypeName[messageType]} size="small" />
              </li>
            ))}
        </Box>
      </TableCell>
      {/* Access Rights */}
      <TableCell>
        <FormControl sx={{ m: 0, width: 280 }}>
          <AccessRightSelect />
        </FormControl>
      </TableCell>
      {/* Actions */}
      {props.refetchUsers && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Tooltip title="Delete User" arrow>
            <Box display="inline-block">
              <IconButton
                aria-label={`Delete user “${props.user.name}”`}
                color="error"
                size="small"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>
      )}
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteUser user={props.user} onDelete={props.refetchUsers} onClose={() => setDeleteDialogOpen(false)} />
      </Dialog>
    </TableRow>
  ) : (
    // Skeleton of a user row
    <TableRow hover sx={{ height: 89 }}>
      {/* User */}
      <TableCell>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ m: "4px" }} />
          <Box width={8} />
          <Box>
            <Typography variant="body1">
              <Skeleton width={135} />
            </Typography>
            <Typography variant="body2">
              <Skeleton width={160} />
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {/* Phone Number */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={135} />
        </Typography>
      </TableCell>
      {/* Subscriptions */}
      <TableCell>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            listStyle: "none",
            p: 0,
            m: -0.5,
            width: 250,
          }}
          component="ul"
        >
          <li style={{ margin: 0, padding: theme.spacing(0.5) }}>
            <Skeleton width={100} height={24} />
          </li>
          <li style={{ margin: 0, padding: theme.spacing(0.5) }}>
            <Skeleton width={100} height={24} />
          </li>
          <li style={{ margin: 0, padding: theme.spacing(0.5) }}>
            <Skeleton width={100} height={24} />
          </li>
        </Box>
      </TableCell>
      {/* Access Rights */}
      <TableCell>
        <Skeleton width={280} height={69} />
      </TableCell>
      {/* Actions */}
      <TableCell style={{ whiteSpace: "nowrap" }}>
        <Skeleton
          sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
          variant="circular"
          width={2 * (theme.typography.body1.fontSize as number) - 4}
          height={2 * (theme.typography.body1.fontSize as number) - 4}
        />
      </TableCell>
    </TableRow>
  );
};

/**
 * Properties for the UserRow component
 */
interface UserRowProps {
  /**
   * The user to display
   */
  user?: User;
  /**
   * A method to update the user list, e.g. after a user was modified or deleted.
   */
  refetchUsers?: () => void;
}

export default UserRow;
