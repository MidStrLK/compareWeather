var server = require("./node/server");
var router = require("./node/router");
var requestHandlers = require("./node/requestHandlers");

var handle = {};

handle["/"]         = requestHandlers.submitRequest;    // index.html
handle["/remove"]   = requestHandlers.submitRequest;    // очистить БД
handle["/insert"]   = requestHandlers.submitRequest;    // Посчитать погоду и положить в БД
handle["/select"]   = requestHandlers.submitRequest;    // Получить погоду на сегодня
handle["/count"]    = requestHandlers.submitRequest;    // Тест БД
handle["/testCalculate"]    = requestHandlers.submitRequest;    // Тест БД

server.start(router.route, handle);