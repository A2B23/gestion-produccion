
// ===================================
// 1. ELEMENTOS DEL FORMULARIO
// ===================================

const actividad = document.getElementById("actividad");

const seccionArmado = document.getElementById("seccionArmado");
const seccionCorte = document.getElementById("seccionCorte");

const referencia = document.getElementById("referencia");

const cantidadArmado = document.getElementById("cantidadArmado");
const tipoCorte = document.getElementById("tipoCorte");
const cantidadCorte = document.getElementById("cantidadCorte");

const fecha = document.getElementById("fecha");


// ===================================
// 2. FECHA ACTUAL
// ===================================

const hoy = new Date();

const fechaActual = new Date(
    hoy.getTime() - hoy.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

fecha.value = fechaActual;


// ===================================
// 3. REFERENCIAS DE ARMADO
// ===================================

const referencias = [
    { nombre: "100 ENTERA × 17", precio: 5000 },
    { nombre: "100 ENTERA × 14", precio: 5000 },
    { nombre: "120 ENTERA × 14", precio: 6000 },
    { nombre: "120 DIVIDIDA × 14", precio: 6000 },
    { nombre: "120 ENTERA × 17", precio: 6000 },
    { nombre: "120 DIVIDIDA × 17", precio: 6000 },
    { nombre: "140 ENTERA × 14", precio: 6000 },
    { nombre: "140 DIVIDIDA × 14", precio: 7000 },
    { nombre: "140 ENTERA × 17", precio: 6000 },
    { nombre: "140 DIVIDIDA × 17", precio: 7000 },
    { nombre: "160 DIVIDIDA × 14", precio: 7000 },
    { nombre: "160 DIVIDIDA × 17", precio: 7000 }
];

referencias.forEach(function (item) {

    const opcion = document.createElement("option");

    opcion.value = item.nombre;
    opcion.textContent = item.nombre;

    referencia.appendChild(opcion);

});


// ===================================
// 4. MOSTRAR LAS SECCIONES
// ===================================

function mostrarSecciones() {

    const seleccion = actividad.value;

    seccionArmado.style.display = "none";
    seccionCorte.style.display = "none";

    if (seleccion === "armado") {

        seccionArmado.style.display = "block";

    } else if (seleccion === "corte") {

        seccionCorte.style.display = "block";

    } else if (seleccion === "ambos") {

        seccionArmado.style.display = "block";
        seccionCorte.style.display = "block";

    }

}


// ===================================
// 5. ESCUCHAR CAMBIOS
// ===================================

actividad.addEventListener("change", mostrarSecciones);


// ===================================
// 6. ESTADO INICIAL
// ===================================

mostrarSecciones();


// ===================================
// 7. FORMATO DE DINERO
// ===================================

function formatoDinero(valor) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);

}


// ===================================
// 8. CALCULAR LA PRODUCCIÓN
// ===================================

function calcularProduccion() {

    let totalArmado = 0;
    let totalCorte = 0;

    const seleccion = actividad.value;

    // CALCULAR ARMADO

    if (seleccion === "armado" || seleccion === "ambos") {

        const producto = referencias.find(function (item) {
            return item.nombre === referencia.value;
        });

        const cantidad = Number(cantidadArmado.value) || 0;

        if (producto && cantidad > 0) {

            totalArmado = producto.precio * cantidad;

        }
    }

    // CALCULAR CORTE

    if (seleccion === "corte" || seleccion === "ambos") {

        const cantidad = Number(cantidadCorte.value) || 0;

        let precioCorte = 0;

        if (tipoCorte.value === "entero") {
            precioCorte = 3000;
        }

        if (tipoCorte.value === "dividido") {
            precioCorte = 4000;
        }

        totalCorte = precioCorte * cantidad;

    }

    // CALCULAR TOTAL GENERAL

    const totalGeneral = totalArmado + totalCorte;

    // MOSTRAR RESULTADOS

    document.getElementById("totalArmado").textContent =
        formatoDinero(totalArmado);

    document.getElementById("totalCorte").textContent =
        formatoDinero(totalCorte);

    document.getElementById("totalGeneral").textContent =
        formatoDinero(totalGeneral);

}


// ===================================
// 9. ACTUALIZAR AUTOMÁTICAMENTE
// ===================================

actividad.addEventListener("change", calcularProduccion);

referencia.addEventListener("change", calcularProduccion);

cantidadArmado.addEventListener("input", calcularProduccion);

tipoCorte.addEventListener("change", calcularProduccion);

cantidadCorte.addEventListener("input", calcularProduccion);


// CÁLCULO INICIAL

calcularProduccion();



// ===================================
// 10. GUARDAR REGISTROS
// ===================================

// Recuperar registros guardados en el navegador
let registros = JSON.parse(
    localStorage.getItem("produccion") || "[]"
);


