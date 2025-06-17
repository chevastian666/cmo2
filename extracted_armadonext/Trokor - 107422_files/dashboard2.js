let dash;
moment.locale("es");
moment.updateLocale("es", {
  relativeTime: {
    future: "en %s",
    past: "%s",
    s: "%d seg",
    ss: "%d segs",
    m: "%d min",
    mm: "%d mins",
    h: "%d hr",
    hh: "%d hrs",
    d: "%d día",
    dd: "%d días",
    w: "%d semana",
    ww: "%d semanas",
    M: "%d mes",
    MM: "%d meses",
    y: "%d año",
    yy: "%d años",
  },
});
const MAP_MARKER_SIZE = 48;

var Dashboard = (function () {
  //singleton pattern for Dashboard
  const INTERVAL_PERIOD = 10000;
  let instance;

  function createInstance(config) {
    const thisDash = new Object();
    thisDash.paths = [];
    thisDash.currentFilter = null;
    thisDash.resultList = $("#result-list");
    if (thisDash.resultList.length > 0) {
      thisDash.toggleShowAllButton = $(".btn-show-all-viajes");
      thisDash.locateAllButton = $(".btn-locate-all-viajes");
      thisDash.total = 0;
      thisDash.offset = 0;
      thisDash.limit = 10;
      thisDash.currentEle = null;
      thisDash.singleLoading = false;

      thisDash.toggleShowAllButton.on("click", function () {
        let anyHidden = false;
        thisDash.transito.forEach(
          (ele) => (anyHidden = anyHidden || !ele.show)
        );
        thisDash.transito.forEach((ele) => {
          if ((anyHidden && !ele.show) || (!anyHidden && ele.show)) {
            thisDash.showEle(ele);
          }
        });
        thisDash.updateShowStatus();
      });

      thisDash.search = (params, offset = 0, clear = true) => {
        if (params == null) {
          params = thisDash.filters.getFilters();
        }
        if (!params.status) {
          params.status = 1;
        }
        params.offset = offset;
        thisDash.offset = offset;
        params.limit = thisDash.limit;
        if (clear) {
          $("#result-list").html("");
          let loader = $("#spinner-template").clone();
          loader.attr("id", "search-loader");
          $("#result-list").append(loader);
        }
        callApi("search", params, (response) => {
          if (response.status) {
            if (response.status == "fail") {
              alert(response.msg);
            }
          }
          //console.log("Success:", response);
          thisDash.parseData({ transito: response.data }, clear);
          if (response.hasOwnProperty("total")) {
            thisDash.total = response.total;
          } /* else {
          thisDash.total = response.data.length;
        }*/
          $("#result-list #search-loader").remove();
          thisDash.render();
          window.updateColumns($("#result-list .ref-element"));
        });
      };

      thisDash.filters = DashFilters.getInstance({
        callback: (filterParams, tab) => thisDash.search(filterParams),
        actionUrl: thisDash.actionUrl,
      });

      thisDash.pagination = Pagination.getInstance({
        container: $("#map-side-panel .pagination"),
        callback: (offset) => {
          thisDash.offset = offset;
          thisDash.search(null, offset);
        },
      });

      thisDash.trMap = TrMap.getInstance({});

      thisDash.alarms = Alarms.getInstance({
        container: $("#alarms-container"),
        callApi: callApi,
        map: thisDash.trMap,
      });

      thisDash.locateAllButton.on("click", function () {
        thisDash.trMap.locateAll();
      });

      thisDash.parseData = (data, clear) => {
        console.log("parseData", data, clear);
        if (clear) {
          if (data.transito) {
            thisDash.transito = data.transito;
          } else {
            thisDash.transito = [];
          }
          thisDash.trMap.clearMarkers();
          thisDash.transito.forEach((ele) => {
            ele.marker = thisDash.trMap.addTripMarker(ele);
          });
        } else {
          if (thisDash.transito && data.transito) {
            console.log("transito", data.transito);
            for (
              let index = thisDash.transito.length - 1;
              index >= 0;
              index--
            ) {
              const ele = thisDash.transito[index];
              console.log(ele.pvid, "update ele", ele);
              let stillExists = false;
              data.transito.forEach((newEle) => {
                if (newEle.pvid == ele.pvid) {
                  console.log(newEle.pvid, "edit existing ele", newEle);
                  if (ele.marker) {
                    ele.marker.updateLocation(newEle);
                  }
                  stillExists = true;
                }
              });
              if (!stillExists) {
                if (ele.marker) {
                  ele.marker.deleteMarker();
                  ele.marker = null;
                }
                thisDash.transito.splice(index, 1);
              }
            }
            data.transito.forEach((newEle) => {
              console.log(newEle.pvid, "new newEle", newEle);
              let exists = false;

              thisDash.transito.forEach((ele) => {
                if (ele.pvid == newEle.pvid) {
                  exists = true;
                }
              });
              if (!exists) {
                thisDash.transito.push(newEle);
                newEle.marker = thisDash.trMap.addTripMarker(newEle);
              } else {
              }
            });
          }
        }
      };

      thisDash.render = (clear = true) => {
        if (thisDash.currentEle == null) {
          $(".viaje-details").hide();
          if (clear) {
            thisDash.resultList
              .find(".single-result:not(.ref-element)")
              .remove();
          }
          if (thisDash.transito) {
            thisDash.transito.forEach((ele) => {
              if (!ele.hasOwnProperty("dom")) {
                ele.dom = createSingleResult(thisDash, ele, clear);
              }
              $("#result-list").append(ele.dom);
            });
            thisDash.updateShowStatus();
            thisDash.pagination.update(
              thisDash.total,
              thisDash.limit,
              thisDash.offset
            );
            window.updateColumns($("#result-list .ref-element"));
            window.matchColumns(true);
          }
        } else {
          $(".viaje-details").show();
          if (thisDash.singleLoading) {
            //$(".viaje-details").html("");
            let loader = $("#spinner-template").clone();
            loader.attr("id", "single-loader");
            $(".viaje-details").prepend(loader);
          } else {
            $(".viaje-details #single-loader").remove();
            createSingleResult(thisDash, thisDash.currentEle, clear);
          }
        }
      };

      const refElement = createSingleResult(thisDash, {});
      //console.log("refElement", refElement);
      refElement.addClass("ref-element");
      $("#result-list").append(refElement);
      window.updateColumns(refElement);

      thisDash.update = () => {
        console.log("update");
        thisDash.fetchDash();
      };

      thisDash.fetchDash = () => {
        console.log("filters", thisDash.filters);
        console.log("currentEle", thisDash.currentEle);
        if (thisDash.currentEle != null) {
          console.log("%cupdate single", "color: #29abe2");
          thisDash.getSingle(thisDash.currentEle, false);
        } else {
          console.log("%cupdate search", "color: #29abe2");
          thisDash.search(
            thisDash.filters.getFilters(),
            thisDash.offset,
            false
          );
        }
      };

      thisDash.showPvid = (pvid) => {
        let currEle = null;
        thisDash.transito.forEach((ele) => {
          if (ele.pvid == pvid) {
            currEle = ele;
          }
        });
        if (currEle != null) {
          let anyHidden = false;
          thisDash.transito.forEach(
            (ele) => (anyHidden = anyHidden || !ele.show)
          );
          if (!anyHidden) {
            thisDash.transito.forEach((ele) => (ele.show = false));
            currEle.show = true;
          } else {
            const show = !currEle.show;
            currEle.show = show;
          }
          thisDash.updateShowStatus();
        }
      };

      thisDash.showEle = (currEle) => {
        let anyHidden = false;
        thisDash.transito.forEach(
          (ele) => (anyHidden = anyHidden || !ele.show)
        );
        if (!anyHidden) {
          thisDash.transito.forEach((ele) => (ele.show = false));
          currEle.show = true;
        } else {
          const show = !currEle.show;
          currEle.show = show;
        }
        thisDash.updateShowStatus();
      };

      thisDash.locateInMap = (pvid) => {
        let currEle = null;
        thisDash.transito.forEach((ele) => {
          if (ele.pvid == pvid) {
            currEle = ele;
          }
        });
        if (currEle != null) {
          if (currEle.marker) {
            currEle.show = true;
            currEle.marker.locate();
          }
        }
      };

      thisDash.getSingle = (currEle, clear = true) => {
        console.log("currEle", currEle);
        let params = { interval: 30, pvid: parseInt(currEle.pvid) };
        if (clear) {
          thisDash.singleLoading = true;
          thisDash.render();
        }
        callApi("single", params, (response) => {
          console.log("single Success:", "color: #29abe2");
          console.log(response);
          thisDash.singleLoading = false;
          if (response.data) {
            if (clear) {
              thisDash.trMap.clearMarkers();
              if (response.data.ubicaciones) {
                let ubicaciones = response.data.ubicaciones;
                currEle.ubicaciones = ubicaciones;
                currEle.marker.addTrip(currEle.ubicaciones);
              }
              thisDash.updateShowStatus();
              thisDash.render();
              currEle.marker.locate();
            } else {
              console.log("%cupdate single", "color: #29abe2");
              console.log(response.data.ubicaciones);
              let ubicaciones = response.data.ubicaciones;
              currEle.ubicaciones = ubicaciones;
              currEle.marker.updateTrip(currEle.ubicaciones);
            }
          } else {
            thisDash.currentEle = null;
          }
          if (response.status) {
            if (response.status == "fail") {
              alert(response.msg);
            }
          }
        });
      };

      thisDash.closeDetails = () => {
        if (thisDash.currentEle != null) {
          thisDash.trMap.clearMarkers();
          thisDash.currentEle = null;
          thisDash.render();
        }
      };

      thisDash.showDetails = (pvid) => {
        let currEle = null;
        thisDash.transito.forEach((ele) => {
          if (ele.pvid == pvid) {
            currEle = ele;
          }
        });
        if (currEle != null) {
          thisDash.currentEle = currEle;
          thisDash.getSingle(currEle);
        }
      };

      thisDash.toggleDetails = (pvid, force = null) => {};

      thisDash.updateShowStatus = () => {
        let anyShown = false;
        let anyHidden = false;
        let anyDetails = false;
        thisDash.transito.forEach((ele) => {
          if (ele.show) {
            ele.dom.addClass("shown");
            ele.dom.find(".btn-show-viaje").addClass("active");
            anyShown = true;
          } else {
            ele.dom.removeClass("shown");
            ele.dom.find(".btn-show-viaje").removeClass("active");
            anyHidden = true;
          }
          if (
            thisDash.currentEle != null &&
            thisDash.currentEle.pvid == ele.pvid
          ) {
            ele.dom.addClass("show-map-details");
            ele.dom.find(".btn-events-viaje").addClass("active");
            anyDetails = true;
          } else {
            ele.dom.removeClass("show-map-details");
            ele.dom.find(".btn-events-viaje").removeClass("active");
          }
        });
        if (anyShown && !anyHidden) {
          thisDash.toggleShowAllButton.addClass("active");
          thisDash.resultList.addClass("all-shown");
          thisDash.transito.forEach((ele) => {
            if (ele.show) {
              ele.dom.find(".btn-show-viaje").removeClass("active");
            }
          });
        } else {
          thisDash.toggleShowAllButton.removeClass("active");
          thisDash.resultList.removeClass("all-shown");
        }
        if (anyShown) {
          thisDash.locateAllButton.removeClass("disabled");
          thisDash.locateAllButton.removeAttr("disabled");
        } else {
          thisDash.locateAllButton.addClass("disabled");
          thisDash.locateAllButton.attr("disabled", true);
        }
        if (anyDetails) {
          if (thisDash.currentEle.marker) {
            thisDash.currentEle.marker.show(true, true);
          }
        } else {
          thisDash.transito.forEach((ele) => {
            if (ele.marker) {
              ele.marker.show(ele.show, false);
            }
          });
        }
      };

      thisDash.interval = setInterval(thisDash.update, INTERVAL_PERIOD);
      thisDash.update();
      thisDash.search(thisDash.filters.getFilters());
    }

    return thisDash;
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

$(document).on("click", ".btn-show-viaje", (e) => {
  dash.showPvid($(e.currentTarget).closest(".single-result").data("pvid"));
});

$(document).on("click", ".btn-locate-viaje", (e) => {
  dash.locateInMap($(e.currentTarget).closest(".viaje-details").data("pvid"));
});

$(document).on("click", ".btn-locate-event", (e) => {
  const btn = $(e.currentTarget);
  let lat = btn.data("lat");
  let lng = btn.data("lng");
  if (!(parseFloat(lat) == 0 && parseFloat(lng) == 0)) {
    dash.trMap.locateLatLng(lat, lng);
  }
});

/*$(document).on("click", ".btn-events-viaje", (e) => {
  dash.showDetails(
    $(e.currentTarget).closest(".viaje-details, .single-result").data("pvid")
  );
});*/

$(document).on("click", ".single-result", (e) => {
  dash.showDetails($(e.currentTarget).data("pvid"));
});

$(document).on("click", ".viaje-details .close-viaje-details", (e) => {
  dash.closeDetails();
});

function createSingleResult(dash, ele, clear = true) {
  ele.show = true;
  ele.details = false;
  let dom;
  if (dash.currentEle != null && dash.currentEle.pvid == ele.pvid) {
    dom = $(".viaje-details");
  } else {
    dom = $("#result-template").clone();
    dom.attr("id", "");
  }
  if (clear) {
    dom.data("pvid", ele.pvid);
    dom.attr("data-pvid", ele.pvid);
  }
  [0, 1, 2, 3, 4, 5].forEach((status) => dom.removeClass("status-" + status));
  dom.addClass("status-" + ele.status);
  //dom.find(".json").html(json);
  dom.find("[data-value]").each((index, valContainer) => {
    valContainer.textContent = "";
  });
  dom.find("[data-value]").each((index, valContainer) => {
    fillValue(ele, valContainer);
  });
  if (ele.hasOwnProperty("marker")) {
    if (clear) {
      dom.on("mouseover", (e) => {
        //console.log("mouseover pvid", ele.pvid);
        if (dom.hasClass("single-result")) {
          if (
            ele.hasOwnProperty("marker") &&
            ele.marker != undefined &&
            ele.show
          ) {
            ele.marker.highlight();
          }
        }
      });
    }
  }
  let historial = dom.find(".historial-list");
  historial.html("");
  if (historial.length > 0) {
    ele.historial.forEach((histEle) => {
      let histDom = historial.find("#hist-ele-" + histEle.pveid);
      if (histDom.length == 0) {
        $("#single-historial-template").clone();
        histDom.attr("id", "hist-ele-" + histEle.pveid);
        historial.append(histDom);
      }
      histDom.find("[data-value]").each((i, histValInput) => {
        fillValue(histEle, histValInput);
      });
      histDom.find(".btn-locate-event").data("lat", histEle.lat);
      histDom.find(".btn-locate-event").data("lng", histEle.lng);
    });
  }
  let ubicacionesSlider = dom.find(".ubicaciones-slider");
  console.log("createSlider");
  if (ubicacionesSlider.length > 0) {
    if (ele.hasOwnProperty("locSlider")) {
      ele.locSlider.updateValues(ele);
    } else {
      ele.locSlider = locationsSlider(ubicacionesSlider, ele, dash.map);
    }
  }
  dom.find(".btn-show-viaje").addClass("active");
  dom.attr("data-pvid", ele.pvid);
  return dom;
}

async function callApi(method, params, callback) {
  let formData = new FormData();
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const element = params[key];
      switch (typeof element) {
        case "object":
          formData.append(key, JSON.stringify(element));
          break;
        case "number":
          formData.append(key, element.toString());
          break;
        case "string":
        default:
          formData.append(key, element);
          break;
      }
    }
  }
  fetch(window.actionUrl + method, {
    method: "POST",
    body: formData,
  }).then((res) =>
    res
      .json()
      .catch((error) => console.error("Error:", error))
      .then(callback)
  );
}

function fillValue(ele, valContainer) {
  let key = valContainer.dataset.value;
  let splitArray = key.split(".");
  if (splitArray.length == 2) {
    if (ele.hasOwnProperty(splitArray[0])) {
      ele = ele[splitArray[0]];
      key = splitArray[1];
    }
  }
  if (ele.hasOwnProperty(key)) {
    switch (valContainer.dataset.type) {
      case "text":
      default:
        valContainer.textContent = ele[key];
        break;
      case "date":
      case "date-compact":
        let date = moment.unix(ele[key]);
        if (valContainer.dataset.type == "date") {
          valContainer.textContent = date.format("DD/MM/YYYY, HH:mm:ss");
        }
        if (valContainer.dataset.type == "date-compact") {
          valContainer.textContent = date.format("DD/MM, HH:mm");
        }
        break;
      case "option":
        let options = JSON.parse(valContainer.dataset.options);
        //console.log(options);
        options.forEach((opt) => {
          if (opt.value === ele[key]) {
            valContainer.textContent = opt.label;
          }
        });
        break;
      case "image-option":
        let imgOptions = JSON.parse(valContainer.dataset.options);
        //console.log(imgOptions);
        imgOptions.forEach((opt) => {
          if (opt.value === ele[key]) {
            valContainer.src = opt.img;
          }
        });
        break;
      case "array":
        if (valContainer.dataset.arraytype == "text") {
          let arr = JSON.parse(ele[key]);
          let text = "";
          if (typeof arr === "object") {
            text = arr.join(", ");
          } else if (typeof arr === "string" || typeof arr === "number") {
            text = arr;
          }
          valContainer.textContent = text;
        }
        break;
      case "url":
        valContainer.innerHtml = "";
        let url = ele[key];
        if (valContainer.dataset.pre) {
          url = valContainer.dataset.pre + ele[key];
        }
        const domA = document.createElement("a");
        domA.innerText = ele[key];
        domA.href = url;
        domA.setAttribute("target", "_blank");
        valContainer.appendChild(domA);
    }
  }
  return;
}
