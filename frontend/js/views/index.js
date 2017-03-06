var vm = new Vue({
	el : "#app",
	data : {
		stations : []
	},
	methods : {

	}
});
$document.ready(function(){
	this.$http.get("/api/stations").then(function(res){
		if(res.body.success){
			vm.data = res.body.stations;
		}else{

		}
	});
});
