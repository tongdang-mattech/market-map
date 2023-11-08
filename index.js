var map;
var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow({
  disableAutoPan: true,
});
var center = new google.maps.LatLng(38.78436574258653, -77.0150403423293);
var bounds;
var zoom = 6;
var infoBubble;
var markers = [];
var markerClusters = [];

const icon_marker = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 10C19 13.9765 12 21 12 21C12 21 5 13.9765 5 10C5 6.02355 8.13401 3 12 3C15.866 3 19 6.02355 19 10Z" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`;

const TYPES = [
  { type: "Barge Facility", color: "#335bff", path: "./assets/icon1/m" },
  { type: "CDD Landfill", color: "#00a77a", path: "./assets/icon2/m" },
  { type: "Industrial Landfill", color: "#00a77a", path: "./assets/icon2/m" },
  { type: "MRF", color: "#008cff", path: "./assets/icon3/m" },
  {
    type: "Materials Recovery Facility",
    color: "#008cff",
    path: "./assets/icon3/m",
  },
  { type: "Sanitary Landfill", color: "#00a77a", path: "./assets/icon2/m" },
  { type: "Transfer Station", color: "#b700ff", path: "./assets/icon4/m" },
  { type: "Waste Pile", color: "#335bff", path: "./assets/icon1/m" },
];

let data = [];
async function init() {
  data = await fetch("./data.json").then((res) => res.json());
  data = data.filter((item) => item.lat && item.lng);
  data = data.filter(
    (v, i, a) =>
      a.findIndex((v2) => v2["Facility Name"] === v["Facility Name"]) === i
  );
  var mapOptions = {
    zoom: zoom,
    maxZoom: 22,
    minZoom: 4,
    tilt: 45,
    center: center,
    mapTypeControl: false,
    clickableIcons: false,
    // mapTypeId: "satellite",
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  infoBubble = new InfoBubble({
    map: map,
    shadowStyle: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 0,
    borderColor: "#2c2c2c",
    disableAutoPan: true,
    hideCloseButton: true,
    minWidth: 250,
    maxWidth: 600,
    padding: 0,
    zIndex: 1,
    disableAnimation: true,
  });
  setMarkers(data);
}

window.onload = () => {
  init();
};

function setMarkers(items) {
  bounds = new google.maps.LatLngBounds();
  for (const key in items) {
    const latLng = new google.maps.LatLng(items[key].lat, items[key].lng);
    const value = items[key]["Process Rate/Daily Disposal Limit"];
    const scale = parseInt(value / 1000) != 0 ? parseInt(value / 1000) + 5 : 5;
    let content_html = `<div style="font-size:14px;
                            padding: 8px;
                            font-weight: 600; 
                            word-wrap: break-word;
                            white-space: normal;">
                        <span>${items[key]["Facility Name"]}</span>
                    </div>`;
    content_html += `<div style="font-size:14px;
                            padding: 0 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span>${icon_marker}</span>
                        <span>${items[key]["Loc City/Town"]}, VA, USA</span>
                    </div>`;
    content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">Ownership Type:</span>
                        <span>${items[key]["Ownership Type"]}</span>
                    </div>`;
    content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">Unit Type:</span>
                        <span>${items[key]["Unit Type"]}</span>
                    </div>`;
    content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">T/S/D:</span>
                        <span>${items[key]["T/S/D"]}</span>
                    </div>`;
    content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">Unit Status:</span>
                        <span>${items[key]["Unit Status"]}</span>
                    </div>`;
    if (items[key]["Process Rate/Daily Disposal Limit"]) {
      content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">Process Rate/Daily Disposal Limit:</span>
                        <span>${numberWithCommas(
                          items[key]["Process Rate/Daily Disposal Limit"]
                        )} ${
        items[key]["Process Rate/Daily Disposal Limit UOM"]
      }</span>
                    </div>`;
    }
    if (items[key]["Waste Storage/Total Capacity"]) {
      content_html += `<div style="font-size:14px;
                            padding: 4px 8px;
                            word-wrap: break-word;
                            white-space: normal;">
                        <span style="font-weight: 500">Waste Storage/Total Capacity:</span>
                        <span>${numberWithCommas(
                          items[key]["Waste Storage/Total Capacity"]
                        )} ${
        items[key]["Waste Storage/Total Capacity UOM"]
      }</span>
                    </div>`;
    }
    TYPES.forEach((TYPE) => {
      if (TYPE.type == items[key]["Unit Type"]) {
        const color = TYPE.color;
        const marker = new google.maps.Marker({
          position: latLng,
          map: map,
          clickable: true,
          icon: {
            path: 0.0,
            scale: scale,
            fillOpacity: 1,
            strokeWeight: 2,
            fillColor: color,
            strokeColor: "#ffffff",
          },
        });
        infoBubble.setPosition(latLng);
        marker.addListener("click", function () {
          infoBubble.setContent(content_html);
          infoBubble.open(map, this);
        });
        if (!markers[TYPE.type]) markers[TYPE.type] = [];
        markers[TYPE.type].push(marker);
      }
      bounds.extend(latLng);
    });
  }
  map.fitBounds(bounds);
  map.addListener("click", function () {
    infoBubble.close();
  });

  TYPES.forEach((TYPE) => {
    markerClusters[TYPE.type] = new MarkerClusterer(map, markers[TYPE.type], {
      imagePath: TYPE.path,
      minimumClusterSize: 2,
      maxZoom: 8,
    });
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
