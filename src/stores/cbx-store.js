import { defineStore } from "pinia";
import { ref } from "vue";
import * as d3 from "d3";
import axios from "axios";

const CURRENCIES_URL = "https://api.exchange.coinbase.com/currencies";

export const useCBXStore = defineStore("cbxStore", {
  state: () => ({
    channels: ref({}),
    currencies: ref({}),
    msgTypes: ref({}),
    //
    connStatus: ref("CBX Connect"),
    connected: ref(false),
    ws: ref(null),
    t0: ref(null),
    show: ref(true),
    msgCount: ref(0),
    connTime: ref(0),
    display_minutes: ref(30),
    buffer_minutes: ref(30),
    d0Idx: ref(30),
    //
  }),
  getters: {
    nchan(state) {
      return Object.keys(state.channels).length;
    },
  },
  actions: {
    zeroCB() {
      Object.keys(this.channels).forEach((k, idx) => {
        console.log(k);
        this.channels[k].d0 = {
          Date: this.channels[k].rawData[0].Date,
          price: this.channels[k].rawData[0].price,
        };
      });
    },
    processTickerMsg(msg) {
      // example_channel={'BTC-USD': {'type': 'channel', 'block_update': False, 'product_id': 'BTC-USD', 'currency': 'BTC', 'price': 29276.58, 'numcycle': 1, 'data': [], 't0': 1653364314.374358, 'tlast': 1653364318.194863, 'tnext': 1653364374.374268, 'volume_1m': 16.702597818520832, 'volume_24h': 24051.74085867, 'volume_30d': '749647.48653685', 'low_24h': 28847.72, 'high_24h': 30635.39, 'open_24h': 30134.07, 'balance': None, 'price_history': [[29281.53, 29276.58, 29276.58, 29281.53, None, -0.01690485435698575], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0], [None, None, None, None, None, 0]], 'pct_change_total': -0.01690485435698575, 'buy_volume_histo': [0.00929428, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 'sell_volume_histo': [0.05817264999999999, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 'buy_vol_total': 0.0, 'sell_vol_total': 0.0, 'buy_usd_histo': [272.13984113460003, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 'sell_usd_histo': [1703.2087093689004, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 'buy_usd_total': 272.13984113460003, 'sell_usd_total': 1703.2087093689004, 'vol': {'buy': 0.00237847, 'sell': 0.00272132, 'diff': 0}, 'vol_usd': {'buy': 272.13984113460003, 'sell': 1703.2087093689004, 'diff': 0}, 'channel_report': {}, 'tlast_text_message': 1653364314.3742728, 'sequence': 37979004742, 'best_bid': '29276.58', 'best_ask': '29278.55', 'side': 'sell', 'time': '2022-05-24T03:51:58.143666Z', 'trade_id': 342805270, 'last_size': '0.00272132', 'last_buy_vol': 0.00237847, 'last_buy_usd': 69.6423389257, 'buy_volume_total': 0.00929428, 'last_sell_vol': 0.00272132, 'last_sell_usd': 79.67094268560001, 'sell_volume_total': 0.05817264999999999}}
      try {
        this.msgTypes[msg.product_id] += 1;
      } catch (e) {
        this.msgTypes[msg.product_id] = 1;
      }
      if (!("product_id" in msg)) {
        return;
      }
      const pid = msg.product_id;
      if (pid in this.channels) {
        this.channels[pid].msgCount += 1;
        const entry = {
          Date: new Date(Date.now()),
          price: parseFloat(msg.price),
        };
        this.channels[pid].rawData.push(entry);
      } else {
        const entry = {
          Date: new Date(Date.now()),
          price: parseFloat(msg.price),
        };
        this.channels[pid] = {
          msgCount: 0,
          rawData: [entry],
          d0: entry,
        };
      }
      let cutoff_date = new Date(Date.now() - this.cutoff_minutes * 60000);
      while (this.channels[pid].rawData[0].Date < cutoff_date) {
        this.channels[pid].rawData.shift();
      }
    },
    connect() {
      //console.log('ws', this.ws)
      if (this.ws) {
        this.connStatus = "CBX Closing ...";
        this.ws.close();
        this.ws = null;
        this.connected = false;
        this.connStatus = "CBX Connect";
      } else {
        this.connStatus = "CBX Connecting ...";
        const CONN = "wss://ws-feed.exchange.coinbase.com";
        this.ws = new WebSocket(CONN);
        this.connected = true;
        this.t0 = parseInt(new Date().getTime());
        this.connStatus = "CBX Connected";

        this.ws.onopen = (ev) => {
          let rval;
          const pids = [
            "QNT-USD",
            "UPI-USD",
            "T-USD",
            "EUROC-USD",
            "FARM-USD",
            "UST-USD",
            "HIGH-USD",
            "MIR-USD",
            "SOL-USD",
            "PNG-USD",
            "CRPT-USD",
            "FX-USD",
            "APE-USD",
            "XLM-USD",
            "AUDIO-USD",
            "GALA-USD",
            "SKL-USD",
            "VGX-USD",
            "WCFG-USD",
            "LOKA-USD",
            "KRL-USD",
            "RLC-USD",
            "SUKU-USD",
            "ROSE-USD",
            "YFI-USD",
            "DIA-USD",
            "QUICK-USD",
            "VOXEL-USD",
            "ELA-USD",
            "STG-USD",
            "CTX-USD",
            "ZRX-USD",
            "POND-USD",
            "AURORA-USD",
            "ZEN-USD",
            "FOX-USD",
            "RGT-USD",
            "SHPING-USD",
            "ETC-USD",
            "BTC-USD",
            "DESO-USD",
            "INDEX-USD",
            "BIT-USD",
            "SPELL-USD",
            "SNT-USD",
            "USDC-USD",
            "HBAR-USD",
            "HFT-USD",
            "BAND-USD",
            "QSP-USD",
            "PRO-USD",
            "CELR-USD",
            "AUCTION-USD",
            "NKN-USD",
            "RBN-USD",
            "CBETH-USD",
            "FIDA-USD",
            "POWR-USD",
            "TRU-USD",
            "WBTC-USD",
            "RPL-USD",
            "FORTH-USD",
            "GYEN-USD",
            "MLN-USD",
            "AXS-USD",
            "IMX-USD",
            "JASMY-USD",
            "LTC-USD",
            "FORT-USD",
            "NEAR-USD",
            "ALICE-USD",
            "AMP-USD",
            "REQ-USD",
            "IDEX-USD",
            "AIOZ-USD",
            "ASM-USD",
            "EOS-USD",
            "FET-USD",
            "ADA-USD",
            "ICP-USD",
            "OXT-USD",
            "STORJ-USD",
            "WAXL-USD",
            "MSOL-USD",
            "KAVA-USD",
            "ATA-USD",
            "LQTY-USD",
            "SYN-USD",
            "BLUR-USD",
            "GAL-USD",
            "MUSD-USD",
            "BICO-USD",
            "COMP-USD",
            "GFI-USD",
            "GNO-USD",
            "00-USD",
            "LDO-USD",
            "ATOM-USD",
            "PLA-USD",
            "MASK-USD",
            "CRV-USD",
            "NEST-USD",
            "OCEAN-USD",
            "ILV-USD",
            "AXL-USD",
            "ANKR-USD",
            "MXC-USD",
            "TBTC-USD",
            "TRIBE-USD",
            "CVC-USD",
            "GNT-USD",
            "GRT-USD",
            "ORN-USD",
            "ANT-USD",
            "SNX-USD",
            "DNT-USD",
            "POLS-USD",
            "DASH-USD",
            "ALGO-USD",
            "XTZ-USD",
            "NMR-USD",
            "YFII-USD",
            "STX-USD",
            "BAT-USD",
            "BNT-USD",
            "EGLD-USD",
            "AGLD-USD",
            "MDT-USD",
            "LIT-USD",
            "MPL-USD",
            "SUPER-USD",
            "SWFTC-USD",
            "RNDR-USD",
            "GHST-USD",
            "DAR-USD",
            "APT-USD",
            "ORCA-USD",
            "NU-USD",
            "DOGE-USD",
            "MINA-USD",
            "RAI-USD",
            "RARI-USD",
            "MNDE-USD",
            "CHZ-USD",
            "LINK-USD",
            "PRIME-USD",
            "MTL-USD",
            "KEEP-USD",
            "BTRST-USD",
            "ENS-USD",
            "MKR-USD",
            "FIS-USD",
            "ALEPH-USD",
            "OOKI-USD",
            "MAGIC-USD",
            "REP-USD",
            "TRAC-USD",
            "BUSD-USD",
            "ENJ-USD",
            "SUSHI-USD",
            "USDT-USD",
            "AVAX-USD",
            "LPT-USD",
            "UNI-USD",
            "BOND-USD",
            "IOTX-USD",
            "XYO-USD",
            "RARE-USD",
            "AVT-USD",
            "INV-USD",
            "NCT-USD",
            "QI-USD",
            "MCO2-USD",
            "XRP-USD",
            "OMG-USD",
            "MATH-USD",
            "SYLO-USD",
            "ALCX-USD",
            "BLZ-USD",
            "GMT-USD",
            "OP-USD",
            "LSETH-USD",
            "COVAL-USD",
            "DOT-USD",
            "ZEC-USD",
            "XMON-USD",
            "ERN-USD",
            "FIL-USD",
            "REN-USD",
            "LRC-USD",
            "UNFI-USD",
            "LCX-USD",
            "MATIC-USD",
            "RAD-USD",
            "WLUNA-USD",
            "BAL-USD",
            "CGLD-USD",
            "COTI-USD",
            "TONE-USD",
            "CTSI-USD",
            "PERP-USD",
            "POLY-USD",
            "ARPA-USD",
            "ABT-USD",
            "KSM-USD",
            "PRQ-USD",
            "ACS-USD",
            "API3-USD",
            "HOPR-USD",
            "KNC-USD",
            "SAND-USD",
            "GLM-USD",
            "GST-USD",
            "GTC-USD",
            "INJ-USD",
            "DDX-USD",
            "ETH-USD",
            "GODS-USD",
            "RLY-USD",
            "FLOW-USD",
            "CRO-USD",
            "OGN-USD",
            "SHIB-USD",
            "DYP-USD",
            "PYR-USD",
            "AERGO-USD",
            "ACH-USD",
            "BCH-USD",
            "PLU-USD",
            "UMA-USD",
            "MANA-USD",
            "TRB-USD",
            "BADGER-USD",
            "LOOM-USD",
            "WAMPL-USD",
            "C98-USD",
            "CVX-USD",
            "PUNDIX-USD",
            "AAVE-USD",
          ];
          const shortlist = ["BTC-USD", "T-USD"];
          //const pids = ["BTC-USD", "GRT-USD", "FIL-USD"];
          var pyld = JSON.stringify({
            type: "subscribe",
            product_ids: pids,
            channels: ["ticker"],
          });
          this.ws.send(pyld);
        };

        this.ws.onmessage = (ev) => {
          this.msgCount += 1;
          this.connTime = parseInt(
            (parseInt(new Date().getTime()) - this.t0) / 1000
          );
          const data = JSON.parse(ev.data);
          this.processTickerMsg(data);
          if (!this.show) return;
          let html = '<center><table width="100%">';
          html += "<tr><td>ChanCount</td><td>" + Object.keys(this.channels).length + "</td></tr>";
          html += "<tr><td>MsgCount</td><td>" + this.msgCount + "</td></tr>";
          html += "<tr><td>ConnTime</td><td>" + this.connTime + "</td></tr>";
          //html += '<tr><td>t0</td><td>' + this.t0 + '</td></tr>'
          for (const [key, val] of Object.entries(data)) {
            if (key.indexOf("volume") > -1) {
              html +=
                '<tr class="text-uppercase"><td>' +
                key +
                "</td><td> " +
                parseInt(val) +
                "</td></tr>";
            } else if (key.indexOf("time") > -1) {
              html +=
                '<tr class="text-uppercase"><td>' +
                key +
                "</td><td> " +
                val.split(":")[0] +
                "</td></tr>";
            } else {
              html +=
                '<tr class="text-uppercase"><td>' +
                key +
                "</td><td> " +
                val +
                "</td></tr>";
            }
          }
          html += "</table></center>";
          d3.select("#cbx_debug").html(html);
        };
      }
    },
    getCurrencies() {
      axios(CURRENCIES_URL).then((res) => {
        //console.log(res.data)
        res.data.forEach((c) => {
          this.currencies[c.id] = c;
        });
      });
    },
  },
});
