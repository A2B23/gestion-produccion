
const URL_API = "https://script.google.com/macros/s/AKfycbxub26FgcZStv-Wf6uD0jDwP0JNWrLzSUKRYcM6Y8cIVlcq0wG5gxmizBS4AdZTfz0u1g/exec";

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
const formulario = document.getElementById("formProduccion");

let registros = [];

// ===================================
// 2. FECHA ACTUAL
// ===================================

function establecerFechaActual() {
    const hoy = new Date();

    fecha.value = new Date(
        hoy.getTime() - hoy.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];
}

establecerFechaActual();

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

referencias.forEach(item => {
    const opcion = document.createElement("option");
    opcion.value = item.nombre;
    opcion.textContent = item.nombre;
    referencia.appendChild(opcion);
});

// ===================================
// 4. MOSTRAR SECCIONES
// ===================================

function mostrarSecciones() {
    const seleccion = actividad.value;

    seccionArmado.style.display =
        seleccion === "armado" || seleccion === "ambos"
            ? "block" : "none";

    seccionCorte.style.display =
        seleccion === "corte" || seleccion === "ambos"
            ? "block" : "none";
}

actividad.addEventListener("change", mostrarSecciones);
mostrarSecciones();

// ===================================
// 5. FORMATO DE DINERO
// ===================================

