exports.list = [
	/* YANDEX */
	{
		name: 'yandex',
		url: "http://pogoda.yandex.ru/moscow",
		params: {
			 now_text: '.current-weather__comment'
			,now_temp: '.current-weather__thermometer.current-weather__thermometer_type_now'
			,now_img:  '.current-weather__col_type_now'
			,day_text: '.forecast-brief__item-comment'
			,day_temp: '.forecast-brief__item-temp-day'
			//,day_temp_night: '.forecast-brief__item-temp-night'
		},
        hourly:[{
            url: 'https://pogoda.yandex.ru/moscow/details',
            text: '.forecast-detailed__day-info_first .weather-table__body-cell_type_condition .weather-table__value',
            temp: '.forecast-detailed__day-info_first .weather-table__temp',
            time: '.forecast-detailed__day-info_first .weather-table__daypart'
        }]
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
		},
        hourly:[{
            url: 'https://www.gismeteo.ru/city/hourly/4368/',
            text: '#tbwdaily1 .wrow .cltext',
            temp: '#tbwdaily1 .wrow .temp .m_temp.c',
            time: '#tbwdaily1 .wrow th'
        }]
	},

	/* ACCUWEATHER */
	{
		name: 'accuweather',
		params: [{
			url: 'http://www.accuweather.com/ru/ru/moscow/294021/weather-forecast/294021',
			params: {
				 now_text: '#feed-tabs .current .cond'
				,now_temp: '#feed-tabs .current .large-temp'
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
		}],
        hourly:[{
            url: 'http://www.accuweather.com/en/ru/moscow/294021/hourly-weather-forecast/294021?hour=',
            text: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            temp: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            firstNumber: 0
        }/*,{
            url: 'http://www.accuweather.com/en/ru/moscow/294021/hourly-weather-forecast/294021?hour=8',
            text: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            temp: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            firstNumber: 8
        },{
            url: 'http://www.accuweather.com/en/ru/moscow/294021/hourly-weather-forecast/294021?hour=16',
            text: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            temp: '#detail-hourly > div > div.hourly-table.overview-hourly > table > tbody > tr > td > span',
            firstNumber: 16
        }*/]
	}
];