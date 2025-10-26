<template>
  <q-expansion-item label="Z25 Connection" v-model="expanded">

    <q-card
      v-if="expanded"
      dense
      flat
      :style="{ backgroundColor: 'grey', borderRadius: '5px' }"
      class="q-ma-md ptr q-pa-xs"
    >
      <div
        id="Z25_debug"
        :style="{
          backgroundColor: '#222',
          borderRadius: '5px',
        }"
        class="flex flex-center q-pa-sm q-ma-xs"
      >
      </div>

      <div
        :style="{
          backgroundColor: '#222',
          borderRadius: '5px',
        }"
        class="flex flex-center q-pa-sm q-ma-xs"
      >
        <table class="text-center"><tbody>
          <tr>
            <th colSpan="10">Channels</th>
          </tr>
          <tr>
            <th>Tot</th>
            <th>Sub</th>
            <th>Ign</th>
            <th>Hid</th>
            <th>Ord</th>
            <th>Vol</th>
            <th>Pct</th>
          </tr>
          <tr>
            <td>{{ store.nchan }}</td>
            <td>{{ store.nsub }}</td>
            <td>{{ store.nignore }}</td>
            <td>{{ store.nhidden }}</td>
            <td>{{ store.channelsWithOrders.length }}</td>
            <td>{{ store.nvol }}</td>
            <td>{{ store.npct }}</td>
          </tr>
        </tbody></table>
      </div>

      <q-card-section class="text-center">
        <q-btn
          @click="this.store.connect()"
          :style="{ backgroundColor: '#222' }"
        >
          <q-icon v-if="this.store.connected" name="private_connectivity" color="green" />
          <q-icon v-else name="private_connectivity" color="grey" />
          &nbsp;&nbsp; Z25d
        </q-btn>

        <q-chip
          clickable
          outline
          square
          @click="this.store.connect()"
          class="q-pa-md hidden"
        >
          <q-avatar
            v-if="this.store.connected"
            class="text-positive"
            icon="cloud"
          />
          <q-avatar v-else icon="cloud_off" />
          {{ this.store.connStatus }}
        </q-chip>
      </q-card-section>

      <q-card-section class="text-center">
        <div
          :style="{ backgroundColor: '#222', borderRadius: '5px' }"
          class="flex flex-center"
        >
          <q-toggle v-model="this.store.subscribeVol">Vol</q-toggle>
          <q-toggle v-model="this.store.subscribePct">Pct</q-toggle>
          <q-toggle v-model="this.store.subscribeBal">Bal</q-toggle>
          <q-toggle v-model="this.store.subscribeBTC">BTC</q-toggle>
          <q-toggle v-model="this.store.subscribeETH">ETH</q-toggle>
          <q-toggle
            v-model="this.store.maintainHotlist"
            @update:model-value="this.store.toggleHotlist()"
          >Hot</q-toggle>

          <q-item>
            <q-item-section>
              <q-btn
                @click="this.store.sendSettings()"
                icon="sync_alt"
                color="positive"
              ></q-btn>
            </q-item-section>
            <q-item-section>
              <q-btn
                @click="this.store.clearLookAtMe()"
                icon="clear"
                color="positive"
              ></q-btn>
            </q-item-section>
            <q-item-section>
              <q-btn
                @click="this.store.restartCBX()"
                icon="cloud_sync"
                color="positive"
              >
                <q-tooltip>Restart CBX data-feed if closed</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <!--
      <q-card-section>
        <q-expansion-item label="Balances">
          <span
            v-for="(CURROBJ, CURRNAME) in this.store.currencies"
            :key="CURRNAME"
          >
            <div
              flat
              dense
              class="q-ma-sm"
              v-if="
                this.store.channels[CURROBJ['pid']] &&
                this.store.channels[CURROBJ['pid']].balance > 0
              "
            >
              <q-card
                dense
                flat
                :style="{
                  backgroundColor: [this.store.getChannelColor(CURROBJ['pid'])],
                  color: 'navy',
                }"
                class="channel-label q-pa-xs"
                @mouseenter="this.fatOn(CURROBJ.pid)"
                @mouseout="this.fatOff(CURROBJ.pid)"
              >
                <q-checkbox
                  dense
                  class="q-ml-sm"
                  v-model="this.store.channels[CURROBJ.pid].subscribed"
                  checked-icon="star"
                  unchecked-icon="star_border"
                  indeterminate-icon="help"
                />
                {{ CURRNAME }}
                <span class="float-right">
                  {{
                    (
                      this.store.channels[CURROBJ.pid].balance *
                      this.store.channels[CURROBJ.pid].rawData[0].Close
                    ).toFixed(4)
                  }}
                </span>
              </q-card>
            </div>
          </span>
        </q-expansion-item>
      </q-card-section>
-->
    </q-card>
  </q-expansion-item>

  <q-expansion-item label="Currencies">
    <q-card
      dense
      flat
      :style="{ backgroundColor: 'grey' }"
      class="q-ma-xs ptr q-pa-xs"
    >
      <div
        :style="{ backgroundColor: '#222', borderRadius: '5px', width: '290px', overflow: auto, }"
      >
        <q-expansion-item
          dense
          v-for="(CURRNAME, idx) in Object.keys(this.store.currencies).sort()"
          :key="idx"
          :header-style="{
            backgroundColor: [this.store.getChannelColorByIDX(idx)],
            color: 'navy',
            borderRadius: '5px',
          }"
          class="q-ma-xs q-pa-xs"
        >
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                <q-icon
                  :name="
                    this.store.currencies[CURRNAME]['subscribed'] == true
                      ? 'star'
                      : 'star_border'
                  "
                  @click="this.store.toggleSubscribedByCurrname(CURRNAME)"
                />
                {{ CURRNAME }}
              </div>
            </q-item-section>
          </template>
          <span v-if="this.store.currencies[CURRNAME]['subscribed'] == false">
            <q-btn
              outline
              class="q-ma-md"
              @click="this.store.subscribe(CURRNAME)"
            >
              Subscribe
            </q-btn>
          </span>
          <span v-else>
            <q-btn
              outline
              class="q-ma-md"
              @click="this.store.unsubscribe(CURRNAME)"
            >
              Un-Subscribe
            </q-btn>
          </span>
          <pre>{{
            JSON.stringify(this.store.currencies[CURRNAME], null, 2)
          }}</pre>
        </q-expansion-item>
      </div>
    </q-card>
  </q-expansion-item>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useZ25Store } from "stores/z25-store.js";

export default defineComponent({
  name: "Z25Component",
  setup() {
    return {
      store: useZ25Store(),
      expanded: ref(false),
    };
  },
  mounted() {
    this.store.getCurrencies();
  },
  methods: {
    fatOn(k) {
      console.log("fatOn", k);
      this.store.channels[k].fatLine = true;
    },
    fatOff(k) {
      console.log("fatOff", k);
      this.store.channels[k].fatLine = false;
    },
    sellCB(pid) {
      console.log("sellCB", pid);
      this.store.sellCB(pid);
    },
    buy1CB(pid) {
      console.log(this.store.buy1(pid));
    },
    pidCB(pid) {
      console.log("pidCB ", pid);
      const URL = `https://pro.coinbase.com/trade/${pid}`;
      window.open(URL, "_blank");
    },
  },
});
</script>
