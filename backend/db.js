const mysql = require("mysql2");

// Configuracion de la conexion a mysql
const conexion = mysql.createConnection({
    host: "localhost", // servidor local
    user: "root",      // usuario de mysql (por defecto el xampp)
    database: "tienda", // Nombre de nuestra BD
    port: 3307
});

// Comprobar si la conexion fue exitosa

conexion.connect((error) => {
    if (error){
        console.error("Error al conectar con mysql:", error);
        return
    }
    console.log("Conexion exitosa con mysql");
});
// Exportar la conexion para reutilizarla en las rutas del servidor 
module.exports = conexion;