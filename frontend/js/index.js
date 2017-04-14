var vm = new Vue({
	el : "#app",
	data : {
		user : null,
		message : "",
		projects : [],
		classes : []
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
						if(vm.user.type == "student"){
							this.$http.get('/api/student-projects', {params : {token : token}}).then(
								res => {
									vm.projects = res.body.projects;
								}, res => {
									message = res.body.message;
								}
							);
						}else if(vm.user.type == "teacher"){
							this.$http.get('/api/teacher-classes', {params : {token : token}}).then(
								res => {
									console.log(res.body);
								}, res => {
									message = res.body.message;
								}
							);
						}
					}, function(res){
						message = res.body.message;
					}
				);
			}
		},
		logout_p : function(event) {
			Cookies.remove('token');
			vm.user = null;
			location.reload();
		},
		upload_p : function(event){
			console.log(event.target.id);
			var formData = new FormData();
			formData.append("submitted", event.target.files[0]);
			this.$http.post("/fileserve/upload", formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(
				res => {
					var data = {
						token : Cookies.get("token"),
						link : res.body.filename,
						phase : event.target.id.split("+")[0],
						project : event.target.id.split("+")[1],
					};
					this.$http.post("/api/new-submission", data, {emulateJSON : true}).then(
						s_res => {
							this.runonload();
							Materialize.toast("Submission successful", 4000);
						}, s_res => {
							Materialize.toast("Submission failed", 4000);
					});
				}, res => {
					Materialize.toast("File upload failed", 4000);
				});
		}
	}
});
$(document).ready(() => {
	vm.runonload();
});
