import type * as oidc from "oauth4webapi";

export const {
  ClientSecretPost,
  calculatePKCECodeChallenge,
  generateRandomCodeVerifier,
  processDiscoveryResponse,
  processUserInfoResponse,
  validateAuthResponse,
} = await vi.importActual<typeof oidc>("oauth4webapi");

export const discoveryRequest: typeof oidc.discoveryRequest = () =>
  Promise.resolve(
    new Response(
      // eslint-disable-next-line max-len
      '{"issuer":"https://sso.example.com","authorization_endpoint":"https://sso.example.com/protocol/openid-connect/auth","token_endpoint":"https://sso.example.com/protocol/openid-connect/token","introspection_endpoint":"https://sso.example.com/protocol/openid-connect/token/introspect","userinfo_endpoint":"https://sso.example.com/protocol/openid-connect/userinfo","end_session_endpoint":"https://sso.example.com/protocol/openid-connect/logout","frontchannel_logout_session_supported":true,"frontchannel_logout_supported":true,"jwks_uri":"https://sso.example.com/protocol/openid-connect/certs","check_session_iframe":"https://sso.example.com/protocol/openid-connect/login-status-iframe.html","grant_types_supported":["authorization_code","implicit","refresh_token","password","client_credentials","urn:openid:params:grant-type:ciba","urn:ietf:params:oauth:grant-type:device_code"],"acr_values_supported":["0","1"],"response_types_supported":["code","none","id_token","token","id_token token","code id_token","code token","code id_token token"],"subject_types_supported":["public","pairwise"],"id_token_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"],"id_token_encryption_alg_values_supported":["ECDH-ES+A256KW","ECDH-ES+A192KW","ECDH-ES+A128KW","RSA-OAEP","RSA-OAEP-256","RSA1_5","ECDH-ES"],"id_token_encryption_enc_values_supported":["A256GCM","A192GCM","A128GCM","A128CBC-HS256","A192CBC-HS384","A256CBC-HS512"],"userinfo_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512","none"],"userinfo_encryption_alg_values_supported":["ECDH-ES+A256KW","ECDH-ES+A192KW","ECDH-ES+A128KW","RSA-OAEP","RSA-OAEP-256","RSA1_5","ECDH-ES"],"userinfo_encryption_enc_values_supported":["A256GCM","A192GCM","A128GCM","A128CBC-HS256","A192CBC-HS384","A256CBC-HS512"],"request_object_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512","none"],"request_object_encryption_alg_values_supported":["ECDH-ES+A256KW","ECDH-ES+A192KW","ECDH-ES+A128KW","RSA-OAEP","RSA-OAEP-256","RSA1_5","ECDH-ES"],"request_object_encryption_enc_values_supported":["A256GCM","A192GCM","A128GCM","A128CBC-HS256","A192CBC-HS384","A256CBC-HS512"],"response_modes_supported":["query","fragment","form_post","query.jwt","fragment.jwt","form_post.jwt","jwt"],"registration_endpoint":"https://sso.example.com/clients-registrations/openid-connect","token_endpoint_auth_methods_supported":["private_key_jwt","client_secret_basic","client_secret_post","tls_client_auth","client_secret_jwt"],"token_endpoint_auth_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"],"introspection_endpoint_auth_methods_supported":["private_key_jwt","client_secret_basic","client_secret_post","tls_client_auth","client_secret_jwt"],"introspection_endpoint_auth_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"],"authorization_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"],"authorization_encryption_alg_values_supported":["ECDH-ES+A256KW","ECDH-ES+A192KW","ECDH-ES+A128KW","RSA-OAEP","RSA-OAEP-256","RSA1_5","ECDH-ES"],"authorization_encryption_enc_values_supported":["A256GCM","A192GCM","A128GCM","A128CBC-HS256","A192CBC-HS384","A256CBC-HS512"],"claims_supported":["aud","sub","iss","auth_time","name","given_name","family_name","preferred_username","email","acr"],"claim_types_supported":["normal"],"claims_parameter_supported":true,"scopes_supported":["openid","address","basic","email","web-origins","profile","microprofile-jwt","acr","offline_access","phone","roles"],"request_parameter_supported":true,"request_uri_parameter_supported":true,"require_request_uri_registration":true,"code_challenge_methods_supported":["plain","S256"],"tls_client_certificate_bound_access_tokens":true,"revocation_endpoint":"https://sso.example.com/protocol/openid-connect/revoke","revocation_endpoint_auth_methods_supported":["private_key_jwt","client_secret_basic","client_secret_post","tls_client_auth","client_secret_jwt"],"revocation_endpoint_auth_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"],"backchannel_logout_supported":true,"backchannel_logout_session_supported":true,"device_authorization_endpoint":"https://sso.example.com/protocol/openid-connect/auth/device","backchannel_token_delivery_modes_supported":["poll","ping"],"backchannel_authentication_endpoint":"https://sso.example.com/protocol/openid-connect/ext/ciba/auth","backchannel_authentication_request_signing_alg_values_supported":["PS384","RS384","EdDSA","ES384","ES256","RS256","ES512","PS256","PS512","RS512"],"require_pushed_authorization_requests":false,"pushed_authorization_request_endpoint":"https://sso.example.com/protocol/openid-connect/ext/par/request","mtls_endpoint_aliases":{"token_endpoint":"https://sso.example.com/protocol/openid-connect/token","revocation_endpoint":"https://sso.example.com/protocol/openid-connect/revoke","introspection_endpoint":"https://sso.example.com/protocol/openid-connect/token/introspect","device_authorization_endpoint":"https://sso.example.com/protocol/openid-connect/auth/device","registration_endpoint":"https://sso.example.com/clients-registrations/openid-connect","userinfo_endpoint":"https://sso.example.com/protocol/openid-connect/userinfo","pushed_authorization_request_endpoint":"https://sso.example.com/protocol/openid-connect/ext/par/request","backchannel_authentication_endpoint":"https://sso.example.com/protocol/openid-connect/ext/ciba/auth"},"authorization_response_iss_parameter_supported":true}',
      { headers: { "Content-Type": "application/json" } },
    ),
  );

