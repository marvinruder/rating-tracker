import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
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
  handleResponse,
  messageTypeArray,
  messageTypeName,
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
  ADMINISTRATIVE_ACCESS,
} from "@rating-tracker/commons";
import { useState } from "react";

import userClient from "../../../api/user";
import { DeleteUser } from "../../../components/dialogs/user/DeleteUser";
import { SendEmailToUser } from "../../../components/dialogs/user/SendEmailToUser";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import { useStatusContextState } from "../../../contexts/StatusContext";

const accessRightArray = [GENERAL_ACCESS, WRITE_STOCKS_ACCESS, ADMINISTRATIVE_ACCESS] as const;
type AccessRight = (typeof accessRightArray)[number];

const accessRightLabel: Record<AccessRight, string> = {
  [GENERAL_ACCESS]: "General Access",
  [WRITE_STOCKS_ACCESS]: "Write Stocks",
  [ADMINISTRATIVE_ACCESS]: "Administrative Access",
};

/**
 * A dropdown menu for the access rights.
 * @param props The properties of the component.
 * @param props.user The user to display.
 * @param props.refetchUsers A method to update the user list, e.g. after a user was modified or deleted.
 * @returns The component.
 */
const AccessRightSelect = (props: {
  user: NonNullable<UserRowProps["user"]>;
  refetchUsers: NonNullable<UserRowProps["refetchUsers"]>;
}): JSX.Element => {
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
        userClient[":email"]
          .$patch({ param: { email: props.user.email }, json: { accessRights } })
          .then(handleResponse)
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

/**
 * This component displays information about a user in a table row that is used in the user list.
 * @param props The properties of the component.
 * @returns The component.
 */
const UserRow = (props: UserRowProps): JSX.Element => {
  const theme = useTheme();

  const { systemStatus } = useStatusContextState();
  const emailConfigured = systemStatus.services["Email"].status === "success";

  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return props.user ? (
    // Actual user row
    <TableRow hover sx={{ height: 89 }}>
      {/* Name and Logo */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{ width: 64, height: 64, m: "4px", background: "none" }}
            src={props.user.avatar ?? undefined}
            alt={props.user.name}
            slotProps={{ img: { loading: "lazy" } }}
          />
          <Box sx={{ width: 8 }} />
          <Box>
            <Typography variant="body1" noWrap sx={{ fontWeight: "bold", color: "text.primary", width: 160 }}>
              {props.user.name}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: "text.secondary", width: 160 }}>
              {props.user.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {/* Phone Number */}
      <TableCell>
        <Typography variant="body1" noWrap sx={{ color: "text.primary", width: 135 }}>
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
            .filter((messageType) => props.user!.hasSubscribedTo(messageType))
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
          <AccessRightSelect user={props.user!} refetchUsers={props.refetchUsers!} />
        </FormControl>
      </TableCell>
      {/* Actions */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {emailConfigured && (
          <Tooltip title="Send email to user" arrow>
            <Box sx={{ display: "inline-block", mr: 1 }}>
              <IconButton
                aria-label={`Send email to user “${props.user.name}”`}
                color="primary"
                onClick={() => setSendEmailDialogOpen(true)}
              >
                <EmailIcon />
              </IconButton>
            </Box>
          </Tooltip>
        )}
        <Tooltip title="Delete User" arrow>
          <Box sx={{ display: "inline-block" }}>
            <IconButton
              aria-label={`Delete user “${props.user.name}”`}
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Tooltip>
      </TableCell>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteUser user={props.user} onDelete={props.refetchUsers} onClose={() => setDeleteDialogOpen(false)} />
      </Dialog>
      {/* Send Email Dialog */}
      {emailConfigured && (
        <Dialog fullWidth open={sendEmailDialogOpen} onClose={() => setSendEmailDialogOpen(false)}>
          <SendEmailToUser user={props.user} onClose={() => setSendEmailDialogOpen(false)} />
        </Dialog>
      )}
    </TableRow>
  ) : (
    // Skeleton of a user row
    <TableRow hover sx={{ height: 89 }}>
      {/* User */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ m: "4px" }} />
          <Box sx={{ width: 8 }} />
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
            <Skeleton width={120} height={32} />
          </li>
          <li style={{ margin: 0, padding: theme.spacing(0.5) }}>
            <Skeleton width={80} height={32} />
          </li>
        </Box>
      </TableCell>
      {/* Access Rights */}
      <TableCell>
        <Skeleton width={280} height={69} />
      </TableCell>
      {/* Actions */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {emailConfigured && (
          <Skeleton
            sx={{ mr: 1, display: "inline-block", verticalAlign: "middle" }}
            variant="rounded"
            width={40}
            height={40}
          />
        )}
        <Skeleton sx={{ display: "inline-block", verticalAlign: "middle" }} variant="rounded" width={40} height={40} />
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
