var weather = require("./weather"),
	calculate = require("./calculate");

function start(){
	var func = function() {
			var date = new Date(),
				hours = date.getHours(),
				minutes = date.getMinutes();

			if(minutes > 0 && minutes < 5) weather.getAllWeather();

			if(	minutes > 40 && minutes < 45 && hours == 23) calculate.calc();
		};

	setInterval(func, 300000); // 5 мин = 300 000

}

exports.start = start;
