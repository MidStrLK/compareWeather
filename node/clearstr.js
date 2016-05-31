function clearTemp(text){
    text = String(text);
    if(!text || !text.replace || !text.charAt) return;

    text = text.replace(/\s/, '');
    if(text.charAt(0) !== '-' && text.charAt(0) !== '+') text = '+' + text;
    if(text.charAt(text.length-1) === 'C' && text.charAt(text.length-2) !== '°') text = text.substr(0, text.length-2) + '°C';
    if(text.charAt(text.length-1) === '°') text += 'C';
    if(text.indexOf('°C') === -1) text += '°C';

    return text;
}

function translate(text){
    if(text && text.toLowerCase && translateArray[text.toLowerCase()]) text = translateArray[text.toLowerCase()];
    return text;
}

translateArray = {
    'partly sunny'  : 'Местами солнечно',
    'showers'       : 'Ливни',
    'mostly clear'  : 'Малооблачно',
    'cloudy'        : 'Облачно',
    'rain'          : 'Дожди',
    'mostly cloudy' : 'Пасмурно',
    'partly cloudy' : 'Переменная облачность',
    'mostly sunny'  : 'Облачно с прояснениями',
    'sunny'         : 'Солнечно',
    'clear'         : 'Ясно'
};

exports.clearTemp = clearTemp;
exports.translate = translate;
