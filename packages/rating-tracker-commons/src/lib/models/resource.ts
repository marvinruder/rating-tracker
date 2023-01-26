/**
 * A cached webpage, API response, image or other resource from the web.
 */
export class Resource {
  url: string;
  fetchDate: Date;
  content: string;
}
