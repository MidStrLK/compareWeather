//Ext.require([
//	'APP.Desktop'
//]);

Ext.application({

	name: 'APP',

	launch: function(){
		Ext.create('APP.Desktop');

	}
});