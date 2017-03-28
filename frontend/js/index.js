var vm = new Vue({
	el : "#app",
	data : {
		type : "",
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
						vm.login = Cookies.get('token');
						vm.type = res.body.user.type;
			 	},
			 	function(res){
			 		this.message = res.body.message;
			 	}
		 	);
		}
	}
});
$(document).ready(() => {
	vm.login = Cookies.get('token');
});
