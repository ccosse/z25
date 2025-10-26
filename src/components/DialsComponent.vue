<template>
  <q-card flat>
    <q-expansion-item label="Thresholds">
      <template v-slot:header>
        <q-item-section>
          <div class="text-weight-bold">
            Thresholds {{ this.z25Store.volThresh }}x {{ this.z25Store.pctThresh }}%
          </div>
        </q-item-section>
      </template>

      <q-card class="text-center">

        <q-card-section class="q-pt-none" align="center">
          <q-knob
            show-value
            size="100px"
            min="1"
            max="1000000"
            step="100"
            :thickness="0.5"
            color="positive"
            track-color="green-3"
            center-color="grey-8"
            class="text-white col q-ma-md"
            v-model="this.z25Store.barsNormalization"
          >
          </q-knob>
          <div class="text-weight-bold">Bars Normalization</div>
        </q-card-section>

        <q-card-section class="q-pt-none" align="center">
          <q-knob
            show-value
            size="100px"
            min="0"
            max="3"
            step="0.1"
            :thickness="0.5"
            color="positive"
            track-color="green-3"
            center-color="grey-8"
            class="text-white col q-ma-md"
            v-model="this.z25Store.pctThresh"
          >
          </q-knob>
          <div class="text-weight-bold">Percent Threshold</div>
        </q-card-section>
        <q-card-section class="q-pt-none" align="center">
          <q-knob
            show-value
            min="0"
            max="100"
            size="100px"
            stacked
            :thickness="0.5"
            color="positive"
            track-color="green-3"
            center-color="grey-8"
            class="text-white col q-ma-md"
            v-model="this.z25Store.volThresh"
          >
          </q-knob>
          <div class="text-weight-bold">Volume Threshold</div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { useZ25Store } from "stores/z25-store.js";
export default defineComponent({
  name: "DialsComponent",
  setup() {
    return {
      z25Store: useZ25Store(),
      title: ref("Title"),
    };
  },
  mounted() {
    console.log("mounted");
  },
  methods: {
    dummy() {
      console.log("dummy");
    },
  },
});
</script>
<style>
a {
  text-decoration: none;
}
</style>
