/**
 * Converts an uploaded file to a JPEG image with smaller size and reduced quality.
 *
 * @param {File} file The uploaded file
 * @returns {Uint8Array} The image.
 */
const convertAvatar = async (file: File): Promise<Uint8Array> =>
  import("@rating-tracker/wasm").then(async (wasm) => wasm.convert_avatar(new Uint8Array(await file.arrayBuffer())));

self.onmessage = async (message: { data: File }) => {
  await convertAvatar(message.data)
    .then((result) => self.postMessage({ result }))
    .catch(() => self.postMessage({ isError: true }));
};
