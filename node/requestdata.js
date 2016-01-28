/* Получить временные данные для актуальной даты на весь день*/
function getActualDayDate(date){
	if(!date) date = new Date();
	return {
		daykey: 'now',
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate()
	}
}

/* Получить временные данные для актуальной даты */
function getActualDate(date){
	if(!date) date = new Date();
	return {
		daykey: 'now',
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hour: date.getHours()
	}
}

/* Получить временные данные для прогноза за весь день */
function getForecastDayDate(date) {
	if(!date) date = new Date();
	return {
		daykey: 'destiny',
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate()
	}
}

/* Получить временные данные для прогноза */
function getForecastDate(date) {
	if(!date) date = new Date();
	return {
		daykey: 'day',
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hour: date.getHours()
	}
}

/* Получить временные данные для прогноза */
function getDestinyDate(date) {
	if(!date) date = new Date();
	return {
		daykey: 'deviation',
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate()
	}
}

/* Получить временные данные для главного отклонения */
function getMainDeviationData() {
	return {
		daykey: 'maindeviation'
	}
}

exports.getActualDayDate 		= getActualDayDate;
exports.getActualDate 			= getActualDate;
exports.getForecastDayDate 		= getForecastDayDate;
exports.getForecastDate 		= getForecastDate;
exports.getDestinyDate 			= getDestinyDate;
exports.getMainDeviationData 	= getMainDeviationData;