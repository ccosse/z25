<template>
  <q-card
    dense
    flat
    :style="{ backgroundColor: 'grey' }"
    class="q-ma-xs ptr q-pa-xs"
  >
  <div class="full-width">

    <q-bar :style="{ backgroundColor: '#333' }">
      <q-btn no-caps flat label="Plot Controls">
        <q-menu
          :style="{ width: '350px' }"
          bordered
          dense
          class="rounded-borders text-center q-py-md q-ma-md z-top"
          label="Plot Controls"
        >
          <q-list>
            <q-item>
              <q-item-section>
                <table><tbody>
                  <tr>
                    <td>
                      <q-knob
                        show-value
                        :min="0"
                        :max="this.z25Store.buffer_minutes"
                        size="100px"
                        :thickness="0.5"
                        :style="{ height: '100px' }"
                        color="positive"
                        track-color="green-3"
                        center-color="grey-8"
                        class="text-white col q-ma-md"
                        v-model="this.z25Store.display_minutes"
                      >
                      </q-knob>
                    </td>

                    <td>
                      <q-knob
                        show-value
                        size="100px"
                        stacked
                        :thickness="0.5"
                        :style="{ height: '100px' }"
                        color="positive"
                        track-color="green-3"
                        center-color="grey-8"
                        class="text-white col q-ma-md"
                        v-model="this.z25Store.d0Idx"
                        @update:model-value="this.z25Store.zeroCB()"
                      >
                      </q-knob>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="text-weight-bold">Display Minutes</div>
                    </td>

                    <td>
                      <div class="text-weight-bold">Pinch Minutes</div>
                    </td>
                  </tr>
                </tbody></table>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                
              </q-item-section>
              <q-item-section>
                <q-btn class="bg-positive">
                  <q-icon
                    :name="this.candlesticks ? 'candlestick_chart' : 'insights'"
                    @click="this.toggleCandlesticks()"
                  />
                </q-btn>
              </q-item-section>
              <q-item-section>
                <q-btn class="bg-positive">
                  <q-icon
                    :name="this.mode == 0 ? 'timeline' : 'show_chart'"
                    @click="this.cycleMode()"
                  />
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              </q-item-section>

              <q-item-section>
                <q-btn class="bg-positive">
                  <q-icon
                    :name="'sync_alt'"
                    @click="this.z25Store.sendSettings()"
                  /> </q-btn
              ></q-item-section>

              <q-item-section>
                <q-btn class="bg-positive">
                  <q-icon
                    :name="'clear'"
                    @click="this.z25Store.clearLookAtMe()"
                  />
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-space />
      <q-btn flat no-caps>${{ this.z25Store.portfolioBalance }}
        <q-tooltip>Portfolio Balance</q-tooltip>
      </q-btn>
      <q-btn flat no-caps>${{ this.z25Store.usdAvailable }}
        <q-tooltip>USD Available = {{this.z25Store.usdAvailable}} USD Holds = {{this.z25Store.usdBalance - this.z25Store.usdAvailable}}</q-tooltip>
      </q-btn>
      <q-btn flat no-caps>${{ this.z25Store.usdBalance }}
        <q-tooltip>USD Balance</q-tooltip>
      </q-btn>

    </q-bar>

    <div
      id="plotDIV1"
      :style="{ height: '50vh', backgroundColor: '#222' }"
      class="full-width"
    ></div>

    <q-bar :style="{ backgroundColor: '#333' }">

      <q-btn dense @click="this.clearPlotCB()" color="positive">
        <q-icon
          name="cancel"
        ></q-icon>
        <q-tooltip>Clear the Plot area</q-tooltip>
      </q-btn>

      <q-btn dense @click="this.runCB()" color="positive">
        <q-icon
          :name="this.running ? 'pause' : 'play_arrow'"
        ></q-icon>
        <q-tooltip>Run Plot w/continuous updates</q-tooltip>
      </q-btn>

      <q-btn dense class="bg-positive on-right">
        <q-icon
          :name="this.loglin ? 'stacked_bar_chart' : 'bar_chart'"
          @click="this.toggleLogLin()"
        />
        <q-tooltip>Toggle Log/Lin</q-tooltip>
      </q-btn>

      <q-btn no-caps flat label="Orders" @click="this.toggleOrders()">
        <q-tooltip>Show/hide Orders table</q-tooltip>
      </q-btn>

      <q-btn dense @click="this.z25Store.getOrders()" icon="replay">
        <q-tooltip>Update Orders info</q-tooltip>
      </q-btn>

			<q-btn dense @click="this.z25Store.getAccounts()" icon="replay">
        <q-tooltip>Update Account Balances</q-tooltip>
      </q-btn>

      <q-btn dense @click="this.z25Store.setAllHidden()" icon="visibility_off">
        <q-tooltip>This will set every channel hidden only, not a toggle.</q-tooltip>
      </q-btn><!--parameter-->
      <q-btn dense @click="this.toggleAll()" icon="cancel">
        <q-tooltip>TypeA plot will bypass checks and plot all channels, and NOT change any settings</q-tooltip>
      </q-btn><!--bypass-->
      <q-btn dense @click="this.getAllChannels()" icon="replay">
        <q-tooltip>Request one collective block_update of all channels at z25</q-tooltip>
      </q-btn><!--bypass-->
      <q-space />
      <q-btn dense @click="this.z25Store.cancelAll()" icon="cancel">
        <q-tooltip>Cancel all orders</q-tooltip>
      </q-btn>
    </q-bar>

  </div>
