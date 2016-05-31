var mongodb  = require("../mongo/mongodb"),
    formatDate = require('../formatdate'),
    requestdata = require('./requestdata');

exports.calc = calc;

/*
* 1. Усредныем Актуальные, ПрогнозС, ПрогнозНА и записываем на сервер
* 2. Запуск расчета Ошибки*/
function calc(callback, COLLECTION){
    var requestArrayLength = 0,
        requestArray = [],
        calcNext = function(data) {
            requestArray = requestArray.concat(data);
            requestArrayLength++;

            if(requestArrayLength !== 3) return;

            sendData(requestArray, callback, COLLECTION);

            calcForecastGlobal(COLLECTION);

        };

    calcActualAverage(calcNext, COLLECTION);
    calcForecastAverage(calcNext, COLLECTION);
    calcPredictedAverage(calcNext, COLLECTION);
}

/* Отправляет данные на сервер */
function sendData(data, callback, COLLECTION){
    if(!data || !data.length){
        callback(0, 0);
    }else{
        console.info(formatDate.dateToLocal(), '-NODE_request- average - result: ', (data && data.length) ? data.length : 'error');
        mongodb.requestMDB('insert', callback, data, COLLECTION);
    }


}

/* Получаем актуальные данные на сегодня и запускаем их усреднение */
function calcActualAverage(callback, COLLECTION){
    var func = function(err, result){
        calcAverage(err, result, callback)
    };
    mongodb.requestMDB('select', func, requestdata.getActualDay(), COLLECTION);
}

/* Получаем прогнозируемые данные С сегодня и запускаем их усреднение */
function calcForecastAverage(callback, COLLECTION){
    var func = function(err, result){
        calcAverage(err, result, callback)
    };
    mongodb.requestMDB('select', func, requestdata.getForecastDay(), COLLECTION);
}

/* Получаем прогнозируемые данные НА сегодня и запускаем их усреднение */
function calcPredictedAverage(callback, COLLECTION){
    var func = function(err, result){
        calcAverage(err, result, callback)
    };
    mongodb.requestMDB('select', func, requestdata.getPredictedDay(), COLLECTION);
}

/* Усредняет данные */
function calcAverage(err, result, callback){

    if(err || !result || !result.forEach) return;

    var resObj = {},
        resArr = [];

    result.forEach(function(val){
        if(val['_id']) delete val['_id'];
        if(val['hour']) delete val['hour'];
        val.daykey += 'average';

        var num = val.name + '_' + val.key + '_' + val.afterday;

        if(!resObj[num]) resObj[num] = [];

        resObj[num].push(val);
    });

    for(var key in resObj){
        resArr.push((key.indexOf('temp') !== -1) ? getAverageValueTemp(resObj[key]) : getAverageValueText(resObj[key]))
    }

    callback(resArr);
}

/* Посчитать среднее значение массива Текста*/
function getAverageValueText(arr) {
    var arrLen = arr.length,
        res = {},
        num = 0,
        result = '';
    for (var i = 0; i < arrLen; i++) {
        if(!res[arr[i].value]) res[arr[i].value] = 0;
        res[arr[i].value]++;
    }

    for(var key in res){
        if(res[key] > num){
            num = res[key];
            result = key;
        }
    }

    arr[0].value = result;

    return arr[0];
}

/* Посчитать среднее значение массива Температур */
function getAverageValueTemp(arr){
    var arrLen = arr.length,
        result = 0;
    for (var i = 0; i < arrLen; i++) {
        result += arr[i].value;
    }

    arr[0].value = (result / arrLen).toFixed(1);

    return arr[0];
}


