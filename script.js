

/* =====================================
   CONFIGURACIÓN DEL JUEGO
===================================== */

const pantallas = document.querySelectorAll(".pantalla");

const escenario = document.getElementById("escenario");
const residuosContenedor = document.getElementById("residuos");
const zonaLimpieza = document.getElementById("zonaLimpieza");
const linterna = document.getElementById("linterna");
const contador = document.getElementById("contador");

let residuosRestantes = 0;
let dificultadActual = "";
let arrastrando = null;

let desplazamientoX = 0;
let desplazamientoY = 0;

let posicionInicialX = 0;
let posicionInicialY = 0;


/* =====================================
   CAMBIAR PANTALLAS
===================================== */

function cambiarPantalla(id) {

    pantallas.forEach(pantalla => {
        pantalla.classList.remove("activa");
    });

    document.getElementById(id).classList.add("activa");
}

function mostrarMenu() {
    cambiarPantalla("menu");
}

function volverMenu() {

    arrastrando = null;
    zonaLimpieza.classList.remove("activa");

    cambiarPantalla("menu");
}


/* =====================================
   INICIAR PARTIDA
===================================== */

function iniciarJuego(dificultad) {

    dificultadActual = dificultad;

    const cantidades = {
        basico: 5,
        intermedio: 8,
        avanzado: 12
    };

    residuosRestantes = cantidades[dificultad];

    contador.textContent = residuosRestantes;

    residuosContenedor.innerHTML = "";

    arrastrando = null;

    // CONFIGURAR LINTERNA

    if (dificultad === "basico") {

        linterna.style.display = "none";

    } else {

        linterna.style.display = "block";

        ajustarLinterna();
    }

    linterna.style.setProperty("--x", "50%");
    linterna.style.setProperty("--y", "50%");

    // TIPOS DE RESIDUOS

    const tiposResiduos = [
        "cigarro.png",
        "botella.png",
        "plastico.png",
        "basura.png",
        "cigarro.png",
        "botella.png",
        "plastico.png",
        "basura.png",
        "cigarro.png",
        "botella.png",
        "plastico.png",
        "basura.png"
    ];

    // CREAR RESIDUOS

    for (let i = 0; i < residuosRestantes; i++) {

        const residuo = document.createElement("div");

        residuo.classList.add("residuo");

        const imagen = document.createElement("img");

        imagen.src = "assets/img/" + tiposResiduos[i];

        imagen.alt = "Agente contaminante";

        imagen.classList.add("imagenResiduo");

        // DETECTAR SI UNA IMAGEN NO EXISTE

        imagen.onerror = function() {
            console.error("No se encontró la imagen:", imagen.src);
        };

        residuo.appendChild(imagen);

        // POSICIÓN ALEATORIA

        residuo.style.left =
            (15 + Math.random() * 70) + "%";

        residuo.style.top =
            (15 + Math.random() * 70) + "%";

        residuosContenedor.appendChild(residuo);

        activarArrastre(residuo);
    }

    cambiarPantalla("juego");
}


/* =====================================
   SISTEMA DE ARRASTRE
===================================== */

function activarArrastre(elemento) {

    elemento.addEventListener("pointerdown", function(e) {

        arrastrando = elemento;

        const rect = elemento.getBoundingClientRect();

        const escenarioRect = escenario.getBoundingClientRect();

        // GUARDAR POSICIÓN ORIGINAL

        posicionInicialX =
            parseFloat(elemento.style.left);

        posicionInicialY =
            parseFloat(elemento.style.top);

        // CALCULAR DESPLAZAMIENTO

        desplazamientoX =
            e.clientX - rect.left - rect.width / 2;

        desplazamientoY =
            e.clientY - rect.top - rect.height / 2;

        elemento.classList.add("arrastrando");

        // CAPTURAR EL MOVIMIENTO DEL PUNTERO

        elemento.setPointerCapture(e.pointerId);

        e.preventDefault();
    });


    elemento.addEventListener("pointermove", function(e) {

        if (arrastrando !== elemento) return;

        const rect = escenario.getBoundingClientRect();

        let x = e.clientX - rect.left - desplazamientoX;
        let y = e.clientY - rect.top - desplazamientoY;

        // MOVER RESIDUO

        elemento.style.left =
            (x / rect.width * 100) + "%";

        elemento.style.top =
            (y / rect.height * 100) + "%";

        // DETECTAR CERCANÍA A ZONA DE LIMPIEZA

        const zona = zonaLimpieza.getBoundingClientRect();

        const dentroZona =
            e.clientX >= zona.left &&
            e.clientX <= zona.right &&
            e.clientY >= zona.top &&
            e.clientY <= zona.bottom;

        zonaLimpieza.classList.toggle("activa", dentroZona);
    });


    elemento.addEventListener("pointerup", function(e) {

        if (arrastrando !== elemento) return;

        const zona = zonaLimpieza.getBoundingClientRect();

        const dentroZona =
            e.clientX >= zona.left &&
            e.clientX <= zona.right &&
            e.clientY >= zona.top &&
            e.clientY <= zona.bottom;

        if (dentroZona) {

            // ELIMINAR RESIDUO

            elemento.remove();

            residuosRestantes--;

            contador.textContent = residuosRestantes;

            comprobarVictoria();

        } else {

            // REGRESAR A LA POSICIÓN ORIGINAL

            elemento.style.left = posicionInicialX + "%";

            elemento.style.top = posicionInicialY + "%";
        }

        finalizarArrastre(elemento);
    });


    elemento.addEventListener("pointercancel", function() {

        if (arrastrando !== elemento) return;

        // RESTAURAR POSICIÓN

        elemento.style.left = posicionInicialX + "%";

        elemento.style.top = posicionInicialY + "%";

        finalizarArrastre(elemento);
    });

}


/* =====================================
   FINALIZAR ARRASTRE
===================================== */

function finalizarArrastre(elemento) {

    elemento.classList.remove("arrastrando");

    arrastrando = null;

    zonaLimpieza.classList.remove("activa");
}


/* =====================================
   MOVIMIENTO DE LA LINTERNA
===================================== */

escenario.addEventListener("pointermove", function(e) {

    if (dificultadActual === "basico") return;

    const rect = escenario.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    linterna.style.setProperty("--x", x + "px");

    linterna.style.setProperty("--y", y + "px");
});


/* =====================================
   AJUSTAR TAMAÑO DE LINTERNA
===================================== */

function ajustarLinterna() {

    let tamaño = 90;

    if (dificultadActual === "avanzado") {

        tamaño = 55;
    }

    linterna.style.background = `
        radial-gradient(
            circle ${tamaño}px at var(--x, 50%) var(--y, 50%),
            transparent 0%,
            rgba(0,0,0,0.20) 50%,
            rgba(0,0,0,0.97) 100%
        )
    `;
}


/* =====================================
   COMPROBAR VICTORIA
===================================== */

function comprobarVictoria() {

    if (residuosRestantes === 0) {

        linterna.style.display = "none";

        setTimeout(function() {

            cambiarPantalla("completado");

        }, 500);
    }
}




/* =====================================
   REGISTRO DE APLICACIÓN OFFLINE
===================================== */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registro = await navigator.serviceWorker.register("./sw.js");

            console.log(
                "Aplicación offline registrada correctamente:",
                registro.scope
            );

        } catch (error) {

            console.error(
                "Error al registrar la aplicación offline:",
                error
            );

        }

    });

}
