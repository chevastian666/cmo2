const styles = [
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

var TrMap = (function () {
  let instance;
  function createInstance(config) {
    const thisMap = new Object();
    if (document.getElementById("map")) {
      thisMap.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -32.6011, lng: -56.1645 },
        zoom: 7,
        mapTypeId: "roadmap",
        styles: styles,
        fullscreenControl: false,
        streetViewControl: false,
      });

      thisMap.allShapes = [];
      thisMap.markers = [];

      thisMap.addAlarmMarker = function (alarm) {
        return thisMap.addMarker(alarm, "alarm");
      };

      thisMap.addTripMarker = function (ele) {
        return thisMap.addMarker(ele);
      };

      thisMap.addMarker = function (ele, markerType = "trip") {
        let positions = [];
        if (
          ele.hasOwnProperty("ultimasubicaciones") &&
          ele.ultimasubicaciones.length > 0
        ) {
          ele.ultimasubicaciones.forEach((prec) => {
            let last = prec[0];
            if (!(parseFloat(last.lat) == 0 && parseFloat(last.lng) == 0)) {
              positions.push({
                precintoid: last.precintoid,
                latLng: new google.maps.LatLng(
                  parseFloat(last.lat),
                  parseFloat(last.lng)
                ),
              });
            }
          });
        }
        let historialMarkers = [];
        if (ele.hasOwnProperty("historial") && ele.historial.length > 0) {
          ele.historial.forEach((historyEle) => {
            console.log("%chistoryElement", "color: #29abe2");
            console.log(historyEle);
            if (
              !(
                parseFloat(historyEle.lat) == 0 &&
                parseFloat(historyEle.lng) == 0
              )
            ) {
              historyElePosition = new google.maps.LatLng(
                parseFloat(historyEle.lat),
                parseFloat(historyEle.lng)
              );
              let type = "";
              let label = historyEle.user.name;
              switch (historyEle.status) {
                case "1":
                  type = "armado";
                  label = "Armado " + historyEle.user.name;
                  break;
                case "2":
                  type = "desarmado";
                  label = "Desarmado " + historyEle.user.name;
                  break;
                case "3":
                  type = "cambiado";
                  label = "Cambiado " + historyEle.user.name;
                  break;
              }
              let historyElementMarker = thisMap.createMarker(
                type,
                historyElePosition,
                label
              );
              historyElementMarker.setMap(null);
              historialMarkers.push(historyElementMarker);
            }
          });
        }

        let markerObj = {
          pvid: ele.pvid,
          markers: [],
          alarms: [],
          historial: historialMarkers,
          trips: [],
          precintos: positions.map((pos) => pos.precintoid),
        };
        if (markerType == "alarm") {
          if (!(parseFloat(ele.lat) == 0 && parseFloat(ele.lng) == 0)) {
            const alarmPosition = new google.maps.LatLng(
              parseFloat(ele.lat),
              parseFloat(ele.lng)
            );
            const alarmMarker = thisMap.createMarker(
              "alarma",
              alarmPosition,
              ele.pvaid,
              ele.type
            );
            markerObj.alarms.push(alarmMarker);
          }
        }
        markerObj.highlight = function () {
          markerObj.markers.forEach((marker) => {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          });
          setTimeout(() => {
            markerObj.markers.forEach((marker) => {
              marker.setAnimation(null);
            });
          }, 700);
        };
        markerObj.showEvents = function (show) {
          markerObj.historial.forEach((histMarker) => {
            histMarker.setMap(show ? thisMap.map : null);
          });
          markerObj.trips.forEach((singleTrip) =>
            singleTrip.setMap(show ? thisMap.map : null)
          );
        };
        markerObj.deleteMarker = function () {
          markerObj.markers.forEach((marker) => marker.setMap(null));
          markerObj.alarms.forEach((alarm) => alarm.setMap(null));
        };
        markerObj.show = function (show, showDetails = false) {
          if (show) {
            markerObj.markers.forEach((marker) => marker.setMap(thisMap.map));
            markerObj.alarms.forEach((alarm) => alarm.setMap(thisMap.map));
            markerObj.showEvents(showDetails);
          } else {
            markerObj.markers.forEach((marker) => marker.setMap(null));
            markerObj.alarms.forEach((alarm) => alarm.setMap(null));
            markerObj.showEvents(false);
          }
        };
        markerObj.updateLocation = function (newEle) {
          let positions = [];
          if (
            newEle.hasOwnProperty("ultimasubicaciones") &&
            newEle.ultimasubicaciones.length > 0
          ) {
            newEle.ultimasubicaciones.forEach((prec) => {
              let last = prec[0];
              if (!(parseFloat(last.lat) == 0 && parseFloat(last.lng) == 0)) {
                positions.push({
                  precintoid: last.precintoid,
                  latLng: new google.maps.LatLng(
                    parseFloat(last.lat),
                    parseFloat(last.lng)
                  ),
                });
              }
            });
          }
          for (let index = positions.length - 1; index >= 0; index--) {
            const position = positions[index];
            if (markerObj.markers.length > index) {
              markerObj.markers[index].setPosition(position.latLng);
            } else {
              let marker = thisMap.createMarker(
                "transito",
                position.latLng,
                position.precintoid
              );
              marker.precintoid = position.precintoid;
              console.log("%cAdd marker", "color: #29abe2");
              console.log(position);
              markerObj.markers.push(marker);
            }
          }
          for (
            let markerIndex = markerObj.markers.length - 1;
            markerIndex >= positions.length;
            markerIndex--
          ) {
            markerObj.markers[markerIndex].setMap(null);
            markerObj.markers.splice(markerIndex, 1);
          }
        };
        markerObj.locate = function () {
          var bounds = new google.maps.LatLngBounds();
          markerObj.markers.forEach((marker) => {
            bounds.extend(marker.getPosition());
          });
          markerObj.historial.forEach((histMarker) => {
            if (histMarker.getMap() != null) {
              bounds.extend(histMarker.getPosition());
            }
          });
          markerObj.alarms.forEach((alarmMarker) => {
            if (alarmMarker.getMap() != null) {
              bounds.extend(alarmMarker.getPosition());
            }
          });
          markerObj.trips.forEach((tripPath) => {
            if (tripPath.getMap() != null) {
              let path = tripPath.getPath();
              for (let i = 0; i < path.length; i++) {
                const point = path.getAt(i);
                bounds.extend(point);
              }
            }
          });
          thisMap.map.fitBounds(bounds);
          if (thisMap.map.getZoom() > 20) {
            thisMap.map.setZoom(20);
          }
        };

        markerObj.movePrecinto = function (precintoid, lat, lng) {
          markerObj.markers.forEach((marker, index) => {
            if (markerObj.precintos[index] == precintoid) {
              if (!(parseFloat(lat) == 0 && parseFloat(lng) == 0)) {
                let position = new google.maps.LatLng({
                  lat: parseFloat(lat),
                  lng: parseFloat(lng),
                });
                marker.setPosition(position);
              }
            }
          });
        };

        markerObj.updateTrip = function (trips) {
          if (markerObj.hasOwnProperty("trips")) {
            markerObj.trips.forEach((existingTrip) => {
              existingTrip.setMap(null);
            });
          }
          markerObj.trips = [];
          trips.forEach((prec) => {
            let tripPath = prec
              .filter(
                (point) =>
                  !(parseFloat(point.lat) == 0 && parseFloat(point.lng) == 0)
              )
              .map((point) => {
                return {
                  lat: parseFloat(point.lat),
                  lng: parseFloat(point.lng),
                };
              });
            let singleTrip = new google.maps.Polyline({
              path: tripPath,
              geodesic: true,
              strokeColor: "#e83e8c",
              strokeOpacity: 1.0,
              strokeWeight: 0.5,
            });
            singleTrip.setMap(thisMap.map);
            thisMap.allShapes.push(singleTrip);
            markerObj.trips.push(singleTrip);
          });
        };

        markerObj.addTrip = function (trips) {
          markerObj.updateTrip(trips);
          markerObj.locate();
        };
        positions.forEach((position) => {
          if (!(position.latLng.lat() == 0 && position.latLng.lng() == 0)) {
            let marker = thisMap.createMarker(
              "transito",
              position.latLng,
              position.precintoid
            );
            marker.precintoid = position.precintoid;
            console.log("%cAdd marker", "color: #29abe2");
            console.log(position);
            markerObj.markers.push(marker);
          }
        });
        thisMap.markers.push(markerObj);
        return markerObj;
      };

      thisMap.locateLatLng = (lat, lng) => {
        if (!(parseFloat(lat) == 0 && parseFloat(lng) == 0)) {
          var centerLatLng = new google.maps.LatLng({
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          });
          thisMap.map.setCenter(centerLatLng);
          thisMap.map.setZoom(20);
        }
      };

      thisMap.clearMarkers = () => {
        for (let i = thisMap.allShapes.length - 1; i >= 0; i--) {
          const shape = thisMap.allShapes[i];
          shape.setMap(null);
        }
      };

      thisMap.locateAll = () => {
        var bounds = new google.maps.LatLngBounds();
        console.log("%clocateAll markers", "color: #29abe2");
        console.log(thisMap.markers);
        let any = false;
        thisMap.markers.forEach((element) => {
          if (element.hasOwnProperty("markers")) {
            element.markers.forEach((marker) => {
              if (marker.getMap() != null) {
                console.log(
                  marker.getPosition().lat(),
                  marker.getPosition().lng()
                );
                bounds.extend(marker.getPosition());
                any = true;
              }
            });
            element.historial.forEach((historialMarker) => {
              if (historialMarker.getMap() != null) {
                console.log(
                  marker.getPosition().lat(),
                  marker.getPosition().lng()
                );
                bounds.extend(historialMarker.getPosition());
                any = true;
              }
            });
          }
        });
        if (any) {
          thisMap.map.fitBounds(bounds);
          if (thisMap.map.getZoom() > 20) {
            thisMap.map.setZoom(20);
          }
        } else {
          alert("No hay ubicaciones válidas");
        }
      };

      thisMap.createMarker = (type, position, id, labelText = null) => {
        let iconUrl = "/sc/img/map-marker-single.png?v=3";
        let label = {
          text: labelText != null ? labelText : id,
          color: "#333530",
          fontWeight: "bold",
        };
        let labelOriginX = 0.75;
        let labelOriginY = 0.75;
        switch (type) {
          case "transito":
            iconUrl = "/sc/img/map-marker.png?v=3";
            label.text = "Prec. " + id;
            break;
          case "alarma":
            iconUrl = "/sc/img/map-marker-alarm.png?v=6";
            label = labelText;
            break;
          case "armado":
            iconUrl = "/sc/img/marker-arm.png?v=7";
            label = null;
            break;
          case "desarmado":
            iconUrl = "/sc/img/marker-disarm.png?v=7";
            label = null;
            break;
          default:
            iconUrl = "/sc/img/map-marker-single.png?v=3";
            break;
        }
        const icon = {
          url: iconUrl,
          size: new google.maps.Size(76, 76),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(
            MAP_MARKER_SIZE / 2,
            MAP_MARKER_SIZE / 2
          ),
          scaledSize: new google.maps.Size(MAP_MARKER_SIZE, MAP_MARKER_SIZE),
          labelOrigin: new google.maps.Point(
            labelOriginX * MAP_MARKER_SIZE,
            labelOriginY * MAP_MARKER_SIZE
          ),
        };
        const marker = new google.maps.Marker({
          map: thisMap.map,
          icon: icon,
          title: type + "-" + id,
          position: position,
          label: label,
        });
        marker.type = type;
        thisMap.allShapes.push(marker);
        return marker;
      };

      thisMap.locateBounds = (latLongs) => {
        console.log("locateBounds", latLongs);
        const bounds = new google.maps.LatLngBounds();
        latLongs.forEach((latLng) => {
          console.log("%clatLng", "color: #29abe2");
          console.log(latLng);
          if (
            !(parseFloat(latLng.lat()) == 0 && parseFloat(latLng.lng()) == 0)
          ) {
            bounds.extend({
              lat: parseFloat(latLng.lat),
              lng: parseFloat(latLng.lng),
            });
          }
        });
        thisMap.map.fitBounds(bounds);
      };
    }
    return thisMap;
  }

  return {
    getInstance: function (config) {
      if (!instance) {
        instance = createInstance(config);
      }
      return instance;
    },
  };
})();
