//Ext.require([
//	'APP.Desktop'
//]);

Ext.application({

	name: 'APP',

	launch: function(){
		console.log('APP',APP);
		console.log('Ext',Ext);
		Ext.create('APP.Desktop');

	}
});