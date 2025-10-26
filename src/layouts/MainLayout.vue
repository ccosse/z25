<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-positive text-white">
      <q-toolbar>
        <q-btn flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <div class="text-h6 float-center text-yellow cursor-pointer">
            <span style="padding: 0px 0px" @click="this.z25Store.cbxLink('BTC')"
              ><q-icon size="md" style="top: -3px" name="currency_bitcoin"
            /></span>
            <span style="width: 200px" class="BTC-USD-price-label-noexp"
              >$00,000.00</span
            >
          </div>
        </q-toolbar-title>

        <q-btn
          flat
          round
          icon="auto_awesome"
          @click="this.z25Store.updateAccounts()"
        >
        </q-btn>
        <q-btn flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-page-container>
        <router-view />
    </q-page-container>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area :style="{ height: '94vh' }" ref="scrollAreaLHS">
        <q-select
          filled
          v-model="this.z25Store.colorTheme"
          :options="Object.keys(this.z25Store.colorThemes)"
          label="Channel Colors"
        />
        <Z25Component />
        <NtupleComponent />
        <q-expansion-item label="Subscribed" v-model="subscribeListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Subscribed {{ this.z25Store.nsub }} 
              </div>
            </q-item-section>
          </template>
          <div id="subscribeListDiv" class="flex flex-center" v-if="this.subscribeListExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].subscribed == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>
<!--
        <q-expansion-item label="Hotlist" v-model="hotListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Hotlist {{ this.z25Store.nhot }}
              </div>
            </q-item-section>
          </template>
          <div id="hotlistDiv" class="flex flex-center" v-if="this.hostlistExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].hotlist == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>
      -->
        <q-expansion-item label="Volumes" v-model="volumesListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Volumes {{ this.z25Store.nvol }}
              </div>
            </q-item-section>
          </template>
          <div id="volumesListDiv" class="flex flex-center" v-if="this.volumesListExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].lookAtMeVOL == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>

        <q-expansion-item label="Percentages" v-model="pctsListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Percentages {{ this.z25Store.npct }}
              </div>
            </q-item-section>
          </template>
          <div id="pctsListDiv" class="flex flex-center" v-if="this.pctsListExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].lookAtMePCT == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>
<!--
        <AccountsComponent />
        <CBXComponent />
-->
    <DialsComponent />
    <q-page-sticky position="bottom-left" :offset="[-285,0]">
          <q-btn fab icon="height" color="grey" @click=this.scrollTopLHS() />
        </q-page-sticky>
      </q-scroll-area>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-scroll-area :style="{ height: '94vh' }" ref="scrollAreaRHS">

        <q-expansion-item label="Pinned" v-model="pinnedListExpanded">
          <div id="channelPanel" class="flex flex-center">

            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].pid == 'BTC-USD'
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>

            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].pinned == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>

        <q-expansion-item label="Orders" v-model="ordersListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Orders {{ this.z25Store.channelsWithOrders.length }}
              </div>
            </q-item-section>
          </template>
          <div id="ordersListDiv" class="flex flex-center" v-if="this.ordersListExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => this.z25Store.channelsWithOrders.indexOf(d[0]) > -1
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>

        <q-expansion-item label="Balances" v-model="balanceListExpanded">
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-bold">
                Balances {{ this.z25Store.nbal }}
              </div>
            </q-item-section>
          </template>
          <div id="balanceListDiv" class="flex flex-center" v-if="this.balanceListExpanded">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].balance > 0
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>


        <q-expansion-item label="Ignore">
          <div id="ignoreDiv" class="flex flex-center">
            <span
              v-for="(c, k) of Object.entries(this.z25Store.channels).filter(
                (d) => d[1].ignore == true
              )"
              :key="k"
            >
              <ChannelComponent :k="k" :c="c" />
            </span>
          </div>
        </q-expansion-item>

        <q-expansion-item label="debug">
          {{ this.z25Store.channelsWithOrders }}
        </q-expansion-item>
        <q-page-sticky position="bottom-right" :offset="[-285,0]">
        <q-btn fab icon="height" color="grey" @click=this.scrollTopRHS() />
      </q-page-sticky>

    </q-scroll-area>
    </q-drawer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { Dark } from "quasar";
import Z25Component from "components/Z25Component.vue";
import NtupleComponent from "components/NtupleComponent.vue";
import ChannelComponent from "components/ChannelComponent.vue";
import DialsComponent from "components/DialsComponent.vue";
/*
import CBXComponent from "components/CBXComponent.vue";
import AccountsComponent from "components/AccountsComponent.vue";
*/
import { useZ25Store } from "stores/z25-store.js";
export default defineComponent({
  name: "MainLayout",
  components: {
    Z25Component,
    NtupleComponent,
    ChannelComponent,
    DialsComponent,
/*
    CBXComponent,
    AccountsComponent,
*/
    },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const scrollAreaRHS = ref(null)
    const scrollAreaLHS = ref(null)
    return {
      z25Store: useZ25Store(),
      pinnedListExpanded: ref(true),
      balanceListExpanded: ref(false),
      hostlistExpanded: ref(false),
      volumesListExpanded: ref(false),
      pctsListExpanded: ref(false),
      subscribeListExpanded: ref(false),
      ordersListExpanded: ref(false),
      hotListExpanded: ref(false),

      scrollAreaRHS,
      scrollAreaLHS,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
    };
  },
  mounted() {
    if (!Dark.isActive) {
      Dark.toggle();
    }
  },
  methods: {
    logout() {},
    scrollTopRHS () {
      // console.log(this.scrollAreaRHS.getScrollPosition())
      // this.scrollAreaRHS.setScrollPosition('vertical', 0)
      const rval = this.scrollAreaRHS.getScrollPosition()
      if (rval.top === 0) {
        this.scrollAreaRHS.setScrollPercentage('vertical', 1)
      } else {
        this.scrollAreaRHS.setScrollPosition('vertical', 0)
      }
    },
    scrollTopLHS () {
      // console.log(this.scrollAreaLHS.getScrollPosition())
      // this.scrollAreaLHS.setScrollPosition('vertical', 0)
      const rval = this.scrollAreaLHS.getScrollPosition()
      if (rval.top === 0) {
        this.scrollAreaLHS.setScrollPercentage('vertical', 1)
      } else {
        this.scrollAreaLHS.setScrollPosition('vertical', 0)
      }
    }
  },
});
</script>
