var mongodb  = require("../mongo/mongodb"),
	requestdata = require('./requestdata');

function select(postData, callback){
	if(postData) postData = JSON.parse(postData);
	var aData, fData, tData, dData,
		date = (postData && postData.date) ? new Date(postData.date) : new Date(),
		funcA = function(dataA){aData = dataA;funcAFT();},
		funcF = function(dataF){fData = dataF;funcAFT();},
		funcT = function(dataT){tData = dataT;funcAFT();},
		funcD = function(dataD){dData = dataD;funcAFT();},
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
				actual:   aData,
				forecast: fData,
				today:    tData
			};

			callback(0, res);

		};

	mongodb.requestMDB('select', funcA, requestdata.getActualDate(date));
	mongodb.requestMDB('select', funcF, requestdata.getForecastDate(date));
	mongodb.requestMDB('select', funcT, requestdata.getDestinyDate(date));
	mongodb.requestMDB('select', funcD, requestdata.getMainDeviationData());
}

exports.select = select;
