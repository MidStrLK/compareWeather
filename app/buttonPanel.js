Ext.define('APP.buttonPanel' , {
	extend: 'Ext.panel.Panel',
	alias: 'widget.buttonPanel',

	height: 200,

	defaults: {
		margin: 5
	},

	items: [{
		xtype: 'textfield',
        listeners:{
            specialkey: function(field, e) {
                if (e.getKey() == e.ENTER) {

                    var me = this.up('buttonPanel'),
                        value = field.getValue();
                    if(!value) return;

                    value = '{"' + value.replace(/\s/g, '","').replace(/=/g, '":"') + '"}';
                    console.info('value - ',value);
                    Ext.Ajax.request({
                        url: '/mongorequest',
                        method: 'POST',
                        jsonData: value,
                        callback: function (opts, success, response) {
                            console.info('response - ',response);
                            me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + (JSON.parse(response.responseText)).length + ' записей');
                        }
                    })
                }
            }
        }
	},{
		xtype: 'button',
		name: 'testInterval',
		text: 'Запустить таймер',
		handler: function () {
			var me = this.up('buttonPanel'),
                intRequest = function(){
                    Ext.Ajax.request({
                        url: '/count',
                        method: 'GET',
                        callback: function (opts, success, response) {
                            if(success){
                                var data = JSON.parse(response.responseText);
                                if(typeof data === 'string'){
                                    me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + response.responseText + ' записей');
                                }else{
                                    var text = '',
                                        obj = {};
                                    if(data.error && data.error.length) text = 'Ошибки: ' + data.error.length + '. ';
                                    for(var key in data){
                                        if(key !== 'error'){
                                            for(var key2 in data[key]){
                                                if(!obj[key2]) obj[key2] = 0;
                                                obj[key2] += data[key][key2];
                                            }
                                        }
                                    }

                                    text += JSON.stringify(obj).replace(/\"/g,'').replace(/\{/g,'').replace(/}/g,'').replace(/,/g,', ');
                                    me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + text + ' записей');

                                }
                            }

                        }
                    })
                };

            if(me.interval){
                clearInterval(me.interval);
                if(me.interval) delete me.interval;
                this['setText']('Запустить таймер');
            }else{
                me.interval = setInterval(intRequest, 1800000);
                this['setText']('Остановить таймер');
            }


		}
	},{
		xtype: 'button',
		name: 'testCalcDB',
		text: 'Тест расчета БД',
		handler: function () {
			var me = this.up('buttonPanel');
			Ext.Ajax.request({
				url: '/testCalculate',
				method: 'GET',
				callback: function (opts, success, response) {
					me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + response.responseText + ' записей');
				}
			})
		}
	},{
		xtype: 'button',
		name: 'testDB',
		text: 'Тест БД',
		handler: function () {
			var me = this.up('buttonPanel');
			Ext.Ajax.request({
				url: '/count',
				method: 'GET',
				callback: function (opts, success, response) {
                    if(success){
                        var data = JSON.parse(response.responseText);
                        if(typeof data === 'string'){
                            me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + response.responseText + ' записей');
                        }else{
                            var text = '',
                                obj = {};
                            if(data.error && data.error.length) text = 'Ошибки: ' + data.error.length + '. ';
                            for(var key in data){
                                if(key !== 'error'){
                                    for(var key2 in data[key]){
                                        if(!obj[key2]) obj[key2] = 0;
                                        obj[key2] += data[key][key2];
                                    }
                                }
                            }

                            text += JSON.stringify(obj).replace(/\"/g,'').replace(/\{/g,'').replace(/}/g,'').replace(/,/g,', ');
                            me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. В БД ' + text + ' записей');

                        }
                    }

				}
			})
		}
	}, {
		xtype: 'button',
		name: 'addToDB',
		text: 'Отправить погоду в БД',
		handler: function () {
			var me = this.up('buttonPanel');
			Ext.Ajax.request({
				url: '/insert',
				method: 'GET',
				callback: function (opts, success, response) {
				}
			})
		}
	}, {
		xtype: 'button',
		text: 'Получить погоду из БД',
		name: 'getFromDB',
		handler: function(){
			this.up('buttonPanel').getWeather()
		}
	}, {
		xtype: 'button',
		text: 'Очистить БД',
		name: 'removeDB',
		handler: function () {
			var me = this.up('buttonPanel');
			Ext.Ajax.request({
				url: '/remove',
				method: 'GET',
				callback: function (opts, success, response) {
					me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. Удалено ' + response.responseText + ' записей');
				}
			})
		}
	}],

	getWeather: function(){
		var me = this;
		Ext.Ajax.request({
			url: '/select',
			method: 'GET',
			callback: function (opts, success, response) {

				var text = response.responseText;

				if (success) {
					text = '';
					var data = JSON.parse(response.responseText);
					if (data && data.actual) {
						text += data.actual.length + ' актуальных, ';
						me.setActualWeather(data.actual)
					}
					if (data && data.forecast) {
						text += data.forecast.length + ' прогнозов, ';
						me.setForecastWeather(data.forecast);
					}
					if (data && data.today) {
						text += data.today.length + ' на сегодня';
						me.setTodayWeather(data.today);
					}
				}

				me.getDesktopLabel().setText(response.statusText + ' ' + response.status + '. Выбрано ' + text + ' записей');
			}
		});
	},

	setActualWeather: function (data) {
		var store = this.getActualGrid().getStore(),
			res = [],
			arr = [];
		store.removeAll();
		data.forEach(function(val){
			var flag = true;
			res.forEach(function(vall){
				if(val['name'] === vall['name'] && val['key'] === vall['key']) {flag = false;}
			});
			if(flag) res.push(val);
		});

		res.forEach(function(val1){
			res.forEach(function(val2){
				if(val1['name'] === val2['name'] && val1['key'] === 'temp' && val2['key'] === 'text') arr.push({
					name: val1['name'],
					temp: val1['value'] + ' &deg;C',
					text: val2['value']
				})
			});
		});

		store.add(arr);

	},

	setTodayWeather: function (data) {
		var me = this,
			store = me.getTodayForecastGrid().getStore(),
			resArr = [],
			resObj = [],
			temp = {},
			text = {};
console.info('data - ',data);
		data.forEach(function (val) {
			if (val.key.indexOf('temp') !== -1) {
				if (!temp[val.name]) {
					temp[val.name] = [val.name];
				}
				temp[val.name][(-val.afterday || 0) + 1] = val.value;
			} else if (val.key.indexOf('text') !== -1) {
				if (!text[val.name]) {
					text[val.name] = [val.name];
				}
				text[val.name][(-val.afterday || 0) + 1] = val.value;
			}
		});
		for (var key in temp) {
			resArr.push(temp[key]);
			resArr.push(text[key]);
		}
console.info('resArr - ',resArr);
		resArr.forEach(function (vall, keyy) {          // вся таблица
			vall.forEach(function (valll, keyyy) {      // строка таблицы
				if (!resObj[keyy]) resObj[keyy] = {};
				if (keyyy === 0) {
					resObj[keyy]['name'] = valll;
				} else {
					resObj[keyy]['day' + (keyyy - 1)] = valll;
				}
			})
		});
console.info('resObj - ',resObj);
		store.removeAll();
		store.add(resObj);

	},

	setForecastWeather: function (data) {
		var me = this,
			store = me.getForecastGrid().getStore(),
			resArr = [],
			resObj = [],
			temp = {},
			text = {};

		data.forEach(function (val) {
			if (val.key.indexOf('temp') !== -1) {
				if (!temp[val.name]) {
					temp[val.name] = [val.name];
				}
				temp[val.name][(val.afterday || 0) + 1] = val.value;
			} else if (val.key.indexOf('text') !== -1) {
				if (!text[val.name]) {
					text[val.name] = [val.name];
				}
				text[val.name][(val.afterday || 0) + 1] = val.value;
			}
		});
		for (var key in temp) {
			resArr.push(temp[key]);
			resArr.push(text[key]);
		}

		resArr.forEach(function (vall, keyy) {
			vall.forEach(function (valll, keyyy) {
				if (!resObj[keyy]) resObj[keyy] = {};
				if (keyyy === 0) {
					resObj[keyy]['name'] = valll;
				} else {
					resObj[keyy]['day' + (keyyy - 1)] = valll;
				}
			})
		});

		store.removeAll();
		store.add(resObj);

	},





	getActualGrid: function(){
		return this.up('desktop').down('actualGrid')
	},

	getTodayForecastGrid: function(){
		return this.up('desktop').down('todayForecastGrid')
	},

	getForecastGrid: function(){
		return this.up('desktop').down('forecastGrid')
	},

	getDesktopLabel: function(){
		return this.up('desktop').down('[name="desktopLabel"]')
	}


});