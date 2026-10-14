const API_URL = "http://localhost:3000";

// Elementos del DOM
const formContacto = document.getElementById("formularioMensaje");
const listaMensajes = document.getElementById("listaMensajes");

// 5. Consultar los mensajes en la base de datos (GET)
async function cargarMensajes() {
  if (!listaMensajes) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto`);
    const mensajes = await respuesta.json();

    listaMensajes.innerHTML = "";

    if (mensajes.length === 0) {
      listaMensajes.innerHTML = "<p class='sin-mensajes'>No hay mensajes recibidos.</p>";
      return;
    }

    mensajes.forEach((msg) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto", "tarjeta-mensaje"); 

      elemento.innerHTML = `
        <div class="contenido-mensaje">
          <p><strong>${msg.nombre}</strong> <span class="email-mensaje">&lt;${msg.email}&gt;</span></p>
          <p class="asunto-mensaje"><strong>Asunto:</strong> ${msg.asunto}</p>
          <p class="mensaje-texto">"${msg.mensaje}"</p>
        </div>
        <div class="acciones">
          <button class="btn-eliminar" onclick="eliminarMensaje(${msg.id})">Eliminar</button>
        </div>
      `;

      listaMensajes.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar los mensajes:", error);
  }
}

// 6. Registrar un nuevo mensaje desde el formulario (POST) - [ACTUALIZADO CON ALERTAS DE ERROR]
if (formContacto) {
  formContacto.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que la página se recargue y rompa la petición

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const asunto = document.getElementById("asunto").value;
    const mensaje = document.getElementById("mensaje").value;

    try {
      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      });

      if (respuesta.ok) {
        alert("¡Mensaje de contacto enviado con éxito!");
        formContacto.reset();
        cargarMensajes(); // Refresca de inmediato la lista en pantalla
      } else {
        const errorData = await respuesta.json();
        console.error("Error del servidor:", errorData);
        alert("El servidor no pudo guardar el mensaje. Revisa la consola.");
      }
    } catch (error) {
      console.error("Error de conexión al enviar el mensaje:", error);
      alert("No se pudo conectar con el servidor backend. Asegúrate de que esté encendido en la terminal.");
    }
  });
}

// 7. Eliminar un mensaje recibido (DELETE)
async function eliminarMensaje(id) {
  const confirmar = confirm("¿Deseas eliminar este mensaje permanentemente?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/contacto/${id}`, {
      method: "DELETE",
    });
    cargarMensajes(); // Recarga la lista modificada
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
  }
}

// Llamada inicial automática al abrir o refrescar la página
cargarMensajes();
