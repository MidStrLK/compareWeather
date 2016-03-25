/* Получить временные данные для актуальной даты на весь день*/
function getActualDay(date){
	if(!date) date = new Date();
	return {
		daykey: 'actual',
		year:   date.getFullYear(),
		month:  date.getMonth() + 1,
		day:    date.getDate()
	}
}

/* Получить временные данные для прогноза С даты на весь день*/
function getForecastDay(date){
    if(!date) date = new Date();
    return {
        daykey: 'forecast',
        year:   date.getFullYear(),
        month:  date.getMonth() + 1,
        day:    date.getDate()
    }
}

/* Получить временные данные для актуальной даты на весь день*/
function getPredictedDay(date){
    if(!date) date = new Date();
    return {
        daykey: 'predicted',
        year:   date.getFullYear(),
        month:  date.getMonth() + 1,
        day:    date.getDate()
    }
}


/* Получить временные данные для актуальной усредненной даты на весь день*/
function getActualAverageDay(date){
    if(!date) date = new Date();
    return {
        daykey: 'actualaverage',
        year:   date.getFullYear(),
        month:  date.getMonth() + 1,
        day:    date.getDate()
    }
}

/* Получить временные данные для предсказанной усредненной НА даты на весь день*/
function getPredictedAverageDay(date){
    if(!date) date = new Date();
    return {
        daykey: 'predictedaverage',
        year:   date.getFullYear(),
        month:  date.getMonth() + 1,
        day:    date.getDate()
    }
}

/* Получить временные данные для главного отклонения */
function getDeviation() {
    return {
        daykey: 'deviation'
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
		year:   date.getFullYear(),
		month:  date.getMonth() + 1,
		day:    date.getDate()
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

exports.getActualDay 		    = getActualDay;
exports.getForecastDay 		    = getForecastDay;
exports.getPredictedDay         = getPredictedDay;
exports.getActualAverageDay     = getActualAverageDay;
exports.getPredictedAverageDay  = getPredictedAverageDay;
exports.getDeviation            = getDeviation;



exports.getActualDate 			= getActualDate;
exports.getForecastDayDate 		= getForecastDayDate;
exports.getForecastDate 		= getForecastDate;
exports.getDestinyDate 			= getDestinyDate;
exports.getMainDeviationData 	= getMainDeviationData;