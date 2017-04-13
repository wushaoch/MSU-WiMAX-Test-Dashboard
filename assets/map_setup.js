var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: true,
        streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        center: {lat: 42.725166, lng: -84.481115},
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

    map.data.setStyle(function(feature) {
        var mag_normalized = normalizeMag(
                                    feature.getProperty('received_throughput'),
                                    100,
                                    0
                                    );
        return {
            icon: getCircle(mag_normalized)
        };
    });
    

    map.data.addListener('click', function(event) {
        document.getElementById("db_header_text").innerHTML="Data Point";
        document.getElementById("receive_value").innerHTML=event.feature.getProperty('received_throughput');
        document.getElementById("send_value").innerHTML=event.feature.getProperty('sent_throughput');
        document.getElementById("db_value_3").innerHTML=event.feature.getProperty('base_station_signal_strength');
        document.getElementById("db_value_4").innerHTML=event.feature.getProperty('subscriber_unit_signal_strength');
        document.getElementById("db_value_5").innerHTML=event.feature.getProperty('base_station_SNR');
        document.getElementById("db_value_6").innerHTML=event.feature.getProperty('subscriber_unit_SNR');
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
        strokeColor: 'white',
        strokeWeight: 1.5,
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
        console.log("changed to black");
        return "#050505"; // return black
    }
    if (mag == -2)
    {
        return "#00FF00";
    }

    var top_r = 31;  //#1FF8FF
    var top_g = 248;
    var top_b = 255;
    var btm_r = 255;
    var btm_g = 0;
    var btm_b = 0;

    // color only starts to change at 90% height of the bar
    if (mag >= 100)
    {
        return "#1FF8FF";
    }
    else
    {
        var r = Math.round(btm_r + (mag * (top_r - btm_r)) / 100);
        var g = Math.round(btm_g + (mag * (top_g - btm_g)) / 100);
        var b = Math.round(btm_b + (mag * (top_b - btm_b)) / 100); 
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
