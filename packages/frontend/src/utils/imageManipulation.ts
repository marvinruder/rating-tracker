/**
 * Converts an uploaded file to an AVIF image with smaller size and reduced quality.
 * @param file The uploaded file
 * @returns The image.
 */
const convertAvatar = async (file: File): Promise<Uint8Array> =>
  import("@rating-tracker/wasm").then(async (wasm) => wasm.convertAvatar(new Uint8Array(await file.arrayBuffer())));

self.onmessage = async (message: { data: File }) => {
  await convertAvatar(message.data)
    .then((result) => self.postMessage({ result }))
    .catch((error) => self.postMessage({ error }));
};
