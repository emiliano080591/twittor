//imports
importScripts('js/sw-utils.js');

const STATIC_CACHE='static-v3';
const DYNAMIC_CACHE='dynamica-v1';
const INMUTABLE_CACHE='inmutable-v1';

const APP_SHELL=[
    //'/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/hulk.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js'
];

const APP_SHELL_INMUTABLE=[
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

//Instala el service worker
self.addEventListener('install',e=>{
    //Instala el cache estatico
    const cacheStatic=caches.open(STATIC_CACHE).then(cache=>{
        cache.addAll(APP_SHELL);
    });
    //Instala el cache inmutable
    const cacheInmutable=caches.open(INMUTABLE_CACHE).then(cache=>{
        cache.addAll(APP_SHELL_INMUTABLE);
    });

    //espera a que se instalen los caches antes de seguir con 'activate'
    e.waitUntil(Promise.all([cacheStatic,cacheInmutable]));
});

//borrar los caches viejos cuando se esta activando el service worker
self.addEventListener('activate',e=>{
    const respuesta=caches.keys().then(keys=>{
        keys.forEach(key=>{
            if (key!=STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }
        });
    });
    e.waitUntil(respuesta);
});

self.addEventListener('fetch',e=>{
    const respuesta=caches.match(e.request).then(res=>{
        if (res) {
            return res;
        }else{
            return fetch(e.request).then(newRes=>{
                return actualizaCacheDinamico(DYNAMIC_CACHE,e.request,newRes);
            });
        }
    });
    
    e.respondWith(respuesta);
});