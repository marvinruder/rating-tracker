import { Card, Container } from "@mui/material";

import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";

import UserManagementHeader from "./UserManagementHeader";
import UserTable from "./UserTable";

/**
 * A module that displays a list of users.
 *
 * @returns {JSX.Element} The component.
 */
const UserManagementModule = (): JSX.Element => {
  return (
    <>
      <PageHeaderWrapper maxWidth={false}>
        <UserManagementHeader />
      </PageHeaderWrapper>
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
