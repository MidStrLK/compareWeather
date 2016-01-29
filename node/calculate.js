var mongodb  = require("../mongo/mongodb");

function calc(callback){
	var dataA,
		dataF,
		funcA = function(data) {dataA = data; funcAF()},
		funcF = function(data) {dataF = data; funcAF()},
		funcAF = function() {
			if(!dataA || !dataF) return;
			var callbackWrapper = function(err, result) {
					callback(err, result);
				},
				deviationArr = getDeviation(dataA, dataF);

			console.info(new Date().toLocaleString(), '-NODE_request- calculate - result: ', (deviationArr && deviationArr.length) ? deviationArr.length : 'error');
			mongodb.requestMDB('insert', callbackWrapper, deviationArr);

			setMainDeviation(deviationArr);

		};

	mongodb.requestMDB('selectDayActual',   funcA);
	mongodb.requestMDB('selectDayForecast', funcF);

}

/* Считает отклонение за все время */
function setMainDeviation(arr){
	var func = function(data){
		if(!data.length){
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
			mongodb.requestMDB('insert', null, arr)
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

			console.info(new Date().toLocaleString(), '-NODE_request- main deviation - result: ', (data && data.length) ? data.length : 'error');
			mongodb.requestMDB('insertMainDeviation', null, data);
		}
	};
	mongodb.requestMDB('getMainDeviation', func);
}

/* Подсчет ошибки расхождения */
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

}

/* Запустить усреднение для каждого источника */
function prepareAverage(arr){
	var resObj = {},
		resArr = [];
	arr.forEach(function(val){
		if(!resObj[val.name + '_' + val.key]) resObj[val.name + '_' + val.key] = [];
		resObj[val.name + '_' + val.key].push(val);
	});

	for(var key in resObj){
		resArr.push((key.indexOf('text') != -1) ? getAverageValueText(resObj[key]) : getAverageValueTemp(resObj[key]))
	}

	return resArr
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

	arr[0].value = result / arrLen;

	return arr[0];
}

exports.calc = calc;
