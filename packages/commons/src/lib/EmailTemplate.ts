/**
 * An array of email templates.
 */
export const emailTemplateArray = ["Welcome", "Test"] as const;

/**
 * An email template.
 */
export type EmailTemplate = (typeof emailTemplateArray)[number];

/**
 * Checks if an entity is a valid email template.
 * @param entity The entity to check.
 * @returns True if the entity is a valid email template.
 */
export function isEmailTemplate(entity: unknown): entity is EmailTemplate {
  return emailTemplateArray.includes(entity as EmailTemplate);
}

/**
 * A record of descriptions for email templates.
 */
export const emailTemplateDescriptions: Record<EmailTemplate, string> = {
  Welcome: "A welcome email for letting a user know that their account has been activated.",
  Test: "A test email for verifying the SMTP configuration.",
} as const;
