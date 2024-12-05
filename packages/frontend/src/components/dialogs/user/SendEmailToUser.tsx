import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SendIcon from "@mui/icons-material/Send";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid2 as Grid,
  Chip,
  Avatar,
  Box,
} from "@mui/material";
import type { EmailTemplate, User } from "@rating-tracker/commons";
import { emailTemplateArray, emailTemplateDescriptions, handleResponse } from "@rating-tracker/commons";
import { useEffect, useState } from "react";

import emailClient from "../../../api/email";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to send an email to a user.
 * @param props The properties of the component.
 * @returns The component.
 */
export const SendEmailToUser = (props: SendEmailToUserProps): React.JSX.Element => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templatePreview, setTemplatePreview] = useState<{
    from: string;
    to: string;
    subject: string;
    text: string | null;
  } | null>(null);
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  useEffect(
    () =>
      selectedTemplate
        ? void emailClient[":email"][":template"].preview
            .$get({ param: { email: props.user.email, template: selectedTemplate } })
            .then(handleResponse)
            .then((response) => setTemplatePreview(response.data))
            .catch((e) => setErrorNotificationOrClearSession(e, "retrieving email preview"))
        : setTemplatePreview(null),
    [selectedTemplate],
  );

  /**
   * Sends an email to the user.
   * @returns A {@link Promise} that resolves when the email was sent and the dialog was closed.
   */
  const sendEmailToUser = (): Promise<void> => (
    setRequestInProgress(true),
    emailClient[":email"][":template"]
      .$post({ param: { email: props.user.email, template: selectedTemplate! } })
      .then(handleResponse)
      .then(props.onClose)
      .catch((e) => setErrorNotificationOrClearSession(e, "sending email to user"))
      .finally(() => setRequestInProgress(false))
  );

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Send Email to User “{props.user.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Select an email template from the list below:
        </Typography>
        <List
          disablePadding
          sx={(theme) => ({
            mb: 2,
            " > .MuiListItem-root": { borderTop: `1px solid ${theme.palette.divider}` },
            " > .MuiListItem-root:last-child": { borderBottom: `1px solid ${theme.palette.divider}` },
          })}
        >
          {emailTemplateArray.map((template) => (
            <ListItem key={template} disablePadding disableGutters>
              <ListItemButton
                onClick={() => setSelectedTemplate((prev) => (prev === template ? null : template))}
                selected={template === selectedTemplate}
              >
                <ListItemText
                  primary={template}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                  secondary={emailTemplateDescriptions[template]}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Preview
        </Typography>
        {templatePreview === null ? (
          <Box sx={{ minHeight: 147, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="subtitle1">Select an email template to preview it here.</Typography>
          </Box>
        ) : (
          <Grid container spacing={1} sx={{ minHeight: 147, alignContent: "start" }}>
            <Grid size={{ xs: 3, sm: 2, md: 1.5 }} sx={{ alignContent: "center" }}>
              <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                From:
              </Typography>
            </Grid>
            <Grid size={{ xs: 9, sm: 10, md: 10.5 }}>
              <Chip
                size="small"
                sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })}
                icon={<QueryStatsIcon color="primary" />}
                label={templatePreview.from}
              />
            </Grid>
            <Grid size={{ xs: 3, sm: 2, md: 1.5 }} sx={{ alignContent: "center" }}>
              <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                To:
              </Typography>
            </Grid>
            <Grid size={{ xs: 9, sm: 10, md: 10.5 }}>
              <Chip
                size="small"
                sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })}
                avatar={<Avatar alt={props.user.name} src={props.user.avatar ?? undefined} />}
                label={templatePreview.to}
              />
            </Grid>
            <Grid size={{ xs: 3, sm: 2, md: 1.5 }}>
              <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                Subject:
              </Typography>
            </Grid>
            <Grid size={{ xs: 9, sm: 10, md: 10.5 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {templatePreview.subject}
              </Typography>
            </Grid>
            <Grid size={{ xs: 3, sm: 2, md: 1.5 }}>
              <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                Text:
              </Typography>
            </Grid>
            <Grid size={{ xs: 9, sm: 10, md: 10.5 }}>
              <Typography variant="body1">{templatePreview.text}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          disabled={selectedTemplate === null}
          variant="contained"
          onClick={sendEmailToUser}
          color="primary"
          startIcon={<SendIcon />}
        >
          Send email
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the SendEmailToUser component.
 */
interface SendEmailToUserProps {
  /**
   * The user to send an email to.
   */
  user: User;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
