var mongodb  = require("../mongo/mongodb"),
	requestdata = require('./requestdata');

function select(postData, callback, COLLECTION){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, tData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(err, dataA){aData = dataA;funcAFT();},     /* daykey = now;            year,month,day,hour = now   Актуальные данные на данный час                                                  */
		funcF = function(err, dataF){fData = dataF;funcAFT();},     /* daykey = day;            year,month,day,hour = now   Прогноз с данного часа на несколько дней вперед                                  */
		funcT = function(err, dataT){tData = dataT;funcAFT();},     /* daykey = deviation;      year,month,day      = now   Прогноз на сегодня за предшествующие дни                                         */
		funcD = function(err, dataD){dData = dataD;funcAFT();},     /* daykey = maindeviation                               Отклонение на 1,2,3....  дня вперед - на сколько точен прогноз на несколько дней */
		funcAFT = function(){
			if(!aData || !fData || !tData || !dData) return;

			fData.forEach(function(valO, keyO){                 // Прогноз с данного часа на несколько дней вперед
				dData.forEach(function(valN){                   // Насколько точен прогноз на несколько дней
					if( valN['name'] 	 === valO['name'] &&
						valN['key']  	 === valO['key']  &&
						valN['afterday'] === valO['afterday']){
							fData[keyO]['value'] = valO['value'] +
								((valN['key'] === 'temp') ? ' &deg;C' : '' ) +
								' (' +
								((valN['key'] === 'temp') ? ('±' + valN['deviation'].toFixed(1)) :  (valN['deviation']*100).toFixed(1) + '%') +
								')';
					}
				})
			});

			var res = {
				actual:     aData,
				forecast:   fData,
				today:      tData,
				deviation:  dData
			};

			callback(0, res);

		};

	mongodb.requestMDB('select', funcA, requestdata.getActualDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcF, requestdata.getForecastDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcT, requestdata.getDestinyDate(date), 	COLLECTION);
	mongodb.requestMDB('select', funcD, requestdata.getMainDeviationData(), COLLECTION);
}

exports.select = select;
