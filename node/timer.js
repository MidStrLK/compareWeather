var weather = require("./weather"),
	calculate = require("./calculate"),
	formatDate = require('../formatdate');

function start(){
	var func = function() {
			var date = formatDate.getNowDate(),
				hours = date.getHours(),
				minutes = date.getMinutes();

		console.log('>>> ' + formatDate.dateToLocal(date) + ' <<<');

			if(minutes > 0 && minutes < 5) weather.getAllWeather();

			if(	minutes > 40 && minutes < 45 && hours == 23) calculate.calc();
		};

	setInterval(func, 300000); // 5 мин = 300 000
}

exports.start = start;
