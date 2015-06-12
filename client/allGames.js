if(Meteor.isClient){
	var PAGE_SIZE = 5;
	var checkedTeam;
  var clickedCheckbox;
	var gameId;
	
	
  var allGames = [];

  Session.set("gamePicked", false);
  Session.setDefault('gamesLimit', PAGE_SIZE);
  Deps.autorun(function() {
    Meteor.subscribe('upcomingGames', Session.get('gamesLimit'));
  });

	Template.allGames.helpers({
    currentDate:function(){
      return new Date().toLocaleString();
    },
    gameNotPicked:function(){
      return !Session.get("gamePicked");
    },
		games:function(){
			var games = Games.find({"status": "Upcoming"}).fetch();
      return games;
		},
		clickedTeam:function(){
  			return Session.get("clickedTeam");
  	},
    formattedDate:function(){
        return this.date.toLocaleString();
    },
    disabled:function(){
      var ifpicked = Current_Picks.findOne({"gameId": this._id, "userId": Meteor.userId()});
      if(typeof(ifpicked) != "undefined"){
        return true;
      }
      else{
        return false;
      }
    },
    checked1:function(){
      var ifpicked = Current_Picks.findOne({"gameId": this._id, "userId": Meteor.userId()});
      if(typeof(ifpicked) != "undefined" && parseInt(ifpicked.pickedTeam) == 1){
        return true;
      }
      else{
        return false;
      }
    },
    checked2:function(){
      var ifpicked = Current_Picks.findOne({"gameId": this._id, "userId": Meteor.userId()});
      if(typeof(ifpicked) != "undefined" && parseInt(ifpicked.pickedTeam) == 2){
        return true;
      }
      else{
        return false;
      }
    },
    more:function(){
      if(Counts.get('upcomingGames') > Session.get("gamesLimit")){
        return true;
      }
      else{
        return false;
      }
    }
	});


	Template.allGames.events({
		"click .teamCheckbox":function(event){
  			//set the global variables of what the user just clicked
        clickedCheckbox = event.target;
  			checkedTeam = event.target.value;
  			gameId = this._id;

        //check to see if you already picked this game
        var pick = Current_Picks.findOne({"gameId": gameId, "userId": Meteor.userId()});
        if(typeof(pick) == "undefined"){
          if(checkedTeam == 1){
            Session.set("clickedTeam", this.team1);
          }
          else if(checkedTeam == 2){
            Session.set("clickedTeam", this.team2);
          }
          Session.set("gamePicked", false);
        }
        else{
          console.log("You already picked this game!!");
          Session.set("gamePicked", true);
        }

  			
  		},
  		"click .yes":function(event){
  			var userId = Meteor.userId();
        $(clickedCheckbox).attr('disabled', true);
        Meteor.call("addPick", userId, gameId, checkedTeam);
  		},
      "click .no":function(event){
        $(clickedCheckbox).removeAttr('checked');
      },
      "click .closeBtn":function(event){
        $(".teamCheckbox").removeAttr('checked');
      },
      "click .showMore":function(event){
        Session.set('gamesLimit', Session.get('gamesLimit') + PAGE_SIZE);
      }
	});
}