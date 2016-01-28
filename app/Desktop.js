Ext.require([
	'APP.actualGrid',
	'APP.forecastGrid',
	'APP.buttonPanel',
	'APP.todayForecastGrid'
]);

Ext.define('APP.Desktop' , {
	extend: 'Ext.container.Viewport',
	alias: 'widget.desktop',

	layout: 'anchor',
	autoScroll: true,
	items: [{
		xtype: 'buttonPanel',
		cmargins: '0 0 5 0',
		height: 50
	},{
		xtype: 'label',
		name: 'desktopLabel',
		height: 30
	}, {
		xtype: 'actualGrid',
		cmargins: '5 5 5 0',
		maxHheight: 250,

	}, {
		xtype: 'forecastGrid',
		cmargins: '5 5 5 5',
		//height: 300,
		autoHeight: true
	}, {
		xtype: 'todayForecastGrid',
		cmargins: '5 5 5 5',
		autoHeight: true
	}],

	afterRender: function(){
		this.callParent();
		this.down('buttonPanel').getWeather();
	}
});