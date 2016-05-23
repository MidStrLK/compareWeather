Ext.define('APP.forecastGrid' , {
	extend: 'Ext.grid.Panel',
	alias: 'widget.forecastGrid',

	title: 'Прогноз на неделю',

	days: 14,

    enableLocking:true,

	initComponent: function(){

		if(!this.days) this.days = 10;

		var fields = ['name'],
			columns = [{ text: 'Название', dataIndex: 'name', menuDisabled: true,  locked: true }],
			date = new Date(),
			formatDate = function(increment){
				var incDate = new Date(),
					month = incDate.getMonth() + 1;
				incDate.setDate(date.getDate() + increment);
				if(month < 10) month = '0' + String(month);
				return incDate.getDate() + '.' + month + ', ' + ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][incDate.getDay()];
			};

		for(var i=0; i<this.days; i++){
			fields.push('day' + i);
			columns.push({
				text: formatDate(i),
				dataIndex: 'day' + i,
				menuDisabled: true,
				width: 230
			});
		}

		this.store = {fields: fields};

		this.columns = columns;


		this.callParent();
	}

});