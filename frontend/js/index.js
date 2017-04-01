var vm = new Vue({
	el : "#app",
	data : {
		user : null,
		message : "",
		projects : []
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
						this.runonload();
			 	},
			 	function(res){
			 		this.message = res.body.message;
			 	}
		 	);
		},
		runonload : function() {
			var token = Cookies.get('token');
			if(token){
				this.$http.get('/api/login', {params : {token : token}}).then(
					function(res){
						vm.user = res.body.user;
					}, function(res){
						message = res.body.message;
					}
				);
				this.$http.get('/api/student-projects', {params : {token : token}}).then(
					res => {
						vm.projects = res.body.projects;
						console.log(vm.projects);
					}, res => {
						message = res.body.message;
					}
				);
			}
		},
		logout_p : function(event) {
			Cookies.remove('token');
			vm.user = null;
			location.reload();
		}
	}
});
$(document).ready(() => {
	vm.runonload();
});