/* Подсчерт глобального отклонения */
function calcForecastGlobal(COLLECTION){
    var resultCommon = {},
        callbackActual    = function(err, result){  resultCommon.actual    = result;  func();},
        callbackForecast  = function(err, result){  resultCommon.predicted = result;  func();},
        callbackDeviation = function(err, result){  resultCommon.deviation = result;  func();},
        func = function(){
            if(!resultCommon.actual || !resultCommon.predicted || !resultCommon.deviation) return;

            var dayDeviation = calcDayDeviation(resultCommon.actual, resultCommon.predicted),
                deviation    = getDeviation(dayDeviation, resultCommon.deviation);

            sendDeviation(deviation, COLLECTION);

    };

    mongodb.requestMDB('select', callbackActual,    requestdata.getActualAverageDay(),    COLLECTION);
    mongodb.requestMDB('select', callbackForecast,  requestdata.getPredictedAverageDay(), COLLECTION);
    mongodb.requestMDB('select', callbackDeviation, requestdata.getDeviation(),           COLLECTION);
}

/* Подсчитать расхождение для каждого дня */
function calcDayDeviation(actual, predicted){
    var res = [];

    predicted.forEach(function(valP, keyP){
        actual.forEach(function(valA, keyA){
            if(valP.name === valA.name && valP.key === valA.key){
                res.push({
                    name:       valP.name,
                    key:        valP.key,
                    value:      calcDeviation(valP.value, valA.value, valP.key),
                    afterday:   valP.afterday
                });
            }
        })
    });

    return res;
}

/* Подсчитывает погрешность */
function calcDeviation(predicted, actual, key){
    var res = 0;

    if(key === 'temp'){
        res = Math.abs(predicted - actual);
    }else{
        if(predicted === actual){
            res = 1;
        }else if(predicted.indexOf(actual) != -1 || actual.indexOf(predicted) != -1){
            res = 0.5;
        }else{
            var predictedArr = predicted.split(' '),
                actualArr = predicted.split(' ');

            predictedArr.forEach(function(valPA){
                actualArr.forEach(function(valAA){
                    if(valPA === valAA) res = 0.75;
                })
            })
        }

    }

    return res;
}


function getDeviation(actual, deviation){
    var newDeviation = [];

    actual.forEach(function(valA){
        var actualIsNew = true;
        deviation.forEach(function(valD){
            if( valA.name     === valD.name &&
                valA.key      === valD.key &&
                valA.afterday === valD.afterday){
                    valD.value = (valD.value * valD.count + valA.value)/(valD.count + 1);
                    valD.count++;
                actualIsNew = false;
            }
        });

        if(actualIsNew){
            newDeviation.push({
                name:       valA.name,
                key:        valA.key,
                value:      valA.value,
                afterday:   valA.afterday,
                daykey:     'deviation',
                count:      1
            })
        }

    });

    return deviation.concat(newDeviation);
}

function sendDeviation(data, COLLECTION){
    if(data && data.length){
        console.info(formatDate.dateToLocal(), '-NODE_request- deviation - result: ', (data && data.length) ? data.length : 'error');
        mongodb.requestMDB('insertDeviation', null, data, COLLECTION);
    }
}


