import { basePath, emailAPIPath, emailPreviewEndpointSuffix } from "@rating-tracker/commons";
import type { SMTPServerAddress } from "smtp-server";

import { emailMessages } from "../../test/live.test";
import {
  expectRouteToBePrivate,
  expectSpecialAccessRightsToBeRequired,
  type LiveTestSuite,
} from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Email API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "generates an email preview",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test${emailPreviewEndpointSuffix}`,
    );
    await expectSpecialAccessRightsToBeRequired(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test${emailPreviewEndpointSuffix}`,
    );

    // attempting to generate an email preview for a non-existing user returns an error
    let res = await app.request(
      `${basePath}${emailAPIPath}/${encodeURIComponent("does.not.exist@example.com")}` +
        `/Test${emailPreviewEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(404);

    // attempting to generate an email preview based on an invalid template returns an error
    res = await app.request(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Hello${emailPreviewEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(400);

    res = await app.request(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test${emailPreviewEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.from).toBe('"Rating Tracker" <ratingtracker@example.com>');
    expect(body.to).toBe('"Jane Doe" <jane.doe@example.com>');
    expect(body.subject).toBe("Rating Tracker Test email");
    expect(body.text).toContain(`This is a test email from Rating Tracker at https://${process.env.FQDN}`);

    res = await app.request(
      `${basePath}${emailAPIPath}/${encodeURIComponent("john.doe@example.com")}/Welcome${emailPreviewEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.from).toBe('"Rating Tracker" <ratingtracker@example.com>');
    expect(body.to).toBe('"John Doe" <john.doe@example.com>');
    expect(body.subject).toBe("Welcome to Rating Tracker, John Doe!");
    expect(body.text).toContain(`Your account at https://${process.env.FQDN} has been activated. You can now log in`);
  },
});

tests.push({
  testName: "[unsafe] sends an email",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test`,
      "POST",
    );
    await expectSpecialAccessRightsToBeRequired(
      `${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test`,
      "POST",
    );

    // attempting to send an email to a non-existing user returns an error
    let res = await app.request(`${basePath}${emailAPIPath}/${encodeURIComponent("does.not.exist@example.com")}/Test`, {
      method: "POST",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);

    // attempting to send an email based on an invalid template returns an error
    res = await app.request(`${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Hello`, {
      method: "POST",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(400);

    res = await app.request(`${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test`, {
      method: "POST",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(202);

    // Validate the email received by the SMTP server
    expect(emailMessages.length).toBe(1);
    const message = emailMessages[0];
    expect(message.session.hostNameAppearsAs).toBe(process.env.FQDN);
    expect(message.session.user).toBe(process.env.SMTP_USER);
    expect((message.session.envelope.mailFrom as SMTPServerAddress).address).toBe("ratingtracker@example.com");
    expect(message.session.envelope.rcptTo[0].address).toBe("jane.doe@example.com");
    console.debug(message.data);
    expect(message.data).toContain("From: =?UTF-8?Q?Rating_Tracker?= <ratingtracker@example.com>");
    expect(message.data).toContain("To: =?UTF-8?Q?Jane_Doe?= <jane.doe@example.com>");
    expect(message.data).toContain("Subject: =?UTF-8?Q?Rating_Tracker_Test_email?=");
    expect(message.data).toContain(
      `Hello Jane Doe!\n\nThis is a test email from Rating Tracker at https://${process.env.FQDN}.`,
    );
  },
});

tests.push({
  testName: "[unsafe] returns correct errors when SMTP is misconfigured",
  testFunction: async () => {
    process.env.SMTP_HOST = undefined;
    let res = await app.request(`${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test`, {
      method: "POST",
      headers: { Cookie: "id=exampleSessionID" },
    });
    let body = await res.json();
    expect(res.status).toBe(501);
    expect(body.message).toMatch("No SMTP server is configured");

    process.env.SMTP_HOST = "unresolvable";
    res = await app.request(`${basePath}${emailAPIPath}/${encodeURIComponent("jane.doe@example.com")}/Test`, {
      method: "POST",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(502);
    expect(body.message).toMatch("An error occurred while sending the email");
  },
});
