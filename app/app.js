Ext.require([
	'APP.Desktop'
]);

console.log('Ext',Ext);
console.log('APP',APP);

Ext.application({

	name: 'APP',

	launch: function(){
		Ext.create('APP.Desktop');

	}
});