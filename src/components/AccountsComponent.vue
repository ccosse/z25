<template>

<q-expansion-item label="Portfolio" v-model="expanded">
	<div v-if="expanded" id="accountsPanel" class="full-width">

	<q-card flat>
		<q-card-section>
		<table id="balancesTable" width="100%" class="text-center">
		<tbody>
			<tr class="font-weight-bold">
				<th @click="this.sortTable(0)" class="cursor-pointer">Curr</th>
				<th @click="this.sortTable(1)" class="cursor-pointer">Bal</th>
				<th @click="this.sortTable(2)" class="cursor-pointer">Price</th>
				<th @click="this.sortTable(3)" class="cursor-pointer float-right">Val</th>
			</tr>
			<tr v-for="(c, k) of this.z25Store.currenciesWithBalances" :key="k">
				<td>
					<q-btn flat dense @click="this.z25Store.togglePinned(k)" :style="{backgroundColor: [this.z25Store.getChannelColor(k)], color: 'navy', width: '40px'}" class="font-weight-bold">
					{{ k.slice(0,3) }}</q-btn>
					<q-icon name="link" class="on-right rotate-90 cursor-pointer" @click="this.z25Store.cbxLink(k)"/>
				</td>
				<td>
					<span v-if="c.balance < 1">{{ c.balance.toFixed(5) }}</span>
					<span v-else>{{ c.balance.toFixed(2) }}</span>
				</td>
				<td v-if="this.z25Store.channels[k + '-USD']">
					{{ this.z25Store.channels[k + "-USD"].rawData[0].Close }}
				</td>
				<td v-else>
					-1
				</td>
				<td class="float-right" v-if="this.z25Store.channels[k + '-USD']">
					{{
						(
							this.z25Store.currencies[k].balance *
							this.z25Store.channels[k + "-USD"].rawData[0].Close
						).toFixed(2)
					}}
				</td>
				<td v-else class="float-right">
					-1
				</td>
			</tr>
		</tbody>
		</table>
		</q-card-section>
	</q-card>

	</div>
</q-expansion-item>

</template>
<script>
import { defineComponent, ref } from "vue";
import { useZ25Store } from "stores/z25-store.js";
export default defineComponent({
	name: "AccountsComponent",
	setup() {
		return {
			z25Store: useZ25Store(),
			title: ref("Title"),
			expanded: ref(false),
		};
	},
	mounted() {
		console.log("mounted");
	},
	methods: {
		sortTable (n) {
			var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
			table = document.getElementById("balancesTable");
			console.log('sortTable ', n, table)
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
				console.log('rows.length',rows.length)
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
							if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
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
							if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
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
	},
});
</script>
<style></style>
