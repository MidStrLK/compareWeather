var weather    = require("./weather"),
	calculate  = require("./calculate"),
	formatDate = require('../formatdate'),
    interval   = 5,
    lastWeather,
    lastCalc;

function start(){
	var func = function() {
			var date    = formatDate.getNowDate(),
                day     = date.getDate(),
				hours   = date.getHours(),
				minutes = date.getMinutes();

		console.log('>>> ' + formatDate.dateToLocal(date) + ' <<<');

			if(lastWeather !== hours) {
                lastWeather = hours;
                weather.getAllWeather();
            }

			if(hours == 23 && lastCalc !== day) {
                lastCalc = day;
                calculate.calc();
            }
		};

	setInterval(func, interval*60000); // 5 мин = 300 000
}

exports.start = start;
