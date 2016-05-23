var server 			= require("./node/server"),
	router 			= require("./node/router"),
	requestHandlers = require("./node/requestHandlers"),
	handle 			= {};

handle["/"]                 = requestHandlers.submitRequest;    // index.html
handle["/remove"]           = requestHandlers.submitRequest;    // очистить БД
handle["/insert"]           = requestHandlers.submitRequest;    // Посчитать погоду и положить в БД
handle["/select"]           = requestHandlers.submitRequest;    // Получить погоду на сегодня
handle["/count"]            = requestHandlers.submitRequest;    // Тест БД
handle["/testCalculate"]    = requestHandlers.submitRequest;    // Тест БД
handle["/mongorequest"]     = requestHandlers.submitRequest;    // Тест БД
handle["/gethourly"]        = requestHandlers.submitRequest;    // Почасовой прогноз

server.start(router.route, handle);