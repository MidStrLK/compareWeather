var weather    = require("./weather"),
	calculate  = require("./calculate"),
	formatDate = require('../formatdate'),
    interval   = 5,
    lastWeather,
    lastCalc;

function start(COLLECTION){
	var func = function() {
			var date    = formatDate.getNowDate(),
                day     = date.getDate(),
				hours   = date.getHours(),
				minutes = date.getMinutes();

		console.log('>>> ' + formatDate.dateToLocal(date) + ' <<<  (weather hours | calc day == ', lastWeather, hours, ' | ', lastCalc, day);

			if(lastWeather !== hours) {
                lastWeather = hours;
				console.log('GETALLWEATHER attempt');
                weather.getAllWeather(null, COLLECTION);
            }

			if(hours == 13 && lastCalc !== day) {
                lastCalc = day;
                console.log('CALCULATE attempt');
                calculate.calc(null, COLLECTION);
            }
		};

	setInterval(func, interval*60000); // 5 мин = 300 000
}

exports.start = start;
