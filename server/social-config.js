if(Meteor.isServer){
	

	ServiceConfiguration.configurations.remove({
    	service: 'facebook'
	});
 
	ServiceConfiguration.configurations.insert({
    	service: 'facebook',
    	appId: '1621493374804448',
    	secret: '9acb179dffcd57d9fcd3a9ed2a7f3b32'
	});
}