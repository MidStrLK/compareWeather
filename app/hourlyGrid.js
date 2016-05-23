Ext.define('APP.hourlyGrid' , {
	extend: 'Ext.grid.Panel',
	alias: 'widget.hourlyGrid',

	title: 'Почасовой прогноз',

    columnLines: true,

    enableLocking:true,

	store: {fields: [
            'name', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'
        ]},

	columns: [
            { text: 'Название', dataIndex: 'name', menuDisabled: true, locked   : true },
            { text: '0:00',  dataIndex: '0',  menuDisabled: true, width: 150 },
            { text: '1:00',  dataIndex: '1',  menuDisabled: true, width: 150 },
            { text: '2:00',  dataIndex: '2',  menuDisabled: true, width: 150 },
            { text: '3:00',  dataIndex: '3',  menuDisabled: true, width: 150 },
            { text: '4:00',  dataIndex: '4',  menuDisabled: true, width: 150 },
            { text: '5:00',  dataIndex: '5',  menuDisabled: true, width: 150 },
            { text: '6:00',  dataIndex: '6',  menuDisabled: true, width: 150 },
            { text: '7:00',  dataIndex: '7',  menuDisabled: true, width: 150 },
            { text: '8:00',  dataIndex: '8',  menuDisabled: true, width: 150 },
            { text: '9:00',  dataIndex: '9',  menuDisabled: true, width: 150 },
            { text: '10:00', dataIndex: '10', menuDisabled: true, width: 150 },
            { text: '11:00', dataIndex: '11', menuDisabled: true, width: 150 },
            { text: '12:00', dataIndex: '12', menuDisabled: true, width: 150 },
            { text: '13:00', dataIndex: '13', menuDisabled: true, width: 150 },
            { text: '14:00', dataIndex: '14', menuDisabled: true, width: 150 },
            { text: '15:00', dataIndex: '15', menuDisabled: true, width: 150 },
            { text: '16:00', dataIndex: '16', menuDisabled: true, width: 150 },
            { text: '17:00', dataIndex: '17', menuDisabled: true, width: 150 },
            { text: '18:00', dataIndex: '18', menuDisabled: true, width: 150 },
            { text: '19:00', dataIndex: '19', menuDisabled: true, width: 150 },
            { text: '20:00', dataIndex: '20', menuDisabled: true, width: 150 },
            { text: '21:00', dataIndex: '21', menuDisabled: true, width: 150 },
            { text: '22:00', dataIndex: '22', menuDisabled: true, width: 150 },
            { text: '23:00', dataIndex: '23', menuDisabled: true, width: 150 },
            { text: '24:00', dataIndex: '24', menuDisabled: true, width: 150 },
        ]

});