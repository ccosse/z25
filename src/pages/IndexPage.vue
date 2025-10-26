<template>
  <q-page>
    <q-scroll-area :style="{height: '94vh'}">
    <TypeA />
    <div id="ordersPanel" class="hidden">
      <OrdersComponent />
    </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import TypeA from "components/TypeA.vue";
import OrdersComponent from "src/components/OrdersComponent.vue";
import { useZ25Store } from "stores/z25-store.js";

export default defineComponent({
  name: "IndexPage",
  components: {
    TypeA,
    OrdersComponent,
  },
  setup() {
    return {
      visible: ref(true),
      z25Store: useZ25Store(),
    };
  },
  mounted() {},
  methods: {
    fatOn(k) {
      console.log("fatOn", k);
      this.z25Store.channels[k].fatLine = true;
    },
    fatOff(k) {
      console.log("fatOff", k);
      this.z25Store.channels[k].fatLine = false;
    },
    toggleVisibility(k) {
      if (this.z25Store.channels[k].hidden)
        this.z25Store.channels[k].hidden = false;
      else this.z25Store.channels[k].hidden = true;
    },
  },
});
</script>
