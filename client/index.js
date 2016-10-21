Router.map( function () {
  var OnBeforeActions;


  this.route('about', {
    onAfterAction: function () {
      document.title = "About";
    }
  });
  this.route('leaderboard', {
    onAfterAction: function () {
      document.title = "Leaderboard";
    }
  });
  this.route('admin');
  this.route('allGames', {
    onAfterAction: function () {
      document.title = "All Games";
    }
  });
  this.route('login', {
    onAfterAction: function () {
      document.title = "Login";
    }
  });
  this.route('register', {
    onAfterAction: function () {
      document.title = "Register";
    }
  });
  this.route('home', {
    path: '/',
    onAfterAction: function () {
      document.title = "ePickEm";
    }
  });
  this.route('profile', {
    onAfterAction: function () {
      document.title = "Profile";
    }
  });

  this.route('/user/:_id', {
    name: 'userProfile',
    data: function() {
      return Meteor.users.findOne(this.params._id);
    },
    onAfterAction: function () {
      document.title = "User Profile";
    }
  });


  this.route('/game/:_id', {
    name: 'game',
    data: function(){
      return Games.findOne(this.params._id);
    },
    onAfterAction: function () {
      document.title = "Game Info";
    }
  })


  OnBeforeActions = {
    loginRequired: function(pause) {
      if (!Meteor.userId()) {
        Router.go('login');
      }
      else{
        this.next();
      }
    }
  };

  //these are all of the pages that are user protected!!
  Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['profile', 'allGames', 'admin']
  });

  
});


Games = new Mongo.Collection("games");
Current_Picks = new Mongo.Collection("currentPicks");
Comments = new Mongo.Collection('comments');
Teams = new Mongo.Collection('teams');

if (Meteor.isClient) {
  
  Session.set("clickedTeam", "");

	Meteor.subscribe("currentPicks");
	Meteor.subscribe("totalUsers");
	Meteor.subscribe("totalCurrentPicks");
  Meteor.subscribe("totalUpcomingGames");
  Meteor.subscribe("totalInProgressGames");
	Meteor.subscribe("allUsers");
  Meteor.subscribe("comments");
  Meteor.subscribe("teams");
  Meteor.subscribe("finishedGames");
  Meteor.subscribe("inProgressGames");

	var checkedTeam;
	var gameId;
	var alreadyPicked = false;
	

  	Template.home.helpers({
  		
  	});

  	Template.home.events({
  		

  	});

    Template.home.onRendered(function(){
      $('#carousel').slick({
        dots: true,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 15000,
      });
    });

  	Template.mainNav.events({
  		"click #logout":function(event){
  			event.preventDefault();
        	Meteor.logout();
  		}
  	});

}
