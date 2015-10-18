L.mapbox.accessToken = 'pk.eyJ1IjoiYWxscnlkZXIiLCJhIjoidWs5cUFfRSJ9.t8kxvO3nIhCaAl07-4lkNw';
var map = L.mapbox.map('map', 'mapbox.light', {
    center: [6.664608, 36.386719],
    zoom: 2,
    zoomControl: false
});

new L.Control.Zoom({
    position: 'bottomright'
}).addTo(map);

var osmGeoJSON;

function getOSM(type, id) {
    console.log(type, id);
    var data = type + "(" + id + "); (._; > ;);out;";
    $.post('http://overpass-api.de/api/interpreter', {
            data
        })
        .done(function(data) {
            osmGeoJSON = osmtogeojson(data);
            if (osmGeoJSON.features.length > 0) {
                var osmFeatureLayer = L.mapbox.featureLayer()
                    .setGeoJSON(osmGeoJSON)
                    .addTo(map);
                map.fitBounds(osmFeatureLayer.getBounds());
                osmFeatureLayer.eachLayer(function(layer) {
                    var content = "<table><tbody>";
                    var tags = layer.feature.properties.tags;
                    for (var tag in tags) {
                        tagValue = tags[tag];
                        content += "<tr><th> " + tag + " </th><td>&nbsp;" + tagValue + " </td></tr>"
                    };
                    content += "</tbody></table>";
                    layer.bindPopup(content);
                });
                downloadGeoJSON(osmGeoJSON, type, id);
            } else {
                message = "There is no " + type + " with ID " + id
                alert(message)
            }
        })
};



var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=')

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1].replace('/', '');
        }
    }
};

function downloadGeoJSON(geojson, type, id) {
    var fileName = type + "_" + id + ".geojson"
    var content = JSON.stringify(geojson);
    saveAs(new Blob([content], {
        type: 'text/plain;charset=utf-8'
    }), fileName);
}

var wayID = getUrlParameter('wayID');
var nodeID = getUrlParameter('nodeID');
var relationID = getUrlParameter('relationID');



if (typeof wayID !== "undefined") {
    $("#id_input").val(wayID);
    getOSM('way', wayID);
}

if (typeof nodeID !== "undefined") {
    $("#id_input").val(nodeID);
    getOSM('node', nodeID);
}

if (typeof relationID !== "undefined") {
    $("#id_input").val(relationID);
    getOSM('relation', relationID);
}


$(':input:checked').parent('.btn').addClass('active');
$("#find_btn").click(function() {
    var id = $("#id_input").val();
    var type;
    $('.btn').each(function(i, btn){
        if($(btn).hasClass('active') ){
            type = $(btn).children().val();
        }
    });
    getOSM(type, id);
});
