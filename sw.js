importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/01e3ae528a84dd4b5923.js",
    "revision": "76957e2e9c0b98baa33bac7e296fbf41"
  },
  {
    "url": "/_nuxt/182432626f2018f5b50c.js",
    "revision": "dc65e0cab21bfc660cc8611c596f38ac"
  },
  {
    "url": "/_nuxt/1c63558f0c3b5a91bbee.js",
    "revision": "3edea51d68524ca9da3974d2b6f9c6d6"
  },
  {
    "url": "/_nuxt/709262d974cd4c10fdc4.js",
    "revision": "5cefa09a4982a5da35d1c55fb7e16102"
  },
  {
    "url": "/_nuxt/975cfd8e75108c8aacb5.js",
    "revision": "9d94cb673aee8d0b438e9a60f106d6ca"
  },
  {
    "url": "/_nuxt/a461570a7456fb46dbe9.js",
    "revision": "332e09fe52af6a2b7525358ef1e6424a"
  },
  {
    "url": "/_nuxt/b2e38028d724eb9c1c40.js",
    "revision": "793d2cda5b4a370899311efc2112f390"
  }
], {
  "cacheId": "bredfern",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')
