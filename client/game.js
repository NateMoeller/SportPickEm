

if(Meteor.isClient){
	

	Template.game.events({
		"submit #addComment":function(event){
			event.preventDefault();
			var comment = event.target.comment.value;
			var gameId = this._id;

			Meteor.call("addComment", gameId, comment);

			event.target.comment.value = '';
			return false;
		}
	});

	Template.game.onRendered(function(){
        $("#addComment").validate({
            rules: {
                comment: {
                    required: true
                },
            }
        });
    });
	

	Template.game.helpers({
		comments:function(){
			//get all comments for this game
			var gameId = this._id;
			var comments = Comments.find({"gameId": gameId}).fetch();
			comments.forEach(function(comment){
				comment.date = comment.date.toLocaleString();
			});
			return comments;
		},
		team1Percentage:function(){
			//get the percent of picks who picked team1 for this game
			var gameId = this._id;
			var picks = Current_Picks.find({"gameId": gameId}).fetch();
			var count = 0;
			if(picks.length == 0){
				return '0%';
			}
			else{
				picks.forEach(function(pick){
					if(pick.pickedTeam == 1){
						count++;
					}
				});
				return String((count / picks.length * 100) + '%');
			}
		},
		team2Percentage:function(){
			//get the percent of picks who picked team1 for this game
			var gameId = this._id;
			var picks = Current_Picks.find({"gameId": gameId}).fetch();
			var count = 0;
			if(picks.length == 0){
				return '0%';
			}
			else{
				picks.forEach(function(pick){
					if(pick.pickedTeam == 2){
						count++;
					}
				});
				return String((count / picks.length * 100) + '%');
			}
		},
		gameResult:function(){
			var result = this.result;
			if(parseInt(result) == 1){
				return this.team1;
			}
			else if(parseInt(result) == 2){
				return this.team2;
			}
			else{
				return "?";
			}
		},
		formattedDate:function(){
			var date = this.date;
			return date.toLocaleString();
		}
	});
}