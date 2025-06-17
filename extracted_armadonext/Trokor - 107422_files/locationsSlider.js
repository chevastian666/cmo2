function locationsSlider(slider, ele, map) {
  const thisLocSlider = new Object();
  const output = slider.siblings(".slider-output");
  let joinedLocations = [];
  if (ele.hasOwnProperty("ubicaciones")) {
    ele.ubicaciones.forEach((arr, index) => {
      joinedLocations = joinedLocations.concat(arr);
    });
    joinedLocations.sort(
      (locA, locB) => parseInt(locA.tiempo) - parseInt(locB.tiempo)
    );
    if (joinedLocations.length > 0) {
      slider.attr("max", joinedLocations.length - 1);
      slider.val(joinedLocations.length - 1);
      slider[0].oninput = function () {
        const event = joinedLocations[this.value];
        if (event) {
          const timestamp = event.tiempo;
          const date = moment.unix(timestamp);
          const precintoid = event.precintoid;
          const lat = event.lat;
          const lng = event.lng;
          output[0].textContent = date.format("DD/MM/YYYY HH:mm:ss");
          if (!(parseFloat(lat) == 0 && parseFloat(lng) == 0)) {
            ele.marker.movePrecinto(precintoid, lat, lng);
          }
        }
      };
    } else {
      slider.attr("disabled", "disabled");
    }
  }
  return thisLocSlider;
}
