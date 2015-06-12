if(Meteor.isClient){
	

	// this variable controls which tab is displayed and associated application state
	Session.setDefault('selectedPanel', 1);

	Template.profile.helpers({

		//side tabs code
		statsVisibility:function(){
			if(Session.get('selectedPanel') == 1){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},
		historyVisibility:function(){
			if(Session.get('selectedPanel') == 2){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},
		picksVisibility:function(){
			if(Session.get('selectedPanel') == 3){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},
		settingsVisibility:function(){
			if(Session.get('selectedPanel') == 4){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},

		imgHash:function(){
			return Meteor.user().profile.hash;
		},
		email:function(){
			var user = Meteor.user();
			return user.emails[0].address;
		},
		username:function(){
			var user = Meteor.user();
			return user.profile.username;
		},
		chart:function(){
			//get data
			var picks = Current_Picks.find({"userId": Meteor.userId()}).fetch();
			var data = [];
			var count = 1;
			var initDataPoint = [];
			initDataPoint[0] = 0;
			initDataPoint[1] = 0;
			data.push(initDataPoint); 
			picks.forEach(function(pick){
				var gameInfo = Games.findOne({"_id": pick.gameId});
				if(gameInfo.status == "Finished"){
					var dataPoint = [];
					dataPoint[0] = gameInfo.date.getTime();
					if(pick.pickedTeam == gameInfo.result){
						dataPoint[1] = data[count-1][1] + 1;
					}
					else{
						dataPoint[1] = 0;
					}
					data.push(dataPoint);
					count++;
				}	
			});
			data.sort(); //sort the data based on timestamp
			//change the date of the initial data point
			if(data.length > 1){
				data[0][0] = data[1][0] - 86400000; //milliseconds in 1 day
			}
			else{
				data[0][0] = new Date().getTime();
			}
			
			return {
			    	title: {
		        	text: 'Current Run',
		            x: -20 //center
		        },
		        xAxis: {
	                title:{
						text: 'Date'
					},
					type: 'datetime',
					dateTimeLabelFormats: {
						millisecond: '%I:%M:%S %P',
						second: '%I:%M %P',
						day: '%e of %b'
					}
	            },
		        yAxis: {
		            title: {
		                text: 'Correct Picks'
		            },
		            min: 0
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
		        },
		        series: [{
		        	name: 'Run',
		            data: data,
		        }]
		    };
		}
		
	});

	Template.profile.events({
		"click .sideTab":function(event){
			//TODO: finish this
			var name = event.target.text;
			name = name.toLowerCase().replace(/ /g,"_");
			if(name == "profile"){
				Session.set("selectedPanel", 1);
			}
			else if(name == "pick_history"){
				Session.set("selectedPanel", 2);
			}
			else if(name == "current_picks"){
				Session.set("selectedPanel", 3);
			}
			else if(name == "settings"){
				Session.set("selectedPanel", 4);
			}
		}
	});


	Template.stats.helpers({
		email:function(){
			var user = Meteor.user();
			return user.emails[0].address;
		},
		username:function(){
			return Meteor.user().profile.username;
		},
		streak:function(){
			return Meteor.user().profile.streak;
		},
		correctPicks:function(){
			return Meteor.user().profile.correctPicks;
		},
		incorrectPicks:function(){
			return Meteor.user().profile.incorrectPicks;
		},
		longestStreak:function(){
			return Meteor.user().profile.longestStreak;
		}
	});

	Template.currentPicks.helpers({
		currentPicks:function(){
			var myPicks = Current_Picks.find({"userId": Meteor.userId()}).fetch();
			var allPicks = [];
			var gameId;

			myPicks.forEach(function(pick){
				var gameInfo = Games.findOne({"_id": pick.gameId});
				if(gameInfo.status == "Upcoming" || gameInfo.status == "In Progress"){
					var pickObj = new Object();
					pickObj.id = pick._id;
					pickObj.gameId = pick.gameId;
					pickObj.team1 = gameInfo.team1;
					pickObj.team2 = gameInfo.team2;
					if(pick.pickedTeam == 1){
						pickObj.pickedTeam = gameInfo.team1;
					}
					else{
						pickObj.pickedTeam = gameInfo.team2;
					}
					if(gameInfo.status == "In Progress"){
						pickObj.inProgress = true;
					}
					else{
						pickObj.inProgress = false;
					}
					pickObj.date = gameInfo.date.toLocaleString();
					pickObj.status = gameInfo.status;

					allPicks.push(pickObj);
				}
				
			});
			return allPicks;
		}
	});

	Template.currentPicks.events({
		"click .delete":function(){
			Meteor.call("deletePick", this.id);
		},
		
		"click .gameCell":function(event){
			var gameId = this.gameId;
			Router.go('/game/' + gameId);
		}
		
	});

	Template.pickHistory.helpers({
		pickHistory:function(){
			var myPicks = Current_Picks.find({"userId": Meteor.userId()}).fetch();
			var allPicks = [];
			var gameId;

			myPicks.forEach(function(pick){
				var gameInfo = Games.findOne({"_id": pick.gameId});
				if(gameInfo.status == "Finished"){
					var pickObj = new Object();
					pickObj.gameId = pick.gameId;
					pickObj.team1 = gameInfo.team1;
					pickObj.team2 = gameInfo.team2;
					if(pick.pickedTeam == 1){
						pickObj.pickedTeam = gameInfo.team1;
					}
					else{
						pickObj.pickedTeam = gameInfo.team2;
					}
					pickObj.date = gameInfo.date.toLocaleString();
					pickObj.status = gameInfo.status;
					if(gameInfo.result == 1){
						pickObj.result = gameInfo.team1;
					}
					else{
						pickObj.result = gameInfo.team2;
					}
					if(gameInfo.result == pick.pickedTeam){
						pickObj.correct = true;
					}
					else{
						pickObj.correct = false;
					}
					allPicks.push(pickObj);
				}
				
			});
			return allPicks;
		}
	});

	Template.pickHistory.events({
		"click tr":function(){
			var gameId = this.gameId;
			Router.go('/game/' + gameId);
		}
	});


	Template.settings.onRendered(function(){
        $("#changePassword").validate({
            rules: {
                oldPassword: {
                    required: true,
                },
                
                password1: {
                  required: true,
                },

                password2: {
                	required: true,
                	equalTo: "#password1"
                }
            }
        });
    });

	Template.settings.events({
		"submit #changePassword":function(event){
			event.preventDefault();
			var oldPass = event.target.oldPassword.value;
			var newPass = event.target.password1.value;

			event.target.oldPassword.value = '';
			event.target.password1.value = '';
			event.target.password2.value = '';

			Accounts.changePassword(oldPass, newPass, function(err){
				var message;
				if (err) {
	                message = 'There was an issue: ' + err.reason;
	            } 
	            else {
	                message = 'You reset your password!';
	            }

	            // Inform the user.
        		$('#form-messages').html(message);
			});

        	return false;
		},
	});
}