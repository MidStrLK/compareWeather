myApp.controller('RequestController',
    function QuestionController($scope, $http){

        $http.get('/getactual').success(function(data) {
            $scope.actual = data;
        });

        $scope.hourlyTime = [' '];
        for(var i=0;i<24;i++){
            $scope.hourlyTime.push(i+':00');
        }

        $http.get('/gethourly').success(function(data) {
            $scope.hourly = data;
        });

        $scope.forecastDate = [' '];

        var date = new Date(),
            formatDate = function(increment){
            var incDate = new Date(),
                month = incDate.getMonth() + 1;
            incDate.setDate(date.getDate() + increment);
            if(month < 10) month = '0' + String(month);
            return incDate.getDate() + '.' + month + ', ' + ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][incDate.getDay()];
        };

        for(var k=0;k<11;k++){
            $scope.forecastDate.push(formatDate(k));
        }
        $http.get('/select').success(function(data) {
            $scope.forecast = data.forecast;
        });
    }
);