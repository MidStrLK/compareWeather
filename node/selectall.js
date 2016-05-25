var mongodb  = require("../mongo/mongodb"),
	requestdata = require('./requestdata'),
    clearstr    = require('./clearstr');

exports.select = select;

function select(postData, callback, COLLECTION){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(err, dataA){aData = dataA;funcAFD();},
		funcF = function(err, dataF){fData = dataF;funcAFD();},
		funcD = function(err, dataD){dData = dataD;funcAFD();},
		funcAFD = function(){
			if(!aData || !fData || !dData) return;

            if(aData.length){
                createReturnData(aData, fData, dData, callback);
            }else{
                var lastHour = new Date(),
                    func = function(err, data){
                        createReturnData(data, fData, dData, callback);
                    };
                lastHour = new Date(lastHour.setHours((new Date()).getHours() - 1));
                mongodb.requestMDB('select', func, requestdata.getActualHour(lastHour), 	COLLECTION);
            }


            //var forecastDeviation = calcDeviationForecast(fData, dData);
			//var res = {
			//	actual:     aData,
			//	forecast:   forecastDeviation
			//};
			//callback(0, res);

		};

	mongodb.requestMDB('select', funcA, requestdata.getActualHour(date), 	COLLECTION);
	mongodb.requestMDB('select', funcF, requestdata.getForecastDay(date), 	COLLECTION);
	mongodb.requestMDB('select', funcD, requestdata.getDeviation(),         COLLECTION);
}

function createReturnData(actual, forecast, deviation, callback){
    var forecastDeviation = calcDeviationForecast(forecast, deviation);



    var res = {
        actual:     actual,
        forecast:   forecastDeviation
    };

    callback(0, res);
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
              data[key]['value'] = clearstr.clearTemp(data[key]['value']);
              //data[key]['text'] = data[key]['value'] + '&deg;';
        }
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
                forecast[keyF]['deviation'] = '(' +  ((valD['key'] === 'temp') ? ('±' + valD['value'].toFixed(1)) :  (valD['value']*100).toFixed(1) + '%') + ')';
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
        if(val.afterday > 10) return;
        if(!rowView[val.name]) rowView[val.name] = {name: val.name};
        if(!rowView[val.name][val.afterday]) rowView[val.name][val.afterday] = {};

        rowView[val.name][val.afterday][val.key] = val.value;
        rowView[val.name][val.afterday][val.key + '_deviation'] = val.deviation;
    });

    return rowView;
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

