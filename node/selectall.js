var mongodb  = require("../mongo/mongodb"),
	requestdata = require('./requestdata');

function select(postData, callback, COLLECTION){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, tData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(err, dataA){aData = dataA;funcAFT();},
		funcF = function(err, dataF){fData = dataF;funcAFT();},
		funcT = function(err, dataT){tData = dataT;funcAFT();},
		funcD = function(err, dataD){dData = dataD;funcAFT();},
		funcAFT = function(){
			if(!aData || !fData || !tData || !dData) return;

			fData.forEach(function(valO, keyO){
				dData.forEach(function(valN){
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
