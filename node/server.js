var http = require("http"),
    url = require("url"),
    weather = require("./weather"),
    timer = require("./timer"),
    formatDate = require('../formatdate'),
	server_port = process.env.OPENSHIFT_NODEJS_PORT || 3003,
	server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log(formatDate.dateToLocal() + "--" + pathname);

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });

  }
 
	var server = http.createServer(onRequest);
	server.listen(server_port, server_ip_address, function () {
		console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
	});
  
  //http.createServer(onRequest).listen(8888);
  //console.log("Server has started.");

  timer.start();

}

exports.start = start;