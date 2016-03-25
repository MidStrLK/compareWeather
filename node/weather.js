var manifest 	= require("../manifest"),
	request  	= require("request"),
	cheerio  	= require("cheerio"),
	utf8     	= require('utf8'),
	mongodb  	= require("../mongo/mongodb"),
	formatDate 	= require('../formatdate');

/* передача на сервер функции */
exports.getAllWeather = getAllWeather;




/* Запрашивает погоду из всех источников */
function getAllWeather(callback, COLLECTION){
    if(!manifest || !manifest.list) return;

    var requestArray = [];

    for(var key in manifest.list) {
        //getWeather(manifest.list[key], COLLECTION)
        requestArray = requestArray.concat(getRequestData(manifest.list[key]));
    }

    var responseArray = [],
        length = 0,
        responseArrayLength = 0,
        func = function(data){
            responseArray = responseArray.concat(data);
            responseArrayLength++;

            if(responseArrayLength !== length) return;

            sendData(responseArray, callback, COLLECTION);
            //callback(0, responseArray);
    };

    requestArray.forEach(function(val){
        for(var key in val.params){
            length++;
        }
    });

    requestArray.forEach(function(val){
        submitRequest(val, func);
    });
}

/* Получаем данные для отправки запроса */
function getRequestData(data){
    var params = data.params,
        name = data.name,
        periodic = data.periodic,
        res = [];

    if(data.url){
        res.push({
            url:data.url,
            params: params,
            inc: data.firstNumber,
            name: name,
            periodic: periodic
        });
    }else if(params['forEach']){
        params['forEach'](function(Pval){
            res.push({
                url:Pval.url,
                params: Pval.params,
                firstNumber: Pval.firstNumber,
                name: name,
                periodic: periodic
            });
        })
    }

    return res;
}


/* Запрос данных с сайта */
function submitRequest(values, callback){
    request({
        uri: values.url
    }, function(error, response, body) {
        var $ = cheerio.load(body);

        for(var key in values.params){
            findParameter($, values.params[key], key, values.name, values.inc, values.periodic, callback)
        }
    });
}

/* Ищет параметры для каждого случая */
function findParameter($, tag, key, name, firstNumber, periodic, callback){
    var intArr = [],
        resArr = [],
        daynum = firstNumber || 0;

    if(!$(tag)) return;

    $(tag).each(function() {
        var link = $(this);
        var text = link.text().replace(/<span>.*<\/span>/g,'').replace('Мин', '');
        text = (key.indexOf('temp') !== -1) ? parseInt(text.replace(/'/g, '').replace(/"/g, '').replace(/−/g, '-')) : text;
        intArr.push(text);

    });


    intArr['forEach'](function (val, num) {

        if(periodic && periodic === 'odd' && (key.indexOf('day') !== -1) && num%2 === 0) return;

        resArr.push(createActualForecastRow({
            name: name,
            key: key,
            afterday: daynum,
            value: val
        }));

        resArr.push(createForecastPredictedRow({
            name: name,
            key: key,
            afterday: daynum,
            value: val
        }));

        daynum = daynum + 1;

    });


    callback(resArr);
}

/* Готовит данные для сервера для прогноза на неделю */
function createActualForecastRow(data){

		var date 	 = new Date(),
			name 	 = data.name,
			key 	 = data.key,
			afterday = data.afterday,
			value 	 = data.value,
			res 	 = {};

	if(name 	!== undefined) 	res.name 		= name;			// Название сервиса (yandex, gismeteo)
	if(key 		!== undefined) 	{
		if(key.indexOf('_') !== -1){
			res.key 	= key.split('_')[1];					// Ключ в манифесте (temp, text)
			//res.daykey 	= key.split('_')[0];					// now/day -> actual/forecast
            res.daykey = (key.split('_')[0] === 'now') ? 'actual' : 'forecast';
		}

	}
	if(afterday !== undefined) 	res.afterday 	= afterday;		// На сколько дней прогноз (0,1,2....)
	if(value 	!== undefined) 	res.value 	 	= value;		// Значение (10, облачно)


	res.year 		= date.getFullYear();
	res.month 		= date.getMonth() + 1;
	res.day 		= date.getDate();
	res.hour 		= date.getHours();
	res.timestamp	= date.getTime();


	return res;
}

/* Готовит данные для сервера для прогноза на определенный день*/
function createForecastPredictedRow(data){

		var date 	 = new Date(),
			tempDate = new Date(),
			name 	 = data.name,
			key 	 = data.key,
			afterday = data.afterday,
			value 	 = data.value,
			res 	 = {};

	if(name 	!== undefined) 	res.name 		= name;			// Название сервиса (yandex, gismeteo)
	if(key 		!== undefined && key.indexOf('_') !== -1) res.key = key.split('_')[1];
	if(value 	!== undefined) 	res.value 	 	= value;		// Значение (10, облачно)
	res.daykey 	= 'predicted';


	if(afterday !== undefined) 	res.afterday = -afterday;		// На сколько дней прогноз (0,1,2....)

	tempDate.setDate(date.getDate() + afterday);

	res.year 		= tempDate.getFullYear();
	res.month 		= tempDate.getMonth() + 1;
	res.day 		= tempDate.getDate();
	res.hour 		= tempDate.getHours();
	res.timestamp	= tempDate.getTime();


	return res;
}



/* Отправляет данные на сервер */
function sendData(data, callback, COLLECTION){
    console.info(formatDate.dateToLocal(), '-NODE_request- weather - result: ', (data && data.length) ? data.length : 'error');
    mongodb.requestMDB('insert', callback, data, COLLECTION);
}






/* Запрос на сервер и формирование объекта */
/*function getWeather(data, collectData, COLLECTION) {
 var params = data.params,
 name = data.name,
 periodic = data.periodic;

 var submitRequest = function(localURL, subParams, inc){
 request({
 uri: localURL
 }, function(error, response, body) {
 var $ = cheerio.load(body);

 for(var key in subParams){
 findParameter($, subParams[key], key, name, inc, periodic, collectData, COLLECTION)
 }
 });
 };

 if(data.url){
 submitRequest(data.url, params,  data.firstNumber);
 }else if(params['forEach']){
 params['forEach'](function(Pval){
 this.length++;
 submitRequest(Pval.url, Pval.params, Pval.firstNumber);
 })
 }
 }*/