/**
 * A singleton class, ensuring that only one instance of the class exists. Note that class names of all implementations
 * of this abstract class must be globally unique.
 *
 * Its constructor will create the only instance on the first call and return it on subsequent calls.
 */
export default abstract class Singleton {
  /**
   * Creates or returns the singleton instance of the class.
   * @returns The singleton instance of the class.
   */
  constructor() {
    const name = this.constructor.name;
    if (Singleton.instances[name]) return Singleton.instances[name];
    Singleton.instances[name] = this;
  }

  /**
   * The singleton instances.
   */
  private static instances: Record<string, Singleton> = {};
}
