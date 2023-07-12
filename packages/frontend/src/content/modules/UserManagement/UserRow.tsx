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
import DeleteIcon from "@mui/icons-material/Delete";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import {
  messageTypeArray,
  messageTypeName,
  User,
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
  ADMINISTRATIVE_ACCESS,
  userManagementEndpointPath,
} from "@rating-tracker/commons";
import { useState } from "react";
import { DeleteUser } from "../../../components/dialogs";
import LoadingButton from "@mui/lab/LoadingButton";
import { baseUrl } from "../../../router";
import axios from "axios";
import { useNotification } from "../../../contexts/NotificationContext";

/**
 * This component displays information about a user in a table row that is used in the user list.
 *
 * @param {UserRowProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const UserRow = (props: UserRowProps): JSX.Element => {
  const theme = useTheme();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const accessRightMap = new Map<number, string>();
  accessRightMap.set(GENERAL_ACCESS, "General Access");
  accessRightMap.set(WRITE_STOCKS_ACCESS, "Write Stocks");
  accessRightMap.set(ADMINISTRATIVE_ACCESS, "Administrative Access");

  /**
   * Provides labels for the access rights of the user.
   *
   * @returns {string[]} a list of strings containing access right labels.
   */
  const getAccessRightLabels = (): string[] => {
    const labels: string[] = [];
    for (const accessRightLabel of accessRightMap) {
      if (props.user.hasAccessRight(accessRightLabel[0])) {
        labels.push(accessRightLabel[1]);
      }
    }
    return labels;
  };

  /**
   * A list of checkboxes for the access rights.
   *
   * @returns {JSX.Element} The component.
   */
  const AccessRightCheckboxList = (): JSX.Element => {
    const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
    const [accessRights, setAccessRights] = useState<number>(props.user.accessRights);

    const { setNotification, setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

    /**
     * Updates the user’s access rights in the backend.
     */
    const patchAccessRights = () => {
      setRequestInProgress(true);
      axios
        .patch(baseUrl + userManagementEndpointPath + `/${props.user.email}`, undefined, {
          params: {
            // Only send the parameters that have changed.
            accessRights: accessRights !== props.user.accessRights ? accessRights : undefined,
          },
        })
        .then(
          () => (
            props.getUsers && props.getUsers(),
            setNotification({
              severity: "success",
              title: "User access rights updated",
              message:
                `Access rights for the user ${props.user.name} ` +
                `(${props.user.email}) have been updated successfully`,
            })
            // TODO close select
          ),
        ) // Update the user in the table, show a notification, and close the dialog on success.
        .catch((e) => setErrorNotification(e, "updating user"))
        .finally(() => setRequestInProgress(false));
    };

    const accessRightLabels: { accessRight: number; accessRightLabel: string }[] = [];
    for (const accessRight of accessRightMap) {
      accessRightLabels.push({ accessRight: accessRight[0], accessRightLabel: accessRight[1] });
    }

    return (
      <>
        {accessRightLabels.map((accessRight) => (
          <MenuItem
            key={accessRight.accessRight}
            value={accessRight.accessRightLabel}
            sx={{ p: 0 }}
            onClick={() => setAccessRights(accessRights ^ accessRight.accessRight)}
          >
            <Checkbox checked={(accessRights & accessRight.accessRight) === accessRight.accessRight} disableRipple />
            <ListItemText primary={accessRight.accessRightLabel} />
          </MenuItem>
        ))}
        <Box width="100%" display="flex" justifyContent="flex-end" mt={1}>
          <LoadingButton
            size="small"
            loading={requestInProgress}
            onClick={patchAccessRights}
            disabled={requestInProgress || accessRights === props.user.accessRights}
            variant="contained"
            startIcon={<PublishedWithChangesIcon />}
          >
            Update
          </LoadingButton>
        </Box>
      </>
    );
  };

  return props.user ? (
    // Actual user row
    <TableRow hover sx={{ height: 89 }}>
      {/* Name and Logo */}
      <TableCell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ width: 64, height: 64, m: "4px", background: "none" }} src={props.user.avatar} alt=" " />
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
          {messageTypeArray.map((messageType) =>
            props.user.hasSubscribedTo(messageType) ? (
              <li key={messageType} style={{ margin: 0, padding: theme.spacing(0.5) }}>
                <Chip key={messageType} label={messageTypeName[messageType]} size="small" />
              </li>
            ) : (
              <></>
            ),
          )}
        </Box>
      </TableCell>
      {/* Access Rights */}
      <TableCell>
        <FormControl sx={{ m: 0, width: 280 }}>
          <Select
            size="small"
            multiple
            value={[props.user.accessRights]}
            onChange={() => undefined}
            renderValue={() => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {getAccessRightLabels().map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            <AccessRightCheckboxList />
          </Select>
        </FormControl>
      </TableCell>
      {/* Actions */}
      {props.getUsers && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Tooltip title="Delete User" arrow>
            <Box display="inline-block">
              <IconButton color="error" size="small" onClick={() => setDeleteDialogOpen(true)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>
      )}
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteUser user={props.user} getUsers={props.getUsers} onClose={() => setDeleteDialogOpen(false)} />
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
      {props.getUsers && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Skeleton
            sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
        </TableCell>
      )}
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
  getUsers?: () => void;
}

export default UserRow;
