// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
      '@nuxtjs/tailwindcss',
      '@nuxtjs/stylelint-module',
      '@nuxt/content',
  ],

  stylelint: {
      "lintOnStart": false
  },
  app: {
    baseURL: '/' // baseURL: '/<repository>/'
  },
  ssr: true,
  devtools: {
    enabled: true
  },
})