export const authorizationCodeGrantRequest: typeof oidc.authorizationCodeGrantRequest = (
  as,
  client,
  clientAuthentication,
  callbackParameters,
) =>
  Promise.resolve(
    new Response(
      JSON.stringify({
        access_token: callbackParameters.get("code"),
        expires_in: 3600,
        id_token: callbackParameters.get("code"),
        refresh_token: callbackParameters.get("code"),
        scope: "openid profile email phone",
        token_type: "bearer",
      }),
      { headers: { "Content-Type": "application/json" } },
    ),
  );

export const processAuthorizationCodeResponse: typeof oidc.processAuthorizationCodeResponse = (as, client, response) =>
  response.json();

export const getValidatedIdTokenClaims: typeof oidc.getValidatedIdTokenClaims = (ref) => {
  let sub, resource_access;
  switch (ref.id_token) {
    case "jane.doe":
    case "jane.roe":
      sub = "00000000-0000-0000-0000-000000000000";
      resource_access = {
        "rating-tracker": { roles: ["administrative_access", "write_stocks_access", "general_access"] },
      };
      break;
    case "john.doe":
      sub = "11111111-1111-1111-1111-111111111111";
      resource_access = { "rating-tracker": { roles: ["write_stocks_access", "general_access"] } };
      break;
    case "jim.doe":
      sub = "22222222-2222-2222-2222-222222222222";
      resource_access = { "rating-tracker": { roles: ["general_access"] } };
      break;
    case "jack.doe":
      sub = "33333333-3333-3333-3333-333333333333";
      resource_access = {};
      break;
    case "jen.doe":
      sub = "44444444-4444-4444-4444-444444444444";
      resource_access = { "rating-tracker": { roles: [] } };
      break;
    case "jess.doe":
      sub = "55555555-5555-5555-5555-555555555555";
      resource_access = { "rating-tracker": { roles: ["general_access"] } };
      break;
    default:
      throw new Error("Unknown ID token");
  }
  return { iss: "https://sso.example.com", sub, aud: "", iat: 0, exp: 0, resource_access };
};

export const userInfoRequest: typeof oidc.userInfoRequest = (as, client, accessToken) => {
  switch (accessToken) {
    case "jane.doe":
    case "jane.roe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "00000000-0000-0000-0000-000000000000",
            name: "Jane Roe",
            given_name: "Jane",
            family_name: "Roe",
            preferred_username: "jane.roe",
            email: "jane.roe@example.com",
            email_verified: true,
            phone_number: "+1234567890",
            resource_access: {
              "rating-tracker": { roles: ["administrative_access", "write_stocks_access", "general_access"] },
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    case "john.doe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "11111111-1111-1111-1111-111111111111",
            name: "John Doe",
            given_name: "John",
            family_name: "Doe",
            preferred_username: "john.doe",
            email: "john.doe@example.com",
            email_verified: true,
            phone_number: "01234567890",
            resource_access: { "rating-tracker": { roles: ["write_stocks_access", "general_access"] } },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    case "jim.doe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "22222222-2222-2222-2222-222222222222",
            name: "Jim Doe",
            given_name: "Jim",
            family_name: "Doe",
            preferred_username: "jim.doe",
            email: "jim.doe@example.com",
            email_verified: true,
            resource_access: { "rating-tracker": { roles: ["general_access"] } },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    case "jack.doe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "33333333-3333-3333-3333-333333333333",
            name: "Jack Doe",
            given_name: "Jack",
            family_name: "Doe",
            preferred_username: "jack.doe",
            email: "jack.doe@example.com",
            email_verified: true,
            resource_access: {},
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    case "jen.doe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "44444444-4444-4444-4444-444444444444",
            name: "Jen Doe",
            given_name: "Jen",
            family_name: "Doe",
            preferred_username: "jen.doe",
            email: "jen.doe@example.com",
            email_verified: true,
            resource_access: { "rating-tracker": { roles: [] } },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    case "jess.doe":
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sub: "55555555-5555-5555-5555-555555555555",
            name: "Jess Doe",
            given_name: "Jess",
            family_name: "Doe",
            preferred_username: "jess.doe",
            email: "jess.doe@example.com",
            email_verified: false,
            resource_access: { "rating-tracker": { roles: ["general_access"] } },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    default:
      throw new Error("Unknown access token");
  }
};
