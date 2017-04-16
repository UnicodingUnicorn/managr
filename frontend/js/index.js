var vm = new Vue({
	el : "#app",
	data : {
		user : null,
		issearch : false,
		message : "",
		projects : [],
		classes : [],
		results : []
	}, methods : {
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
							this.$http.get('/api/student-token-projects', {params : {token : token}}).then(
								res => {
									vm.projects = res.body.projects;
								}, res => {
									message = res.body.message;
								}
							);
						}else if(vm.user.type == "teacher"){
							this.$http.get('/api/teacher-token-classes', {params : {token : token}}).then(
								res => {
									console.log(JSON.stringify(res.body.classes));
									vm.classes = res.body.classes;
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
		},
		do_search : function(event){
			var term = event.target.search.value;
			console.log(term);
			vm.projects.forEach(function(project){
				console.log(project.title + " " + project.title.search(term));
				if(project.title.search(term) != -1)
					vm.results.push(project);
				project.phases.forEach(function(phase){
					if(phase.title.search(term) != -1)
						vm.results.push(phase);
				})
			});
			vm.classes.forEach(function(class_){
				if(class_.name.search(term) != -1)
					vm.results.push(class_);
				class_.students.forEach(function(student){
					if(student.name.search(term) != -1)
						vm.results.push(student);
						student.projects.forEach(function(project){
							console.log(project.title + " " + project.title.search(term));
							if(project.title.search(term) != -1)
								vm.results.push(project);
							project.phases.forEach(function(phase){
								if(phase.title.search(term) != -1)
									vm.results.push(phase);
							})
						});
				});
			});
			console.log(JSON.stringify(vm.results));
		},
		grade : function(event) {
			//var formData = new FormData(event.target);
			//formData.append("token", Cookies.get('token'));
			var formData = {
				submission : event.target.submission.value,
				comment : event.target.comment.value,
				grade : event.target.grade.value,
				token : Cookies.get('token')
			};
			this.$http.post("/api/grade-submission", formData, {emulateJSON : true}).then(
				res => {
					runonload();
				}, res => {
					Materialize.toast(res.body.message, 4000);
			});
		}
	}, beforeCreate : function(){
		var token = Cookies.get('token');
		if(token){
			this.$http.get('/api/login', {params : {token : token}}).then(
				function(res){
					vm.user = res.body.user;
					if(vm.user.type == "student"){
						this.$http.get('/api/student-token-projects', {params : {token : token}}).then(
							res => {
								vm.projects = res.body.projects;
							}, res => {
								message = res.body.message;
							}
						);
					}else if(vm.user.type == "teacher"){
						this.$http.get('/api/teacher-token-classes', {params : {token : token}}).then(
							res => {
								res.body.classes.forEach(function(class_){
									class_.students.forEach(function(student){
										student.projects.forEach(function(project){
											var total = 0, completed = 0;
											project.phases.forEach(function(phase){
												if(phase.submissions.length > 0) completed++;
												total++;
											});
											project.completed = completed / total * 100;
											console.log(project.completed);
										});
									});
								});
								vm.classes = res.body.classes;
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
	}
});
/*$(document).ready(() => {
	vm.runonload();
});*/
