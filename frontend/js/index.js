var vm = new Vue({
	el : "#app",
	data : {
		login : null
	},
	methods : {
		login : function(event){
			var formData : {
				email : $("#email").val(),
				password :$("#password").val()
			};
			this.$http.post("/api/login", formData, {emulateJSON : true}).then(
				function(res){
				 		Cookies.set("token", res.body.token.token, {expires : res.body.token.expires});
						vm.login = Cookies.get('token');
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
