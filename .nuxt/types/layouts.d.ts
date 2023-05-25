import { ComputedRef, Ref } from 'vue'
export type LayoutKey = string
declare module "/home/bredfern/Documents/projects/bredfern.github.io/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: false | LayoutKey | Ref<LayoutKey> | ComputedRef<LayoutKey>
  }
}