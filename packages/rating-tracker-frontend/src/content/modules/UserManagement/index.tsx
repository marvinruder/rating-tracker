import PageHeader from "./PageHeader";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import { Card, Container } from "@mui/material";
import Footer from "../../../components/Footer";

import UserTable from "./UserTable";

/**
 * A module that displays a list of users.
 * @returns {JSX.Element} The component.
 */
const UserManagementModule = (): JSX.Element => {
  return (
    <>
      <PageTitleWrapper maxWidth={false}>
        <PageHeader />
      </PageTitleWrapper>
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
