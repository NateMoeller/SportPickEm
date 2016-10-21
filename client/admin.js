if(Meteor.isClient){
	var PAGE_SIZE = 5;
	Session.setDefault('adminPanel', 1);
	Session.setDefault('selectedGame', "Halo");

	Template.admin.events({
		"submit #insertGame":function(event){
			event.preventDefault();
			var game = event.target.game.value;
			var team1 = event.target.team1.value;
			var team2 = event.target.team2.value;
			var date = event.target.date.value;
			var question = event.target.question.value;

			Meteor.call("addGame", game, team1, team2, question, date);

			event.target.team1.value = '';
			event.target.team2.value = '';
			event.target.date.value = '';
			event.target.question.value = '';

			console.log("inserted Game");

			return false;
		},
		"click .teamCheckbox":function(event){
  			//set the global variables of what the user just clicked
  			var checkedTeam = event.target.value;
  			var gameId = this._id;

  			//update database
  			Meteor.call("editResult", gameId, checkedTeam);
  			Meteor.call("updatePicks", gameId, checkedTeam);
  		},
  		"click .showMore":function(event){
        	Session.set('gamesLimit', Session.get('gamesLimit') + PAGE_SIZE);
      	},
      	"click .adminTab":function(event){
      		var buttonText = event.target.text;
      		
			if(buttonText == "Insert game"){
				Session.set("adminPanel", 1);
			}
			else if(buttonText == "Stats"){
				Session.set("adminPanel", 2);
			}
			else if(buttonText == "All Games"){
				Session.set("adminPanel", 3);
			}
			$(".adminTab").removeClass("active");

			$(event.target.parentNode).addClass("active");
      	},
      	"change #game":function(event){
      		//console.log(event.target.value);
      		Session.set('selectedGame', event.target.value);
      	}

	});

	Template.admin.helpers({
		games:function(){
			return Games.find({"status": {$ne: "Finished"}});
		},
		teams:function(){
			var game = Session.get('selectedGame');
			return Teams.find({"sport": game});
		},
		totalUsers:function(){
			return Counts.get('users');
		},
		totalCurrentPicks:function(){
			return Counts.get("picks");
		},
		gamesInProgress:function(){
			return Counts.get("gamesInProgress");
		},
		more:function(){
	      if(Counts.get('upcomingGames') > Session.get("gamesLimit")){
	        return true;
	      }
	      else{
	        return false;
	      }
	    },
	    insertGameVisibility:function(){
	    	if(Session.get('adminPanel') == 1){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
	    },
	    statsVisibility:function(){
	    	if(Session.get('adminPanel') == 2){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
	    },
	    allGamesVisibility:function(){
	    	if(Session.get('adminPanel') == 3){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
	    }
	});

	//this is for the datetime/time picker
	Template.admin.onRendered(function() {
		this.$('.datetimepicker').datetimepicker();
	});

}

