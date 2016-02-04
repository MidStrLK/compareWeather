// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/compareweather';
// if OPENSHIFT env variables are present, use the available connection info:

if(process && process.env && process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

var mongo = require('mongodb').MongoClient,											// include the mongodb module
    requestdata = require('../node/requestdata'),
    //Server = mongo.Server,
    //Db = mongo.Db,
    //server = new Server('localhost', 27017, {auto_reconnect: true}),	// create a server instance
    //db = new Db('weatherDb', server),									// ссылка на БД
    opendb,
    openconnection = [],
    name = 'weather';



	
exports.requestMDB = requestMDB;



/*-------------------------------------------------------------------------------------------------------------------*/

/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/* Главный запрос к БД, запускает нужные ф-ции */
function requestMDB(path, callback, data){
console.log(dateToLocal(getNowDate()), '-MDB_request-', path);
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
        collectionMongo(function(){
            insertDB(name, data);
        })
    }else{
        if(!callback) callback = function(err, result){
            console.info(dateToLocal(getNowDate()), '-MDB_reply- insert - err:', err, ', result: ', (result && result.length) ? result.length : '');
        };
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
            cursor.toArray(function(err, result) {
                console.info(dateToLocal(getNowDate()), '-MDB_reply- select - err:', err, ', result: ', (result && result.length) ? result.length : '');
                if(callback) callback(result);
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

function getNowDate(){
    var date = new Date(),
        remoteTimezoneOffset = -180;
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - remoteTimezoneOffset);
    return date;
}

function dateToLocal(date){
    return  date.getDate()  + '.' + date.getMonth()   + '.' + date.getFullYear() + ' ' +
        date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}


/* Находим БД */
function connectMongo(callback){
    mongo.connect('mongodb://'+connection_string, function(err, db) {												// connect to database server
        console.info(dateToLocal(getNowDate()), '-MDB- db connect - err:', err, ', result: ', !!db);
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
            console.info(dateToLocal(getNowDate()), '-MDB- collection connect - err:', err, ', result: ', !!collectionref);
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
