// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos los elementos del DOM
    const parrafo = document.getElementById("miParrafo");
    const boton = document.getElementById("miBoton");
    const div = document.getElementById("miDiv");
    const lista = document.getElementById("miLista");

    // 1. Cambiar el texto del párrafo al hacer clic en el botón
    boton.addEventListener("click", () => {
        parrafo.textContent = "¡El texto ha sido cambiado!";
    });

    // 2. Añadir una nueva clase CSS al div al pasar el ratón
    div.addEventListener("mouseover", () => {
        div.classList.add("resaltado");
    });

    // Quitar la clase cuando el ratón salga del div
    div.addEventListener("mouseout", () => {
        div.classList.remove("resaltado");
    });

    // 3. Crear un nuevo elemento li y añadirlo a la lista al cargar la página
    const nuevoElemento = document.createElement("li");
    nuevoElemento.textContent = "Nuevo elemento agregado al cargar la página";
    lista.appendChild(nuevoElemento);
});
