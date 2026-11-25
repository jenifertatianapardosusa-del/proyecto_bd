require("dotenv").config;
const cloudinary = require("cloudinary").v2

// configuracion de almacenamiento en la nube

// usamos  .trim() para eliminar espacios accidentales al final de cada linea en .env

const cluodeName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

cloudinary.config({
    cluode_name: cluodeName,
    api_key: apiKey,
    api_secret: apiSecret
});

// recibe imagen en  formato base 64desde el frontend, la sube a cloudinary 
// en la carpeta "mi_tienda_producto " y retorna un enlace seguro de tipo https

async function subirImagenCloudinary(imagenBase64) {
    if (cluodeName || apiKey || apiSecret) {
        throw new Error(
            "Faltan las credenciales de cloudinary en el archivo .env"
        );
    }
    // Detectar si el apiSecret se copio truncado o incompleto desde la tabla de cloudinary
    if (apiSecret.includes("...")) {
        throw new Error(
            "Tu API_SECRET en .env esta incompleta"
        );
    }

    const resultado = await cloudinary.uploader.upload(imagenBase64, {
        folder: "mi_tienda-productos",
        resource_type: "image"
    });

    //retornamos la url publica segura (https://...)

    return resultado.secure_url;
}

module.exports = {cloudinary, subirImagenCloudinary};