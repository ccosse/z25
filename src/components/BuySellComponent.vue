<template>
  <ul style="display:table;padding:0px 0px;margin:0px 0px;">
  	<li style="display:table-cell;">
  		<div id="clicker_buyB" class="clickerB" @click="this.bsCB('B')">
  			<div id="clicker_buyL" class="clickerL">B</div>
  		</div>
  	</li> <li style="display:table-cell;">
  		<div id="clickerAmtB" class="clickerB" @click="this.amtCB()">
  			<div id="clickerAmtL" class="clickerL">{{this.clickerAmt}}</div>
  		</div>
  	</li> <li style="display:table-cell;">
  		<div id="clickerTypeB" class="clickerB" @click="this.typeCB()">
  			<div id="clickerTypeL" class="clickerL">{{this.clickerType}}</div>
  		</div>
  	</li> <li style="display:table-cell;">
  		<div id="clickerLimitB" class="clickerB" @click="this.limitCB()">
  			<div id="clickerLimitL" class="clickerL">{{this.clickerLimit}}</div>
  		</div>
  	</li> <li style="display:table-cell;">
  		<div id="clicker_sellB" class="clickerB" @click="this.bsCB('S')">
  			<div id="clicker_sellL" class="clickerL">S</div>
  		</div>
  	</li>
  </ul>
 </template>
<script>
import { defineComponent, ref } from 'vue'
import { useZ25Store } from 'stores/z25-store.js'

export default defineComponent ({
  name: 'BuySellComponent',
  props: ['pid'],
  setup (props) {
    return {
      z22Store: useZ25Store(),
      title: ref('Z25-Clicker'),
      clickerAmt: ref('5'),
      clickerType: ref('L'),
      clickerLimit: ref('1%'),
      props: ref(props),
    }
  },
  mounted () {
  },
  methods: {
    bsCB(side){
      console.log('bsCB ', side, this.clickerAmt, this.clickerType, this.clickerLimit)
      const pyld = {
        pid: this.props.pid,
        side: side,
        amt: this.clickerAmt,
        type: this.clickerType,
        limit: this.clickerLimit
      }
      this.z22Store.placeOrder(pyld)
    },
    amtCB(){
	    const amts=['MAX','MX2','2','5','10','50','100','250','500'];//MX2=MAX/2
	  	let idx=amts.indexOf(this.clickerAmt)+1
	  	if( idx > amts.length-1 )idx=0
	  	this.clickerAmt = amts[idx]
    },
    typeCB(){
  	  const types=['L','M'];
	 		let idx=types.indexOf(this.clickerType)+1;
	 		if( idx > types.length-1 )idx=0;
  		this.clickerType = types[idx]
    },
    limitCB(){
   	  const limits=['0%','0.1%','0.2%','1%','2%','3%','4%','5%','10%','15%','20%']
  		let idx=limits.indexOf(this.clickerLimit)+1
  		if( idx > limits.length-1 )idx=0
  		this.clickerLimit = limits[idx]
    },
  }
})
</script>
<style>
</style>