require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conexion = require("./db"); // Importamos la conexión creada en db.js
const {subirImagenCloudinary} = require("./cloudinary");

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el frontend

// Aplicamos el limite  a 10MB para el envio de imagenes en base64 hacia cloudinary
app.use(express.json({limit: "10mb"})); // Habilitar la lectura de datos en formato JSON en el cuerpo (req.body)

// verificar al iniciar que la tabla de productos en mysql tenga la columna imagen_url 

conexion.query("show COLUMS FROM productos LIKE 'imagen_url'",
  (err, resultados) => {
    if (!err && Array.isArray(resultados) && resultados.length === 0){
      conexion.query(
        "ALTER TABLE productos ADD COLUM imagen_url VARCHAR(500) DEFAULT NULL",
        (errAlter) => {
          if (!errAlter) {
            console.log("columna 'imagen_url' verificada/agregada en la tabla 'productos'");
          }
        }
      );
    }

  }
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// =========================================================
// ENDPOINTS PARA LA GESTIÓN DE PRODUCTOS (TABLA: productos)
// =========================================================

// 1. Obtener todos los productos (READ)
app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar:", error);
      return res.status(500).json({ mensaje: "Error al consultar los productos" });
    }
    res.json(resultados);
  });
});

// 2. Crear un nuevo producto (CREATE)
app.post("/productos", async (req, res) => {
  try {
  const { nombre, precio, stock, imagenBase64, imagen_url } = req.body;
  let urlImagenFinal = imagen_url || null;

  // si el usuario selecciono un archivo de imagen  la subimos a cloudinary
  if (imagenBase64) {
    urlImagenFinal = await subirImagenCloudinary(imagenBase64);
  }

  const sql = "INSERT INTO productos (nombre, precio, stock, imagen_url) VALUES (?, ?, ?, ?)";
  const valores = [nombre, precio, stock, urlImagenFinal];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al insertar:", error);
      return res.status(500).json({ mensaje: "Error al crear el producto" });
    }

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: resultado.insertId,
    });
  });

    } catch(error) {
      console.error("Error al subir imagen o crear producto", error.message);
      res.status(500).json({
        mensaje: error.message || "Error al subir la imagen a cloudinary",
      });
    }
});

// 3. Actualizar un producto existente (UPDATE)
app.put("/productos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, precio, stock, imagenBase64, imagen_url } = req.body;
    let urlImaggenFinal = imagen_url || null;

    // si el usuario escogio una nueva imagen al editar la subimos a cloudinary y reemplazamos el enlace 
    if (imagenBase64) {
      urlImaggenFinal = await subirImagenCloudinary(imagenBase64)
    }

    
  const sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ?, imagen_url = COALESCE(?, imagen_url) WHERE ID = ?";
  const valores = [nombre, precio, stock, urlImaggenFinal, id];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
    res.json({ mensaje: "Producto actualizado correctamente",
      imagen_url: urlImaggenFinal,
     });
  });
} catch (error) {
  console.error("Error al actualizar producto o imagen", error.message);
  res.status(500).json({
    mensaje: error.message || "Error al actualizar la imagen en cloudinary"
  });
}
});

// 4. Eliminar un producto (DELETE)
app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
});

// ENDPOINTS PARA LA GESTIÓN DE MENSAJES 


// 1. OBTENER TODOS LOS MENSAJES (GET /contacto)
app.get('/contacto', (req, res) => {
   
    const query = 'SELECT * FROM contacto ORDER BY id DESC';
    
    conexion.query(query, (err, resultados) => {
        if (err) {
            console.error('Error al obtener mensajes en MySQL:', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(resultados);
    });
});

// 2. GUARDAR UN NUEVO MENSAJE
app.post('/contacto', (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO contacto (nombre, email, asunto, mensaje) VALUES (?, ?, ?, ?)';
    
    conexion.query(query, [nombre, email, asunto, mensaje], (err, resultado) => {
        if (err) {
            console.error('Error al insertar el mensaje en MySQL:', err);
            return res.status(500).json({ error: 'No se pudo guardar el mensaje en la base de datos' });
        }
        res.status(201).json({ mensaje: 'Mensaje guardado con éxito', id: resultado.insertId });
    });
});

// 3. ELIMINAR UN MENSAJE (DELETE /contacto/:id)
app.delete('/contacto/:id', (req, res) => {
    const { id } = req.params;

    // CORRECCIÓN: Se cambió 'db.query' por 'conexion.query'
    const query = 'DELETE FROM contacto WHERE id = ?';
    
    conexion.query(query, [id], (err, resultado) => {
        if (err) {
            console.error('Error al eliminar el mensaje en MySQL:', err);
            return res.status(500).json({ error: 'No se pudo eliminar el mensaje' });
        }
        res.json({ mensaje: 'Mensaje eliminado correctamente' });
    });
});

// Iniciar servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