// Escuchar el envío del formulario
const formulario = document.getElementById("formProduccion");

formulario.addEventListener("submit", function (event) {

    // Evitar que la página se recargue
    event.preventDefault();

    // Obtener los datos principales
    const nombreTrabajador = document
        .getElementById("trabajador")
        .value.trim();

    const seleccion = actividad.value;

    // VALIDAR FECHA
    if (!fecha.value) {
        alert("Debes seleccionar una fecha.");
        return;
    }

    // VALIDAR NOMBRE
    if (nombreTrabajador === "") {
        alert("Debes escribir el nombre del trabajador.");
        return;
    }

    // VALIDAR ACTIVIDAD
    if (!seleccion) {
        alert("Debes seleccionar una actividad.");
        return;
    }

    // VALIDAR ARMADO
    if (seleccion === "armado" || seleccion === "ambos") {

        if (!referencia.value) {
            alert("Debes seleccionar una referencia de armado.");
            return;
        }

        if (Number(cantidadArmado.value) <= 0) {
            alert("La cantidad de armado debe ser mayor que cero.");
            return;
        }
    }

    // VALIDAR CORTE
    if (seleccion === "corte" || seleccion === "ambos") {

        if (!tipoCorte.value) {
            alert("Debes seleccionar el tipo de corte.");
            return;
        }

        if (Number(cantidadCorte.value) <= 0) {
            alert("La cantidad de corte debe ser mayor que cero.");
            return;
        }
    }

    // CREAR REGISTRO
    const nuevoRegistro = {
        fecha: fecha.value,
        trabajador: nombreTrabajador,
        actividad: seleccion,

        // Datos de armado
        referencia: referencia.value,
        cantidadArmado: Number(cantidadArmado.value) || 0,

        // Datos de corte
        tipoCorte: tipoCorte.value,
        cantidadCorte: Number(cantidadCorte.value) || 0,

        // Liquidación
        total: Number(
            document.getElementById("totalGeneral").textContent
                .replace(/\D/g, "")
        ),

        // Estado de revisión
        estado: "Pendiente"
    };

    // GUARDAR REGISTRO
    registros.push(nuevoRegistro);

    localStorage.setItem(
        "produccion",
        JSON.stringify(registros)
    );

    // ACTUALIZAR HISTORIAL
    mostrarHistorial();

    // CONFIRMAR
    alert("¡Producción registrada correctamente!");

});
// ===================================
// 11. MOSTRAR HISTORIAL
// ===================================

// ===================================
// 11. MOSTRAR HISTORIAL
// ===================================

function mostrarHistorial() {

    const tabla = document.getElementById("tablaHistorial");

    tabla.innerHTML = "";

    registros.forEach(function (registro, indice) {

        const fila = document.createElement("tr");

        // Compatibilidad con registros antiguos
        const estado = registro.estado || "Pendiente";

        // Crear celdas
        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = registro.fecha;

        const celdaTrabajador = document.createElement("td");
        celdaTrabajador.textContent = registro.trabajador;

        const celdaActividad = document.createElement("td");
        celdaActividad.textContent = registro.actividad;
        const celdaDetalle = document.createElement("td");

        let detalle = [];

        if (registro.cantidadArmado > 0) {
            detalle.push(
                `${registro.referencia}: ${registro.cantidadArmado} unidades`
            );
        }

        if (registro.cantidadCorte > 0) {
            detalle.push(
                `Corte ${registro.tipoCorte}: ${registro.cantidadCorte} unidades`
            );
        }

        celdaDetalle.textContent = detalle.join(" | ") || "Sin detalle";

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent = formatoDinero(registro.total);

        const celdaEstado = document.createElement("td");
        celdaEstado.textContent = estado;

        const celdaAcciones = document.createElement("td");

        // Botón para aprobar
        if (estado === "Pendiente") {

            const botonAprobar = document.createElement("button");

            botonAprobar.textContent = "Aprobar";

            botonAprobar.type = "button";

            botonAprobar.addEventListener("click", function () {

                aprobarRegistro(indice);

            });

            celdaAcciones.appendChild(botonAprobar);

        } else {

            celdaAcciones.textContent = "Revisado";

        }

        // Agregar celdas a la fila
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaTrabajador);
        fila.appendChild(celdaActividad);
        fila.appendChild(celdaTotal);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaAcciones);
        fila.appendChild(celdaDetalle);

        tabla.appendChild(fila);

    });

}

// ===================================
// 12. APROBAR REGISTRO
// ===================================

function aprobarRegistro(indice) {

    const confirmar = confirm(
        "¿Estás seguro de aprobar esta producción?"
    );

    if (!confirmar) {
        return;
    }

    registros[indice].estado = "Aprobado";

    localStorage.setItem(
        "produccion",
        JSON.stringify(registros)
    );

    mostrarHistorial();

    alert("Producción aprobada correctamente.");

}