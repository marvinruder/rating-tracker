extern crate console_error_panic_hook;

use base64::Engine;
use wasm_bindgen::prelude::*;

// // Make Javascript’s `console.log()` available
// #[wasm_bindgen]
// extern "C" {
//     #[wasm_bindgen(js_namespace = console)]
//     fn log(s: &str);
// }

#[wasm_bindgen]
pub fn convert_avatar(_array: &[u8]) -> String {
    // Print panic messages to Javascript’s `console.error()`
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    // Read image from array
    let mut img = match image::load_from_memory(_array) {
        Ok(img) => img,
        Err(error) => {
            panic!("Unable to open image: {:?}", error)
        }
    };

    // Resize image with linear interpolation
    img = img.resize_to_fill(480, 480, image::imageops::FilterType::Triangle);

    // Read EXIF Orientation Tag from image and rotate/flip accordingly
    // Details: https://magnushoff.com/articles/jpeg-orientation/
    img = match exif::Reader::new().read_from_container(&mut std::io::Cursor::new(_array)) {
        // We have successfully read EXIF information
        Ok(exif) => match exif.get_field(exif::Tag::Orientation, exif::In::PRIMARY) {
            // There is an orientation tag
            Some(orientation) => match orientation.value.get_uint(0) {
                // The orientation tag holds a valid value
                Some(v @ 1..=8) => match v {
                    2 => img.fliph(),
                    3 => img.rotate180(),
                    4 => img.flipv(),
                    5 => img.flipv().rotate90(),
                    6 => img.rotate90(),
                    7 => img.fliph().rotate90(),
                    8 => img.rotate270(),
                    _ => img,
                },
                _ => img,
            },
            None => img,
        },
        Err(_) => img,
    };

    // Write new image to buffer
    let mut buf = Vec::<u8>::new();
    match img.write_to(
        &mut std::io::Cursor::new(&mut buf),
        // Use JPEG encoding of medium quality
        image::ImageOutputFormat::Jpeg(60),
    ) {
        Ok(_) => (),
        Err(error) => {
            panic!("Unable to create thumbnail image: {:?}", error)
        }
    };
    // Encode as base64 string and return
    return base64::engine::general_purpose::STANDARD.encode(buf);
}

// #[cfg(test)]
// mod tests {}
