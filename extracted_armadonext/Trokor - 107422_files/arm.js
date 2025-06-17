var WEEKDAYS_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

var MONTHS_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function initMap() {
  console.log("map initiated");
}

(function ($) {
  var currentPrecinto = null;
  var initiated = false;
  var map = null;
  var marker = null;
  var interval = setInterval(function () {
    if (!initiated) {
      if (typeof google !== "undefined") {
        initiated = true;
        clearInterval(interval);
        init();
      }
    }
  }, 300);

  updatePending();
  var pendingInterval = setInterval(updatePending, 20000);

  function resetMap() {
    map.setCenter({ lat: -32.6124544, lng: -56.309338 });
    map.setZoom(6);
    marker.setMap(null);
  }

  function setMarker(location, label) {
    marker.setPosition(location);
    marker.setMap(map);
    marker.setLabel(label);
    map.setCenter(location);
    map.setZoom(18);
  }

  function init() {
    var form = $("#arm-form");
    if (form.length === 1) {
      var icon = {
        url: "/sc/img/map-marker-green.png",
        size: new google.maps.Size(77, 77),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(77 / 2, 77 / 2),
        scaledSize: new google.maps.Size(77, 77),
        labelOrigin: new google.maps.Point(77 / 2, 77),
        labelStyle: {
          opacity: 1,
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "white",
        },
      };

      map = new google.maps.Map($("#armar-map")[0], {
        center: { lat: -32.6124544, lng: -56.309338 },
        zoom: 6,
        mapTypeId: "roadmap",
        fullscreenControl: false,
        streetViewControl: false,
      });

      marker = new google.maps.Marker({
        map: null,
        label: "undefined",
        icon: icon,
      });

      $(document).on(
        "change",
        "#arm-form [name=precintoid],#change-precinto-form [name=precintoid]",
        function (event) {
          var form = $(event.currentTarget).closest("form");
          var select = $(event.currentTarget);
          var data = select.find("option:selected").data("data");
          if (typeof data !== "undefined") {
            loadPrecinto(data.precintoid);
            $("[name=nqr]").val(data.precintoid);
            $(".btn-command").data("precintoid", data.precintoid);
            $(".btn-command").prop("disabled", false);
            console.log(data);
            Object.keys(data).forEach(function (key) {
              var value = data[key];
              if (key !== "extra") {
                form.find("[name=" + key + "]").val(value);
              }
            });
            if (data.hasOwnProperty("extra")) {
              var extra = JSON.parse(data.extra);
              if (extra && extra.lat && extra.lng) {
                console.log("setMarker", extra);
                setMarker(
                  {
                    lat: parseFloat(extra.lat),
                    lng: parseFloat(extra.lng),
                  },
                  data.precintoid
                );
                form.find("[name=lat]").val(extra.lat);
                form.find("[name=lng]").val(extra.lng);
              } else {
                resetMap();
              }
            } else {
              resetMap();
            }
            if (data.hasOwnProperty("images")) {
              var photoContainer = form.find(".photo-container");
              photoContainer.html("");
              var auids = [];
              data.images.forEach(function (image) {
                auids.push(image.auid);
                var imageWrapper = $("<figure/>");
                var imageDom = $("<img/>");
                imageDom.attr(
                  "src",
                  window.apiUrl + "sc/uploads/" + image.imagename
                );
                imageDom.attr("alt", image.imagename);
                imageWrapper.append(imageDom);
                var dateSpan = $("<figcaption/>");
                var d = new Date();
                d.setTime(parseInt(image.date) * 1000);
                dateSpan.html(
                  (d.getHours() / 100).toFixed(2).replace("0.", "") +
                    ":" +
                    (d.getMinutes() / 100).toFixed(2).replace("0.", "") +
                    " del " +
                    WEEKDAYS_NAMES[d.getDay()] +
                    " " +
                    d.getDate() +
                    " de " +
                    MONTHS_NAMES[d.getMonth()] +
                    " de " +
                    d.getFullYear()
                );
                imageWrapper.append(dateSpan);
                photoContainer.append(imageWrapper);
              });
              console.log(auids);
              form.find("[name=pictureid]").val(JSON.stringify(auids));
            }
          } else {
            console.log("option does not have data");
          }
        }
      );

      $(document).on("click", ".edit-toggle-btn", function (event) {
        var btn = $(event.currentTarget);
        var toggleContainer = btn.closest(".toggle-group");
        if (!btn.hasClass("toggled")) {
          btn.addClass("toggled");
          toggleContainer
            .find("input, textarea, select")
            .removeAttr("readonly");
        } else {
          btn.removeClass("toggled");
          toggleContainer
            .find("input, textarea, select")
            .attr("readonly", true);
        }
      });

      $(document).on("change", "#arm-form .empresa-select", function (event) {
        var select = $(event.currentTarget);
        var value = select.val();
        var empresas = select.data("empresas");
        console.log(value, empresas);
        $("#arm-form [name=rut]").val("");
        empresas.forEach(function (empresa) {
          if (empresa.empresaid === value) {
            $("#arm-form [name=rut]").val(empresa.rut);
          }
        });
      });

      $(document).on("change", "#arm-form [name=rut]", function (event) {
        var input = $(event.currentTarget);
        var value = input.val();
        var select = $("#arm-form .empresa-select");
        var empresas = select.data("empresas");
        console.log(value, empresas);
        select.val("");
        empresas.forEach(function (empresa) {
          if (empresa.rut === value) {
            select.val(empresa.empresaid);
          }
        });
      });
    }
  }

  $(document).on("input", "[name=nqr]", function (e) {
    var nqrInput = $(e.currentTarget);
    var nqr = nqrInput.val();
    var btn = nqrInput.siblings("button.arm-add-precinto");
    btn.prop("disabled", true);
    btn.data("PrcId", "");
    loadPrecinto(nqr);
    console.log("change nqr", nqr);
  });

  $(document).on(
    "click",
    ".precinto-status-table .precinto-status-update button",
    function (e) {
      var btn = $(e.currentTarget);
      var precintoid = btn.data("precintoid");
      if (
        typeof precintoid !== "undefined" &&
        precintoid !== null &&
        precintoid !== ""
      ) {
        loadPrecinto(precintoid);
      }
    }
  );

  $(document).on("change", "[name=depStart]", function (e) {
    var val = e.currentTarget.value;
    var sel = $(e.currentTarget);
    var opt = sel.find("[value='" + val + "']");
    var plid = opt.data("plid");
    console.log("plid", plid);
    var plidSelect = $("[name=plidStart]");
    plidSelect.val(plid);
  });

  $(document).on("change", "[name=depEnd]", function (e) {
    var val = e.currentTarget.value;
    var sel = $(e.currentTarget);
    var opt = sel.find("[value='" + val + "']");
    var plid = opt.data("plid");
    console.log("plid", plid);
    var plidSelect = $("[name=plidEnd]");
    plidSelect.val(plid);
  });

  $(document).on("change", "[name=plidEnd]", function (e) {
    var val = e.currentTarget.value;
    var sel = $(e.currentTarget);
    var opt = sel.find("[value='" + val + "']");
    var plid = opt.val();
    $("[name=depEnd] option").show();
    console.log("plid", plid);
    if (plid !== "") {
      $("[name=depEnd] option[data-plid]:not([data-plid=" + plid + "])").hide();
      const depositos = $("[name=depEnd] option[data-plid=" + plid + "]");
      if (depositos.length === 1) {
        depositos.get(0).selected = true;
      } else {
        $("[name=depEnd] option:first-child").prop("selected", true);
      }
    }
  });

  $(document).on("change", "[name=plidStart]", function (e) {
    var val = e.currentTarget.value;
    var sel = $(e.currentTarget);
    var opt = sel.find("[value='" + val + "']");
    var plid = opt.val();
    if ($("[name=depStart]").length > 0) {
      $("[name=depStart] option").show();
      console.log("plid", plid);
      if (plid !== "") {
        $(
          "[name=depStart] option[data-plid]:not([data-plid=" + plid + "])"
        ).hide();
        const depositos = $("[name=depStart] option[data-plid=" + plid + "]");
        if (depositos.length === 1) {
          depositos.get(0).selected = true;
        } else {
          $("[name=depStart] option:first-child").prop("selected", true);
        }
      }
    }
  });

  function loadPrecinto(nqr) {
    currentPrecinto = nqr;
    var btn = $(".arm-add-precinto");
    var msgDom = $(".added-precinto-data");
    var statusTable = $(".precinto-status-table");
    msgDom.text("...");
    var statusBat = statusTable.find("td.status-battery");
    statusBat.text("-");
    var statusGPS = statusTable.find("td.status-gps");
    statusGPS.text("-");
    var statusSignal = statusTable.find("td.status-signal");
    statusSignal.text("-");
    var statusEslinga = statusTable.find("td.status-eslinga");
    statusEslinga.text("-");
    statusEslinga.removeClass();
    statusEslinga.addClass("status-eslinga");

    var precStatusBat = statusTable.find(".precinto-status-battery");
    var precStatusHace = statusTable.find(".precinto-status-hace");
    var precUpdateBtn = statusTable.find(".precinto-status-update button");
    precStatusBat.text("-");
    precStatusHace.text("-");
    precUpdateBtn.addClass("btn-disabled");
    precUpdateBtn.removeClass("btn-primary");

    for (var i = 0; i <= 100; i++) {
      precStatusBat.removeClass("value-" + i);
    }

    if (/^JT\d{3}CC$/.test(nqr) || /^\d+/.test(nqr)) {
      // remove leading zeros
      const cleanNqr = nqr.replace(/^0+/, "");
      $.ajax({
        url: "action/precinto",
        method: "post",
        dataType: "JSON",
        data: { precintoid: JSON.stringify([cleanNqr]) },
        success: function (response) {
          console.log("action/precinto response", response);
          if (response.hasOwnProperty("response-0")) {
            var response_0 = response["response-0"];
            if (
              response_0.hasOwnProperty("data") &&
              response_0.data.hasOwnProperty("ubicacion") &&
              response_0.data.ubicacion.hasOwnProperty("bateria") &&
              response_0.data.ubicacion.hasOwnProperty("fecharead") &&
              response_0.data.ubicacion.hasOwnProperty("fecha")
            ) {
              var bateria = parseInt(response_0.data.ubicacion.bateria);
              var fecharead = "hace " + response_0.data.ubicacion.fecharead;
              var fecha = parseInt(response_0.data.ubicacion.fecha);
              var lat = response_0.data.ubicacion.lat;
              var lng = response_0.data.ubicacion.lng;
              setMarker(
                {
                  lat: parseFloat(lat),
                  lng: parseFloat(lng),
                },
                nqr
              );
              precStatusBat.text(bateria + "%");
              precStatusBat.addClass(
                "value-" + Math.max(0, Math.round((bateria - 25) / 0.75))
              );
              precStatusHace.text(fecharead);

              if (new Date().getTime() / 1000 - fecha > 60 * 60) {
                setTimeout(function () {
                  alert(
                    "¡Atención! El precinto no reporta desde " +
                      fecharead +
                      "\nDespierte el precinto y verifique que funciona correctamente antes de armar."
                  );
                }, 100);
              }
              if (bateria <= 35) {
                setTimeout(function () {
                  alert(
                    "¡Atención! La última lectura de batería es de " +
                      bateria +
                      "% " +
                      fecharead
                  );
                }, 100);
              }
              precUpdateBtn.removeClass("btn-disabled");
              precUpdateBtn.addClass("btn-primary");
              precUpdateBtn.data("precintoid", cleanNqr);
            }
          }
        },
        error: function (e1, e2, e3) {
          console.log("action/precinto error", e1, e2, e3);
        },
      });
      $.ajax({
        url: "action/load",
        method: "post",
        dataType: "JSON",
        data: { nqr: cleanNqr },
        success: function (r) {
          var response = r;
          if (typeof r === "string") {
            response = JSON.parse(r);
          }
          if (response && response.status !== undefined) {
            if (response.status === "fail") {
              msgDom.text(
                response.msg.replace("exsiste", "existe") + " " + cleanNqr
              );
              btn.prop("disabled", true);
              btn.data("PrcId", "");
            }
            if (response.status === "success") {
              var PrcId = response.data.precintoid;
              var link = $("<a>");
              var href = window.baseUrl + "precinto/" + PrcId;
              link.attr("href", href);
              link.attr("target", "_blank");
              link.text("PrcId: " + PrcId);
              msgDom.html(link);
              btn.prop("disabled", false);
              btn.data("PrcId", PrcId);
              btn.data("nqr", cleanNqr);
              btn.data("precinto", response.data);
              statusBat.text(response.data.bateria);
              statusGPS.text(response.data.gps);
              statusSignal.text(response.data.senal);
              statusEslinga.text(response.data.eslinga);
              statusEslinga.addClass("status-eslinga-" + response.data.eslinga);
            }
          }
        },
      });
    }
  }

  $(document).on("click", "button.arm-add-precinto", function (e) {
    var btn = $(e.currentTarget);
    var PrcId = btn.data("PrcId");
    var nqr = btn.data("nqr");
    $(".btn-command").data("precintoid", PrcId);
    if (PrcId && PrcId !== "") {
      $(".btn-command").prop("disabled", false);
      loadPrecinto(PrcId);
      console.log("PrcId: " + PrcId);
      var prcIdSelect = $("[name=precintoid]");
      var option = $("<option>");
      option.attr("value", "[" + PrcId + "]");
      option.data("manual", true);
      option.attr("data-manual", true);
      option.data("data", { precintoid: PrcId });
      option.text(nqr + " (" + PrcId + ")");
      prcIdSelect.append(option);
      prcIdSelect.val("[" + PrcId + "]");
      $("#arm-form .edit-toggle-btn").trigger("click");
    } else {
      $(".btn-command").prop("disabled", true);
      alert("Ingrese el código del precinto");
    }
  });

  var uploadingPhoto = false;

  $(document).on(
    "click",
    "#upload-picture-form button[type=submit]",
    function (e) {
      e.preventDefault();
      if (uploadingPhoto) {
        console.log("uploading...");
      } else {
        uploadingPhoto = true;
        var form = $(e.currentTarget).closest("form");
        var targetForm = $(form.data("target"));
        var data = new FormData(form[0]);
        $.ajax({
          url: form.attr("action"),
          data: data,
          method: "post",
          cache: false,
          contentType: false,
          processData: false,
          success: function (r) {
            console.log(r);
            var response = r;
            if (typeof r === "string") {
              try {
                response = JSON.parse(r.trim());
              } catch (e) {
                console.warn(e);
              }
            }
            if (response && response.status) {
              if (response.status === "success") {
                // {"status":"success","auid":4510,"filename":"1648149856-8","fileurl":"https:\/\/api.example.com\/sc\/uploads\/1648149856-8"}
                var picturesJsonStr = targetForm.find("[name=pictureid]").val();
                var pictures = [];
                try {
                  pictures = JSON.parse(picturesJsonStr);
                } catch (e) {
                  console.warn(e);
                }
                pictures.push(response.auid);
                targetForm
                  .find(" [name=pictureid]")
                  .val(JSON.stringify(pictures));
                var photoItem = $("#photo-item-template").clone();
                photoItem.removeAttr("id");
                photoItem.data("auid", response.auid);
                photoItem.data("form", targetForm);
                var img = photoItem.find("img");
                img.attr("src", response.fileurl);
                img.attr("alt", response.filename);
                $(".photo-container").append(photoItem);
              }
            }
            uploadingPhoto = false;
          },
          error: function (e1, e2, e3) {
            console.warn(e1, e2, e3);
            uploadingPhoto = false;
          },
        });
      }
      return false;
    }
  );

  function updatePending() {
    console.log("uppdatePending . . .");
    $.ajax({
      url: "/action/pendinglist",
      success: function (response) {
        if (typeof response === "string") {
          response = JSON.parse(response);
        }
        var count = response.data.length;
        var badge = $(".pending-badge");
        if (count > 0) {
          badge.text(count);
          badge.show();
        } else {
          badge.hide();
          badge.text("");
        }
        var armForm = $("#arm-form");
        if (armForm.length > 0) {
          var precintoSelect = armForm.find("[name=precintoid]");
          var cachedPrecintoid = precintoSelect.find("option:selected").val();
          console.log(precintoSelect, cachedPrecintoid);
          precintoSelect.find("option").each(function (index, option) {
            if (!$(option).data("manual")) {
              $(option).remove();
            }
          });
          precintoSelect.append($('<option value="">Sin definir</option>'));
          response.data.forEach(function (option) {
            var text =
              "Matrícula " +
              option.MatTra +
              " - ID PRECINTO: " +
              option.precintoid;
            var optionDom = $("<option/>");
            optionDom.attr("value", option.precintoid);
            optionDom.data("data", option);
            optionDom.text(text);
            precintoSelect.append(optionDom);
          });
          precintoSelect.val(cachedPrecintoid);
        }
      },
    });
  }

  $(document).on("click", ".photo-item .btn-close", function (e) {
    var btn = $(e.currentTarget);
    var photoItem = btn.closest(".photo-item");
    var form = photoItem.data("form");
    var auid = photoItem.data("auid");
    var picturesJsonStr = form.find("[name=pictureid]").val();
    var pictures = [];
    try {
      pictures = JSON.parse(picturesJsonStr);
    } catch (e) {
      console.warn(e);
    }
    var newPictures = pictures.filter(function (p) {
      return p !== auid;
    });
    form.find("[name=pictureid]").val(JSON.stringify(newPictures));
    photoItem.remove();
  });

  $(document).on("click", ".btn-command", function (e) {
    const btn = $(e.currentTarget);
    const command = btn.data("command");
    const precintoid = btn.data("precintoid");
    btn.addClass("loading");
    $.ajax({
      url: "/action/precintocommand",
      method: "POST",
      data: {
        precintoid: precintoid,
        command: command,
        extra: "",
        phone: "",
      },
      dataType: "JSON",
      success: (r) => {
        console.log("success", r);
        if (typeof r === "object" && r !== null && r.hasOwnProperty("status")) {
          console.log("Comando ejecutado con éxito", r);
          const msg = $("<p class='msg'>");
          msg.text("El comando ha sido enviado");
          btn.parent().append(msg);
          setTimeout(() => {
            msg.remove();
          }, 2000);
        }
      },
      complete: () => {
        btn.removeClass("loading");
      },
    });
  });

  $(document).on("change", "[name=ConTel]", function (e) {
    var input = $(e.currentTarget);
    var value = input.val();
    input.val(value.trim());
  });

  $(document).on("submit", "#arm-form.arm-form", function (e) {
    e.preventDefault();
    var form = $(e.currentTarget);
    var data = form.serializeArray();
    var modal = $("#arm-confirm-modal");

    console.log(data);

    modal.find("input").val("");
    modal.find("strong.phone").text("");

    let cancel = false;

    data.forEach(function (item) {
      const { name, value } = item;
      const input = modal.find("." + name);
      if (name === "ConTel") {
        modal.find("strong.driver-phone").text(value);
      }
      if (name === "ConNmb") {
        modal.find("strong.driver-name").text(value);
      }
      if (name === "MatTra") {
        modal.find("strong.matricula").text(value);
      }
      if (input.is("select")) {
        const select = form.find(`[name=${name}]`);
        input.html("");
        select.find("option").each(function (index, option) {
          input.append($(option).clone());
        });
        if (value !== "") {
          input.find(`option[value=${value}]`).prop("selected", true);
        }
      }
      if (name === "empresaid") {
        if (value === "0" || value === "") {
          alert(
            "Verificar la empresa seleccionada\nEl rut no fue identificado\nDe no existir la empresa. Crearla en el sistema"
          );
          cancel = true;
        }
      }
      if (value === "") {
        input.closest(".form-group").hide();
      } else {
        input.closest(".form-group").show();
      }
      modal.find(`.${name}`).val(value);
    });
    if (!cancel) {
      modal.modal("show");
    }
    return false;
  });
})(jQuery);
