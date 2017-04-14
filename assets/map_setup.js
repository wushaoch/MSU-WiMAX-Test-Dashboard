var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: true,
        streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        center: {lat: 42.707554, lng: -84.4656752}, // 42.707554,-84.4656752
        // center: {lat: -25.363, lng: 131.044}, // test for window
        mapTypeId: 'hybrid',
        fullscreenControl: true,
        rotateControl: true,
    });

    // legend
    var legend = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    // detail window
    var detail_box = document.getElementById('detail_box');
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(detail_box);

    // Create a <script> tag and the source.
    var script = document.createElement('script');

    script.src = 'convert/master.json';
    document.getElementsByTagName('head')[0].appendChild(script);


    var base_station = {lat: 42.7176737, lng: -84.48485924};

    var base_station_image = "assets/triangle.png";

    // var goldStar = {
    //       path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
    //       fillColor: 'yellow',
    //       fillOpacity: 0.8,
    //       scale: 1,
    //       strokeColor: 'gold',
    //       strokeWeight: 2
    //     };


    var marker = new google.maps.Marker({
        position: base_station,
        map: map,
        icon: base_station_image,
    });



    var borderLinesCoordinates = [ 
        {lat: 42.686397, lng: -84.52909124}, // left point : 42.692970, -84.515050
        {lat: 42.7176737, lng: -84.48485924}, // base station
        {lat: 42.686397,  lng: -84.44062724} // right point: 42.690573, -84.456670
    ];

    var borderLines = new google.maps.Polyline({
      path: borderLinesCoordinates,
      geodesic: true,
      strokeColor: '#FFFFFF',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });

    borderLines.setMap(map);

    map.data.setStyle(function(feature) {
        var mag_normalized = normalizeMag(
                                    feature.getProperty('sent_throughput'),
                                    100,
                                    0
                                    );
        return {
            icon: getCircle(mag_normalized)
        };
    });
    

    map.data.addListener('click', function(event) {
        document.getElementById("db_header_text").innerHTML="Details";
        
        var receive_thp = event.feature.getProperty('received_throughput');

        if (receive_thp == 999)
        {
            document.getElementById("receive_value").innerHTML= "0";
            document.getElementById("send_value").innerHTML= "0";
            document.getElementById("db_value_3").innerHTML= "0";
            document.getElementById("db_value_4").innerHTML= "0";
            document.getElementById("db_value_5").innerHTML= "0";
            document.getElementById("db_value_6").innerHTML= "0";
            document.getElementById("detail_box").style.display = "0";
            document.getElementById("timestamp").innerHTML=event.feature.getProperty('time');
        }

        else 
        {
            document.getElementById("receive_thp").innerHTML=event.feature.getProperty('received_throughput');
            document.getElementById("send_thp").innerHTML=event.feature.getProperty('sent_throughput');
            document.getElementById("bsu_sig").innerHTML=event.feature.getProperty('base_station_signal_strength');
            document.getElementById("su_sig").innerHTML=event.feature.getProperty('subscriber_unit_signal_strength');
            document.getElementById("bsu_snr").innerHTML=event.feature.getProperty('base_station_SNR');
            document.getElementById("su_snr").innerHTML=event.feature.getProperty('subscriber_unit_SNR');
            document.getElementById("timestamp").innerHTML=event.feature.getProperty('time');
        }
        document.getElementById("detail_box").style.display = "inline";
        
    });

    map.data.addListener('mouseover', function(event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {icon: getCircle(-2)});
    });

    map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
    });
}

function getCircle(mag_normalized) {
    var color = getColor(mag_normalized);
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color, // need to calculate color according to strength
        fillOpacity: 1,
        scale: 8,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: 1,
    };
}

function normalizeMag(mag, max, min) { // normalize to 0-100, 
    if (mag == 999) // connection failure
    {
        return -1;
    }
    else 
    {
        return 100*(mag-min)/(max-min);
    }
}

function getColor(mag) {
    // intensity on a scale range from 0 to 100
    if (mag == -1) 
    {
        return "red"; // return black
    }
    if (mag == -2)
    {
        return "#FFFFFF";
    }

    // // light blue #1FF8FF
    // var top_r = 31;  
    // var top_g = 248;
    // var top_b = 255;

    // 00ff61
    var top_r = 0;  
    var top_g = 255;
    var top_b = 97;
    // green #a0e22d
    var mid_up_r = 160;
    var mid_up_g = 226;
    var mid_up_b = 45;
    // yellow #ffe000
    var mid_r = 255;
    var mid_g = 244;
    var mid_b = 0;
    // orange ff9000
    var btm_r = 255;
    var btm_g = 144;
    var btm_b = 0;    
    // red 
    // var btm_r = 255;
    // var btm_g = 0;
    // var btm_b = 0;

    // color only starts to change at 90% height of the bar
    if (mag >= 75 && mag < 100)
    {
        var r = Math.round(mid_up_r + ((mag-75) * (top_r - mid_up_r)) / 25);
        var g = Math.round(mid_up_g + ((mag-75) * (top_g - mid_up_g)) / 25);
        var b = Math.round(mid_up_b + ((mag-75) * (top_b - mid_up_b)) / 25); 
        return RgbDecToHex(r, g, b);
    }
    else if (mag >= 50 && mag < 75)
    {
        var r = Math.round(mid_r + ((mag-50) * (mid_up_r - mid_r)) / 25);
        var g = Math.round(mid_g + ((mag-50) * (mid_up_g - mid_g)) / 25);
        var b = Math.round(mid_b + ((mag-50) * (mid_up_b - mid_b)) / 25); 
        return RgbDecToHex(r, g, b);
    }
    else
    {
        var r = Math.round(btm_r + (mag * (mid_r - btm_r)) / 50);
        var g = Math.round(btm_g + (mag * (mid_g - btm_g)) / 50);
        var b = Math.round(btm_b + (mag * (mid_b - btm_b)) / 50); 
        return RgbDecToHex(r, g, b);
    } 
}

function RgbDecToHex(r_d, g_d, b_d) {
    // convert to hex strings
    r = r_d.toString(16);
    g = g_d.toString(16);
    b = b_d.toString(16);
    // pad zeroes if necessary
    if (r_d < 16) { r = "0" + r; }
    if (g_d < 16) { g = "0" + g; }
    if (b_d < 16) { b = "0" + b; }

    return ("#" + r + g + b);
}

function datafeed_callback(results) {
    map.data.addGeoJson(results);
}

function close_detail_box(){
    document.getElementById("detail_box").style.display = "none";
}
