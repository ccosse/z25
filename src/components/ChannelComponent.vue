<template>
  <q-card
    v-if="this.c && this.c[1]"
    dense
    flat
    :style="{ backgroundColor: 'grey' }"
    class="q-ma-xs ptr q-pa-xs"
    @mouseover="this.fatOn(c[0])"
    @mouseout="this.fatOff(c[0])"
  >
    <div class="flex flex-center" :style="{ backgroundColor: '#222' }">
      <q-badge
        class="q-ma-xs"
        rounded
        :color="this.c[1].lookAtMePCT ? 'positive' : 'grey'"
        label="PCT"
      />
      <q-badge
        class="on-right q-ma-xs"
        rounded
        :color="this.c[1].lookAtMeVOL ? 'positive' : 'grey'"
        label="VOL"
      />
      <q-badge
        class="on-right q-ma-xs"
        rounded
        :color="this.c[1].balance ? 'positive' : 'grey'"
        label="BAL"
      />
      <q-badge
        class="on-right q-ma-xs"
        rounded
        :color="this.c[1].subscribed ? 'positive' : 'grey'"
        label="SUB"
      />
      <q-badge
        class="on-right q-ma-xs"
        rounded
        :color="this.z25Store.channelsWithOrders.indexOf(this.c[0]) > -1 ? 'positive' : 'grey'"
        label="ORD"
      />

      <q-icon
        :name="c[1].pinned ? 'push_pin' : 'push_pin'"
        :color="c[1].pinned ? 'green-13' : 'grey'"
        @click="this.z25Store.togglePinned(c[1].pid)"
        class="text-h6 q-ml-sm"
      />
    </div>

    <div>
      <table width="100%"><tbody>
        <tr>
          <td>
            <div
              :style="{
                backgroundColor: [this.z25Store.getChannelColor(c[1].pid)],
                color: 'navy',
                borderRadius: '5px',
              }"
              @click="this.cbxLink(c[1].pid)"
              class="q-pa-sm text-center text-h6"
            >
              {{ currency }}
            </div>
          </td>

          <td align="right">
            <div
              :style="{
                backgroundColor: '#222',
                color: 'white',
                borderRadius: '5px',
              }"
              class="q-pa-sm text-center text-h6"
            >
              <div :class="`${c[0]}-price-label`"></div>
            </div>
          </td>
        </tr>
      </tbody></table>

      <div
        :style="{
          backgroundColor: '#222',
          color: 'white',
          borderRadius: '5px',
          fontSize: '14pt',
        }"
        class="q-pa-sm q-my-xs q-mx-xs flex flex-center text-weight-bold full-width"
      >
        <table width="100%"><tbody>
          <tr style="background-color: " class="text-center">
            <td colSpan="1">
              <div :style="{ fontSize: '10pt' }">{{ BuyUSD10 }}</div>
              <div :style="{ fontSize: '10pt' }">{{ SellUSD10 }}</div>
              <div>{{ BuyUSD1 }}</div>
              <div>{{ SellUSD1 }}</div>
            </td>

            <td class="text-center">
              <div style="color: #5f5">+{{ pct24High }}%</div>

              <div>
                <span
                  v-if="
                    this.z25Store.channels[this.c[0]].price >
                    this.z25Store.channels[this.c[0]].open_24h
                  "
                  style="color: #5f5"
                  >+ {{ pct24Now }}%</span
                >
                <span v-else style="color: #f55">{{ pct24Now }}%</span>
              </div>

              <div style="color: #f55">{{ pct24Low }}%</div>
            </td>
          </tr>
        </tbody></table>
      </div>
    </div>

    <!-- histoTable -->
    <table
      style="background-color: #222; border-radius: 4px"
      class="q-ma-xs full-width"
    ><tbody>
      <tr>
        <td v-for="i in 10" :key="i">
          <div
            :style="{
              backgroundColor: pctColors[i - 1],
              width: '20px',
              height: '20px',
            }"
            class="histoTableCell"
          >
            <q-tooltip
              class="text-h6 text-center"
              :style="{ backgroundColor: '#222', }"
            >
              <q-card bordered flat class="q-ma-xs q-pa-sm">
                +$
                {{
                  (
                    this.z25Store.channels[this.c[0]].rawData[i - 1]["BuyUSD"] /
                    1000
                  ).toFixed(1)
                }}
                k
                <br />
                -$
                {{
                  (
                    this.z25Store.channels[this.c[0]].rawData[i - 1][
                      "SellUSD"
                    ] / 1000
                  ).toFixed(1)
                }}
                k
                <br />
                <span
                  v-if="
                    this.z25Store.channels[this.c[0]].rawData[i - 1][
                      'PricePctChange'
                    ] > 0
                  "
                >
                  +
                </span>

                <span
                  :style="{
                    color:
                      this.z25Store.channels[this.c[0]].rawData[i - 1][
                        'PricePctChange'
                      ] > 0
                        ? 'green'
                        : 'red',
                  }"
                >
                  {{
                    this.z25Store.channels[this.c[0]].rawData[i - 1][
                      "PricePctChange"
                    ].toFixed(3)
                  }}%
                </span>
                <br />
                {{ pctColors[i - 1] }}
              </q-card>
            </q-tooltip>
            <span class="hidden">{{ i - 1 }}</span>
          </div>
        </td>
      </tr>
    </tbody></table>

    <!-- histoTable -->
    <table
      style="background-color: #222; border-radius: 4px"
      class="q-ma-xs full-width"
    ><tbody>
      <tr>
        <td v-for="i in 10" :key="i">
          <div
            :style="{
              backgroundColor: volColors[i - 1],
              width: '20px',
              height: '20px',
            }"
          >
            <q-tooltip
              class="text-h6 text-center"
              :style="{ backgroundColor: '#222' }"
            >
              <q-card bordered flat class="q-ma-xs q-pa-sm">
                +
                {{
                  this.z25Store.channels[this.c[0]].rawData[i - 1][
                    "BuyVOL"
                  ].toFixed(1)
                }}

                <br />
                -
                {{
                  this.z25Store.channels[this.c[0]].rawData[i - 1][
                    "SellVOL"
                  ].toFixed(1)
                }}

                <br />
                <span
                  v-if="
                    this.z25Store.channels[this.c[0]].rawData[i - 1][
                      'PricePctChange'
                    ] > 0
                  "
                >
                </span>
                <span
                  :style="{
                    color:
                      parseFloat(
                        (this.z25Store.channels[this.c[0]].rawData[i - 1][
                          'BuyVOL'
                        ] -
                          this.z25Store.channels[this.c[0]].rawData[i - 1][
                            'SellVOL'
                          ]) /
                          this.z25Store.channels[this.c[0]].volume_1m
                      ) >= 0
                        ? 'green'
                        : 'red',
                  }"
                >
                  {{
                    parseFloat(
                      (this.z25Store.channels[this.c[0]].rawData[i - 1][
                        "BuyVOL"
                      ] -
                        this.z25Store.channels[this.c[0]].rawData[i - 1][
                          "SellVOL"
                        ]) /
                        this.z25Store.channels[this.c[0]].volume_1m
                    ).toFixed(2)
                  }}
                  x ({{
                    this.z25Store.channels[this.c[0]].volume_1m.toFixed(2)
                  }})
                </span>
                <br />
                {{ volColors[i - 1] }}
              </q-card>
            </q-tooltip>
            <span class="hidden">{{ i - 1 }}</span>
          </div>
        </td>
      </tr>
    </tbody></table>

    <div class="text-center full-width" :style="{ backgroundColor: '#222' }">
      <q-icon
        :name="c[1].ignore ? 'notifications_paused' : 'notifications'"
        @click="this.toggleIgnore(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
        :color="c[1].ignore ? 'blue-13' : 'grey'"
      />
      <q-icon
        :name="this.c[1].subscribed ? 'star' : 'star_border'"
        @click="this.z25Store.toggleSubscribed(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ borderRadius: '2px' }"
        :color="!c[1].subscribed ? 'grey' : 'green-13'"
      />
      <!--
      <q-icon
        :name="c[1].dots ? 'timeline' : 'show_chart'"
        @click="this.toggleDots(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
        :color="c[1].dots ? 'green-13' : 'grey'"
      />
      -->
      <q-icon
        :name="c[1].candlesticks ? 'candlestick_chart' : 'insights'"
        @click="this.toggleCandlesticks(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
        :color="c[1].candlesticks ? 'green-13' : 'grey'"
      />
      <q-icon
        :name="'bar_chart'"
        @click="this.toggleBars(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
        :color="c[1].bars ? 'green-13' : 'grey'"
      />
      <q-icon
        :name="c[1].hidden ? 'visibility_off' : 'visibility'"
        @click="this.toggleVisibility(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
        :color="c[1].hidden ? 'grey' : 'green-13'"
      />
      <q-icon
        :name="'close'"
        @click="this.z25Store.removeChannel(c[1].pid)"
        class="text-h6 q-ma-sm"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
      />
    </div>

    <div class="flex flex-center" :style="{ backgroundColor: '#222' }">
      <!--
      <q-icon
        name="sell"
        @click="this.z25Store.sell3PCT(c[1].pid)"
        class="text-h6 q-mx-md q-mb-md"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
      >
        <q-tooltip>Sell balance @3%</q-tooltip>
      </q-icon>

      <q-icon
        name="sell"
        @click="this.z25Store.sell(c[1].pid)"
        class="text-h6 q-mx-md q-mb-md"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
      >
        <q-tooltip>Sell balance @Market</q-tooltip>
      </q-icon>


      <q-icon
        name="attach_money"
        @click="this.z25Store.buy1(c[1].pid)"
        class="text-h6 q-mx-md q-mb-md"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
      >
      <q-tooltip>Buy $1 @Market</q-tooltip>
      </q-icon>

      <q-icon
        name="attach_money"
        @click="this.z25Store.buy10at3PCT(c[1].pid)"
        class="text-h6 q-mx-md q-mb-md color-blue"
        :style="{ backgroundColor: '', borderRadius: '2px' }"
      >
      <q-tooltip>Buy $10 @3%</q-tooltip>
      </q-icon>
      -->
    </div>

    <div class="flex flex-center full-width" no-padding no-margin :style="{ backgroundColor: '#222' }">
      <BuySellComponent :pid="c[1].pid"/>
    </div>




  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useZ25Store } from "stores/z25-store.js";