function formatoDinero(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

// ===================================
// 6. CALCULAR PRODUCCIÓN
// ===================================

function calcularProduccion() {
    let totalArmado = 0;
    let totalCorte = 0;

    const seleccion = actividad.value;

    if (seleccion === "armado" || seleccion === "ambos") {
        const producto = referencias.find(
            item => item.nombre === referencia.value
        );

        const cantidad = Number(cantidadArmado.value) || 0;

        if (producto && cantidad > 0) {
            totalArmado = producto.precio * cantidad;
        }
    }

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

    const totalGeneral = totalArmado + totalCorte;

    document.getElementById("totalArmado").textContent =
        formatoDinero(totalArmado);

    document.getElementById("totalCorte").textContent =
        formatoDinero(totalCorte);

    document.getElementById("totalGeneral").textContent =
        formatoDinero(totalGeneral);
}

actividad.addEventListener("change", calcularProduccion);
referencia.addEventListener("change", calcularProduccion);
cantidadArmado.addEventListener("input", calcularProduccion);
tipoCorte.addEventListener("change", calcularProduccion);
cantidadCorte.addEventListener("input", calcularProduccion);

calcularProduccion();

// ===================================
// 7. CONSULTAR GOOGLE SHEETS
// ===================================

async function cargarRegistros() {
    const tabla = document.getElementById("tablaHistorial");

    tabla.innerHTML = `
        <tr>
            <td colspan="7">Consultando producción en la nube...</td>
        </tr>
    `;

    try {
        const respuesta = await fetch(URL_API);
        const datos = await respuesta.json();

        if (datos.estado !== "correcto") {
            throw new Error(
                datos.mensaje || "No se pudieron consultar los registros."
            );
        }

        registros = datos.registros.map(registro => ({
            id: registro.ID,
            fecha: registro.FECHA,
            trabajador: registro.TRABAJADOR,
            actividad: registro.ACTIVIDAD,
            referencia: registro.REFERENCIA,
            cantidadArmado: Number(registro.CANTIDAD_ARMADO) || 0,
            tipoCorte: registro.TIPO_CORTE,
            cantidadCorte: Number(registro.CANTIDAD_CORTE) || 0,
            total: Number(registro.TOTAL) || 0,
            estado: registro.ESTADO || "Pendiente"
        }));

        mostrarHistorial();

    } catch (error) {
        console.error("Error al consultar Google Sheets:", error);

        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    No se pudo consultar la nube. Revisa tu conexión
                    y la consola del navegador.
                </td>
            </tr>
        `;
    }
}

// ===================================
// 8. ENVIAR DATOS A GOOGLE SHEETS
// ===================================

async function enviarDatos(datos) {
    return fetch(URL_API, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(datos)
    });
}

// ===================================
// 9. REGISTRAR PRODUCCIÓN
// ===================================

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombreTrabajador = document
        .getElementById("trabajador")
        .value.trim();

    const seleccion = actividad.value;

    if (!fecha.value) {
        alert("Debes seleccionar una fecha.");
        return;
    }

    if (nombreTrabajador === "") {
        alert("Debes escribir el nombre del trabajador.");
        return;
    }

    if (!seleccion) {
        alert("Debes seleccionar una actividad.");
        return;
    }

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

    const nuevoRegistro = {
        fecha: fecha.value,
        trabajador: nombreTrabajador,
        actividad: seleccion,
        referencia: referencia.value,
        cantidadArmado: Number(cantidadArmado.value) || 0,
        tipoCorte: tipoCorte.value,
        cantidadCorte: Number(cantidadCorte.value) || 0,
        total: Number(
            document.getElementById("totalGeneral").textContent
                .replace(/\D/g, "")
        )
    };

    const boton = formulario.querySelector('[type="submit"]');

    try {
        boton.disabled = true;
        boton.textContent = "Enviando...";

        await enviarDatos(nuevoRegistro);

        alert(
            "Solicitud enviada. Vamos a consultar Google Sheets para verificar el registro."
        );

        formulario.reset();
        establecerFechaActual();

        mostrarSecciones();
        calcularProduccion();

        await new Promise(resolve => setTimeout(resolve, 2000));
        await cargarRegistros();

    } catch (error) {
        console.error("Error al enviar producción:", error);
        alert("No se pudo enviar la producción. Revisa tu conexión.");
    } finally {
        boton.disabled = false;
        boton.textContent = "Registrar producción";
    }
});

// ===================================
// 10. MOSTRAR HISTORIAL
// ===================================

function mostrarHistorial() {
    const tabla = document.getElementById("tablaHistorial");

    tabla.innerHTML = "";

    if (registros.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">Todavía no hay registros de producción.</td>
            </tr>
        `;
        return;
    }

    registros.forEach(function (registro) {
        const fila = document.createElement("tr");

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = registro.fecha;

        const celdaTrabajador = document.createElement("td");
        celdaTrabajador.textContent = registro.trabajador;

        const celdaActividad = document.createElement("td");
        celdaActividad.textContent = registro.actividad;

        const celdaDetalle = document.createElement("td");
        const detalle = [];

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

        celdaDetalle.textContent =
            detalle.join(" | ") || "Sin detalle";

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent = formatoDinero(registro.total);

        const celdaEstado = document.createElement("td");
        celdaEstado.textContent = registro.estado;

        const celdaAcciones = document.createElement("td");

        if (registro.estado === "Pendiente") {
            const botonAprobar = document.createElement("button");

            botonAprobar.textContent = "Aprobar";
            botonAprobar.type = "button";

            botonAprobar.addEventListener("click", function () {
                aprobarRegistro(registro.id);
            });

            celdaAcciones.appendChild(botonAprobar);
        } else {
            celdaAcciones.textContent = "Revisado";
        }

        fila.append(
            celdaFecha,
            celdaTrabajador,
            celdaActividad,
            celdaDetalle,
            celdaTotal,
            celdaEstado,
            celdaAcciones
        );

        tabla.appendChild(fila);
    });
}

// ===================================
// 11. APROBAR REGISTRO EN LA NUBE
// ===================================

async function aprobarRegistro(id) {
    const confirmar = confirm(
        "¿Estás seguro de aprobar esta producción?"
    );

    if (!confirmar) {
        return;
    }

    try {
        await enviarDatos({
            accion: "aprobar",
            id: id
        });

        alert(
            "Solicitud de aprobación enviada. Actualizaremos el historial."
        );

        await new Promise(resolve => setTimeout(resolve, 1500));
        await cargarRegistros();

    } catch (error) {
        console.error("Error al aprobar:", error);
        alert("No se pudo enviar la aprobación.");
    }
}

// ===================================
// 12. CARGA INICIAL
// ===================================

cargarRegistros();
