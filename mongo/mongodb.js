// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/compareweather';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

var mongo = require('mongodb').MongoClient,											// include the mongodb module
	//provide a sensible default for local development
	db_name = 'weather',
    requestdata = require('../node/requestdata'),
    Server = mongo.Server,
    Db = mongo.Db,
    server = new Server('localhost', 27017, {auto_reconnect: true}),	// create a server instance
    db = new Db('weatherDb', server),									// ссылка на БД
    opendb,
    openconnection = [],
    name = 'weather';



	
exports.requestMDB = requestMDB;



/*-------------------------------------------------------------------------------------------------------------------*/

/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/* Главный запрос к БД, запускает нужные ф-ции */
function requestMDB(path, callback, data){
console.log('-MONGO-', path);
    if(path === 'insert'){
        insertDB(data, callback);
    }else if(path === 'remove'){
        removeDB(data, callback)
    }else if(path === 'count'){
        selectDB(null, callback, 'count')
    }else if(path === 'select'){
        selectDB(data, callback)
    }else if(path === 'selectDayActual'){
        selectDB(requestdata.getActualDayDate(), callback)
    }else if(path === 'selectDayForecast'){
        selectDB(requestdata.getForecastDayDate(), callback)
    }else if(path === 'getMainDeviation'){
        selectDB(requestdata.getMainDeviationData(), callback)
    }else if(path === 'insertMainDeviation'){
        removeDB(requestdata.getMainDeviationData(),function(err, result){
            if(!err) insertDB(data, callback);
        });
    }
}
/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/* Вставляем данные в БД */
function insertDB(data, callback){
    if(!openconnection[name]){
        collectionMongo(name, function(){
            insertDB(name, data);
        })
    }else{
        openconnection[name].insert(data, callback);
    }
}

/* Получаем данные из БД */
function selectDB(data, callback, reason){
    if(!openconnection[name]){
        collectionMongo(function(){
            selectDB(data, callback, reason);
        })
    }else{
        var cursor = openconnection[name].find(data);
        if(reason === 'count'){
            cursor.count(function(err, docs) {
                if(callback) callback(err, docs);
            });
        }else{
            cursor.toArray(function(err, docs) {
                if(callback) callback(docs);
            });
        }

    }
}

/* Удаление записей из БД */
function removeDB(data, callback){
    if(!openconnection[name]){
        collectionMongo(function(){
            removeDB(data, callback);
        })
    }else{
        if(data){
            openconnection[name].remove(data, callback)
        }else openconnection[name].remove(callback)
    }
}

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- НИЗКИЙ УРОВЕНЬ ---*/

/* Находим БД */
function connectMongo(callback){
    mongo.connect('mongodb://'+connection_string, function(err, db) {												// connect to database server
        if(!err) {
            opendb = db;
            callback();
        }
    });
    //db.open(function(err, db) {												// connect to database server
    //    if(!err) {
    //        opendb = db;
    //        callback();
    //    }
    //});
}

/* Находим нужную коллекцию */
function collectionMongo(callback){

    if(!opendb){
        connectMongo(function(){
            collectionMongo(callback);
        })
    }else{
        opendb.collection(name, function(err, collectionref) {		// ссылки на коллекции
            if(!err){
                openconnection[name] = collectionref;
                callback();
            }
        });
    }
}

/* Отключаемся от БД */
function disconnectMongo(db){
    db.close();															// close a database connection
}

/*--- НИЗКИЙ УРОВЕНЬ ---*/



