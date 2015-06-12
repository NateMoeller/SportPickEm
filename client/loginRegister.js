if (Meteor.isClient) {
    Template.register.events({
        'submit #register': function(event) {
            event.preventDefault();
            var email = event.target.registerEmail.value;
        	var password = event.target.registerPassword.value;
        	var username = event.target.registerUsername.value;

            var user = Meteor.users.find({"profile.username": {$regex : new RegExp(username, "i") }}).fetch();
            
            if(user.length == 0){
                
                Accounts.createUser({
                    email: email,
                    password: password,
                    profile: {
                        "username": username,
                        "admin": false, 
                        "streak": 0, 
                        "correctPicks": 0, 
                        "incorrectPicks": 0, 
                        "longestStreak": 0, 
                        "hash": CryptoJS.MD5(email.toLowerCase()).toString(),
                    } 
                });

                setTimeout(function(){
                    Router.go('profile');
                }, 200);
                
            }
            else{
                //show error message
                $("#registerMessage").html("This username is already taken. Please choose another.");
            }
        	
            
        }
    });

    Template.login.onRendered(function(){
        $("#login").validate({
            rules: {
                loginEmail: {
                    required: true,
                    email: true,
                },
                
                loginPassword: {
                  required: true,
                }
            }
        });
    });

    Template.register.onRendered(function(){
        $("#register").validate({
            rules: {
                registerUsername:{
                    required:true,
                },
                registerEmail: {
                    required: true,
                    email: true,
                },
                
                registerPassword: {
                  required: true,
                }
            }
        });
    });
    


    Template.login.events({
    	'submit #login': function(event){
        	event.preventDefault();
        	var email = event.target.loginEmail.value;
        	var password = event.target.loginPassword.value;
        	Meteor.loginWithPassword(email, password, function(err){
                if(err){
                    $("#loginError").html("Email or password Incorrect");
                    return;
                }
                else {
                    // if we are on the login route, we want to redirect the user
                    return Router.go('profile');
                }
            });


            
    	}
    });
}