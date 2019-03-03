// Service Worker with Cache-first network

var CACHE = 'stopTinnitusPrecache';
var precacheFiles = [
      /* Array of files to precache */
      // '/',
      '/labs/stoptinnitus/',
      '/labs/stoptinnitus/index.html',
      '/labs/stoptinnitus/app.html',
      '/labs/stoptinnitus/src/scripts/app.js',
      '/labs/stoptinnitus/src/scripts/main.js',
      '/labs/stoptinnitus/src/scripts/workbox-config.js',
      '/labs/stoptinnitus/src/img',
      '/labs/stoptinnitus/src/sounds/white_noise.mp3',
      '/labs/stoptinnitus/src/sounds/white_noise.ogg',
      '/labs/stoptinnitus/src/sounds/pink_noise.mp3',
      '/labs/stoptinnitus/src/sounds/pink_noise.ogg',
    ];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(precache().then(function() {
    console.log('Skip waiting on install');
    return self.skipWaiting();
  }));
});


// Allow sw to control current page
self.addEventListener('activate', function(event) {
  console.log('Claiming clients for current page');
  return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.'+ evt.request.url);
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request){
  //this is the fallback if it is not in the cache to go to the server and get it
  return fetch(request).then(function(response){ return response});
}