/* Усреднить Ранние прогнозы на дату */
function setTodayForecast(callback){

    var date = new Date(),
        requestData = {
            daykey:     'day',
            year:       date.getFullYear(),
            month:      date.getMonth() + 1,
            day:        date.getDate()
        },
        callbackWrapper = function(result){
            var res = {},
                resultArr = [],
                avg = function(arr) {
                    var arrLen = arr.length,
                        result = 0;
                    for (var i = 0; i < arrLen; i++) {
                        result += arr[i];
                    }
                    return result / arrLen;
                },
                avgText = function(arr) {
                    var arrLen = arr.length,
                        res = {},
                        num = 0,
                        result = '';
                    for (var i = 0; i < arrLen; i++) {
                        if(!res[arr[i]]) res[arr[i]] = 0;
                        res[arr[i]]++;
                    }

                    for(var key in res){
                        if(res[key] > num){
                            num = res[key];
                            result = key;
                        }
                    }

                    return result;
                };


            result.forEach(function(val){
                if(!res[val.name]) res[val.name] = {};
                if(!res[val.name][val.key]) res[val.name][val.key] = [];
                if(!res[val.name][val.key][val.afterday]) res[val.name][val.key][val.afterday] = [];

                res[val.name][val.key][val.afterday].push(val.value);
            });

            for(var reskey in res){
                if(!res.hasOwnProperty(reskey)) return;

                res[reskey]['temp'].forEach(function(vall, keyy){
                    var tempDate = new Date(date);
                    tempDate = new Date(tempDate.setDate(date.getDate() + keyy));
                    resultArr.push({
                        name:       reskey,
                        key:        'temp',
                        daykey:     'forecast',
                        afterday:   -keyy,
                        value:      avg(vall),
                        year:       tempDate.getFullYear(),
                        month:      tempDate.getMonth() + 1,
                        day:        tempDate.getDate()
                    })
                });

                res[reskey]['text'].forEach(function(vall, keyy){
                    var textDate = new Date(date);
                    textDate = new Date(textDate.setDate(date.getDate() + keyy));
                    resultArr.push({
                        name:       reskey,
                        key:        'text',
                        daykey:     'forecast',
                        afterday:   -keyy,
                        value:      avgText(vall),
                        year:       textDate.getFullYear(),
                        month:      textDate.getMonth() + 1,
                        day:        textDate.getDate()
                    })
                });
            }

            insertDB(resultArr);

            callback(resultArr.length);
        };

    selectDB(requestData, callbackWrapper);
}

/* Получить временные данные для прогноза на дату */
function getTodayForecastDate() {
    return {
        daykey: 'forecast',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate()
    }
}

/* Сравнить актуальную погоду с прогнозом */
function getComparedWeather(data, callback){

    var actual,
        forecast,
        callbackactual   = function(result){actual   = result;callbackAF();},
        callbackforecast = function(result){forecast = result;callbackAF();},
        callbackAF = function() {
            if(!actual || !forecast) return;
            if(!actual.length || !forecast.length) callback([]);

            forecast.forEach(function(valF, keyF){
                actual.forEach(function(valA,keyA){

                    if(String(forecast[keyF]['value']).indexOf('(') !== -1) return;

                    if(valF['name'] === valA['name'] && valF['key'] === valA['key']){
                        if(valF['key'] === 'temp'){
                            valF['tempDeviation'] = valF['value'] - valA['value'];
                        }else if(valF['key'] === 'text'){
                            if(valF['value'] === valA['value']){
                                valF['tempDeviation'] = '100%'
                            }else if(valF['value'].indexOf(valA['value']) != -1 || valA['value'].indexOf(valF['value']) != -1){
                                valF['tempDeviation'] = '50%'
                            }else valF['tempDeviation'] = '0%'

                        }
                        forecast[keyF]['value'] += ' (' + String(valF['tempDeviation']) + ')';
                    }
                })
            });

            callback(forecast)
        };

    selectDB(getForecastDate(data), callbackforecast);
    selectDB(getActualDate(data),callbackactual);
}

/* Получить все нужные данные для нужного дня */
function selectAll(data, callback){
    var aData, fData, tData,
        funcA = function(dataA){aData = dataA;funcAFT();},
        funcF = function(dataF){fData = dataF;funcAFT();},
        funcT = function(dataT){tData = dataT;funcAFT();},
        funcAFT = function(){
            if(!aData || !fData || !tData) return;
            var res = {
                actual:   aData,
                forecast: fData,
                today:    tData
            };

            callback(0, res);

        };
    selectDB(getActualDate(data), funcA);
    selectDB(getForecastDate(data), funcF);
    selectDB(getDestinyDate(data), funcT);
}

/* Получить временные данные для актуальной даты на весь день*/
function getActualDayDate(){
    return {
        daykey: 'now',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate()
    }
}

/* Получить временные данные для актуальной даты */
function getActualDate(){
    return {
        daykey: 'now',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate(),
        hour: (new Date()).getHours()
    }
}

/* Получить временные данные для прогноза за весь день */
function getForecastDayDate() {
    return {
        daykey: 'destiny',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate()
    }
}

/* Получить временные данные для прогноза */
function getForecastDate() {
    return {
        daykey: 'day',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate(),
        hour: (new Date()).getHours()
    }
}

/* Получить временные данные для прогноза */
function getDestinyDate() {
    return {
        daykey: 'deviation',
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate()
    }
}

/* Получить временные данные для главного отклонения */
function getMainDeviationData() {
    return {
        daykey: 'maindeviation'
    }
}