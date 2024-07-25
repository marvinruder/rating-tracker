/**
 * A cached webpage, API response, image or other resource from the web.
 */
export type Resource = {
  /**
   * The URI of the resource.
   */
  uri: string;
  /**
   * The date and time of the last fetch.
   */
  lastModifiedAt: Date;
  /**
   * The content of the resource.
   */
  content: Uint8Array;
  /**
   * The MIME type of the resource.
   */
  contentType: string;
};