/*
/!*!/!* Подсчет ошибки расхождения *!/
function getDeviation(actual, forecast){
    var avgActual 	= prepareAverage(actual),
        avgForecast = prepareAverage(forecast);

    avgForecast.forEach(function(valF, keyF){
        avgActual.forEach(function(valA){
            if(String(valF['value']).indexOf('(') !== -1) return;

            if(valF['name'] === valA['name'] && valF['key'] === valA['key']){
                if(valF['key'] === 'temp'){
                    valF['deviation'] = Math.abs(valF['value'] - valA['value']);
                }else if(valF['key'] === 'text'){
                    if(valF['value'] === valA['value']){
                        valF['deviation'] = 1;
                    }else if(valF['value'].indexOf(valA['value']) != -1 || valA['value'].indexOf(valF['value']) != -1){
                        valF['deviation'] = 0.5;
                    }else valF['deviation'] = 0;

                }
                avgForecast[keyF]['value'] = valF['value'] +
                    ((valA['key'] === 'temp') ? ' &deg;C' : '' ) +
                    ' (' +
                    ((valA['key'] === 'temp') ? ('±' + valF['deviation'].toFixed(1)) :  (valF['deviation']*100).toFixed(1) + '%') +
                    ')';

                //avgForecast[keyF]['value'] += ' (' + String(valF['deviation']) + ')';
                avgForecast[keyF]['daykey'] = 'deviation';
                avgForecast[keyF]['timestamp'] = Date.now();
                delete avgForecast[keyF]['hour'];
                delete avgForecast[keyF]['_id'];
            }
        })
    });

    return avgForecast;

}*!/

/!* Запустить усреднение для каждого источника *!/
function prepareAverage(arr){
    var resObj = {},
        resArr = [];
    arr.forEach(function(val){

        /!*   #VAL#
         { _id: 56f3c2f901f1ce94220d48b1,
         name: 'yandex',
         key: 'temp',
         value: -1,
         daykey: 'destiny',
         afterday: 0,
         year: 2016,
         month: 3,
         day: 24,
         hour: 13,
         timestamp: 1458815737363
         }*!/

        var name = [];
        if(val.name) name.push(val.name);
        if(val.key)  name.push(val.key);
        if(val.afterday !== undefined)  name.push(String(val.afterday));

        name = name.join('_');

        if(!resObj[name]) resObj[name] = [];
        resObj[name].push(val);                 // Получаем наборы прогнозов с какой-то даты на сегодня
    });

    for(var key in resObj){
        resArr.push((key.indexOf('text') != -1) ? getAverageValueText(resObj[key]) : getAverageValueTemp(resObj[key]))
    }

    return resArr
}

/!*function calc(callback, COLLECTION){
	var dataA,
		dataF,
		funcA = function(err, data) {dataA = data; funcAF()},
		funcF = function(err, data) {dataF = data; funcAF()},
		funcAF = function() {
			if(!dataA || !dataF) return;
			var callbackWrapper = function(err, result) {
					if(callback && typeof callback === 'function') callback(err, result);
				},
				deviationArr = getDeviation(dataA, dataF);

			console.info(formatDate.dateToLocal(), '-NODE_request- calculate - result: ', (deviationArr && deviationArr.length) ? deviationArr.length : 'error');
			mongodb.requestMDB('insert', callbackWrapper, deviationArr, COLLECTION);

			setMainDeviation(deviationArr, COLLECTION);

		};

	mongodb.requestMDB('selectDayActual',   funcA, null, COLLECTION);
	mongodb.requestMDB('selectDayForecast', funcF, null, COLLECTION);

}*!/

/!* Считает отклонение за все время *!/
function setMainDeviation(arr, COLLECTION){
    var func = function(data){
        if(!data || !data.length){
            // Предыдущие значения
            // Новые значения
            arr.forEach(function(val, key){
                arr[key]['daykey'] = 'maindeviation';
                arr[key]['timestamp'] = Date.now();
                arr[key]['count'] = 1;
                if(arr[key]['hour']) 	delete arr[key]['hour'];
                if(arr[key]['day']) 	delete arr[key]['day'];
                if(arr[key]['month']) 	delete arr[key]['month'];
                if(arr[key]['year']) 	delete arr[key]['year'];
                if(arr[key]['_id']) 	delete arr[key]['_id'];
            });
            mongodb.requestMDB('insert', null, arr, COLLECTION)
        }else{
            data.forEach(function(valO, keyO){
                arr.forEach(function(valN, keyN){
                    if( valN['name'] 	 === valO['name'] &&
                        valN['key']  	 === valO['key']  &&
                        valN['afterday'] === valO['afterday']){

                        data[keyO]['deviation'] = (Math.abs(valO['deviation']*valO['count']) + Math.abs(valN['deviation']))/(valO['count'] + 1);
                        data[keyO]['count'] 	= valO['count'] + 1;

                    }
                })
            });

            console.info(formatDate.dateToLocal(), '-NODE_request- main deviation - result: ', (data && data.length) ? data.length : 'error');
            mongodb.requestMDB('insertMainDeviation', null, data, COLLECTION);
        }
    };
    mongodb.requestMDB('getMainDeviation', func, null, COLLECTION);
}*/






