<template>
  <q-card class="hidden">
    <ul style="display: table">
      <li style="display: table-cell">
        <div id="clicker_buyB" class="clickerB">
          <div id="clicker_buyL" class="clickerL w3-xlarge">B</div>
        </div>
      </li>
      <li style="display: table-cell">
        <div id="clicker_amtB" class="clickerB">
          <div id="clicker_amtL" class="clickerL w3-xlarge">2</div>
        </div>
      </li>
      <li style="display: table-cell">
        <div id="clicker_typeB" class="clickerB">
          <div id="clicker_typeL" class="clickerL w3-xlarge">L</div>
        </div>
      </li>
      <li style="display: table-cell">
        <div id="clicker_limitB" class="clickerB">
          <div id="clicker_limitL" class="clickerL w3-xlarge">0.1%</div>
        </div>
      </li>
      <li style="display: table-cell">
        <div id="clicker_sellB" class="clickerB">
          <div id="clicker_sellL" class="clickerL w3-xlarge">S</div>
        </div>
      </li>
      <li style="display: table-cell">
        <div></div>
      </li>
    </ul>
  </q-card>

  <q-card
    dense
    flat
    :style="{ backgroundColor: 'grey' }"
    class="q-ma-xs ptr q-pa-xs"
  >
    <div class="flex flex-center" :style="{ backgroundColor: '#222' }">
      <table class="text-center">
        <tbody>
        <tr>
          <td>
            <div
              :id="`${props.o.product_id}-${props.o.order_id}`"
              :style="{
                height: '225px',
                width: '100px',
                borderRadius: '5px',
              }"
              class="q-mx-xs q-my-xs"
            ></div>

            <q-btn
              class="absolute-top-left font-weight-bold"
              flat
              dense
              outline
              @click="this.runCB()"
              :style="{
                backgroundColor: channelColor,
                border: '1px solid grey',
                color: 'navy',
                width: '50px',
              }"
              >{{ o.product_id.split("-")[0] }}
              <q-badge
                v-if="this.running && o.side == 'sell'"
                color="red"
                rounded
                floating
              />
              <q-badge
                v-if="this.running && o.side == 'buy'"
                color="green"
                rounded
                floating
              />
            </q-btn>

            <q-btn
              flat
              no-padding
              class="absolute-top-right"
              icon="open_in_new"
              :style="{ color: 'grey' }"
              @click="this.z25Store.togglePinned(o.product_id)"
            >
            </q-btn>
          </td>
        </tr>
        <tr>
          <td>
            <q-bar v-if="this.running && o.side == 'BUY'" :style="{ backgroundColor: 'green' }">
              <q-btn
                flat
                dense
                @click="this.z25Store.cancelOrder(this.props.o.order_id)"
                icon="cancel"
              />
              <q-btn flat dense @click="this.incHalfDomain()" icon="remove" />
              <q-btn flat dense @click="this.decHalfDomain()" icon="add" />
            </q-bar>
            <q-bar v-else :style="{ backgroundColor: 'red' }">
              <q-btn
                flat
                dense
                @click="this.z25Store.cancelOrder(this.props.o.order_id)"
                icon="cancel"
              />
              <q-btn flat dense @click="this.incHalfDomain()" icon="remove" />
              <q-btn flat dense @click="this.decHalfDomain()" icon="add" />
            </q-bar>
          </td>
        </tr>
      </tbody>
      </table>
    </div>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { useZ25Store } from "stores/z25-store.js";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default defineComponent({
  name: "Component",
  props: ["o"],
  setup(props) {
    return {
      z25Store: useZ25Store(),
      title: ref("Title"),
      props: ref(props),
      running: ref(true),
      interval: ref(null),
      half_domain: ref(5),
    };
  },
  mounted() {
    console.log("mounted");
    this.render();
  },
  computed: {
    channelColor() {
      var myColor = d3
        .scaleSequential()
        .domain([0, Object.keys(this.z25Store.currencies).length])
        .interpolator(d3.interpolatePurples);
      //return myColor(parseFloat(0.5));
      return this.z25Store.colorThemes[this.z25Store.colorTheme](
        parseFloat(
          Object.keys(this.z25Store.currencies).indexOf(
            this.props.o.product_id.split("-")[0]
          ) / 260
        )
      );
      /*
      return this.z25Store.colorThemes[this.z25Store.colorTheme](
        parseFloat(
          Object.keys(this.z25Store.currencies).indexOf(this.props.o.product_id.split("-")[0])
        ) / 260
      );
      //return this.c[0] == "BTC-USD" ? "green" : "red";
      */
    },
  },
  methods: {
    incHalfDomain() {
      this.half_domain += 1;
    },
    decHalfDomain() {
      if (this.half_domain - 1 > 0) this.half_domain -= 1;
    },
    runCB() {
      console.log("runCB");
      const url = `https://www.coinbase.com/advanced-trade/spot/${this.props.o.product_id.replace('-USDC','-USD')}`;
      window.open(url, "_blank");
      /*
      if (this.running == true) {
        this.running = false;
        cancelAnimationFrame(this.interval);
        this.interval = null;
      } else {
        this.running = true;
        this.interval = requestAnimationFrame(() => {
          this.render();
        });
      }
      */
    },
    render() {
      if(this.props.o.status=="FILLED")return;
      const id = `${this.props.o.product_id}-${this.props.o.order_id}`;
      d3.select("#" + id)
        .selectAll("svg")
        .remove();

      const common_margin = 10;
      const margin = {
        top: common_margin,
        right: common_margin,
        bottom: common_margin,
        left: common_margin,
      };
      const bcr = document.getElementById(id).getBoundingClientRect();
      const svg = d3
        .select("#" + id) //with #
        .append("svg")
        //.style("background-color", "green")
        .style("height", "225px")
        .style("width", "100px")
        .attr("id", "plot_svg");

      const yL = d3
        .scaleLinear()
        .domain([-1 * this.half_domain, this.half_domain])
        .range([100, -100]);

      const yAxis_left = d3.axisLeft(yL);

      const y_axis_left_g = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + bcr.width / 3 + "," + (bcr.height / 2 + 5) + ")"
        )
        .call(yAxis_left);

      let dyPctStr = "----";
      try {
        dyPctStr = (
          ((this.props.o.order_configuration.limit_limit_gtc.limit_price -
            this.z25Store.channels[this.props.o.product_id.replace('-USDC','-USD')].rawData[0].Close) /
            this.props.o.order_configuration.limit_limit_gtc.limit_price) *
          100
        ).toFixed(2);

        svg
          .append("text")
          .attr("transform", "translate(" + bcr.width * 0.55 + "," + 35 + ")")
          .attr("fill", "#FFF")
          .text(dyPctStr + "%");

        /* p_now */
        svg
          .append("text")
          .attr(
            "transform",
            "translate(" +
              (bcr.width / 3 + 15) +
              "," +
              (bcr.height / 2 + 9) +
              ")"
          )
          .attr("fill", "#CC6")
          .text(
            this.z25Store.channels[this.props.o.product_id.replace('-USDC','-USD')].rawData[0].Close
          );
        svg
          .append("path")
          .attr("d", d3.symbol().type(d3.symbolDiamond).size(64))
          .attr("fill", "#CC6")
          .attr(
            "transform",
            "translate(" +
              (bcr.width / 3 + 5) +
              "," +
              (bcr.height / 2 + 5) +
              ")"
          );

        if (this.props.o.side === "BUY") {
          const dyPct =
            ((this.props.o.order_configuration.limit_limit_gtc.limit_price -
              this.z25Store.channels[this.props.o.product_id.replace('-USDC','-USD')].rawData[0]
                .Close) /
              this.props.o.order_configuration.limit_limit_gtc.limit_price) *
            100;
          const dyPx = parseInt(dyPct * (100 / this.half_domain));
          //console.log("dyPx", dyPx);
          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                (bcr.width / 3 + 15) +
                "," +
                (bcr.height / 2 - dyPx + 9) +
                ")"
            )
            .attr("fill", "#5F5")
            .text(parseFloat(this.props.o.order_configuration.limit_limit_gtc.limit_price).toFixed(4));
          svg
            .append("path")
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(64))
            .attr("fill", "#5F5")
            .attr(
              "transform",
              "translate(" +
                (bcr.width / 3 + 5) +
                "," +
                (bcr.height / 2 - dyPx + 5) +
                ")"
            );
        } else if (this.props.o.side === "SELL") {
          const dyPct =
            ((this.props.o.order_configuration.limit_limit_gtc.limit_price -
              this.z25Store.channels[this.props.o.product_id.replace('-USDC','-USD')].rawData[0]
                .Close) /
              this.props.o.order_configuration.limit_limit_gtc.limit_price) *
            100;
          const dyPx = parseInt(dyPct * (100 / this.half_domain));
          //console.log("dyPx", dyPx);
          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                (bcr.width / 3 + 15) +
                "," +
                (bcr.height / 2 - dyPx + 9) +
                ")"
            )
            .attr("fill", "#F55")
            .text(parseFloat(this.props.o.order_configuration.limit_limit_gtc.limit_price).toFixed(4));
          svg
            .append("path")
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(64))
            .attr("fill", "#F55")
            .attr(
              "transform",
              "translate(" +
                (bcr.width / 3 + 5) +
                "," +
                (bcr.height / 2 - dyPx + 5) +
                ")"
            );
        }
      } catch (e) {}

      if (this.running == true) {
        cancelAnimationFrame(this.interval);
        this.interval = requestAnimationFrame(() => {
          this.render();
        });
      }
    },
  },
});
</script>
<style></style>
