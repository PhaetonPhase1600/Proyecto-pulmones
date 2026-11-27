
const CACHE_NAME = "agentes-contaminantes-v1";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    // LOGO
    "./assets/img/logo_respira_transparente (1).png",

    // RESIDUOS
    "./assets/img/cigarro.png",
    "./assets/img/botella.png",
    "./assets/img/plastico.png",
    "./assets/img/basura.png",

    // VIDEO
    "./assets/video/fondo.mp4"
];


/* INSTALAR Y GUARDAR ARCHIVOS */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return Promise.all(
                ARCHIVOS.map(async archivo => {

                    try {

                        const respuesta = await fetch(archivo);

                        if (!respuesta.ok) {
                            throw new Error("Error al cargar " + archivo);
                        }

                        await cache.put(archivo, respuesta);

                    } catch (error) {

                        console.warn(
                            "No se pudo guardar:",
                            archivo,
                            error
                        );

                    }

                })
            );

        })

    );

    self.skipWaiting();

});


/* ACTIVAR Y LIMPIAR CACHÉS ANTIGUAS */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(nombres => {

            return Promise.all(

                nombres.map(nombre => {

                    if (nombre !== CACHE_NAME) {
                        return caches.delete(nombre);
                    }

                })

            );

        })

    );

    self.clients.claim();

});


/* FUNCIONAMIENTO SIN INTERNET */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(

        caches.match(event.request).then(respuestaCache => {

            if (respuestaCache) {
                return respuestaCache;
            }

            return fetch(event.request).then(respuestaRed => {

                if (
                    respuestaRed &&
                    respuestaRed.status === 200
                ) {

                    const copia = respuestaRed.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copia);
                    });

                }

                return respuestaRed;

            }).catch(() => {

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return new Response(
                    "Recurso no disponible sin conexión",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );

            });

        })

    );

});
