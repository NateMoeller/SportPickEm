if(Meteor.isClient){
	
	Session.setDefault('leaderboardPanel', 1);

	Template.leaderboard.helpers({
		topStreaks:function(){
			var users = Meteor.users.find({}, {sort: {"profile.streak": -1}, limit: 10});
			return users;
		},
		topCorrectPicks:function(){
			var users = Meteor.users.find({}, {sort: {"profile.correctPicks": -1}, limit: 10});
			return users
		},

		btnActive1:function(){
			if (Session.get('leaderboardPanel') == 1) {
				return "active";
			}	
		},
		btnActive2:function(){
			if(Session.get('leaderboardPanel') == 2){
				return 'active';
			}
		},
		topStreaksVisibility:function(){
			if(Session.get('leaderboardPanel') == 1){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		},
		topCorrectPicksVisibility:function(){
			if(Session.get('leaderboardPanel') == 2){
    			return "visible";
  			}
  			else{
    			return "hidden";
  			}
		}
	});


	Template.leaderboard.events({
		"click .leaderBoardTab":function(event){
			var buttonText = event.target.text;

			if(buttonText == "Top Streaks"){
				Session.set("leaderboardPanel", 1);
			}
			else if(buttonText == "Most Correct Picks"){
				Session.set("leaderboardPanel", 2);
			}
			$(".leaderBoardTab").removeClass("active");

			$(event.target.parentNode).addClass("active");
		}
	});
}