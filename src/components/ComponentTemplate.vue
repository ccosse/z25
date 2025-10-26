<template>
  <q-card flat >
    <q-card-section>
      <div class="text-weight-bolder text-center q-pa-md">{{this.title}}</div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { useZ22Store } from 'stores/z22-store.js'
export default defineComponent ({
  name: 'Component',
  setup () {
    return {
      z22Store: useZ22Store(),
      title: ref('Title')
    }
  },
  mounted () {
    console.log('mounted')
  },
  methods: {
    dummy () {
      console.log('dummy')
    }
  }
})
</script>
<style>
</style>