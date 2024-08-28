import { z } from "zod";

/**
 * WebAuthn Relying Parties may use `AttestationConveyancePreference` to specify their preference regarding attestation
 * conveyance during credential generation.
 */
const AttestationConveyancePreferenceSchema = z.enum(["direct", "enterprise", "indirect", "none"], {
  description:
    "WebAuthn Relying Parties may use `AttestationConveyancePreference` to specify their preference regarding " +
    "attestation conveyance during credential generation.",
});

/**
 * This is a dictionary containing the client extension input values for zero or more WebAuthn Extensions.
 */
const AuthenticationExtensionsClientInputsSchema = z.object(
  {
    appid: z.string({ description: "A single `USVString` specifying a FIDO AppID." }).optional(),
    credProps: z
      .boolean({
        description: "The Boolean value `true` to indicate that this extension is requested by the Relying Party.",
      })
      .optional(),
    hmacCreateSecret: z
      .boolean({
        description: "A boolean value to indicate that this extension is requested by the Relying Party.",
      })
      .optional(),
  },
  {
    description:
      "This is a dictionary containing the client extension input values for zero or more WebAuthn Extensions.",
  },
);

/**
 * This is a dictionary containing the client extension output values for zero or more WebAuthn Extensions.
 */
const AuthenticationExtensionsClientOutputsSchema = z.object(
  {
    appid: z
      .boolean({
        description:
          "Returns the value of output. If `true`, the AppID was used and thus, when verifying the assertion, the " +
          "Relying Party MUST expect the rpIdHash to be the hash of the AppID, not the RP ID.",
      })
      .optional(),
    credProps: z
      .object({
        rk: z
          .boolean({
            description:
              "This OPTIONAL property, known abstractly as the resident key credential property (i.e., client-side " +
              "discoverable credential property), is a Boolean value indicating whether the `PublicKeyCredential` " +
              "returned as a result of a registration ceremony is a client-side discoverable credential. " +
              "If `rk` is `true`, the credential is a discoverable credential. if `rk` is `false`, the credential is " +
              "a server-side credential. If `rk` is not present, it is not known whether the credential is a " +
              "discoverable credential or a server-side credential.",
          })
          .optional(),
      })
      .optional(),
    hmacCreateSecret: z
      .boolean({
        description: "Boolean `true` value indicating that the authenticator has processed the extension.",
      })
      .optional(),
  },
  {
    description:
      "This is a dictionary containing the client extension output values for zero or more WebAuthn Extensions.",
  },
);

/**
 * This enumeration’s values describe authenticators' attachment modalities. Relying Parties use this to express a
 * preferred authenticator attachment modality when calling `navigator.credentials.create()` to create a credential.
 */
const AuthenticatorAttachmentSchema = z.enum(["platform", "cross-platform"], {
  description:
    "This enumeration’s values describe authenticators' attachment modalities. Relying Parties use this to express a " +
    "preferred authenticator attachment modality when calling `navigator.credentials.create()` to create a credential.",
});

/**
 * Authenticators may implement various transports for communicating with clients. This enumeration defines hints as to
 * how clients might communicate with a particular authenticator in order to obtain an assertion for a specific
 * credential.
 */
const AuthenticatorTransportSchema = z.enum(["ble", "cable", "hybrid", "internal", "nfc", "smart-card", "usb"], {
  description:
    "Authenticators may implement various transports for communicating with clients. This enumeration defines hints " +
    "as to how clients might communicate with a particular authenticator in order to obtain an assertion for a " +
    "specific credential.",
});

/**
 * This enumeration defines the valid credential types. It is an extension point; values can be added to it in the
 * future, as more credential types are defined. The values of this enumeration are used for versioning the
 * Authentication Assertion and attestation structures according to the type of the authenticator.
 *
 * Currently one credential type is defined, namely `public-key`.
 */
const PublicKeyCredentialTypeSchema = z.enum(["public-key"], {
  description:
    "This enumeration defines the valid credential types. It is an extension point; values can be added to it in the " +
    "future, as more credential types are defined. The values of this enumeration are used for versioning the " +
    "Authentication Assertion and attestation structures according to the type of the authenticator. " +
    "Currently one credential type is defined, namely `public-key`.",
});

