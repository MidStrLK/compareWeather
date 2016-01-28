exports.list = [
	/* YANDEX */
	{
		name: 'yandex',
		url: "http://pogoda.yandex.ru/moscow",
		params: {
			 now_text: '.current-weather__comment'
			,now_temp: '.current-weather__thermometer.current-weather__thermometer_type_now'
			,day_text: '.forecast-brief__item-comment'
			,day_temp: '.forecast-brief__item-temp-day'
			//,day_temp_night: '.forecast-brief__item-temp-night'
		}
	},

	/* GISMETEO */
	{
		name: 'gismeteo',
		url: "https://www.gismeteo.ru/city/weekly/4368/",
		periodic: 'odd',
		params: {
			 now_text: 'dd table tr td'
			,now_temp: '.section.higher .temp .value.m_temp.c'
			,day_text: '.wblock .wbshort .cltext'
			,day_temp: '.wblock .wbshort .value.m_temp.c'
		}
	},

	/* ACCUWEATHER */
	{
		name: 'accuweather',
		params: [{
			url: 'http://www.accuweather.com/ru/ru/moscow/294021/weather-forecast/294021',
			params: {
				 now_text: '#feed-main .cond'
				,now_temp: '#feed-main .temp'
			}
		},{
			url: 'http://www.accuweather.com/ru/ru/moscow/294021/daily-weather-forecast/294021',
			firstNumber: 0,
			params: {
				 day_text: '#feed-tabs .day .cond'
				,day_temp: '#feed-tabs .day .temp'
				//,day_temp_night: '#feed-tabs .day .low'
			}
		},{
			url: 'http://www.accuweather.com/ru/ru/moscow/294021/daily-weather-forecast/294021?day=6',
			firstNumber: 5,
			params: {
				 day_text: '#feed-tabs .day .cond'
				,day_temp: '#feed-tabs .day .temp'
				//,day_temp_night: '#feed-tabs .day .low'
			}
		},{
			url: 'http://www.accuweather.com/ru/ru/moscow/294021/daily-weather-forecast/294021?day=11',
			firstNumber: 10,
			params: {
				 day_text: '#feed-tabs .day .cond'
				,day_temp: '#feed-tabs .day .temp'
				//,day_temp_night: '#feed-tabs .day .low'
			}
		}]
	}
];