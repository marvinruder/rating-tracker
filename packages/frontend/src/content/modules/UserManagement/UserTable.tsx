import { FC, useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow, TableContainer } from "@mui/material";
import { User, userListEndpointPath } from "@rating-tracker/commons";
import { baseUrl } from "../../../router";
import UserRow from "./UserRow";
import { useNotification } from "../../../contexts/NotificationContext";

/**
 * The user table component.
 *
 * @returns {JSX.Element} The users table component.
 */
const UserTable: FC = (): JSX.Element => {
  const [count, setCount] = useState<number>(-1);
  const [users, setUsers] = useState<User[]>([]);
  const [usersFinal, setUsersFinal] = useState<boolean>(false);
  const { setErrorNotification } = useNotification();

  /**
   * Get the users from the backend.
   */
  const getUsers = () => {
    setUsersFinal(false);
    axios
      .get(baseUrl + userListEndpointPath)
      .then((res) => {
        setUsers(res.data.map((user: any) => new User(user)));
        setCount(res.data.length);
      })
      .catch((e) => {
        setErrorNotification(e, "fetching users");
        setUsers([]);
        setCount(0);
      })
      .finally(() => setUsersFinal(true));
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <TableContainer>
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
              ? users.map(
                  (
                    user // Render user rows
                  ) => <UserRow user={user} getUsers={getUsers} key={user.email} />
                )
              : [...Array(10)].map(
                  (
                    _,
                    key // Render skeleton rows
                  ) => <UserRow key={key} getUsers={getUsers} />
                )}
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
