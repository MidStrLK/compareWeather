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
    formatDate = require('../formatdate'),
    //Server = mongo.Server,
    //Db = mongo.Db,
    //server = new Server('localhost', 27017, {auto_reconnect: true}),	// create a server instance
    //db = new Db('weatherDb', server),									// ссылка на БД
    opendb,
    openconnection = [],
    name = 'weather';



	
exports.requestMDB       = requestMDB;
exports.getCollectionMDB = collectionMongo;



/*-------------------------------------------------------------------------------------------------------------------*/

/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/* Главный запрос к БД, запускает нужные ф-ции */
function requestMDB(path, callback, data, COLLECTION){
console.log(formatDate.dateToLocal(), '-MDB_request-', path);
    if(path === 'insert'){
        insertDB(data, callback, COLLECTION);

    }else if(path === 'remove'){
        removeDB(data, callback, COLLECTION)

    }else if(path === 'count'){
        selectDB(null, callback, COLLECTION)

    }else if(path === 'select'){
        selectDB(data, callback, COLLECTION)

    }else if(path === 'selectDayActual'){
        selectDB(requestdata.getActualDayDate(), callback, COLLECTION)

    }else if(path === 'selectDayForecast'){
        selectDB(requestdata.getForecastDayDate(), callback, COLLECTION)

    }else if(path === 'getMainDeviation'){
        selectDB(requestdata.getMainDeviationData(), callback, COLLECTION)

    }else if(path === 'insertMainDeviation'){
        removeDB(requestdata.getMainDeviationData(),function(err, result){
            if(!err) insertDB(data, callback, COLLECTION);
        }, COLLECTION);
    }
}
/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/* Вставляем данные в БД */
function insertDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];

    if(!COLLECTION || !COLLECTION.insert){
        collectionMongo(function(){
            insertDB(name, data);
        })
    }else{
        if(!callback) callback = function(err, result){
            console.info(formatDate.dateToLocal(), '-MDB_reply- insert - err:', err, ', result: ', (result && result.length) ? result.length : '');
        };
        COLLECTION.insert(data, callback);
    }
}

/* Получаем данные из БД */
function selectDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];
    if(!COLLECTION || !COLLECTION.find){
        collectionMongo(function(){
            selectDB(data, callback);
        })
    }else{
        var cursor = COLLECTION.find(data);
        if(data === null){
            console.info(formatDate.dateToLocal(), '-MDB_reply- count');
            if(callback) countCategory(cursor, callback);
            //cursor.count(function(err, docs) {
            //    if(callback) callback(err, countCategory(docs));
            //});
        }else{
            cursor.toArray(function(err, result) {
                console.info(formatDate.dateToLocal(), '-MDB_reply- select - err:', err, ', result: ', (result && result.length) ? result.length : '');
                if(callback) callback(result);
            });
        }

    }
}

/* Удаление записей из БД */
function removeDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];

    if(!COLLECTION || !COLLECTION.remove){
        collectionMongo(function(){
            removeDB(data, callback);
        })
    }else{
        if(data){
            COLLECTION.remove(data, callback)
        }else COLLECTION.remove(callback)
    }
}

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- НИЗКИЙ УРОВЕНЬ ---*/

/* Подсчет кол-ва записей */
function countCategory(cursor, callback){
    var res = {error: []};
    cursor.each(function(err, val){
        if(val === null){
            callback(null, res);
        }else if(!val || !val.name || !val.daykey || err){
            res.error.push(val)
        }else{
            if(!res[val.name]) res[val.name] = {};
            if(!res[val.name][val.daykey]) res[val.name][val.daykey] = 0;
            res[val.name][val.daykey]++
        }
    });

}

/* Находим БД */
function connectMongo(callback){
    mongo.connect('mongodb://'+connection_string, function(err, db) {												// connect to database server
        console.info(formatDate.dateToLocal(), '-MDB- db connect - err:', err, ', result: ', !!db);
        if(!err) {
            opendb = db;
            callback();
        }
    });
}

/* Находим нужную коллекцию */
function collectionMongo(callback){

    if(!opendb){
        connectMongo(function(){
            collectionMongo(callback);
        })
    }else{
        opendb.collection(name, function(err, collectionref) {		// ссылки на коллекции
            console.info(formatDate.dateToLocal(), '-MDB- collection connect - err:', err, ', result: ', !!collectionref);
            if(!err){
                openconnection[name] = collectionref;
                callback(collectionref);
            }
        });
    }
}

/* Отключаемся от БД */
function disconnectMongo(db){
    db.close();															// close a database connection
}

/*--- НИЗКИЙ УРОВЕНЬ ---*/