</q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useZ25Store } from "stores/z25-store.js";
import { useCBXStore } from "stores/cbx-store.js";

export default defineComponent({
  name: "TypeA",
  setup() {
    return {
      lrSwitch: ref(false),
      z25Store: useZ25Store(),
      cbxstore: useCBXStore(),
      interval: ref(null),
      running: ref(false),
      d0: ref(null),
      loglin: ref(true),
      mode: ref(1),
    };
  },
  mounted() {
    console.log("mounted");
  },
  methods: {
    toggleAll(){
      if (this.z25Store.plotAllChannelsOverride === true) {
        this.z25Store.plotAllChannelsOverride = false;
      } else {
        this.z25Store.plotAllChannelsOverride = true;
      }
    },
    getAllChannels(){
      this.z25Store.getAllChannels();
    },
    toggleOrders() {
      if (d3.select("#ordersPanel").classed("hidden") == true)
        d3.select("#ordersPanel").classed("hidden", false);
      else d3.select("#ordersPanel").classed("hidden", true);
    },
    toggleLRSwitch() {
      if (this.lrSwitch) this.lrSwitch = false;
      else this.lrSwitch = true;
    },
    toggleLogLin() {
      if (this.loglin) this.loglin = false;
      else this.loglin = true;
    },
    cycleMode() {
      if (this.mode == 1) this.mode = 0;
      else this.mode = 1;
    },
    multiLayerX(config, base, ...layers) {
      const A = Plot.plot({
        ...config,
        marks: base,
      });
      const x = A.scale("x");

      let ptype = "linear";
      if (this.loglin) ptype = "symlog";

      return Plot.plot({
        ...config,
        marks: [
          base,
          ...layers.map(
            (l) => () =>
              Plot.plot({
                ...config,

                marks: [l(x)],
                x: { ...x, axis: null },
                y: {
                  axis: "right",
                  line: false,
                  grid: true,
                  nice: true,
                  type: ptype,
                },
                style: {
                  background: "0000",
                  color: "white",
                  fontSize: "15",
                },
              })
          ),
        ],
      });
    },

    plotCB() {
      d3.select("#plotDIV1").select("svg").remove();
      let store;
      if (!this.lrSwitch) {
        store = this.z25Store;
      } else {
        store = this.cbxstore;
      }
      let cutoff_date = new Date(Date.now() - store.display_minutes * 60000);
      //let cutoff_date = new Date(Date.now() - 5 * 60000);
      const barMarks = [];
      const multiMarks = [];
      const btcMarks = [];
      let data_btc = store.channels["BTC-USD"].rawData.filter(
        (d) => Date.parse(d.tlast) > cutoff_date
      ); //.slice(data_0.length-cutoff);//currently on user to not criss-cross pinch and cutoff
      let strokewidth = 2;
      let d0btc = store.channels["BTC-USD"].d0;
      btcMarks.push(
        Plot.line(data_btc, {
          x: (d) => Date.parse(d.tlast),
          y: (d) => ((d.Close - d0btc.Close) / d0btc.Close) * 100,
          curve: "catmull-rom",
          stroke: "red",
          strokeWidth: strokewidth,
        })
      );

      Object.keys(store.channels).forEach((k, kidx) => {
        //NEED continue equivalent if channel.hidden ... just return in forEach
        if (store.plotAllChannelsOverride) {/*don't return*/}
        else if (store.channels[k].hidden) return;//return is how to break a forEach b/c not a loop

        let d0 = store.channels[k].d0;
        let data_all = store.channels[k].rawData.filter(
          (d) => Date.parse(d.tlast) > cutoff_date
        );

        let strokeWidth = store.channels[k].fatLine ? 3 : 2;
        //if (k === "BTC-USD") strokeWidth = 1;

        multiMarks.push(//this plot is a "layer" to multiLayerX
          Plot.line(data_all, {
            x: (d) => Date.parse(d.tlast),
            y: (d) => ((d.Close - d0.Close) / d0.Close) * 100,
            curve: "catmull-rom",
            stroke: store.getChannelColor(k),
            strokeWidth: strokeWidth,
          })
        );

        if (store.channels[k].candlesticks) {
          multiMarks.push(
            Plot.ruleX(data_all, {
              //rectangle of w=strokeWidth
              x: (d) => Date.parse(d.tlast),
              y1: (d) => ((d.Open - d0.Close) / d0.Close) * 100, //"Low", //d => (d.Low-cs[cutoff-1].Low)/cs[cutoff-1].Low,
              y2: (d) => ((d.Close - d0.Close) / d0.Close) * 100, //"Low", //d => (d.Low-cs[cutoff-1].Low)/cs[cutoff-1].Low,
              stroke: (d) => (d.Close > d.Open ? "#5F5" : "#F55"),
              //strokeWidth: Math.min(10,parseInt((bcr.width-100)/cs.length - hpad)),//make dynamic based on available width and data length
              strokeWidth: 10,
              strokeLinecap: "square",
            })
          );

          multiMarks.push(
            Plot.ruleX(data_all, {
              //limit bars
              x: (d) => Date.parse(d.tlast),
              y1: (d) => ((d.Low - d0.Close) / d0.Close) * 100, //"Low", //d => (d.Low-cs[cutoff-1].Low)/cs[cutoff-1].Low,
              y2: (d) => ((d.High - d0.Close) / d0.Close) * 100, //"Low", //d => (d.Low-cs[cutoff-1].Low)/cs[cutoff-1].Low,
              stroke: (d) => (d.Close > d.Open ? "#5F5" : "#F55"),
            })
          );
        }

        if(store.channels[k].bars){
/*
				  barMarks.push(
					  Plot.ruleX(data_all, { x:d => Date.parse(d.tlast), y:d=>d.BuyUSD-d.SellUSD,  stroke:d=>store.getChannelColor(k), strokeWidth:10, strokeOpacity:.5 })
				  );
 					barMarks.push(
						Plot.text(data_all, { x:d => Date.parse(d.tlast), y:d=>d.BuyUSD-d.SellUSD,  fill:d=>store.getChannelColor(k), text:[k.split("-")[0]], fontSize:10})
					);
*/
				  multiMarks.push(
					  Plot.ruleX(data_all, { x:d => Date.parse(d.tlast), y:d=>(d.BuyUSD-d.SellUSD)/store.barsNormalization,  stroke:d=>store.getChannelColor(k), strokeWidth:10, strokeOpacity:.5 })
				  );
 					multiMarks.push(
						Plot.text(data_all, { x:d => Date.parse(d.tlast), y:d=>(d.BuyUSD-d.SellUSD)/store.barsNormalization,  fill:d=>store.getChannelColor(k), text:[k.split("-")[0]], fontSize:10})
					);
        }

        //single point at d0
        if (false) {
          multiMarks.push(
            Plot.dot([d0], {
              x: (d) => Date.parse(d.t0),
              y: (d) => 0,
              stroke: store.channels[k].color,
            })
          );
        }

        if (store.channels[k].dots) {
          multiMarks.push(
            Plot.dot(data_all, {
              x: (d) => Date.parse(d.tlast),
              y: (d) => ((d.Close - d0.Close) / d0.Close) * 100,
              stroke: "#FF0",
            })
          );
        }

        multiMarks.push(
          Plot.text(data_all, {
            x: (d) => Date.parse(d.tlast),
            y: (d) => ((d.Close - d0.Close) / d0.Close) * 100,
            dy: 0,
            dx: 25,
            text: [k.split("-")[0]],
            fill: store.getChannelColor(k),
            strokeWidth: 0,
            fontSize: store.channels[k].fatLine ? 30 : 15,
          })
        );
      });

      let data = [
        //NEED:replace w/domain
        { x: cutoff_date, Close: 0 },
        { x: new Date(Date.now()), Close: 0 },
      ];
      //multiMarks.push(Plot.line(data, { x: "x", y: "Close", stroke: "#0000" }));
      //btcMarks.push(Plot.line(data, { x: "x", y: "Close", stroke: "#0000" }));

      let bcr = document.getElementById("plotDIV1").getBoundingClientRect();
      let ptype = "linear";
      if (this.loglin) ptype = "symlog";

      /*
       */
      if (this.mode == 0) {
        d3.select("#plotDIV1")
          .node()
          .append(
            Plot.plot({
              y: {
                grid: true,
                type: ptype,
                axis: "right",
                line: false,
              },
              style: { background: store.background, color: "cyan" },
              insetRight: 0,
              insetLeft: 20,
              insetTop: 20,
              insetBottom: 20,
              marginRight: 30,
              marginTop: 0,
              width: bcr.width,
              height: bcr.height,
              marks: multiMarks,
            })
          );
      } else if (this.mode == 1) {
        d3.select("#plotDIV1")
          .node()
          .append(
            this.multiLayerX(
              {
                y: {
                  axis: "left",
                  grid: false,
                  line: false,
                  type: ptype,
                },
                x: {
                  axis: "top",
                  tickFormat: d3.timeFormat("%I:%M"), //%A
                  domain: [cutoff_date, new Date(Date.now())],
                  tickRotate: 35,
                },
                style: {
                  background: "0000",
                  color: "steelblue",
                  fontSize: "15",
                },
                width: bcr.width,
                height: bcr.height,
                marginBottom: 20,
                marginTop: 40,
                insetTop: 0,
                insetBottom: 0,
                insetLeft: 20,
                insetRight: 50,
              },
              btcMarks,
              (x) => multiMarks,
            )
          )

      }

      if (this.running == true) {
        cancelAnimationFrame(this.interval);
        this.interval = requestAnimationFrame(() => {
          this.plotCB();
        });
      }
    },
    clearPlotCB(){
      d3.select("#plotDIV1").select("svg").remove();
    },
    runCB() {
      console.log("runCB");
      if (this.running == true) {
        this.running = false;
        cancelAnimationFrame(this.interval);
        this.interval = null;
      } else {
        this.running = true;
        this.interval = requestAnimationFrame(() => {
          this.plotCB();
        });
      }
    },
  },
});
</script>
<style>
a {
  text-decoration: none;
}
</style>