/**
 * This enumeration’s values describe the Relying Party's requirements for client-side discoverable credentials
 * (formerly known as resident credentials or resident keys).
 */
const ResidentKeyRequirementSchema = z.enum(["discouraged", "preferred", "required"], {
  description:
    "This enumeration’s values describe the Relying Party's requirements for client-side discoverable credentials " +
    "(formerly known as resident credentials or resident keys).",
});

/**
 * A WebAuthn Relying Party may require user verification for some of its operations but not for others, and may use
 * this type to express its needs.
 */
const UserVerificationRequirementSchema = z.enum(["discouraged", "preferred", "required"], {
  description:
    "A WebAuthn Relying Party may require user verification for some of its operations but not for others, and may " +
    "use this type to express its needs.",
});

/**
 * This dictionary contains the attributes that are specified by a caller when referring to a public key credential as
 * an input parameter to the `create()` or `get()` methods. It mirrors the fields of the `PublicKeyCredential` object
 * returned by the latter methods.
 */
const CredentialDescriptorSchema = z.object(
  {
    type: PublicKeyCredentialTypeSchema.describe(
      "This member contains the type of the public key credential the caller is referring to. The value SHOULD be a " +
        "member of `PublicKeyCredentialType` but client platforms MUST ignore any `PublicKeyCredentialDescriptor` " +
        "with an unknown type.",
    ),
    id: z.string({
      description: "This member contains the credential ID of the public key credential the caller is referring to.",
    }), // .base64url(),
    transports: z
      .array(AuthenticatorTransportSchema, {
        description:
          "This OPTIONAL member contains a hint as to how the client might communicate with the managing " +
          "authenticator of the public key credential the caller is referring to. The values SHOULD be members of " +
          "`AuthenticatorTransport` but client platforms MUST ignore unknown values.",
      })
      .optional(),
  },
  {
    description:
      "This dictionary contains the attributes that are specified by a caller when referring to a public key " +
      "credential as an input parameter to the `create()` or `get()` methods. It mirrors the fields of the " +
      "`PublicKeyCredential` object returned by the latter methods.",
  },
);

/**
 * The PublicKeyCredentialUserEntity dictionary is used to supply additional user account attributes when creating a
 * new credential.
 */
const CredentialUserEntity = z.object(
  {
    id: z.string({
      description:
        "The user handle of the user account entity. A user handle is an opaque byte sequence with a maximum size of " +
        "64 bytes, and is not meant to be displayed to the user.",
    }),
    name: z.string({
      description:
        "A human-palatable identifier for a user account. It is intended only for display, i.e., aiding the user in " +
        'determining the difference between user accounts with similar displayNames. For example, "alexm", ' +
        '"alex.mueller@example.com" or "+14255551234".',
    }),
    displayName: z.string({
      description:
        'A human-palatable name for the user account, intended only for display. For example, "Alex Müller" or ' +
        '"田中倫". The Relying Party SHOULD let the user choose this, and SHOULD NOT restrict the choice more than ' +
        "necessary.",
    }),
  },
  {
    description:
      "The PublicKeyCredentialUserEntity dictionary is used to supply additional user account attributes when " +
      "creating a new credential.",
  },
);

/**
 * An object specifying the desired attributes of the to-be-created public key credential.
 */
