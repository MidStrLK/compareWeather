var manifest 	= require("../manifest"),
	request  	= require("request"),
	cheerio  	= require("cheerio"),
	utf8     	= require('utf8'),
	clearstr    = require('./clearstr');

/* передача на сервер функции */
exports.getActual = getActual;


/* Запрашивает почасовой прогноз и отправляет обратно */
function getActual(callback){
    if(!manifest || !manifest.list) return;

    var requestArray = [];

    for(var key in manifest.list) {
        if (!manifest.list[key].params) return;

        var item = {};

        if (manifest.list[key].params instanceof Array) {
            manifest.list[key].params.forEach(function (val) {
                if (val.params && val.params.now_text && val.params.now_temp) {
                    item = {
                        url: val.url,
                        name: manifest.list[key].name,
                        temp: val.params.now_temp,
                        text: val.params.now_text,
                        img:  val.params.now_img
                    };
                }
            })
        } else {
            item = {
                url: manifest.list[key].url,
                name: manifest.list[key].name,
                temp: manifest.list[key].params.now_temp,
                text: manifest.list[key].params.now_text,
                img:  manifest.list[key].params.now_img
            };
        }

        requestArray.push(item)
    }

    var responseArray = [],
        index = 0,
        func = function(data){
            index++;
            if(data) responseArray.push(data);

            if(index !== requestArray.length) return;

            if(callback) callback(0, responseArray);
    };

    requestArray.forEach(function(val){
        submitRequest(val, func);
    });
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

    var result = {name: values.name};

    if(!values || !$ || typeof $ !== 'function') callback();

    if(values.temp && $(values.temp) && $(values.temp).each){
        $(values.temp).each(function(key) {
            var link = $(this);
            result['temp'] = link.text();
        });
    }

    result['temp'] = clearstr.clearTemp(result['temp']);

    if(values.text && $(values.text) && $(values.text).each){
        $(values.text).each(function(key) {
            var link = $(this);
            result['text'] = link.text();
        });
    }

    /*if(values.img && $(values.img) && $(values.img).each){
        $(values.text).each(function(key) {
            var link = $(this);
            console.info('link - ',link.children());
            result['img'] = link.attr('background-image');
            console.info('img',result['img']);
        });
    }*/

    callback(result);
}