var vm = new Vue({
	el : "#app",
	data : {
		user : null,
		message : "",
		projects : [{
			title : "Project 1",
			description : "Stuff"
		},
		{
			title : "Project 2",
			description : "Stuff"
		}]
	},
	methods : {
		login_p : function(event) {
			var formData = {
				email : $("#email").val(),
				password :$("#password").val()
			};
			this.$http.post("/api/login", formData, {emulateJSON : true}).then(
				function(res){
				 		Cookies.set("token", res.body.token.token, {expires : res.body.token.expires});
						vm.user = res.body.user;
			 	},
			 	function(res){
			 		this.message = res.body.message;
			 	}
		 	);
		},
		runonload : function() {
			var token = Cookies.get('token');
			console.log(token);
			this.$http.get('/api/login', {params : {token : token}}).then(
				function(res){
					vm.user = res.body.user;
				}, function(res){
					message = res.body.message;
				}
			);
		}
	}
});
$(document).ready(() => {
	vm.runonload();
});