export const RegistrationOptionsSchema = z.object(
  {
    challenge: z.string({
      description:
        "This member contains a challenge intended to be used for generating the newly created credential’s " +
        "attestation object. See the § 13.4.3 Cryptographic Challenges security consideration.",
    }), // .base64url(),
    rp: z.object(
      {
        id: z
          .string({
            description:
              "The RP ID the credential should be scoped to. If omitted, its value will be the " +
              "`CredentialsContainer` object’s relevant settings object's origin's effective domain. " +
              "See § 5.4.2 Relying Party Parameters for Credential Generation (dictionary " +
              "`PublicKeyCredentialRpEntity`) for further details.",
          })
          .optional(),
        name: z.string({
          description:
            "A human-palatable identifier for the Relying Party, intended only for display. For example, " +
            '"ACME Corporation", "Wonderful Widgets, Inc." or "ОАО Примертех".',
        }),
      },
      { description: "This member contains data about the Relying Party responsible for the request." },
    ),
    user: CredentialUserEntity.describe(
      "This member contains data about the user account for which the Relying Party is requesting attestation.",
    ),
    pubKeyCredParams: z.array(
      z.object({
        alg: z.number({
          description:
            "This member specifies the cryptographic signature algorithm with which the newly generated credential " +
            "will be used, and thus also the type of asymmetric key pair to be generated, e.g., RSA or Elliptic Curve.",
        }),
        type: PublicKeyCredentialTypeSchema.describe(
          "This member specifies the type of credential to be created. The value SHOULD be a member of " +
            "`PublicKeyCredentialType` but client platforms MUST ignore unknown values, ignoring any " +
            "`PublicKeyCredentialParameters` with an unknown `type`.",
        ),
      }),
      {
        description:
          "This member contains information about the desired properties of the credential to be created. " +
          "The sequence is ordered from most preferred to least preferred. " +
          "The client makes a best-effort to create the most preferred credential that it can.",
      },
    ),
    timeout: z
      .number({
        description:
          "This member specifies a time, in milliseconds, that the caller is willing to wait for the call to " +
          "complete. This is treated as a hint, and MAY be overridden by the client.",
      })
      .optional(),
    attestation: AttestationConveyancePreferenceSchema.describe(
      "This member is intended for use by Relying Parties that wish to express their preference for attestation " +
        "conveyance. Its values SHOULD be members of `AttestationConveyancePreference`. Client platforms MUST ignore " +
        "unknown values, treating an unknown value as if the member does not exist. Its default value is `none`.",
    ).optional(),
    excludeCredentials: z
      .array(CredentialDescriptorSchema, {
        description:
          "This member is intended for use by Relying Parties that wish to limit the creation of multiple " +
          "credentials for the same account on a single authenticator. The client is requested to return an error " +
          "if the new credential would be created on an authenticator that also contains one of the credentials " +
          "enumerated in this parameter.",
      })
      .optional(),
    authenticatorSelection: z
      .object(
        {
          authenticatorAttachment: AuthenticatorAttachmentSchema.describe(
            "If this member is present, eligible authenticators are filtered to only authenticators attached with " +
              "the specified § 5.4.5 Authenticator Attachment Enumeration (enum `AuthenticatorAttachment`). " +
              "The value SHOULD be a member of `AuthenticatorAttachment` but client platforms MUST ignore unknown " +
              "values, treating an unknown value as if the member does not exist.",
          ).optional(),
          requireResidentKey: z
            .boolean({
              description:
                "This member is retained for backwards compatibility with WebAuthn Level 1 and, for historical " +
                "reasons, its naming retains the deprecated “resident” terminology for discoverable credentials. " +
                "Relying Parties SHOULD set it to `true` if, and only if, `residentKey` is set to `required`.",
            })
            .optional(),
          residentKey: ResidentKeyRequirementSchema.describe(
            "Specifies the extent to which the Relying Party desires to create a client-side discoverable " +
              "credential. For historical reasons the naming retains the deprecated “resident” terminology. " +
              "The value SHOULD be a member of `ResidentKeyRequirement` but client platforms MUST ignore unknown " +
              "values, treating an unknown value as if the member does not exist. If no value is given then the " +
              "effective value is `required` if `requireResidentKey` is `true` or `discouraged` if it is `false` or " +
              "absent.",
          ).optional(),
          userVerification: UserVerificationRequirementSchema.describe(
            "This member describes the Relying Party's requirements regarding user verification for the `create()` " +
              "operation. Eligible authenticators are filtered to only those capable of satisfying this requirement. " +
              "The value SHOULD be a member of `UserVerificationRequirement` but client platforms MUST ignore " +
              "unknown values, treating an unknown value as if the member does not exist.",
          ).optional(),
        },
        {
          description:
            "This member is intended for use by Relying Parties that wish to select the appropriate authenticators " +
            "to participate in the `create()` operation.",
        },
      )
      .optional(),
    extensions: AuthenticationExtensionsClientInputsSchema.describe(
      "This member contains additional parameters requesting additional processing by the client and authenticator. " +
        "For example, the caller may request that only authenticators with certain capabilities be used to create " +
        "the credential, or that particular information be returned in the attestation object. Some extensions are " +
        'defined in § 9 WebAuthn Extensions; consult the IANA "WebAuthn Extension Identifiers" registry ' +
        "[IANA-WebAuthn-Registries] established by [RFC8809] for an up-to-date list of registered WebAuthn Extensions.",
    ).optional(),
  },
  { description: "An object specifying the desired attributes of the to-be-created public key credential." },
);

