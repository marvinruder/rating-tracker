/**
 * Converts an uploaded file to a base64-encoded string with smaller size and reduced quality.
 *
 * @param {File} file The uploaded file
 * @returns {string} The base64-encoded string containing the encoded image.
 */
const convertAvatar = async (file: File): Promise<string> => {
  // We need to use the browser version of Jimp here, since the Node version is not compatible with the browser.
  // Unfortunately, type declarations are not available for this setup right now.
  // This statement loads the browser version of Jimp and makes it available as the global variable `window.Jimp`.
  await import("jimp/browser/lib/jimp.js");
  const { Jimp } = window as typeof window & { Jimp: any };
  const image = await Jimp.read(await file.arrayBuffer());
  let base64image: string;
  image
    .cover(480, 480) // Resize to a comfortable size of 480x480px while cutting off the excess.
    .quality(60) // Reduce the quality to 60%.
    .getBase64(Jimp.MIME_JPEG, (e: Error, src: string) => {
      /* istanbul ignore next -- @preserve */ // We have not yet found a way to create an erroneous result here
      if (e) {
        throw e;
      }
      base64image = src;
    });
  return base64image;
};

export { convertAvatar };
