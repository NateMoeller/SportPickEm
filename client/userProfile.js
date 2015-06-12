if(Meteor.isClient){
	
	Session.setDefault('userProfilePanel', 1);

	Template.userProfile.helpers({
		statsVisibility:function(){
			if(Session.get('userProfilePanel') == 1){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},
		historyVisibility:function(){
			if(Session.get('userProfilePanel') == 2){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		}
	});

	Template.userProfile.events({
		"click .sideTab":function(event){
			var btnText = event.target.text.toLowerCase();
			if(btnText == "profile"){
				Session.set("userProfilePanel", 1);
			}
			else if(btnText == "pick history"){
				Session.set("userProfilePanel", 2);
			}
		}
	});

	Template.userProfileHistory.helpers({
		history:function(){
			var userId = this._id;
			var myPicks = Current_Picks.find({"userId": userId}).fetch();
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

	Template.userProfileHistory.events({
		"click tr":function(){
			var gameId = this.gameId;
			Router.go('/game/' + gameId);
		}
	});





}