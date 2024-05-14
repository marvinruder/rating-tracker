import Singleton from "../utils/Singleton";

export default abstract class SingletonController extends Singleton {
  /**
   * The base path of the controller. Must not contain the base URL path (e.g. `/api`).
   */
  abstract path: string;
  /**
   * An array of tags for the controller, to be used in the endpoints’ OpenAPI specifications.
   */
  abstract tags: string[];
}
