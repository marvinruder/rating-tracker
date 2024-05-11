/**
 * A singleton class, ensuring that only one instance of the class exists.
 *
 * Its constructor will create the only instance on the first call and return it on subsequent calls.
 */
export default abstract class Singleton {
  /**
   * Creates or returns the singleton instance of the class.
   * @returns The singleton instance of the class.
   */
  constructor() {
    if (Singleton.#instance) return Singleton.#instance;
    Singleton.#instance = this;
  }

  /**
   * The singleton instance of the class.
   */
  static #instance: Singleton = null;
}