import * as d3 from "d3";
import BuySellComponent from 'components/BuySellComponent.vue'

const opacities = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

export default defineComponent({
  name: "ChannelComponent",
  components: {
    BuySellComponent,
  },
  props: ["c", "k"],
  setup(props) {
    return {
      z25Store: useZ25Store(),
      props: ref(props),
    };
  },
  computed: {
    channelColor() {
      return this.z25Store.colorThemes[this.z25Store.colorTheme](
        parseFloat(
          Object.keys(this.z25Store.currencies).indexOf(this.c[0].split("-")[0])
        ) / 260
      );
      //return this.c[0] == "BTC-USD" ? "green" : "red";
    },
    pctColors() {
      const rval = [];
      //const pctThreshCommon = 0.06
      let pctThresh = 0.6; //this.c[1].rawData[0].pctThresh;
      if (this.c[0] == "BTC-USD") pctThresh = 0.06; //
      for (var i = 0; i < 15; i++) {
        //rval.push(channelColor);
        const oidx = Math.min(
          Math.abs(
            parseInt(
              (this.c[1].rawData[i]["PricePctChange"] / pctThresh) *
                (opacities.length - 1)
            )
          ),
          15
        );
        if (this.c[1].rawData[i]["PricePctChange"] > 0)
          rval.push("#5F5" + opacities[oidx]);
        else rval.push("#F55" + opacities[Math.abs(oidx)]);
      }
      //console.log(rval);
      return rval;
    },
    volColors() {
      const rval = [];
      //const pctThreshCommon = 0.06
      let volThresh = 3;
      if (this.c[0] == "BTC-USD") volThresh = 0.6; //
      for (var i = 0; i < 15; i++) {
        //rval.push(channelColor);
        const oidx = Math.min(
          Math.abs(
            parseInt(
              ((this.c[1].rawData[i]["BuyVOL"] -
                this.c[1].rawData[i]["SellVOL"]) /
                this.c[1].volume_1m /
                volThresh) *
                (opacities.length - 1)
            )
          ),
          15
        );
        if (
          this.c[1].rawData[i]["BuyVOL"] - this.c[1].rawData[i]["SellVOL"] >
          0
        )
          rval.push("#5F5" + opacities[oidx]);
        else rval.push("#F55" + opacities[Math.abs(oidx)]);
      }
      //console.log(rval);
      return rval;
    },
    currency() {
      return this.c[0].split("-")[0];
    },
    BuyUSD1() {
      let sum = 0;
      for (let idx = 0; idx < 1; idx++) sum += this.c[1].rawData[idx]["BuyUSD"];
      return `+$${(sum / 1e3).toFixed(2)}k`;
    },
    SellUSD1() {
      let sum = 0;
      for (let idx = 0; idx < 1; idx++)
        sum += this.c[1].rawData[idx]["SellUSD"];
      return `- $${(sum / 1e3).toFixed(2)}k`;
    },
    BuyUSD10() {
      let sum = 0;
      for (let idx = 0; idx < 10; idx++)
        sum += this.c[1].rawData[idx]["BuyUSD"];
      return `+$${(sum / 1e6).toFixed(4)}M`;
    },
    SellUSD10() {
      let sum = 0;
      for (let idx = 0; idx < 10; idx++)
        sum += this.c[1].rawData[idx]["SellUSD"];
      return `- $${(sum / 1e6).toFixed(4)}M`;
    },
    pct24High() {
      const rval = (
        ((this.z25Store.channels[this.c[0]].high_24h -
          this.z25Store.channels[this.c[0]].open_24h) /
          this.z25Store.channels[this.c[0]].open_24h) *
        100
      ).toFixed(2);
      return rval;
    },
    pct24Now() {
      const rval = (
        ((this.z25Store.channels[this.c[0]].rawData[0].Close -
          this.z25Store.channels[this.c[0]].open_24h) /
          this.z25Store.channels[this.c[0]].open_24h) *
        100
      ).toFixed(2);
      return rval;
    },
    pct24Low() {
      const rval = (
        ((this.z25Store.channels[this.c[0]].low_24h -
          this.z25Store.channels[this.c[0]].open_24h) /
          this.z25Store.channels[this.c[0]].open_24h) *
        100
      ).toFixed(2);
      return rval;
    },
  },
  mounted() {
    //console.log("ChannelComponent mounted", this.c, this.k);
    //this.c = this.z25Store.channels["BTC-USD"];
    //console.log(this.c);
  },
  methods: {
    fatOn(k) {
      this.z25Store.channels[k].fatLine = true;
    },
    fatOff(k) {
      this.z25Store.channels[k].fatLine = false;
    },
    toggleBars(k) {
      if (this.z25Store.channels[k].bars)
        this.z25Store.channels[k].bars = false;
      else this.z25Store.channels[k].bars = true;
    },
    toggleVisibility(k) {
      if (this.z25Store.channels[k].hidden)
        this.z25Store.channels[k].hidden = false;
      else this.z25Store.channels[k].hidden = true;
    },
    toggleIgnore(k) {
      //if (this.z25Store.channels[k].ignore)
      //  this.z25Store.channels[k].ignore = false;
      //else this.z25Store.channels[k].ignore = true;
      this.z25Store.tidalTraderLookAt(k);
    },
    toggleDots(k) {
      if (this.z25Store.channels[k].dots)
        this.z25Store.channels[k].dots = false;
      else this.z25Store.channels[k].dots = true;
    },
    toggleCandlesticks(k) {
      if (this.z25Store.channels[k].candlesticks)
        this.z25Store.channels[k].candlesticks = false;
      else this.z25Store.channels[k].candlesticks = true;
    },
    cbxLink(k) {
      const url = `https://www.coinbase.com/advanced-trade/spot/${k}`;
      window.open(url, "_blank");
    },
  },
});
</script>
<style>
.clickerB {
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: #444;
  display: table;
  border: solid 1px white;
  cursor: pointer;
}
.clickerL {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  color: white;
}
li {
  padding: 4px 4px;
}
</style>
