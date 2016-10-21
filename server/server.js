Games = new Mongo.Collection("games");
Current_Picks = new Mongo.Collection("currentPicks");
Comments = new Mongo.Collection("comments");
Teams = new Mongo.Collection("teams");

if (Meteor.isServer) {
  var BlockIo;
  var version;
  var block_io;
  var future;

  Meteor.startup(function () {

    //bitcoin code
    BlockIo = Npm.require('block_io');
    //future = Npm.require('fibers/future');
    version = 2; // API version
    block_io = new BlockIo('ef7c-29ce-0bd8-8c5c', 'VVAoT9B8', version);
    future = Npm.require('fibers/future');

    Accounts.onCreateUser(function(options, user) { 
      if (options.profile){
        user.profile = options.profile;

        if(user.services.facebook){
          //console.log("FACEBOOK USER");
          //adding my own info
          user.emails = [];
          var emailObj = new Object();
          user.profile.username = user.profile.name;
          user.profile.streak = 0;
          user.profile.admin = false;
          user.profile.correctPicks = 0;
          user.profile.incorrectPicks = 0;
          user.profile.longestStreak = 0;
          user.profile.hash = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/";
        }
        else{
          //console.log("NOT A FACEBOOK USER");
        }

        //create a new address
        block_io.get_new_address({'label': user.profile.username + "x1"}, console.log);
        
      }
        
      return user;
    });

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
      var now = new Date();
      var nextweek = new Date(now.getFullYear(), now.getMonth(), now.getDate()+7);
    	return Games.find({"status": "Upcoming", "date": {"$gte": now, "$lt": nextweek}}, {"sort": {"date": 1}, "limit": limit});
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
    	return Meteor.users.find({}, {fields: {profile: 1, emails: 1, createdAt: 1}});
  	});
    Meteor.publish("teams", function(){
      return Teams.find();
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
    },

    getBalance:function(){
      //console.log("GET BALANCE");
      var username = Meteor.user().profile.username;
      // Set up a future
      var fut = new future();

      // This should work for any async method
      setTimeout(function() {

        // Return the results
        block_io.get_balance({'label': username + 'x1'}, function(ret1, data){
        //console.log(data.data.available_balance);
        //console.log(data);
        fut['return'](data);
        });
        
        

      }, 1 * 1000);

      // Wait for async to finish before returning
      // the result
      return fut.wait();
    },
    getAddress:function(){
      //console.log("GET ADDRESS");
      var username = Meteor.user().profile.username;
      var fut = new future();

      // This should work for any async method
      setTimeout(function() {

        // Return the results
        block_io.get_address_by_label({'label': username + 'x1'}, function(ret1, data){
        //console.log(data.data.available_balance);
        console.log(data);
        fut['return'](data);
        });
        
        

      }, 1 * 1000);

      // Wait for async to finish before returning
      // the result
      return fut.wait();
    }


  });

}