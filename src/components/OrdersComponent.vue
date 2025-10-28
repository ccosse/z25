<template>
  <q-card
    dense
    flat
    :style="{ backgroundColor: 'grey' }"
    class="q-ma-xs q-pa-xs ptr"
  >
        <div class="flex flex-center" style="background-color: #222">
          <div v-for="(o, i) in sortedOrders" :key="i">
            <OrderComponent :o="o" />
          </div>
        </div>
        <q-space/>
        <div class="flex flex-center" no-margin style="background-color: #222">
        <table class="full-width text-center"><tbody>
          <tr style="background-color: #333">
            <th>Curr</th>
            <th>Side</th>
            <th>Size</th>
            <th>Price</th>
            <th>Pnow</th>
            <th>Value</th>
            <th>Target</th>
            <th>Progress</th>
          </tr>

          <tr v-for="(o, i) in sortedOrders" :key="i">
            <td style="width: 80px"><q-btn flat dense @click="this.z25Store.cbxLink(o.product_id.replace('-USDC','-USD'))">{{ o.product_id.split('-')[0] }}</q-btn></td>
            <td>
              <q-badge v-if="o.side == 'SELL'" color="red" rounded  />
              <q-badge v-if="o.side == 'BUY'" color="green" rounded  />
            </td>
            <td>
              <span v-if="o.status=='OPEN'">
              {{ parseFloat(o.order_configuration.limit_limit_gtc.base_size) }}
              </span>
            </td>
            <td>
              <span v-if="o.status=='OPEN'">
              {{ parseFloat(o.order_configuration.limit_limit_gtc.limit_price).toFixed(4) }}
              </span>
            </td>
            <td>
              <span v-if="this.z25Store.channels[o.product_id.replace('-USDC','-USD')]">
              {{
                this.z25Store.channels[o.product_id.replace('-USDC','-USD')].rawData[0].Close.toFixed(4)
              }}
              </span>
            </td>
            <td>
              <span v-if="this.z25Store.channels[o.product_id.replace('-USDC','-USD')] && o.status=='OPEN'">
              {{
                (
                  parseFloat(o.order_configuration.limit_limit_gtc.base_size) *
                  this.z25Store.channels[o.product_id.replace('-USDC','-USD')].rawData[0].Close
                ).toFixed(6)
              }}
              </span>
            </td>
            <td>
              <span v-if="this.z25Store.channels[o.product_id.replace('-USDC','-USD')] && o.status=='OPEN'">
              {{ (parseFloat(o.order_configuration.limit_limit_gtc.base_size) * parseFloat(o.order_configuration.limit_limit_gtc.limit_price)).toFixed(4) }}
              </span>
            </td>
            <td>
              <span v-if="this.z25Store.channels[o.product_id.replace('-USDC','-USD')] && o.status=='OPEN'">
              {{
                (
                  ((o.order_configuration.limit_limit_gtc.limit_price -
                    this.z25Store.channels[o.product_id.replace('-USDC','-USD')].rawData[0].Close) /
                    o.order_configuration.limit_limit_gtc.limit_price) *
                  100
                ).toFixed(2)
              }}%
              </span>
            </td>
          </tr>
        </tbody></table>
        </div>
  </q-card>
</template>
<script>
import { defineComponent, ref, computed } from "vue";
import { useZ25Store } from "stores/z25-store.js";
import OrderComponent from "components/OrderComponent.vue";


export default defineComponent({
name: "OrdersComponent",
  components: {
    OrderComponent,
  },
  setup() {
    const z25Store = useZ25Store();

const rankSide = (s) => {
  const v = String(s ?? '').trim().toLowerCase()
  if (v === 'buy' || v === 'b') return 0
  if (v === 'sell' || v === 's') return 1
  return 2
}
const sortedOrders = computed(() => {
  const orders = Array.isArray(z25Store.orders) ? z25Store.orders : []
  return [...orders].sort((a, b) => rankSide(a.side) - rankSide(b.side))
})
return {
      z25Store,
      title: ref("Title"),
    
      sortedOrders
    };
  },
  mounted() {
    console.log("OrdersComponent mounted");
  },
  methods: {
    dummy() {
      console.log("dummy");
    },
  },
});
</script>
<style></style>