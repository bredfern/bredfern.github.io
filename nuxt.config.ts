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

  ssr: true,
  devtools: {
    enabled: true
  },
})
