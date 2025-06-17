const ALARM_HIDDEN_TIME = 15 * 60 * 1000;
const DEVICE_IS_NOT_ATTACHED_THRESHOLD = 35800000;
const DEVICE_IS_ATTACHED_THRESHOLD = 36000000;

let fetching = false;
var Alarms = (function () {
  //singleton pattern for Dashboard
  const INTERVAL_PERIOD = 10000;
  let instance;

  function createInstance(config) {
    const thisAlarms = new Object();
    thisAlarms.alarms = [];
    thisAlarms.showOnMap = true;
    thisAlarms.baseTime = new Date().getTime();

    thisAlarms.updateAlarms = () => {
      config.callApi("dash", {}, function (response) {
        if (response.hasOwnProperty("data")) {
          if (response.data.alarmas.length <= 1) {
            response.data.alarmas = fakeAlarms;
          }
          thisAlarms.alarms = thisAlarms.parseData(response.data.alarmas);
          thisAlarms.update();
        }
        fetching = false;
      });
    };

    $(document).on("click", ".btn-locate-alarms", (e) => {
      const btn = $(e.currentTarget);
      const coords = btn.data("coords");
      config.map.locateBounds(coords);
    });

    $(document).on("submit", ".verify-alert-form", (e) => {
      e.preventDefault();
      let form = $(e.currentTarget);
      let data = {
        pvaid: form.find("[name=pvaid]").val(),
        msg: form.find("[name=msg]").val(),
      };
      $("#verify-alert-modal .response-msg").text("");
      $("#verify-alert-modal .response-msg").hide();
      const submitBtn = form.find(".btn-primary[type=submit]");
      const btnText = submitBtn.text();
      submitBtn.data("cachetext", btnText);
      submitBtn.html("");
      const wrapper = $("<span>");
      wrapper.text(btnText);
      wrapper.css("opacity", 0);
      submitBtn.append(wrapper);
      const loader = $("#loader-template-small").clone();
      loader.attr("id", "");
      submitBtn.append(loader);
      config.callApi("alarmCheck", data, (response) => {
        if (response.hasOwnProperty("status")) {
          if (response.status == "success") {
            $("#verify-alert-modal [name=pvaid]").val("");
            $("#verify-alert-modal [name=msg]").val("");
            $("#verify-alert-modal").modal("hide");
          }
          if (response.hasOwnProperty("msg")) {
            $("#verify-alert-modal .response-msg").show();
            $("#verify-alert-modal .response-msg").text(response.msg);
          }
        }
        submitBtn.html(submitBtn.data("cachetext"));
      });
      return false;
    });

    thisAlarms.parseData = (alarms) => {
      let result = [];
      for (const pvid in thisAlarms.alarms) {
        if (thisAlarms.alarms.hasOwnProperty(pvid)) {
          const oldGroup = thisAlarms.alarms[pvid];
          if (!alarms.hasOwnProperty(pvid)) {
            //group do not exist anymore
            thisAlarms.alarms.splice(pvid, 1);
          } else {
            for (let index = oldGroup.alarms.length - 1; index >= 0; index--) {
              const oldAlarm = oldGroup.alarms[index];
              let exists = false;
              alarms[pvid].forEach((newAlarm) => {
                if (oldAlarm.pvaid == newAlarm.pvaid) {
                  exists = true;
                }
              });
              if (!exists) {
                thisAlarms.alarms[pvid].alarms.splice(index, 1);
              }
            }
          }
        }
      }
      for (const pvid in alarms) {
        if (alarms.hasOwnProperty(pvid)) {
          const group = alarms[pvid];
          let groupExists = false;
          group.forEach((alarm) => {
            let alarmExists = false;
            if (thisAlarms.alarms.hasOwnProperty(pvid)) {
              groupExists = true;
              thisAlarms.alarms[pvid].alarms.forEach((oldAlarm, alarmIndex) => {
                if (oldAlarm.pvaid == alarm.pvaid) {
                  alarmExists = true;
                  if (
                    oldAlarm.hasOwnProperty("marker") &&
                    oldAlarm.marker != null
                  ) {
                    alarm.marker = oldAlarm.marker;
                    alarm.marker.show(false);
                  } else {
                    alarm.marker = null;
                  }
                  if (oldAlarm.hasOwnProperty("hideTime")) {
                    alarm.hideTime = oldAlarm.hideTime;
                  } else {
                    alarm.hideTime = -1;
                  }
                  thisAlarms.alarms[pvid][alarmIndex] = alarm;
                }
              });
              if (!alarmExists) {
                alarm.hideTime = -1;
                alarm.marker = null;
                thisAlarms.alarms[pvid].alarms.push(alarm);
              }
            } else {
              //group does not exist
              alarm.hideTime = -1;
              alarm.marker = null;
              thisAlarms.alarms[pvid] = {
                collapse: true,
                alarms: [alarm],
                offset: 0,
              };
            }
          });
        }
      }
      return thisAlarms.alarms;
    };

    thisAlarms.hideAlarm = (pvid, pvaid) => {
      const group = thisAlarms.alarms[pvid];
      group.alarms.forEach((alarm) => {
        if (alarm.pvaid == pvaid) {
          alarm.hideTime = new Date().getTime() + ALARM_HIDDEN_TIME;
        }
      });
      thisAlarms.update();
    };

    thisAlarms.hideGroup = (pvid) => {
      const group = thisAlarms.alarms[pvid];
      group.alarms.forEach((alarm) => {
        alarm.hideTime = new Date().getTime() + ALARM_HIDDEN_TIME;
      });
    };

    thisAlarms.showGroup = (pvid) => {
      const group = thisAlarms.alarms[pvid];
      group.alarms.forEach((alarm) => {
        alarm.hideTime = -1;
      });
    };

    thisAlarms.expandGroup = (pvid) => {
      const group = thisAlarms.alarms[pvid];
      group.collapse = false;
    };

    thisAlarms.collapseGroup = (pvid) => {
      const group = thisAlarms.alarms[pvid];
      group.collapse = false;
    };

    thisAlarms.checkGroup = (pvid) => {
      const verifyModal = $("#verify-alert-modal");
      verifyModal.find(".show-alarm").hide();
      verifyModal.find(".show-group").show();
      const group = thisAlarms.alarms[pvid];
      verifyModal.find("[data-value=pvid]").text(pvid);
      const condensedAlarms = group.alarms.reduce((alarm, currAlarm) => {
        let typesArray = alarm.types;
        if (typesArray === undefined) {
          typesArray = [
            {
              count: 1,
              type: alarm.type,
              text: ALERT_TYPE_TEXTS[alarm.type],
            },
          ];
        }
        let count = 0;
        typesArray.forEach((obj) => {
          if (obj.type == currAlarm.type) {
            count = obj.count;
            obj.count++;
          }
        });
        if (count === 0) {
          typesArray.push({
            count: count + 1,
            type: currAlarm.type,
            text: ALERT_TYPE_TEXTS[currAlarm.type],
          });
        }

        let coords = alarm.coords;

        if (coords == undefined) {
          if (!(parseFloat(alarm.lat) == 0 && parseFloat(alarm.lng) == 0)) {
            coords = [{ lat: alarm.lat, lng: alarm.lng }];
          }
        }

        if (
          !(parseFloat(currAlarm.lat) == 0 && parseFloat(currAlarm.lng) == 0)
        ) {
          coords.push({ lat: currAlarm.lat, lng: currAlarm.lng });
        }

        return {
          pvaid: alarm.pvaid + "," + currAlarm.pvaid,
          fecha: Math.max(alarm.fecha, currAlarm.fecha),
          bateria: Math.max(alarm.bateria, currAlarm.bateria),
          linga: Math.max(alarm.linga, currAlarm.linga),
          dist: Math.max(alarm.dist, currAlarm.dist),
          types: typesArray,
          coords: coords,
        };
      });
      if (condensedAlarms.dist > DEVICE_IS_ATTACHED_THRESHOLD) {
        condensedAlarms.dist = "Contacto";
      } else if (condensedAlarms.dist > DEVICE_IS_NOT_ATTACHED_THRESHOLD) {
        condensedAlarms.dist = "Contacto débil";
      } else {
        condensedAlarms.dist = "OK";
      }
      verifyModal.find("[data-value]").each((i, ele) => {
        fillValue(condensedAlarms, ele);
      });
      verifyModal
        .find("[data-value=type]")
        .text(
          condensedAlarms.types
            .map((typeObj) => typeObj.text + " (" + typeObj.count + ")")
            .join(", ")
        );
      verifyModal
        .find(".btn-locate-alarms")
        .data("coords", condensedAlarms.coords);
      verifyModal.find(".response-msg").text("");
      verifyModal.find(".response-msg").hide();
      verifyModal.find(".alarm-type-text").text(condensedAlarms.typeText);
      verifyModal.find("input[name=pvaid]").val(condensedAlarms.pvaid);
      verifyModal.find("[name=msg]").val("");
      verifyModal.modal("show");
    };

    thisAlarms.checkAlarm = (pvid, pvaid) => {
      const group = thisAlarms.alarms[pvid];
      group.alarms.forEach((alarm) => {
        if (alarm.pvaid == pvaid) {
          const verifyModal = $("#verify-alert-modal");
          verifyModal.find(".show-alarm").show();
          verifyModal.find(".show-group").hide();
          verifyModal.find("[data-value]").each((i, ele) => {
            fillValue(alarm, ele);
          });
          verifyModal.find(".response-msg").text("");
          verifyModal.find(".response-msg").hide();
          verifyModal
            .find(".alarm-type-text")
            .text(ALERT_TYPE_TEXTS[alarm.type]);
          verifyModal.find("input[name=pvaid]").val(pvaid);
          verifyModal.find("[name=msg]").val("");
          verifyModal.modal("show");
        }
      });
    };

    thisAlarms.locateAlarm = (pvid, pvaids) => {
      const group = thisAlarms.alarms[pvid];
      let markers = [];
      group.alarms.forEach((alarm) => {
        pvaids.forEach((pvaid) => {
          if (alarm.pvaid == pvaid) {
            if (!alarm.hasOwnProperty("marker") || alarm.marker == null) {
              alarm.marker = config.map.addAlarmMarker(alarm);
            }
            markers.push(alarm.marker);
            alarm.marker.locate();
          }
        });
      });
      markers.push(alarm.marker);
    };

    thisAlarms.locateAlarm = (pvid, pvaid) => {
      const group = thisAlarms.alarms[pvid];
      group.alarms.forEach((alarm) => {
        if (alarm.pvaid == pvaid) {
          if (alarm.hasOwnProperty("marker") && alarm.marker) {
            alarm.marker.locate();
          } else {
            alarm.marker = config.map.addAlarmMarker(alarm);
            alarm.marker.locate();
          }
        }
      });
    };

    thisAlarms.showAll = () => {
      for (const pvid in thisAlarms.alarms) {
        const group = thisAlarms.alarms[pvid];
        group.alarms.forEach((alarm) => (alarm.hideTime = -1));
      }
      thisAlarms.update();
    };

    thisAlarms.interval = setInterval(
      () => thisAlarms.updateAlarms(),
      INTERVAL_PERIOD
    );

    config.container.find(".btn-show-all-alarms").on("click", () => {
      thisAlarms.showAll();
    });

    thisAlarms.update = () => {
      thisAlarms.render();
    };

    thisAlarms.render = () => {
      let total = 0;
      let countHidden = 0;
      thisAlarms.now = new Date().getTime();
      for (const pvid in thisAlarms.alarms) {
        if (thisAlarms.alarms.hasOwnProperty(pvid)) {
          const group = thisAlarms.alarms[pvid];
          total += group.alarms.length;
          group.alarms.forEach((alarm) => {
            if (alarm.hideTime > thisAlarms.now) {
              countHidden++;
            }
          });
        }
      }
      let totalText = total + " alertas";
      if (total == 1) {
        totalText = total + " alerta";
      }
      config.container.find(".alarm-count").text(totalText);
      let hiddenText = countHidden + " ocultas";
      if (countHidden == 0) {
        config.container.find(".alarm-hidden").parent().hide();
        config.container.find(".btn-show-all-alarms").hide();
      } else {
        if (countHidden == 1) {
          hiddenText = countHidden + " oculta";
        }
        config.container.find(".alarm-hidden").parent().show();
        config.container.find(".btn-show-all-alarms").show();
      }
      config.container.find(".alarm-hidden").text(hiddenText);
      for (const pvid in thisAlarms.alarms) {
        const group = thisAlarms.alarms[pvid];
        thisAlarms.renderGroup(pvid, group);
      }
    };

    thisAlarms.renderGroup = (groupPvid, group) => {
      let listDom = config.container.find(".alarms-list");
      let groupContainer = listDom.find("#group-pvid-" + groupPvid);
      groupContainer.find(".alarm-ellipsis").remove();
      if (groupContainer.length == 0) {
        groupContainer = $("#alarm-group-container-template").clone();
        groupContainer.attr("id", "group-pvid-" + groupPvid);
        groupContainer.data("pvid", groupPvid);
        groupContainer.addClass("compact");
        groupContainer.find(".close-group-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          let groupContainer = btn.closest(".alarm-group-container");
          let pvid = groupContainer.data("pvid");
          thisAlarms.hideGroup(pvid);
        });
        groupContainer.find(".check-group-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          let groupContainer = btn.closest(".alarm-group-container");
          let pvid = groupContainer.data("pvid");
          thisAlarms.checkGroup(pvid);
        });
        groupContainer.find(".expand-group-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          $(".alarm-group-container").addClass("compact");
          let groupContainer = btn.closest(".alarm-group-container");
          groupContainer.removeClass("compact");
          thisAlarms.render();
        });
        groupContainer.find(".collapse-group-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          let groupContainer = btn.closest(".alarm-group-container");
          groupContainer.addClass("compact");
          thisAlarms.render();
        });
        listDom.append(groupContainer);
      }
      let groupCountText = group.alarms.length + " alertas";
      if (group.alarms.length == 1) {
        groupCountText = groupCountText.replace("alertas", "alerta");
      }
      groupContainer.find(".group-alarms-count").text(groupCountText);
      groupContainer.find(".group-pvid").text(groupPvid);
      let countAlarms = 0;
      group.alarms.forEach((alarm, i) => {
        //console.log("hideTime", alarm.hideTime);
        let showAlarm = alarm.hideTime <= thisAlarms.now;
        showAlarm ? countAlarms++ : null;
        if (
          showAlarm &&
          countAlarms < 10 &&
          (!groupContainer.hasClass("compact") || countAlarms <= 1)
        ) {
          if (alarm.hasOwnProperty("marker") && alarm.marker != null) {
            alarm.marker.show(showAlarm);
          } else {
            alarm.marker = config.map.addAlarmMarker(alarm);
            alarm.marker.show(showAlarm);
          }
          thisAlarms.renderSingle(alarm, groupContainer);
        } else {
          $("#single-alarm-" + alarm.pvaid).remove();
        }
      });
      if (!groupContainer.hasClass("compact") && countAlarms > 10) {
        groupContainer.append(
          $(
            '<div class="alarm-ellipsis">' +
              group.offset +
              " 10 de " +
              group.alarms.length +
              " alarmas</div>"
          )
        );
      }
    };

    thisAlarms.renderSingle = (data, groupContainer) => {
      let domEle = config.container.find("#single-alarm-" + data.pvaid);
      if (domEle.length == 0) {
        domEle = $("#single-alarm-template").clone();
        domEle.attr("id", "single-alarm-" + data.pvaid);
        groupContainer.find(".alarm-group-list").append(domEle);
        domEle.find(".collapse-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          let domEle = btn.closest(".single-alarm");
          domEle.removeClass("expanded");
        });
        domEle.find(".expand-btn").on("click", (e) => {
          let btn = $(e.currentTarget);
          let domEle = btn.closest(".single-alarm");
          domEle.addClass("expanded");
        });
        domEle.find(".close-btn, .btn-alarm-hide").on("click", (e) => {
          let btn = $(e.currentTarget);
          let domEle = btn.closest(".single-alarm");
          let pvid = domEle.data("pvid");
          let pvaid = domEle.data("pvaid");
          thisAlarms.hideAlarm(pvid, pvaid);
        });
        domEle.find(".btn-alarm-check").on("click", (e) => {
          let btn = $(e.currentTarget);
          let domEle = btn.closest(".single-alarm");
          let pvid = domEle.data("pvid");
          let pvaid = domEle.data("pvaid");
          thisAlarms.checkAlarm(pvid, pvaid);
        });
        domEle.find(".btn-alarm-locate").on("click", (e) => {
          let btn = $(e.currentTarget);
          let domEle = btn.closest(".single-alarm");
          let pvid = domEle.data("pvid");
          let pvaid = domEle.data("pvaid");
          thisAlarms.locateAlarm(pvid, pvaid);
        });
      }
      domEle.data("pvid", data.pvid);
      domEle.data("pvaid", data.pvaid);
      domEle.find("[data-value]").each((i, valContainer) => {
        fillValue(data, valContainer);
      });
      if (data.expanded) {
        domEle.addClass("expanded");
      }
      if (data.hideTime > thisAlarms.now) {
        domEle.removeClass("show-alarm");
      } else {
        domEle.addClass("show-alarm");
      }
      //domEle.find(".data-json").html(JSON.stringify(data).substring(0, 50));
      //domEle.find(".data-json-expanded").html(JSON.stringify(data, null, 2));
    };

    thisAlarms.updateAlarms();
    return thisAlarms;
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

const ALERT_TYPE_TEXTS = {
  bateriabaja: "Batería baja",
  lingacortada: "Circuito abierto",
  precintodespegado: "Pérdida de contacto",
};