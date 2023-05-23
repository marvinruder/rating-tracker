import * as wasm from "@rating-tracker/wasm";

await wasm;

/**
 * Converts an uploaded file to a base64-encoded string with smaller size and reduced quality.
 *
 * @param {File} file The uploaded file
 * @returns {string} The base64-encoded string containing the encoded image.
 */
const convertAvatar = async (file: File): Promise<string> =>
  `data:image/jpeg;base64,${wasm.convert_avatar(new Uint8Array(await file.arrayBuffer()))}`;

self.onmessage = async (message: { data: File }) => {
  await convertAvatar(message.data)
    .then((result) => self.postMessage({ result }))
    .catch(() => self.postMessage({ isError: true }));
};
