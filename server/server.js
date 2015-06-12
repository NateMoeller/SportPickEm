Games = new Mongo.Collection("games");
Current_Picks = new Mongo.Collection("currentPicks");
Comments = new Mongo.Collection("comments");

if (Meteor.isServer) {
  Meteor.startup(function () {

    Meteor.users.deny({
      update: function() {
        return true;
      }
    });
    Games.deny({
      update:function(){
        return true;
      }
    })


	Meteor.publish("upcomingGames", function (limit) {
    	return Games.find({"status": "Upcoming"}, {"limit": limit});
  });

  Meteor.publish("finishedGames", function(){
    return Games.find({"status": "Finished"});
  });
  Meteor.publish("inProgressGames", function(){
    return Games.find({"status": "In Progress"});
  })

  Meteor.publish("comments", function(){
    return Comments.find();
  });

	//TODO: change this so it doesnt publish all of the currentPicks, just THIS user's
	Meteor.publish("currentPicks", function(){
		return Current_Picks.find();
	});

  Meteor.publish("allUsers", function () {
  	return Meteor.users.find({}, {fields: {profile: 1, emails: 1}});
	});


  //aggregate statistics
  Meteor.publish('totalUsers', function() {
  	Counts.publish(this, 'users', Meteor.users.find());
	});
	Meteor.publish('totalCurrentPicks', function() {
  	Counts.publish(this, 'picks', Current_Picks.find());
	});
  Meteor.publish('totalInProgressGames', function(){
    Counts.publish(this, 'gamesInProgress', Games.find({"status": "In Progress"}))
  });
  Meteor.publish('totalUpcomingGames', function(){
    Counts.publish(this, 'upcomingGames', Games.find({"status": "Upcoming"}));
  });

  });
}

Meteor.methods({

  //TODO: make admin method
  addGame: function (game, team1, team2, question, date) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Games.insert({
  		game: game,
  		team1: team1,
  		team2: team2,
  		status: "Upcoming",
      question: question,
  		result: "",
  		date: new Date(date)
  	});
    
  },

  //TODO: make admin method
  editResult:function(gameId, result){
  	if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Games.update({"_id": gameId}, {$set: {"result": result, "status": "Finished"}});

  },

  //TODO: make admin method
  updatePicks:function(gameId, result){
  	if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }


    var picks = Current_Picks.find({"gameId": gameId}).fetch();
    
    picks.forEach(function(pick){
    	var userId = pick.userId;
    
    	var userObj = Meteor.users.findOne({"_id": userId});
    	if(result == pick.pickedTeam){
    		var newStreak = userObj.profile.streak + 1;
    		var newCorrectPicks = userObj.profile.correctPicks + 1;
    		var longestStreak = userObj.profile.longestStreak;

    		//see if we should update the longest streak
    		if(newStreak > longestStreak){
    			Meteor.users.update(
				  userId,
				  {$set: {
				  	"profile.streak": newStreak,
				    "profile.correctPicks": newCorrectPicks,
				    "profile.longestStreak": newStreak,
				    }
				  }
				);
    		}
    		else{
    			Meteor.users.update(
				  userId,
				  {$set: {
				     "profile.streak": newStreak,
				     "profile.correctPicks": newCorrectPicks
				    }
				  }
				);
    		}

    		
    	}
    	else{
    		var newIncorrectPicks = userObj.profile.incorrectPicks + 1;
    		Meteor.users.update(
    			userId,
    			{$set: {
    				"profile.streak": 0,
    				"profile.incorrectPicks": newIncorrectPicks,
    			  }
    			}
    		);
    	}
    	
    });
  },
  

  //user method
  addPick: function(userId, gameId, pickedTeam){

  	if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var ifpicked = Current_Picks.findOne({"gameId": gameId, "userId": userId});
    if(typeof(ifpicked) == "undefined"){
      //ok to insert
      Current_Picks.insert({
        gameId: gameId,
        userId: userId,
        pickedTeam: pickedTeam,
        date : new Date(),
      });
    }
  },

  //user method
  deletePick:function(id){
  	if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Current_Picks.remove(id);
  },

  //user method
  addComment:function(gameId, comment){
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Comments.insert({
      gameId: gameId,
      user: Meteor.user(),
      comment: comment,
      date: new Date()
    });
  }


});