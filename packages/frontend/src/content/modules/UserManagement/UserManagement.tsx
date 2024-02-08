import { Card, Container } from "@mui/material";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";

import UserManagementHeader from "./UserManagementHeader";
import UserTable from "./UserTable";

/**
 * A module that displays a list of users.
 * @returns The component.
 */
const UserManagementModule = (): JSX.Element => {
  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <UserManagementHeader />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card>
          <UserTable />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default UserManagementModule;
