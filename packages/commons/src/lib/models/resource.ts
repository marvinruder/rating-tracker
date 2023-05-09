/**
 * A cached webpage, API response, image or other resource from the web.
 */
export class Resource {
  /**
   * The URL of the resource, used as a unique identifier.
   */
  url: string;
  /**
   * The date and time of the last fetch.
   */
  fetchDate: Date;
  /**
   * The content of the resource.
   */
  content: string;
}
