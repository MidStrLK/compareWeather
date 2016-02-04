var weather = require("./weather"),
	calculate = require("./calculate"),
	remoteTimezoneOffset = -180;

function start(){
	var func = function() {
			var date = getNowDate(),
				hours = date.getHours(),
				minutes = date.getMinutes();

		console.log('>>> ' + dateToLocal(date) + ' <<<');

			if(minutes > 0 && minutes < 5) weather.getAllWeather();

			if(	minutes > 40 && minutes < 45 && hours == 23) calculate.calc();
		};

	setInterval(func, 300000); // 5 мин = 300 000
}

function getNowDate(){
	var date = new Date();
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - remoteTimezoneOffset);
	return date;
}

function dateToLocal(date){
	return  date.getDate()  + '.' + date.getMonth()   + '.' + date.getFullYear() + ' ' +
			date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

exports.start = start;