/**
 * An object that contains the attributes that are returned to the server when a new credential is created.
 */
export const RegistrationResponseSchema = z.object(
  {
    id: z.string({ description: "Holds the base64url encoding of the `rawId`." }), // .base64url(),
    rawId: z.string({
      description:
        "This attribute contains the credential ID, chosen by the authenticator. The credential ID is used to look " +
        "up credentials for use, and is therefore expected to be globally unique with high probability across all " +
        "credentials of the same type, across all authenticators.",
    }), // .base64url(),
    response: z.object(
      {
        clientDataJSON: z.string({
          description:
            "This attribute, inherited from `AuthenticatorResponse`, contains the JSON-compatible serialization of " +
            "client data (see § 6.5 Attestation) passed to the authenticator by the client in order to generate this " +
            "credential. The exact JSON serialization MUST be preserved, as the hash of the serialized client data " +
            "has been computed over it.",
        }), // .base64url(),
        attestationObject: z.string({
          description:
            "This attribute contains an attestation object, which is opaque to, and cryptographically protected " +
            "against tampering by, the client. The attestation object contains both authenticator data and an " +
            "attestation statement. The former contains the AAGUID, a unique credential ID, and the credential " +
            "public key. The contents of the attestation statement are determined by the attestation statement " +
            "format used by the authenticator. It also contains any additional information that the Relying Party's " +
            "server requires to validate the attestation statement, as well as to decode and validate the " +
            "authenticator data along with the JSON-compatible serialization of client data. For more details, " +
            "see § 6.5 Attestation, § 6.5.4 Generating an Attestation Object, and Figure 6.",
        }), // .base64url(),
        authenticatorData: z
          .string({
            description:
              "Holds the authenticator data contained within `attestationObject`. See § 5.2.1.1 Easily accessing " +
              "credential data.",
          })
          .optional(), // .base64url().optional(),
        transports: z
          .array(AuthenticatorTransportSchema, {
            description:
              "This internal slot contains a sequence of zero or more unique `DOMString`s in lexicographical order. " +
              "These values are the transports that the authenticator is believed to support, or an empty sequence " +
              "if the information is unavailable. The values SHOULD be members of `AuthenticatorTransport` but " +
              "Relying Parties MUST ignore unknown values.",
          })
          .optional(),
        publicKeyAlgorithm: z
          .number({
            description:
              "Holds the `COSEAlgorithmIdentifier` of the new credential. See § 5.2.1.1 Easily accessing credential " +
              "data.",
          })
          .optional(),
        publicKey: z
          .string({
            description:
              "Holds the DER `SubjectPublicKeyInfo` of the new credential, or `null` if this is not available. " +
              "See § 5.2.1.1 Easily accessing credential data.",
          })
          .optional(), // .base64url().optional(),
      },
      {
        description:
          "This attribute contains the authenticator's response to the client’s request to create a public key " +
          "credential.",
      },
    ),
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema.describe(
      "This internal slot contains the results of processing client extensions requested by the Relying Party upon " +
        "the Relying Party's invocation of `navigator.credentials.create()`.",
    ),
    type: PublicKeyCredentialTypeSchema.describe(
      "The `PublicKeyCredential` interface object's `type` internal slot's value is the string \"public-key\".",
    ),
  },
  { description: "An object sent by a WebAuthn client holding a response to a registration challenge." },
);

/**
 * An object holding an authentication challenge for a WebAuthn client.
 */
