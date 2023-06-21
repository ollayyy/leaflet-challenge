// url
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// initialize the map

const map = L.map("map", {
    center: [37.8, -122.4],
    zoom: 5
});

// tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib2xpdmVyZXZlIiwiYSI6ImNsajRxczgwbTAzcjkzZXAycTRjMWd5bmUifQ.84G0u-0ogazgAh7Emu4_tQ", {
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

// funtion for marker size based on earthquake mag
function markerSize(magnitude) {
    return magnitude * 20000;
}

// function for marker color based on earthquake depth
function markerColor(depth) {
    if (depth < 10) return "#ADFF2F"; // light green
    if (depth < 30) return "#FFD700"; // gold
    if (depth < 50) return "#FFA500"; // orange
    if (depth < 70) return "#FF8C00"; // dark orange
    if (depth < 90) return "#FF4500"; // red orange
    return "#FF0000"; // red
}

// get earthquake data with d3 and add to markers
d3.json(url).then(data => {
    L.geoJSON(data, {
        // function to create circle marker for each earthquake
        pointToLayer: (feature, latlng) => {
            const markerOptions = {
                radius: markerSize(feature.properties.mag), //marker size based on magnitude
                fillColor: markerColor(feature.geometry.coordinates[2]), // marker color based on depth
                color: "#000", // border color to black
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circle(latlng, markerOptions); //circle marker with options
        },
        // popup with info
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p`);

        }
    }).addTo(map); //add geojson layer to map
});


// create legend
let legend = L.control({ position: 'bottomright' });

//function to add legend to map
legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 10, 30, 50, 70, 90]; // depth grades
    var labels = [];
    var legendInfo = "<h4>Depth</h4>"; // header

    div.innerHTML = legendInfo;

    //iterate through each depth grade to label/color legend  and push to label array
    for (var i =0; i < grades.length; i++) {
        var color = markerColor(grades[i]); // color based on depth
        var label = '<ul style="background-color:' + color + '"><span>' + (grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km' : '+ km')) + '</span></ul>';
        labels.push(label);
    }

    // add label item to div under <ul>
    div.innerHTML += "<ul>" + labels.join("") + "</ul";

    //CSS style for border on legend
    div.style.backgroundColor = '#ffffff'; //white
    div.style.padding = '10px';
    div.style.border = '1px solid #ccc';
    return div;
};
//add legend
legend.addTo(map);