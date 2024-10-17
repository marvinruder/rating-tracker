use std::io::Cursor;

use image::{
    codecs::avif::AvifEncoder, imageops, metadata::Orientation, DynamicImage, ImageDecoder,
    ImageReader,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = convertAvatar)]
pub fn convert_avatar(array: &[u8]) -> Result<Vec<u8>, JsError> {
    // Create image decoder for the given array, guessing the image format
    let mut decoder = ImageReader::new(Cursor::new(array))
        .with_guessed_format()?
        .into_decoder()?;

    // Read EXIF Orientation Tag from image
    let orientation = decoder.orientation().unwrap_or(Orientation::NoTransforms);

    // Decode image and apply orientation
    let mut img = DynamicImage::from_decoder(decoder)?;
    img.apply_orientation(orientation);

    // Resize image with linear interpolation
    img = img.resize_to_fill(480, 480, imageops::FilterType::Triangle);

    // Write new image to buffer
    let mut buf = Vec::<u8>::new();
    img.write_with_encoder(AvifEncoder::new_with_speed_quality(&mut buf, 10, 75))?;

    // Return the buffer
    Ok(buf)
}
