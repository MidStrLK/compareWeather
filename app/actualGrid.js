Ext.define('APP.actualGrid' , {
	extend: 'Ext.grid.Panel',
	alias: 'widget.actualGrid',

	hideHeaders: true,

	title: 'Погода сейчас',
	store: {
			fields:[ 'name', 'temp', 'text']
		},
	columns: [
		{ dataIndex: 'name', width: 150, menuDisabled: true },
		{ dataIndex: 'temp', width:  60, menuDisabled: true },
		{ dataIndex: 'text', flex:    1, menuDisabled: true }
	]
});