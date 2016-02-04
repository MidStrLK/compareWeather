function getNowDate(){
    var date = new Date(),
        remoteTimezoneOffset = -180;
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - remoteTimezoneOffset);
    return date;
}

function dateToLocal(date){
    if(!date) date = getNowDate();
    return  ((date.getDate()    < 10) ? ('0' + date.getDate())    : date.getDate())     + '.' +
            ((date.getMonth()   < 10) ? ('0' + date.getMonth())   : date.getMonth())    + '.' +
              date.getFullYear()                                                        + ' ' +
            ((date.getHours()   < 10) ? ('0' + date.getHours())   : date.getHours())    + ':' +
            ((date.getMinutes() < 10) ? ('0' + date.getMinutes()) : date.getMinutes())  + ':' +
            ((date.getSeconds() < 10) ? ('0' + date.getSeconds()) : date.getSeconds());
}


exports.getNowDate = getNowDate;
exports.dateToLocal = dateToLocal;