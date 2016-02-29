var mongodb     = require("../mongo/mongodb"),
    fs          = require("fs"),
    index       = fs.readFileSync('./index.html'),
    weather     = require("./weather"),
    calculate   = require("./calculate"),
    selectall   = require("./selectall");

function submitRequest(response, handle, pathname, postData, COLLECTION){

  if(!pathname || !response){
    response.writeHead(500, { 'Content-Type': 'application/json', 'charset':'utf-8' });
    response.write('Ошибка в запросе ' + pathname);
    response.end();
  }else{
    if(pathname === '/'){
      response.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
      response.end(index);
    }else {
      var path = pathname.replace(/\//g, ''),
          func = function (err, result) {
            var res = 0,
                httpsc = 200;
            if (err) {
              res = err;
              httpsc = 500;
            } else {
              if (result || result === 0) res = result;
              if (result && (result.result || result.result === 0)) res = result.result;
              if (result && result.result && (result.result.n || result.result.n === 0)) res = result.result.n;
            }

            response.writeHead(httpsc, {'Content-Type': 'application/json', 'charset': 'utf-8'});
            response.write(JSON.stringify(res));
            response.end();
          };

      if (pathname === '/insert') {
          weather.getAllWeather(func, COLLECTION);
      }else if (pathname === '/testCalculate') {
          calculate.calc(func, COLLECTION);
      }else if (pathname === '/select') {
          selectall.select(postData, func, COLLECTION)
      }else if (pathname === '/mongorequest') {
          console.info('postData - ',postData);
          mongodb.requestMDB(path, func, JSON.parse(postData), COLLECTION);
      } else if (mongodb.requestMDB) {
          mongodb.requestMDB(path, func, null, COLLECTION);
      } else {
          response.writeHead(500, {'Content-Type': 'application/json', 'charset': 'utf-8'});
          response.write('Ошибка в запросе к БД ' + path);
          response.end();
      }
    }
  }
}

exports.submitRequest       = submitRequest;