export const AuthenticationOptionsSchema = z.object(
  {
    rpId: z
      .string({
        description:
          "This OPTIONAL member specifies the relying party identifier claimed by the caller. If omitted, its value " +
          "will be the `CredentialsContainer` object’s relevant settings object's origin's effective domain.",
      })
      .optional(),
    challenge: z.string({
      description:
        "This member represents a challenge that the selected authenticator signs, along with other data, when " +
        "producing an authentication assertion. See the § 13.4.3 Cryptographic Challenges security consideration.",
    }), // .base64url(),
    timeout: z
      .number({
        description:
          "This OPTIONAL member specifies a time, in milliseconds, that the caller is willing to wait for the call " +
          "to complete. The value is treated as a hint, and MAY be overridden by the client.",
      })
      .optional(),
    userVerification: UserVerificationRequirementSchema.describe(
      "This OPTIONAL member describes the Relying Party's requirements regarding user verification for the `get()` " +
        "operation. The value SHOULD be a member of `UserVerificationRequirement` but client platforms MUST ignore " +
        "unknown values, treating an unknown value as if the member does not exist. Eligible authenticators are " +
        "filtered to only those capable of satisfying this requirement.",
    ).optional(),
    allowCredentials: z
      .array(CredentialDescriptorSchema, {
        description:
          "This OPTIONAL member contains a list of `PublicKeyCredentialDescriptor` objects representing public key " +
          "credentials acceptable to the caller, in descending order of the caller’s preference (the first item in " +
          "the list is the most preferred credential, and so on down the list).",
      })
      .optional(),
    extensions: AuthenticationExtensionsClientInputsSchema.describe(
      "This OPTIONAL member contains additional parameters requesting additional processing by the client and " +
        "authenticator. For example, if transaction confirmation is sought from the user, then the prompt string " +
        "might be included as an extension.",
    ).optional(),
  },
  { description: "An object holding an authentication challenge for a WebAuthn client." },
);

/**
 * An object that contains the attributes that are returned to the server when a new assertion is requested.
 */
export const AuthenticationResponseSchema = z.object(
  {
    id: z.string({ description: "Holds the base64url encoding of the `rawId`." }), // .base64url(),
    rawId: z.string({
      description:
        "This attribute contains the credential ID, chosen by the authenticator. The credential ID is used to look " +
        "up credentials for use, and is therefore expected to be globally unique with high probability across all " +
        "credentials of the same type, across all authenticators.",
    }), // .base64url(),
    response: z.object({
      clientDataJSON: z.string({
        description:
          "This attribute, inherited from `AuthenticatorResponse`, contains the JSON-compatible serialization of " +
          "client data (see § 5.8.1 Client Data Used in WebAuthn Signatures (dictionary `CollectedClientData`)) " +
          "passed to the authenticator by the client in order to generate this assertion. The exact JSON " +
          "serialization MUST be preserved, as the hash of the serialized client data has been computed over it.",
      }), // .base64url(),
      authenticatorData: z.string({
        description:
          "This attribute contains the authenticator data returned by the authenticator. See § 6.1 Authenticator Data.",
      }), // .base64url(),
      signature: z.string({
        description:
          "This attribute contains the raw signature returned from the authenticator. See § 6.3.3 The " +
          "`authenticatorGetAssertion` Operation.",
      }), // .base64url(),
      userHandle: z
        .string({
          description:
            "This attribute contains the user handle returned from the authenticator, or `null` if the authenticator " +
            "did not return a user handle. See § 6.3.3 The `authenticatorGetAssertion` Operation.",
        })
        .optional(), // .base64url().optional(),
    }),
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema.describe(
      "This internal slot contains the results of processing client extensions requested by the Relying Party upon " +
        "the Relying Party's invocation of `navigator.credentials.get()`.",
    ),
    type: PublicKeyCredentialTypeSchema.describe(
      "The `PublicKeyCredential` interface object's `type` internal slot's value is the string \"public-key\".",
    ),
  },
  {
    description:
      "An object that contains the attributes that are returned to the server when a new assertion is requested.",
  },
);
