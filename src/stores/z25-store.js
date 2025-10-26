import { defineStore } from "pinia";
import { ref } from "vue";
import * as d3 from "d3";
import axios from "axios";

const CURRENCIES_URL = "https://api.exchange.coinbase.com/currencies";

const colorThemes = {
    "d3.interpolatePiYG": d3.interpolatePiYG,
    "d3.interpolatePRGn": d3.interpolatePRGn,
    "d3.interpolatePuBu": d3.interpolatePuBu,
    "d3.interpolateRdGy": d3.interpolateRdGy,
    "d3.interpolatePuOr": d3.interpolatePuOr,
    "d3.interpolateOrRd": d3.interpolateOrRd,
    "d3.interpolatePuRd": d3.interpolatePuRd,
    "d3.interpolateRdBu": d3.interpolateRdBu,
    "d3.interpolateGnBu": d3.interpolateGnBu,
    "d3.interpolateBuPu": d3.interpolateBuPu,
    "d3.interpolateBrBG": d3.interpolateBrBG,
    "d3.interpolateYlGn": d3.interpolateYlGn,
    "d3.interpolatePuBuGn": d3.interpolatePuBuGn,
    "d3.interpolateRdYlBu": d3.interpolateRdYlBu,
    "d3.interpolateRdYlGn": d3.interpolateRdYlGn,
    "d3.interpolateSpectral": d3.interpolateSpectral,
    "d3.interpolateYlGnBu": d3.interpolateYlGnBu,
    "d3.interpolateYlOrBr": d3.interpolateYlOrBr,
    "d3.interpolateYlOrRd": d3.interpolateYlOrRd,
    //
    "d3.interpolateGreens": d3.interpolateGreens,
    "d3.interpolateBlues": d3.interpolateBlues,
    "d3.interpolateReds": d3.interpolateReds,
    "d3.interpolateGreys": d3.interpolateGreys,
    "d3.interpolateOranges": d3.interpolateOranges,
    "d3.interpolatePurples": d3.interpolatePurples,
    //
    "d3.interpolateCool": d3.interpolateCool,
    "d3.interpolateWarm": d3.interpolateWarm,
    "d3.interpolateRainbow": d3.interpolateRainbow,
    "d3.interpolateSinebow": d3.interpolateSinebow,
    "d3.interpolatePlasma": d3.interpolatePlasma,
    "d3.interpolateInferno": d3.interpolateInferno,
    "d3.interpolateMagma": d3.interpolateMagma,
    "d3.interpolateViridis": d3.interpolateViridis,
    "d3.interpolateCividis": d3.interpolateCividis,
  };
  
