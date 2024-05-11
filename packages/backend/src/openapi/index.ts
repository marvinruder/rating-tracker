import type { HTTPMethod } from "@rating-tracker/commons";
import { baseURL } from "@rating-tracker/commons";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import packageInfo from "../../package.json" with { type: "json" };
import Singleton from "../utils/Singleton";

import { components } from "./components";
import { servers } from "./servers";

/**
 * The OpenAPI documentation describing all API endpoints.
 */
class OpenAPIDocumentation extends Singleton {
  /**
   * The OpenAPI document describing all API endpoints.
   */
  #openAPIDocument: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
      title: packageInfo.title,
      version: packageInfo.version,
      contact: packageInfo.author,
      license: { name: packageInfo.license, url: "https://opensource.org/licenses/MIT" },
      description: "Specification JSONs: [v3](/api-spec/v3).",
    },
    servers: servers,
    paths: {},
    tags: [],
    components: components,
  };

  /**
   * Returns the OpenAPI document describing all API endpoints.
   * @returns The OpenAPI document describing all API endpoints.
   */
  get openAPIDocument(): OpenAPIV3.Document {
    return this.#openAPIDocument;
  }

  /**
   * Adds an endpoint to the OpenAPI document.
   * @param method The HTTP method of the API endpoint.
   * @param path The path of the API endpoint. Path parameters must be encoded using the `/{parameter}` syntax.
   * @param spec The specification of the API endpoint.
   */
  addEndpoint = (method: HTTPMethod, path: string, spec: OpenAPIV3.OperationObject) => {
    const fullPath = baseURL + path;
    if (!this.#openAPIDocument.paths[fullPath]) this.#openAPIDocument.paths[fullPath] = {};
    this.#openAPIDocument.paths[fullPath][method] = spec;
  };
}

export default new OpenAPIDocumentation();
