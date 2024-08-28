import type { Agent } from "undici-types";

// Allow the `fetch` API to use HTTP/2
void fetch(undefined!).catch(() => {});

/**
 * This class is a factory for creating agents with custom options to be used with the `fetch` API.
 */
class AgentFactory {
  private constructor() {}

  /**
   * The agent constructor, taken from the global dispatcher.
   */
  // @ts-expect-error
  static #Agent: { new (options?: Agent.Options): Agent } = global[Symbol.for("undici.globalDispatcher.1")].constructor;

  /**
   * Create a new agent.
   * @param options The options for the agent.
   * @returns The agent.
   */
  static create(options?: Agent.Options): Agent {
    return new this.#Agent(options);
  }
}

export default AgentFactory;
