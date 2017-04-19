

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        scaleControl: true,
        zoom: 14,
        minZoom: 14,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        center: {lat: 42.70444651, lng: -84.48442291000003}, // 42.70444651, -84.48442291000003
        // center: {lat: -25.363, lng: 131.044}, // test for window
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        rotateControl: true,
    });

    // geolocation
    var infoWindow;

    infoWindow = new google.maps.InfoWindow;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent('You Are Here');
        infoWindow.open(map);
        // map.setCenter(pos); // center the map to current location
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }



    // legend
    var legend = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    // // detail window
    // var detail_box = document.getElementById('detail_box');
    // map.controls[google.maps.ControlPosition.LEFT_TOP].push(detail_box);

    // Create a <script> tag and the source.
    var script = document.createElement('script');

    script.src = 'convert/master.json';
    document.getElementsByTagName('head')[0].appendChild(script);

    // // attempt to make heatmap
    // var heatmap = new google.maps.visualization.HeatmapLayer({
    //     data: map.
        
    // });

    // heatmap.setMap(map);


    var base_station = {lat: 42.7176737, lng: -84.48485924};
    var base_station_image = "assets/triangle.png";

    var base_station_marker = new google.maps.Marker({
        position: base_station,
        map: map,
        icon: base_station_image,
    });

    // 90 degree white border lines

    var borderLinesCoordinates = [ 
        {lat: 42.686397,  lng: -84.52909124}, // left point : 42.692970, -84.515050
        {lat: 42.7176737, lng: -84.48485924}, // base station
        {lat: 42.686397,  lng: -84.44062724}  // right point: 42.690573, -84.456670
    ];

    var borderLinesWhite = new google.maps.Polyline({
      path: borderLinesCoordinates,
      geodesic: true,
      strokeColor: '#FFFFFF',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });

    borderLinesWhite.setMap(map);

    // dim the legend when dragging

    map.data.addListener('drag', function(event) {
        document.getElementById("legend").style.opacity = "0";
    });

    // update detail box (which is on top left)

    map.data.addListener('click', function(event) {

        
        var receive_thp = event.feature.getProperty('received_throughput');
        var time        = event.feature.getProperty('time');
        var pos         = event.feature.getGeometry().get();
        var id          = event.feature.getProperty('id');

        
        var window_content_header = "";
        var window_content_body = "";
        var window_content_footer = "";


        // header content

        if (receive_thp == 999)
        {
            window_content_header = "<b style='color:red;'>NO CONNECTION</b>";
        }
        else {
    
            if (receive_thp < 25) {
                window_content_header = "<b style='color:#FF9000;'>POOR CONNECTION</b>"; 
            }
            else {
                window_content_header = "<b style='color:green;'>SUCCESSFUL CONNECTION</b>";
            }

            // body content if there is receive throughput
            var send_thp    = event.feature.getProperty('sent_throughput');
            var bsu_sig     = event.feature.getProperty('base_station_signal_strength');
            var su_sig      = event.feature.getProperty('subscriber_unit_signal_strength');
            var bsu_snr     = event.feature.getProperty('base_station_SNR');
            var su_snr      = event.feature.getProperty('subscriber_unit_SNR');
            window_content_body = "Received Throughput: <b>" + receive_thp + "</b> Mbps<br>"
                                + "Sent Throughput: <b>" + send_thp + "</b> Mbps<br>"
                                + "BSU Signal: <b>" + bsu_sig + "</b> dBm<br>"
                                + "SU Signal: <b>" + su_sig + "</b> dBm<br>"
                                + "BSU SNR: <b>" + bsu_snr + "</b> dB<br>"
                                + "SU SNR: <b>" + su_snr + "</b> dB<br>";

        }

        // footer content
        window_content_footer =  "Date: " + time + "<br>" + "ID: " + id;

        // put window content together
        window_content_header = "<h4 id='info_window_header'>" + window_content_header + "</h4>";
        window_content_body   = "<p  id='info_window_body'>"   + window_content_body   + "</p>";
        window_content_footer = "<p  id='info_window_footer'>" + window_content_footer + "</p>";
        
        var window_content = window_content_header + window_content_body + window_content_footer;

        // move to point clicked, set window content
        infoWindow.setPosition(pos);
        infoWindow.setContent(window_content);
        infoWindow.open(map);
        map.panTo(pos);

        if (doesPhotoIDExist(id) == true)
        {

            var photoURL = "'photos/" + id + ".jpg'";
            var modal = document.getElementById('myModal');
            var modal_content = document.getElementById('modal_content');
            var btn = document.getElementById("info_window_header");

            // add underline to those who have photo
            var info_window_header = document.getElementById('info_window_header');
            info_window_header.setAttribute("class", "underline");

            // add photo to modal
            modal_content.setAttribute("style", 
                "background-image: url(" + photoURL + "); \
                background-size: cover; \
                background-repeat: no-repeat; \
                background-position: 50% 50%; \
            ");

            // When the user clicks on the button, open the modal 
            btn.onclick = function() {
                modal.style.display = "block";
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }


    });

    // create circles for data points
    map.data.setStyle(function(feature) {
        var mag_normalized = normalizeMag(
                            feature.getProperty('sent_throughput'),
                            100,
                            0
                            );
        if (doesPhotoIDExist(feature.getProperty('id')) == true)
        {
            var stroke_color_value = "#fff";
        }
        else
        {
            var stroke_color_value = "black";
        }
        return {
            icon: getCircle(mag_normalized, 7, 2, 0.8, stroke_color_value)
        };
    });

    // circle becomes bigger and bolder when mouse hover over
    map.data.addListener('mouseover', function(event) {
        map.data.revertStyle();
        // map.data.overrideStyle();
        var mag_normalized = normalizeMag(
                            event.feature.getProperty('sent_throughput'),
                            100,
                            0
                            );
        if (doesPhotoIDExist(event.feature.getProperty('id')) == true)
        {
            var stroke_color_value = "#fff";
        }
        else
        {
            var stroke_color_value = "black";
        }
        map.data.overrideStyle(event.feature, {icon: getCircle(mag_normalized, 11, 3, 1, stroke_color_value)});
    });

    map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
    });

}

// // zoom limit

// google.maps.event.addListener(map, 'zoom_changed', function() {
//     zoomChangeBoundsListener = 
//         google.maps.event.addListener(map, 'bounds_changed', function(event) {
//             if (this.getZoom() < 14 && this.initialZoom == true) {
//                 // Change max/min zoom here
//                 this.setZoom(14);
//                 this.initialZoom = false;
//             }
//         google.maps.event.removeListener(zoomChangeBoundsListener);
//     });
// });
// map.initialZoom = true;
// map.fitBounds(bounds);


// data circles

function getCircle(mag_normalized, circle_scale=7, stroke=2, opacity=0.8, stroke_color='black') {
    var color = getColor(mag_normalized);
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: opacity,
        scale: circle_scale,
        strokeColor: stroke_color,
        strokeWeight: stroke,
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
