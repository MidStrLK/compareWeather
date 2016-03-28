var mongodb  = require("../mongo/mongodb"),
	requestdata = require('./requestdata');

exports.select = select;

function select(postData, callback, COLLECTION){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(err, dataA){aData = dataA;funcAFT();},
		funcF = function(err, dataF){fData = dataF;funcAFT();},
		funcD = function(err, dataD){dData = dataD;funcAFT();},
		funcAFT = function(){
			if(!aData || !fData || !dData) return;


            var forecastDeviation = calcDeviationForecast(fData, dData);

			var res = {
				actual:     aData,
				forecast:   forecastDeviation
			};

			callback(0, res);

		};

	mongodb.requestMDB('select', funcA, requestdata.getActualHour(date), 	COLLECTION);
	mongodb.requestMDB('select', funcF, requestdata.getForecastDay(date), 	COLLECTION);
	mongodb.requestMDB('select', funcD, requestdata.getDeviation(),         COLLECTION);
}

function calcDeviationForecast(forecast, deviation){

    forecast = addDegree(forecast);
    forecast = addDeviation(forecast, deviation);
    forecast = sortToGrid(forecast);

    return forecast;

}

/* Добавляем знак градуса и все записываем в текст */
function addDegree(data){
    data.forEach(function(val, key){
        if(val.key === 'temp'){
              data[key]['text'] = '<span class="span-temp">' + data[key]['value'] + '&deg;</span>';
              //data[key]['text'] = '<span class="span-temp">' + data[key]['value'] + '</span><span class="span-degree"> &deg;C</span>';
        }else data[key]['text'] = '<span class="span-text">' + data[key]['value'] + '</span>';
    });

    return data;
}

/* Добавляем отклонение */
function addDeviation(forecast, deviation){
    forecast.forEach(function(valF, keyF){                 // Прогноз с данного часа на несколько дней вперед
        deviation.forEach(function(valD){                   // Насколько точен прогноз на несколько дней
            if(  valD['name'] 	  === valF['name'] &&
                 valD['key']  	  === valF['key']  &&
                -valD['afterday'] === +valF['afterday']){
                forecast[keyF]['text'] = valF['text'] +
                    '<span class="span-deviation">(' +
                    ((valD['key'] === 'temp') ? ('±' + valD['value'].toFixed(1)) :  (valD['value']*100).toFixed(1) + '%') +
                    ')</span>';
            }
        })
    });

    return forecast;
}

/* Создает структуру грида для отображения */
function sortToGrid(forecast){
    // Делим на строки
    // Получаем массивы с источниками
    // Источники - массивы с [0]:temp и [1]:text
    // Temp и Text - текстовые поля
    var rowView = {},
        res = [];
    forecast.forEach(function(val){
        if(!rowView[val.name]) rowView[val.name] = [];
        if(!rowView[val.name][val.afterday]) rowView[val.name][val.afterday] = [];

        if(val.key === 'temp'){
              rowView[val.name][val.afterday][0] = val.text
        }else rowView[val.name][val.afterday][1] = val.text
    });

    // Совмещаем temp и text
    for(var key in rowView){                            // перебор источников
        var row = {name: key};
        rowView[key].forEach(function(valS, keyS){      // перебор значений
            row['day' + keyS] = rowView[key][keyS].join(', ');
        });
        res.push(row);
    }

    return res;
}





































/*function select(postData, callback, COLLECTION){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, tData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(err, dataA){aData = dataA;funcAFT();},     /!* daykey = now;            year,month,day,hour = now   Актуальные данные на данный час                                                  *!/
		funcF = function(err, dataF){fData = dataF;funcAFT();},     /!* daykey = day;            year,month,day,hour = now   Прогноз с данного часа на несколько дней вперед                                  *!/
		funcT = function(err, dataT){tData = dataT;funcAFT();},     /!* daykey = deviation;      year,month,day      = now   Прогноз на сегодня за предшествующие дни                                         *!/
		funcD = function(err, dataD){dData = dataD;funcAFT();},     /!* daykey = maindeviation                               Отклонение на 1,2,3....  дня вперед - на сколько точен прогноз на несколько дней *!/
		funcAFT = function(){
			if(!aData || !fData || !tData || !dData) return;

			fData.forEach(function(valO, keyO){                 // Прогноз с данного часа на несколько дней вперед
				dData.forEach(function(valN){                   // Насколько точен прогноз на несколько дней
					if( valN['name'] 	 === valO['name'] &&
						valN['key']  	 === valO['key']  &&
						valN['afterday'] === valO['afterday']){
							fData[keyO]['value'] = valO['value'] +
								((valN['key'] === 'temp') ? ' &deg;C' : '' ) +
								' (' +
								((valN['key'] === 'temp') ? ('±' + valN['deviation'].toFixed(1)) :  (valN['deviation']*100).toFixed(1) + '%') +
								')';
					}
				})
			});

			var res = {
				actual:     aData,
				forecast:   fData,
				today:      tData,
				deviation:  dData
			};

			callback(0, res);

		};

	mongodb.requestMDB('select', funcA, requestdata.getActualDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcF, requestdata.getForecastDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcT, requestdata.getDestinyDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcD, requestdata.getMainDeviationData(), COLLECTION);
}*/

