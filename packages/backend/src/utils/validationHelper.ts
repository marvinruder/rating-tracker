import type { ZodNumber, ZodPipeline, ZodType } from "zod";
import { z } from "zod";

/**
 * This helper class provides methods to validate HTTP requests and its components, such as path and query parameters
 * and request bodies.
 */
class ValidationHelper {
  /**
   * Creates a pipeline that coerces a string value to a number and then validates it with the target Zod type.
   * @param target The target Zod type to pipe the coercion to.
   * @returns The pipeline.
   */
  static coerceToNumber<T extends ZodNumber>(target: T): ZodPipeline<ZodType, T> {
    return z.coerce
      .number(target.description ? { description: target.description } : {})
      .pipe(target)
      .openapi({ type: "number" });
  }

  /**
   * Creates a pipeline that coerces a string value to an integer number and then validates it with the target Zod type.
   * @param target The target Zod type to pipe the coercion to.
   * @returns The pipeline.
   */
  static coerceToInteger<T extends ZodNumber>(target: T): ZodPipeline<ZodType, T> {
    return z.coerce
      .number(target.description ? { description: target.description } : {})
      .int()
      .pipe(target)
      .openapi({ type: "integer" });
  }
}

export default ValidationHelper;
