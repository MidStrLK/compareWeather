var manifest 	= require("../manifest"),
	request  	= require("request"),
	cheerio  	= require("cheerio"),
	utf8     	= require('utf8');

/* передача на сервер функции */
exports.getHourly = getHourly;


/* Запрашивает почасовой прогноз и отправляет обратно */
function getHourly(callback){
    if(!manifest || !manifest.list) return;

    var requestArray = [];

    for(var key in manifest.list) {
        if(manifest.list[key].hourly && manifest.list[key].hourly instanceof Array) {
            var valHourly = manifest.list[key].hourly;

            valHourly.forEach(function(valH, keyH){
                valHourly[keyH].name = manifest.list[key].name;
            });

            requestArray = requestArray.concat(valHourly)
        }
    }

    var responseArray = [],
        index = 0,
        func = function(data){
            index++;
            if(data) responseArray.push(data);

            if(index !== requestArray.length) return;

            var endResult = getEndResult(responseArray);

            if(callback) callback(0, endResult);
    };

    requestArray.forEach(function(val){
        submitRequest(val, func);
    });
}

/* Собирает результат ил нескольких массивов/объектов */
function getEndResult(responseArray){
    var res = [];
    responseArray.forEach(function(val){
        var flag = false;
        res.forEach(function(vall, keyy){
            if(val.name === vall.name){
                flag = true;
                for(var keyInVal in val){
                    res[keyy][keyInVal] = val[keyInVal];
                }
            }
        });
        if(!flag) res.push(val);
    });

    return res;
}


/* Запрос данных с сайта */
function submitRequest(values, callback){

    request({
        uri: values.url
    }, function(error, response, body) {
        var $;
        if(body) $ = cheerio.load(body);

        findParameter($, values, callback);
    });
}


/* Ищет параметры для каждого случая */
function findParameter($, values, callback){

    var result = [],
        res = {};

    if(!values || !$ || typeof $ !== 'function') callback();

    if(values.temp && $(values.temp) && $(values.temp).each){
        $(values.temp).each(function(key) {
            var link = $(this);
            var text = link.text();
            if(!result[key]) result[key] = {};
            result[key]['temp'] = text;
        });
    }

    if(values.text && $(values.text) && $(values.text).each){
        $(values.text).each(function(key) {
            var link = $(this);
            var text = link.text();
            if(!result[key]) result[key] = {};
            result[key]['text'] = text;
        });
    }

    if(values.time && $(values.time) && $(values.time).each){
        $(values.time).each(function(key) {
            var link = $(this);
            var text = link.text().replace(/\n/g, '').replace(/\t/g, '');//parseInt(link.text().replace(/\n/g, '').replace(/\t/g, ''));
            if(!result[key]) result[key] = {};
            result[key]['time'] = text;
        });
    }

    for(var key in result) {
        var time;
        if(result[key].time){
            time = result[key].time;

            if(time.indexOf(':') !== -1) time = time.split(':')[0];
            if(time === 'утром') time = 9;
            if(time === 'днём' || time === 'днем') time = 12;
            if(time === 'вечером') time = 18;
            if(time === 'ночью') time = 21;


        }else if(!isNaN(values.firstNumber)){
            time = parseInt(values.firstNumber) + parseInt(key);
        }

        res[time] = {
            temp: result[key].temp || '',
            text: result[key].text || ''
        };

        res[time] = '<span class="hourly_temp">' + (result[key].temp || '') + '</span></br><span class="hourly_text">' + (result[key].text || '') + '</span>';

    }

    res.name = values.name;

    callback(res);
}