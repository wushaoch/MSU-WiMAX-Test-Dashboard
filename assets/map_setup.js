var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    treetViewControl: true,
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
    var mag = feature.getProperty('received_throughput');
    return {
      icon: getCircle(mag)
    };
  });
  

  map.data.addListener('click', function(event) {
    document.getElementById("db_header_text").innerHTML="Data Point #?";
    document.getElementById("db_value_1").innerHTML=event.feature.getProperty('throughput');
    document.getElementById("db_value_2").innerHTML=event.feature.getProperty('throughput');
    document.getElementById("db_value_3").innerHTML=event.feature.getProperty('throughput');
  });

  map.data.addListener('mouseover', function(event) {
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {icon: getCircle(0)});
  });

  map.data.addListener('mouseout', function(event) {
    map.data.revertStyle();
  });
}

function getCircle(throughput) {
  var color = getColor(throughput / 10 * 100);
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

function getColor(mag) {
  // intensity on a scale range from 0 to 100
  
  var top_r = 31;  //#1FF8FF
  var top_g = 248;
  var top_b = 255;
  var btm_r = 255;
  var btm_g = 0;
  var btm_b = 0;

  // color only starts to change at 70% height of the bar
  if (mag >= 70)
  {
    return "#1FF8FF";
  }
  else
  {
    var r = Math.round(btm_r + (mag * (top_r - btm_r)) / 70);
    var g = Math.round(btm_g + (mag * (top_g - btm_g)) / 70);
    var b = Math.round(btm_b + (mag * (top_b - btm_b)) / 70); 
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
