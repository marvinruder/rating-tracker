import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow, TableContainer } from "@mui/material";
import type { OmitFunctions } from "@rating-tracker/commons";
import { User, usersEndpointPath } from "@rating-tracker/commons";
import type { FC } from "react";
import { useEffect, useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import UserRow from "./UserRow";

/**
 * The user table component.
 * @returns The users table component.
 */
const UserTable: FC = (): JSX.Element => {
  const [count, setCount] = useState<number>(-1);
  const [users, setUsers] = useState<User[]>([]);
  const [usersFinal, setUsersFinal] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Get the users from the backend.
   */
  const getUsers = () => {
    setUsersFinal(false);
    api
      .get(usersEndpointPath)
      .then((res) => {
        setUsers(res.data.map((user: OmitFunctions<User>) => new User(user)));
        setCount(res.data.length);
      })
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching users");
        setUsers([]);
        setCount(0);
      })
      .finally(() => setUsersFinal(true));
  };

  useEffect(getUsers, []);

  return (
    <>
      <TableContainer sx={{ overscrollBehaviorX: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Name and Avatar */}
              <TableCell>User</TableCell>
              {/* Phone Number */}
              <TableCell>Phone</TableCell>
              {/* Subscriptions */}
              <TableCell>Subscriptions</TableCell>
              {/* Access Rights */}
              <TableCell>Access Rights</TableCell>
              {/* Actions */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersFinal
              ? // Render user rows
                users.map((user) => <UserRow user={user} refetchUsers={getUsers} key={user.email} />)
              : // Render skeleton rows
                [...Array(10)].map((_, key) => <UserRow key={key} />)}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell sx={{ border: 0 }}>
                {count} user{count != 1 && "s"}
              </TableCell>
              <TableCell sx={{ border: 0 }} />
              <TableCell sx={{ border: 0 }} />
              <TableCell sx={{ border: 0 }} />
              <TableCell sx={{ border: 0 }} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default UserTable;
