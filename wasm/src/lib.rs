extern crate console_error_panic_hook;

use base64::Engine;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn convert_avatar(_array: &[u8]) -> String {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    let img = match image::load_from_memory(_array) {
        Ok(img) => img,
        Err(error) => {
            panic!("Unable to open image: {:?}", error)
        }
    };
    let mut buf: Vec<u8> = Vec::new();
    match img.thumbnail(480, 480).write_to(
        &mut std::io::Cursor::new(&mut buf),
        image::ImageOutputFormat::Jpeg(60),
    ) {
        Ok(_) => (),
        Err(error) => {
            panic!("Unable to create thumbnail image: {:?}", error)
        }
    };
    return base64::engine::general_purpose::STANDARD.encode(buf);
}

// #[cfg(test)]
// mod tests {}
