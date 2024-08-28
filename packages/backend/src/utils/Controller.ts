import type { OpenAPIHono } from "@hono/zod-openapi";

import Singleton from "./Singleton";

/**
 * A controller class, ensuring that only one instance of every controller exists. Note that class names of all
 * implementations of this abstract class must be globally unique.
 *
 * Its constructor will create the only instance on the first call and throw an error on subsequent calls.
 */
export default abstract class Controller extends Singleton {
  constructor({ tags }: { tags: string[] }) {
    super();
    if (Controller.#controllerInstances.includes(this))
      throw new Error(`Controller ${this.constructor.name} must only be instantiated once.`);
    Controller.#controllerInstances.push(this);
    this.#tags = tags;
  }

  /**
   * An array of tags for the controller, to be used in the endpoints’ OpenAPI specifications.
   */
  #tags: string[];

  /**
   * Returns an array of tags for the controller, to be used in the endpoints’ OpenAPI specifications.
   * @returns An array of tags for the controller.
   */
  get tags(): string[] {
    return this.#tags;
  }

  /**
   * The controller instances.
   */
  static #controllerInstances: Controller[] = [];

  /**
   * Returns a new Hono app with the routes of the controller attached.
   * @returns The Hono app with the routes attached.
   */
  abstract get router(): OpenAPIHono;
}
