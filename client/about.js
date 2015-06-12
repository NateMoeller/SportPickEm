if(Meteor.isClient){
	
	Template.about.onRendered(function(){
		$("#accordion").accordion({
      		heightStyle: "content"
    	});
	});

}