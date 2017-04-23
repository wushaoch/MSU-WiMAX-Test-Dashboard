google.charts.load('current', {'packages':['line','corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    
    var databaseread = $.ajax({
          url: "./linechart/getdata.php",
          dataType: "json",
          async: false
          }).responseText;
    
    databaseprocessed = JSON.parse(databaseread);
    
    var toggle = databaseprocessed[0];
    var jsonData = databaseprocessed[1];
    
    for (var i = 1; i < jsonData.length; i++ ){
        jsonData[i][0] = new Date(jsonData[i][0]);
    }
    
    var data = new google.visualization.arrayToDataTable(jsonData);

    var options = {
        title: 'Well Status',
        curveType: 'function',
        series: {
            0: {targetAxisIndex: 1},
            1: {targerAxisIndex: 2}
        },
        hAxis: {
            format: 'M/d/yy hh:mm:ss.SSS',
            title: 'Time'
        },
        vAxes: {0:{title: 'Voltage (V)'}, 1:{title:'Pump Flow Speed (Gallons/mn)'}},
        vAxis: {viewWindow: { max: 20 }},
        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}
setInterval(function(){drawChart();}, 400);
