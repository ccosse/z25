<template>
  <q-expansion-item label="Ntuple" v-model="expanded">
  <q-card flat class="full-width" v-if="expanded">
    <q-card-section>
      <table dense id='ntupleTable' width="100%" class="text-center"><tbody>
      <tr class="font-weight-bold">
        <td><q-btn @click="this.sortTable(0)">PID</q-btn></td> 
        <!--<td><q-btn @click="this.sortTable(1)">$</q-btn></td> -->
        <td><q-btn @click="this.sortTable(1)">%H</q-btn></td> 
        <td><q-btn @click="this.sortTable(2)">%N</q-btn></td> 
        <td><q-btn @click="this.sortTable(3)">%L</q-btn></td> 
      </tr>

      <tr v-for="(channel,pid) of this.z25Store.channels" :key="pid">
        <td>

					<q-btn flat dense @click="this.z25Store.togglePinned(pid)" :style="{backgroundColor: [this.z25Store.getChannelColor(pid)], color: 'navy', width: '40px'}" class="font-weight-bold">
						{{pid.split('-')[0].slice(0,3)}}
						<!--
						<q-tooltip class="text-h6">
							{{pid}} <br> ${{this.z25Store.channels[pid].rawData[0].Close}}
						</q-tooltip>
						-->
					</q-btn>
					<q-icon name="link" class="on-right rotate-90 cursor-pointer" @click="this.z25Store.cbxLink(pid)"/>
					
				</td> 
        <!--td>{{this.z25Store.channels[pid].rawData[0].Close}}</td> -->
        <td>{{ ((this.z25Store.channels[pid].high_24h - this.z25Store.channels[pid].open_24h)/this.z25Store.channels[pid].open_24h * 100).toFixed(2) }}</td> 
        <td>{{ ((this.z25Store.channels[pid].rawData[0].Close - this.z25Store.channels[pid].high_24h)/this.z25Store.channels[pid].high_24h * 100).toFixed(2) }}</td> 
        <td>{{ ((this.z25Store.channels[pid].low_24h - this.z25Store.channels[pid].open_24h)/this.z25Store.channels[pid].open_24h * 100).toFixed(2) }}</td> 
      </tr>
	</tbody></table>
      
    </q-card-section>
  </q-card>
	</q-expansion-item>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { useZ25Store } from 'stores/z25-store.js'
export default defineComponent ({
  name: 'NtupleComponent',
  setup () {
    return {
      z25Store: useZ25Store(),
      title: ref('Title'),
			expanded: ref(false),
    }
  },
  mounted () {
    console.log('mounted')
  },
  methods: {
    sortTable (n) {
    	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    	table = document.getElementById("ntupleTable");
      //console.log('sortTable ', n, table)
    	switching = true;
    	//Set the sorting direction to ascending:
    	dir = "asc";
    	/*Make a loop that will continue until
    	no switching has been done:*/
    	while (switching) {
        //console.log('switching ...')
    		//start by saying: no switching is done:
    		switching = false;
    		rows = table.rows;
    		/*Loop through all table rows (except the
    		first, which contains table headers):*/
        //console.log('rows.length',rows.length)
    		for (i = 1; i < (rows.length - 1); i++) {
    			//start by saying there should be no switching:
    			shouldSwitch = false;
    			/*Get the two elements you want to compare,
    			one from current row and one from the next:*/
    			x = rows[i].getElementsByTagName("TD")[n];
    			y = rows[i + 1].getElementsByTagName("TD")[n];
    			/*check if the two rows should switch place,
    			based on the direction, asc or desc:*/
    			if (dir == "asc") {
    				if (n == 0){
    					if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
    						//if so, mark as a switch and break the loop:
    						shouldSwitch= true;
    						break;
    					}
    				} else {
    					if (parseFloat(x.innerHTML.toLowerCase()) > parseFloat(y.innerHTML.toLowerCase())) {
    						//if so, mark as a switch and break the loop:
    						shouldSwitch= true;
    						break;
    					}
            }
    			} else if (dir == "desc") {
    				if (n == 0){
    					if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
    						//if so, mark as a switch and break the loop:
    						shouldSwitch = true;
    						break;
    					} 
            } else {
    				  if (parseFloat(x.innerHTML.toLowerCase()) < parseFloat(y.innerHTML.toLowerCase())) {
    					  //if so, mark as a switch and break the loop:
    					  shouldSwitch = true;
    					  break;
              }
    				}
    			}
    		}
    		if (shouldSwitch) {
    			/*If a switch has been marked, make the switch
    			and mark that a switch has been done:*/
    			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
    			switching = true;
    			//Each time a switch is done, increase this count by 1:
    			switchcount ++;
    		} else {
    			/*If no switching has been done AND the direction is "asc",
    			set the direction to "desc" and run the while loop again.*/
    			if (switchcount == 0 && dir == "asc") {
    				dir = "desc";
    				switching = true;
    			}
    		}
    	}
    },
 }
})
</script>
<style>
</style>