export const useZ25Store = defineStore("z25Store", {
    state: () => ({
        channels: ref({}),
        currencies: ref({}),
        msgTypes: ref({}),
        accounts: ref({}),
        orders: ref({}),
        //
        connStatus: ref("Z25 Connect"),
        connected: ref(false),
        ws: ref(null),
        t0: ref(null),
        show: ref(true),
        msgCount: ref(0),
        connTime: ref(0),
        display_minutes: ref(10),
        buffer_minutes: ref(100),
        d0Idx: ref(9),
        //
        maintainHotlist: ref(true),
        volThresh: ref(null),
        pctThresh: ref(null),
        subscribeBTC: ref(null),
        subscribeETH: ref(null),
        subscribePct: ref(null),
        subscribeVol: ref(null),
        subscribeBal: ref(null),
        //
        colorTheme: ref("d3.interpolateGreens"),
        background: ref("#222"),
        plotAllChannelsOverride: ref(false),
        barsNormalization: ref(10000),
      }),
      getters: {
        nchan(state) {
          return Object.keys(state.channels).length;
        },
        nsub(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.subscribed) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        nvol(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.lookAtMeVOL) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        npct(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.lookAtMePCT) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        nhot(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.hotlist) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        nignore(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.ignore) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        nhidden(state) {
          let count = 0;
          for (const [pid, channel] of Object.entries(state.channels))
            try {
              if (channel.hidden) count += 1;
            } catch (e) {
              console.log(e);
              return -1;
            }
          return count;
        },
        colorThemes(state) {
          return colorThemes;
        },
        nbal(state) {
          return Object.keys(this.currenciesWithBalances).length;
        },
        currenciesWithBalances(state) {
          //return state.currencies; //.filter((x) => x.balances > 0);
          return Object.fromEntries(
            Object.entries(state.currencies).filter(
              ([key]) =>
                state.currencies[key].balance > 0 &&
                state.currencies[key].status == "online"
            )
          );
        },
        channelsWithOrders(state) {
          //return Object.keys(state.orders)
          //return state.orders
          const rval = [];
          for (var idx = 0; idx < this.orders.length; idx++) {
            rval.push(this.orders[idx]["product_id"].replace('-USDC','-USD'));
          }
          return rval;
        },
        usdBalance(state) {
          try {
            return state.currencies["USD"].balance.toFixed(2);
          } catch (e) {
            return 0;
          }
        },
        usdAvailable(state) {
          try {
            return state.currencies["USD"].available.toFixed(2);
          } catch (e) {
            return 0;
          }
        },
        usdHold(state) {
          try {
            return state.currencies["USD"].hold.toFixed(2);
          } catch (e) {
            return 0;
          }
        },
        portfolioBalance(state) {
          let sum = 0;
          for (const [k, v] of Object.entries(state.currencies)) {
            try {
              sum += v.balance * state.channels[v.pid].rawData[0].Close;
            } catch (e) {
              //console.log(e);
            }
          }
          for (const [k, v] of Object.entries(state.orders)) {
            //console.log("k=",k, "v=",v);
            if(v.side=='SELL')
              try{
                sum += parseFloat(v.outstanding_hold_amount) * state.channels[v.product_id].rawData[0].Close;
              } catch (e) {
                  //console.log(e)
              }
            else
              try{
                sum += parseFloat(v.outstanding_hold_amount);
              } catch(e){
                  //consolelog(e)
              }
          }
          try {
            sum += state.currencies["USD"].balance;
            //console.log("sum=",sum);
            //console.log(state.currencies["USD"].balance);
          } catch (e) {
            //console.log("ERROR: USD balance");
          }
          return sum.toFixed(4);
        },
      },
      actions: {
        cbxLink(k) {
          let url = `https://www.coinbase.com/advanced-trade/spot/${k}-USD`;
          if (k.indexOf("-USD") > 0) url = `https://www.coinbase.com/advanced-trade/spot/${k}`;
          window.open(url, "_blank");
        },
        toggleSubscribedByCurrname(currname) {
          const k = currname + "-USD";
          if (this.channels[k].subscribed) {
            this.unsubscribe(currname);
          } else {
            this.subscribe(currname);
          }
        },
        toggleSubscribed(k) {
          const currname = k.split("-")[0];
          if (this.channels[k].subscribed) {
            this.unsubscribe(currname);
          } else {
            this.subscribe(currname);
          }
        },
        togglePinned(k) {
          console.log("togglePinned", k);
          if (k.indexOf("-USD") < 0) k += "-USD";
          if (this.channels[k].pinned) {
            this.channels[k].pinned = false;
            this.channels[k].hidden = true;
            this.channels[k].bars = false;
            this.channels[k].candlesticks = false;
            this.channels[k].dots = false;
          } else {
            this.channels[k].pinned = true;
            this.channels[k].hidden = false;
          }
          this.updatePriceLabel(k);
        },
        removeChannel(k) {
          const currname = k.split("-")[0];
          this.unsubscribe(currname);
        },
        zeroCB() {
          Object.keys(this.channels).forEach((k, idx) => {
            console.log(k);
            this.channels[k].d0 = {
              //d0 is a property-reference point
              t0: this.channels[k].rawData[this.d0Idx].t0,
              Close: this.channels[k].rawData[this.d0Idx].Close,
            };
          });
        },
        updatePriceLabel(k) {
          d3.selectAll(`.${k}-price-label`).html(
            parseFloat(this.channels[k].rawData[0].Close).toExponential(3)
          );
        },
        updatePriceLabels(msg) {
          try {
            //https://stackoverflow.com/questions/31581011/how-to-use-tolocalestring-and-tofixed2-in-javascript
            d3.selectAll(`.${msg.product_id}-price-label-noexp`).html(
              //main yellow BTC price label
              parseFloat(msg.price).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            );
            d3.selectAll(`.${msg.product_id}-price-label`).html(
              parseFloat(msg.price).toExponential(3)
            );
          } catch (e) {}
        },
        processTickerMsg(msg) {
          if (!("product_id" in msg)) {
            return;
          }
          const pid = msg.product_id;
          if (pid in this.channels) {
            this.channels[pid].msgCount += 1;
            try {
              console.log(msg)
              console.log(msg.price)
              console.log(this.channels[pid].rawData[0])
              this.channels[pid].rawData[0].tlast = new Date(Date.now());
              this.channels[pid].rawData[0].Close = parseFloat(msg.price);
              this.channels[pid].rawData[0].PricePctChange =
                ((parseFloat(msg.price) - this.channels[pid].rawData[0].Open) /
                  this.channels[pid].rawData[0].Open) *
                100;
    
              if (parseFloat(msg.price) > this.channels[pid].rawData[0].High)
                this.channels[pid].rawData[0].High = parseFloat(msg.price);
              if (parseFloat(msg.price) < this.channels[pid].rawData[0].Low)
                this.channels[pid].rawData[0].Low = parseFloat(msg.price);
    
              if (msg["side"] == "buy") {
                this.channels[pid].rawData[0]["BuyUSD"] += parseFloat(
                  msg["last_size"] * this.channels[pid].rawData[0]["Close"]
                );
                this.channels[pid].rawData[0]["BuyVOL"] += parseFloat(
                  msg["last_size"]
                );
              } else if (msg["side"] == "sell") {
                this.channels[pid].rawData[0]["SellUSD"] += parseFloat(
                  msg["last_size"] * this.channels[pid].rawData[0]["Close"]
                );
                this.channels[pid].rawData[0]["SellVOL"] += parseFloat(
                  msg["last_size"]
                );
              }
            } catch (e) {
              console.log(e);
            }
            this.updatePriceLabels(msg);
            /*
            try {
              //https://stackoverflow.com/questions/31581011/how-to-use-tolocalestring-and-tofixed2-in-javascript
              d3.selectAll(`.${pid}-price-label-noexp`).html(
                //main yellow BTC price label
                parseFloat(msg.price).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              );
              d3.selectAll(`.${pid}-price-label`).html(
                parseFloat(msg.price).toExponential(3)
              );
            } catch (e) {}
            */
            let cutoff_date = new Date(Date.now() - this.buffer_minutes * 60000);
            try {
              if (this.channels[pid].rawData) {
                while (
                  this.channels[pid].rawData.length >
                  this.buffer_minutes + 1
                ) {
                  this.channels[pid].rawData.pop();
                }
              }
            } catch (e) {
              console.log(e);
            }
          } else {
            console.log("AWAIT BLOCK UPDATE:", pid);
            //ONLY let collBlockUpdate init channel
            /*
            const entry = {
              Date: msg.Date,
              price: parseFloat(msg.price),
            };
            console.log("date", new Date(Date.now()));
            this.channels[pid] = {
              msgCount: 0,
              rawData: [entry],
              d0: entry,
            };
            */
          }
        },
        processBlockUpdate(msg) {
          console.log("processBlockUpdate", msg);
          const pid = msg.product_id;
          const currname = msg.product_id.split("-")[0];
          this.currencies[currname].subscribed = msg.subscribed;
          if (pid in this.channels) {
            this.channels[pid].rawData = msg.price_data;
            this.channels[pid].balance = msg.balance;
            this.channels[pid].subscribed = msg.subscribed;
            this.channels[pid].lookAtMeVOL = msg.lookAtMeVOL;
            this.channels[pid].lookAtMePCT = msg.lookAtMePCT;
          } else {
            this.channels[pid] = {
              msgCount: 0,
              rawData: msg.price_data,
              d0: msg.price_data[this.d0Idx],
              color: this.getChannelColor(pid), //NEED: eliminate this w/getter
              balance: msg.balance,
              fatLine: false,
              subscribed: msg.subscribed,
              lookAtMeVOL: msg.lookAtMeVOL,
              lookAtMePCT: msg.lookAtMePCT,
              pid: pid,
              candlesticks: false,
              dots: false,
              bars: false,
              hidden: true,
              ignore: false,
              subscribed: false,
              pinned: false,
              high_24h: msg.high_24h,
              low_24h: msg.low_24h,
              open_24h: msg.open_24h,
              volume_1m: msg.volume_1m,
              price: msg.price,
            };
          }
          this.updatePriceLabels(msg);
        },
        processCollectiveBlockUpdate(MSG) {
          console.log("processCollectiveBlockUpdate", MSG);
          Object.keys(MSG).forEach((k, kidx) => {
            if (k !== "type") {
              const msg = MSG[k];
              const pid = msg.product_id;
              const currname = msg.product_id.split("-")[0];
              //this.currencies[currname].subscribed = msg.subscribed;
              if (pid in this.channels) {
                this.channels[pid].rawData = msg.price_data;
                this.channels[pid].rawData[0].tlast = new Date(Date.now());
                this.channels[pid].balance = msg.balance;
                //this.channels[pid].subscribed = msg.subscribed;
                this.channels[pid].lookAtMeVOL = msg.lookAtMeVOL;
                this.channels[pid].lookAtMePCT = msg.lookAtMePCT;
                //console.log(pid, "channel updated");
              } else {
                this.channels[pid] = {
                  msgCount: 0,
                  rawData: msg.price_data,
                  d0: msg.price_data[this.d0Idx],
                  color: this.getChannelColor(pid),
                  balance: msg.balance,
                  fatLine: false,
                  subscribed: msg.subscribed,
                  lookAtMeVOL: msg.lookAtMeVOL,
                  lookAtMePCT: msg.lookAtMePCT,
                  pid: pid,
                  candlesticks: false,
                  dots: false,
                  bars: false,
                  hidden: true,
                  ignore: false,
                  subscribed: false,
                  pinned: false,
                  high_24h: msg.high_24h,
                  low_24h: msg.low_24h,
                  open_24h: msg.open_24h,
                  volume_1m: msg.volume_1m,
                  price: msg.price,
                };
                console.log("channel created");
              }
              this.updatePriceLabels(msg);
            }
          });
        },
        getChannelColorByIDX(idx) {
          var myColor = d3
            .scaleSequential()
            .domain([0, Object.keys(this.currencies).length])
            .interpolator(d3.interpolatePurples);
          //return myColor(parseFloat(0.5));
          return this.colorThemes[this.colorTheme](parseFloat(idx / 260));
        },
        getChannelColor(pid) {
          //console.log(pid)
          if (pid.indexOf("-USD") < 0) pid += "-USD";
          try {
            //console.log("getChannelColor", pid);
            const idx = Object.keys(this.currencies)
              .sort()
              .indexOf(pid.split("-")[0]);
            return this.getChannelColorByIDX(idx);
          } catch (e) {
            return "red";
          }
        },
        updateAccounts(data) {
          console.log(data);
          //update or set a balance field on each currency
          
          Object.entries(data).forEach((k, v) => {
            try {
              this.currencies[k[0].replace("-USD", "")]["available"] = parseFloat(
                k[1]["balance"]["amount"]
              );
              this.currencies[k[0].replace("-USD", "")]["balance"] = 
                parseFloat(k[1]["balance"]["amount"]);
              //this.currencies[k[0].replace("-USD", "")]["hold"] = parseFloat(
              //  k[1].hold["value"]
              //);
              console.log(this.currencies[k[0].replace("-USD", "")]);
              console.log(this.channels[k[0]]);
            } catch (e) {
              console.log(e);
            }
          });
        },
        updateOrders(data) {
          this.orders = data;
          console.log(this.orders);
        },
        oldUpdateAccts(data) {
          console.log(data);
          this.accounts = {};
          //const pre_html = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
          //d3.select("#accounts_dump").html(pre_html);
          let total_value = 0;
          let html = "<table>";
          Object.entries(data).forEach((k, v) => {
            if (parseFloat(k[1].balance) > 0) {
              let pid = k[0] + "-USD";
              console.log(pid);
              let price = "****";
              let value = "****";
    
              try {
                console.log(pid in Object.keys(this.channels));
                console.log(this.channels[pid]);
                if (k[0] == "USD") {
                  price = 1;
                } else {
                  price = parseFloat(
                    this.channels[pid].rawData[0].Close
                  ).toPrecision(5);
                  this.accounts[pid] = { balance: parseFloat(k[1].balance) };
                }
                value = (parseFloat(k[1].balance) * price).toPrecision(5);
                total_value += parseFloat(k[1].balance) * price;
              } catch (e) {
                console.log(e);
              }
              const line =
                "<tr><td>" +
                k[0] +
                "</td><td>" +
                parseFloat(k[1].balance).toPrecision(5) +
                "</td><td>" +
                price +
                "</td><td>" +
                value +
                "</td><td> <button onclick='window.sellCB(\"" +
                k[0] +
                "\")'>Sell</button>" +
                "</td></tr>";
              html += line;
            }
          });
          html +=
            "<tr><td colSpan='10'>Total: " +
            total_value.toPrecision(5) +
            "</td></tr>";
          html += "</table>";
          console.log(html);
          d3.select("#accounts_dump").html(html);
        },
        updateZ25D(data) {
          console.log("updateZ25D", typeof data, data);
          this.volThresh = data.volThresh;
          this.pctThresh = data.pctThresh;
          this.subscribeBTC = data.subscribeBTC;
          this.subscribeETH = data.subscribeETH;
          this.subscribePct = data.subscribePct;
          this.subscribeVol = data.subscribeVol;
          this.subscribeBal = data.subscribeBal;
          for (var idx = 0; idx < data.sendlist.length; idx++) {
            const pid = data.sendlist[idx];
            //console.log("subscribed to ", pid);
            try {
              const currname = pid.split("-")[0];
              try {
                this.channels[pid].subscribed = true;
              } catch (e) {
                //console.log(e);
                //console.log(Object.keys(this.channels));
                //console.log(this.channels[pid]);
              }
              try {
                this.currencies[currname].subscribed = true;
              } catch (e) {
                console.log(e);
              }
            } catch (e) {
              console.log(e);
            }
          }
          console.log("z25d updated");
        },
        sendSettings() {
          const pyld = JSON.stringify({
            type: "z25d",
            volThresh: this.volThresh,
            pctThresh: this.pctThresh,
            subscribeBTC: this.subscribeBTC,
            subscribeETH: this.subscribeETH,
            subscribePct: this.subscribePct,
            subscribeVol: this.subscribeVol,
            subscribeBal: this.subscribeBal,
          });
          this.ws.send(pyld);
          console.log("settings sent", pyld);
        },
        getCBX() {
          const pyld = JSON.stringify({
            type: "cmd",
            cmd: "self.getCBX()",
          });
          this.ws.send(pyld);
        },
        getOrders() {
          const pyld = JSON.stringify({
            type: "refresh_orders",
          });
          this.ws.send(pyld);
        },
        connect() {
          console.log("Z25.connect");
          if (this.ws) {
            this.connStatus = "Z25 Closing ...";
            this.ws.close();
            this.ws = null;
            this.connected = false;
            this.connStatus = "Z25 Connect";
          } else {
            //Connecting ...
            this.connStatus = "Z25 Connecting ...";
            //const CONN = 'wss://ws-feed.pro.coinbase.com'
            //const CONN = "ws://192.168.0.66:7879";
            ////const CONN = "ws://localhost:7879";
            //const CONN = "wss://www.software.vegas:7878";
            ////this.ws = new WebSocket(CONN);
            const fallback = (location.protocol === 'https:') ? 'wss://localhost:7879' : 'ws://localhost:7879';
            const CONN = (import.meta?.env?.VITE_WS_URL?.trim()) || fallback;
            this.ws = new WebSocket(CONN);
            this.connected = true;
            this.t0 = parseInt(new Date().getTime());
    
            this.ws.onopen = (ev) => {
              this.connStatus = "Z25 Connected";
              //var pyld = JSON.stringify({"type":"subscribe", "product_ids":pids, "channels":["ticker"]})
              var pyld = JSON.stringify({
                type: "associate",
                value: 1,
              });
              this.ws.send(pyld);
            };
    
            this.ws.onmessage = (ev) => {
              this.msgCount += 1;
              this.connTime = parseFloat(
                (parseInt(new Date().getTime()) - this.t0) / 1000
              ).toFixed(3);
              const data = JSON.parse(ev.data);
              if (data.type != "ticker") {
                //window.wsio("in",data);
                console.log(data.type);
                if (data.type == "collective_block_update") {
                  this.processCollectiveBlockUpdate(data);
                } else if (data.type == "block_update") {
                  this.processBlockUpdate(data);
                } else if (data.type == "refresh_accounts") {
                  this.updateAccounts(data.value);
                } else if (data.type == "refresh_orders") {
                  this.updateOrders(data.orders);
                } else if (data.type == "z25d") {
                  this.updateZ25D(data);
                } else if (data.type == "subscribed") {
                  const currname = data.pid.split("-")[0];
                  this.channels[data.pid].subscribed = true;
                  this.currencies[currname].subscribed = true;
                } else if (data.type == "unsubscribed") {
                  console.log(data.type, data.pid);
                  const currname = data.pid.split("-")[0];
                  try {
                    this.channels[data.pid].subscribed = false;
                    //this.currencies[currname].subscribed = false;
                    if (this.checkOkayDeleteChannel(data.pid) == true) {
                      delete this.channels[data.pid];
                      console.log("channel", data.pid, "deleted");
                    }
                  } catch (e) {
                    console.log(e);
                  }
                } else if (data.type == "toggle_hotlist") {
                  console.log("toggle_hotlist", ev.data);
                } else {
                  console.log("unk type", ev.data);
                }
              } else {
                this.processTickerMsg(data);
              }
              let html = '<center><table width="100%">';
              html += "<tr><td>Channels</td><td>" + this.nchan + "</td></tr>";
              html += "<tr><td>MsgCount</td><td>" + this.msgCount + "</td></tr>";
              html += "<tr><td>ConnTime</td><td>" + this.connTime + "</td></tr>";
              //html += '<tr><td>t0</td><td>' + this.t0 + '</td></tr>'
              /*
              for (const [key,val] of Object.entries(data)) {
                if (key.indexOf('volume') > -1) {
                  html += '<tr class="text-uppercase"><td>' + key + '</td><td> ' + val + '</td></tr>'
                } else if (key.indexOf('time') > -1) {
                  html += '<tr class="text-uppercase"><td>' + key + '</td><td> ' + val.split(':')[0] + '</td></tr>'
                } else {
                  html += '<tr class="text-uppercase"><td>' + key + '</td><td> ' + val + '</td></tr>'
                }
              }
              this.msgTypes.forEach((v) => {
                html += "<tr><td></td><td>" + v + "</td></tr>";
              });
              */
              html += "</table></center>";
              d3.select("#Z25_debug").html(html);
            };
          }
        },
        getCurrencies() {
          axios(CURRENCIES_URL).then((res) => {
            //console.log(res.data)
            const keys = Object.keys(res.data);
            for (let kidx in keys) {
              const key = res.data[kidx].id;
              const pid = key + "-USD";
              //console.log(pid)
              this.currencies[key] = res.data[kidx];
              //console.log(res.data[kidx])
              this.currencies[key]["pid"] = pid;
    
              //this.currencies[key]["color"] = this.getChannelColor(pid);
              this.currencies[key]["subscribed"] = false;
    
              this.currencies[key]["balance"] = ref(null);
            }
            const skeys = Object.keys(this.currencies).sort();
            for (let kidx = 0; kidx < skeys.length; kidx++) {
              this.currencies[skeys[kidx]]["color"] = ref(
                this.getChannelColorByIDX(kidx)
              );
            }
            /*
            res.data.forEach((c) => {
              this.currencies[c.id] = c;
              this.currencies[c.id]["pid"] = c.id + "-USD";
              this.currencies[c.id]["color"] = c.id + "-USD"
            });
            */
          });
        },
        subscribe(currname) {
          const pid = currname + "-USD";
          var pyld = JSON.stringify({
            type: "subscribe",
            pid: pid,
          });
          this.ws.send(pyld);
        },
        unsubscribe(currname) {
          const pid = currname + "-USD";
          var pyld = JSON.stringify({
            type: "unsubscribe",
            pid: pid,
          });
          this.ws.send(pyld);
        },
        restartCBX() {
          var pyld = JSON.stringify({
            type: "restartCBX",
          });
          this.ws.send(pyld);
        },
        checkOkayDeleteChannel(k) {
          let deleteFlag = true;
          if (k == "BTC-USD" && this.subscribeBTC == true) deleteFlag = false;
          else if (k == "ETH-USD" && this.subscribeETH == true) deleteFlag = false;
          else if (this.channels[k].balance && this.subscribeBal == true)
            deleteFlag = false;
          if (this.channels[k].subscribed == true) deleteFlag = false;
          return deleteFlag;
        },
        clearLookAtMe() {
          for (const [k, v] of Object.entries(this.channels)) {
            if (this.checkOkayDeleteChannel(k) == true) {
              delete this.channels[k];
            }
          }
          var pyld = JSON.stringify({
            type: "clearLookAtMe",
          });
          this.ws.send(pyld);
        },
        setThresholds() {
          var pyld = JSON.stringify({
            type: "setThresholds",
            pctThresh: 1.1,
            volThresh: parseInt(Math.random() * 20),
          });
          this.ws.send(pyld);
        },
        placeOrder(pyld) {
          let json_pyld=JSON.stringify(pyld);
          console.log(json_pyld);
          //{"pid":"DIMO-USD","side":"B","amt":"5","type":"L","limit":"1%"}
          //{"pid":"DIMO-USD","side":"S","amt":"5","type":"L","limit":"1%"}
          //{"pid":"DIMO-USD","side":"B","amt":"5","type":"M","limit":"1%"}
          //{"pid":"DIMO-USD","side":"S","amt":"5","type":"M","limit":"1%"}
          this.ws.send(json_pyld);
          return
        },
        cancelOrder(oid) {
          this.wsio("out", { type: "cancel_order", value: "not-used", id: oid });
        },
        cancelAll() {
          this.wsio("out", { type: "cancel_all", value: "not-used", id: "" });
        },
        wsio(direction, msg) {
          if (direction == "in") {
            console.log("in", msg);
          } else {
            console.log("out", msg);
            this.ws.send(JSON.stringify(msg));
          }
        },
        decimalPlaces(n) {
          //from a stack overflow post
          function hasFraction(n) {
            return Math.abs(Math.round(n) - n) > 1e-10;
          }
          let count = 0;
          // multiply by increasing powers of 10 until the fractional part is ~ 0
          while (hasFraction(n * 10 ** count) && isFinite(10 ** count)) count++;
          return count;
        },
        setAllHidden() {
          Object.keys(this.channels).forEach((k, idx) => {
            this.channels[k].hidden = true;
          });
        },
        toggleHotlist() {
          //if (this.maintainHotlist === true) this.maintainHotlist = false;
          //else this.maintainHotlist = true;
          const pyld = {
            type: "toggle_hotlist",
          };
          this.wsio("out", pyld);
        },
      },
    });
