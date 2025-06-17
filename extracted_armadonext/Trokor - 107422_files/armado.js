var sendingCommand = false;

(function ($) {
  var statusRowDom = $("#status-row-template").clone();
  var dataCard = $("#data-card");
  var fixEventModal = $("#fix-event-modal");

  function clearModal() {
    fixEventModal.find("#fix-event-plaid").val("");
    fixEventModal.find("#fix-event-event").val("");
    fixEventModal.find("#fix-event-pvid").val("");
    fixEventModal.find("#fix-event-VjeId").val("");
    fixEventModal.find("#fix-event-DUA").val("");
    fixEventModal.find("#fix-event-MovId").val("");
    fixEventModal.find("#fix-event-MatTra").val("");
    fixEventModal.find("#fix-event-MatTraOrg").val("");
    fixEventModal.find("#fix-event-MatZrr").val("");
    fixEventModal.find("#fix-event-MatRemo").val("");
    fixEventModal.find("#fix-event-ConNDoc").val("");
    fixEventModal.find("#fix-event-ConODoc").val("");
    fixEventModal.find("#fix-event-ConNmb").val("");
    fixEventModal.find("#fix-event-ConTel").val("");
    fixEventModal.find("#fix-event-ContId").val("");
    fixEventModal.find("#fix-event-aduana-check").prop("checked", false);
  }

  function populateModal(data, status) {
    console.log("populateModal", data, status);
    fixEventModal
      .find("h2 .event-plaid")
      .text(status.event + " - " + status.plaid);

    console.log("plaid", status.plaid, fixEventModal.find("#fix-event-plaid"));

    fixEventModal.find("#fix-event-plaid").val(status.plaid);
    fixEventModal.find("#fix-event-event").val(status.event);
    fixEventModal.find("#fix-event-pvid").val(data.pvid);
    fixEventModal.find("#fix-event-VjeId").val(data.VjeId);
    fixEventModal.find("#fix-event-DUA").val(data.DUA);
    fixEventModal.find("#fix-event-MovId").val(data.MovId);
    fixEventModal.find("#fix-event-MatTra").val(data.MatTra);
    fixEventModal.find("#fix-event-MatTraOrg").val(data.MatTraOrg);
    fixEventModal.find("#fix-event-MatZrr").val(data.MatZrr);
    fixEventModal.find("#fix-event-MatRemo").val(data.MatRemo);
    fixEventModal.find("#fix-event-ConNDoc").val(data.ConNDoc);
    fixEventModal.find("#fix-event-ConODoc").val(data.ConODoc);
    fixEventModal.find("#fix-event-ConNmb").val(data.ConNmb);
    fixEventModal.find("#fix-event-ConTel").val(data.ConTel);
    fixEventModal.find("#fix-event-ContId").val(data.ContId);
    fixEventModal.find("#fix-event-aduana-check").prop("checked", false);
    fixEventModal.find(".response .alert").text("");
    fixEventModal.modal("show");
  }

  function cancelEvent(data, status) {}

  function renderStatus(status) {
    switch (status) {
      case "0":
      case 0:
        return "<strong>Pendiente</strong>";
      case "1":
      case 1:
        return "<strong>OK</strong>";
      case "2":
      case 2:
        return "<strong>Error</strong>";
    }
    return status;
  }

  function update() {
    $.ajax({
      url: "/action/checkStatusViaje",
      data: {
        precintoid: window.precintoid,
        pvid: window.pvid,
      },
      method: "post",
      dataType: "json",
      success: function (r) {
        if (r.status === "success") {
          checkSalida(r.data);
          render(r.data);
        }
      },
      error: function (r) {
        console.warn("checkStatusViaje", r);
      },
    });
  }

  async function checkSalida(data) {
    const changedMuestreo = window.localStorage.getItem(
      "smuestreo-" + data.PrcId + "-" + data.VjeId + "-" + data.MovId
    );
    if (!sendingCommand) {
      if (!changedMuestreo || parseInt(changedMuestreo) !== 300) {
        sendingCommand = true;
        let startV = false;
        let startP = false;
        data.pstatus.forEach(function (status) {
          if (status.event === "startV" && status.status === "1") {
            startV = true;
          }
          if (status.event === "startP" && status.status === "1") {
            startP = true;
          }
        });
        console.log("checkSalida", {
          startV: startV,
          startP: startP,
        });
        if (startV && startP) {
          console.log("TODO change smuesteo to 300s");
          $("#update-smuestreo-status").text("Actualizando muestreo...");
          await new Promise((resolve, reject) => {
            $.ajax({
              url: "/action/precintocommand",
              method: "post",
              data: {
                command: "interval",
                extra: 120,
                precintoid: data.PrcId,
              },
              success: function (_response) {
                $("#update-smuestreo-status").text(_response);
                sendingCommand = false;
                let response = _response;
                if (typeof response === "string") {
                  response = JSON.parse(response);
                }
                if (response?.status === "success") {
                  window.localStorage.setItem(
                    "smuestreo-" +
                      data.PrcId +
                      "-" +
                      data.VjeId +
                      "-" +
                      data.MovId,
                    300
                  );
                }
                resolve(response);
              },
              error: function (err) {
                $("#update-smuestreo-status").text("Error");
                sendingCommand = false;
                reject(err);
              },
            });
          });
        }
      }
    } else {
      console.log("sendingCommand");
    }
  }

  function render(data) {
    console.log("data", data);
    dataCard.find(".VjeId").text(data.VjeId);
    dataCard.find(".DUA").text(data.DUA);
    dataCard.find(".MovId").text(data.MovId);
    dataCard.find(".PrcId").text(data.PrcId);
    dataCard.find(".MatTra").text(data.MatTra);
    dataCard.find(".MatTraOrg").text(data.MatTraOrg);
    dataCard.find(".ConNmb").text(data.ConNmb);
    dataCard.find(".ConNDoc").text(data.ConNDoc);
    dataCard.find(".ConTel").text(data.ConTel);
    dataCard.find(".ConTelConf").text(data.ConTelConf);
    const confirmBtn = dataCard.find(".btn-approve-exit");
    if (data.ConTelConf !== "0" && data.ConTelConf !== data.ConTel) {
      dataCard.find(".ConTelConf").show();
      dataCard.find(".ConTel").addClass("text-danger");
    } else {
      dataCard.find(".ConTelConf").hide();
    }
    if (data.ConTelConf !== "0") {
      dataCard.find(".ConTelConf").hide();
      confirmBtn.find("span").text("Salida confirmada");
      confirmBtn.closest("div").find(".alert-danger").hide();
      confirmBtn.find("i").removeClass("fa-phone");
      confirmBtn.find("i").addClass("fa-check");
      confirmBtn.addClass("btn-success");
      confirmBtn.removeClass("btn-danger");
    } else {
      confirmBtn.find("i").removeClass("fa-check");
      confirmBtn.find("i").addClass("fa-phone");
      confirmBtn.find("span").text("Confirmar salida");
      confirmBtn.closest("div").find(".alert-danger").show();
      confirmBtn.addClass("btn-danger");
      confirmBtn.removeClass("btn-success");
    }
    dataCard.find(".fecha").text(moment.unix(data.fecha).format("DD/MM/YYYY"));
    dataCard.find(".hora").text(moment.unix(data.fecha).format("HH:mm"));
    if (typeof window.locationsList !== "undefined") {
      dataCard
        .find(".plidEnd")
        .text(
          window.locationsList.find((value) => value.plid === data.plidEnd).name
        );
    } else {
      dataCard.find(".plidEnd").text(data.plidEnd);
    }
    if (typeof window.depositos !== "undefined") {
      dataCard
        .find(".depEnd")
        .text(
          window.depositos.find((value) => value.codigo === data.depEnd)?.alias
        );
    } else {
      dataCard.find(".depEnd").text(data.depEnd);
    }
    var table = dataCard.find("tbody");
    table.html("");
    var enableChangePrecinto = data.fechafin === "0";
    var enableConfirmExit = enableChangePrecinto;
    data.pstatus.forEach(function (status) {
      var row = statusRowDom.clone();
      statusRowDom.removeAttr("id");
      row.find(".event").text(status.event);
      row.addClass("event-status-" + status.status);
      row.find(".status").html(renderStatus(status.status));
      row
        .find(".tsent")
        .text(moment.unix(status.tsent).format("DD/MM/YY, HH:mm"));
      row
        .find(".tresponse")
        .text(moment.unix(status.tresponse).format("DD/MM/YY, HH:mm"));
      row.find(".Errnum").text(status.Errnum);
      row.find(".Errmsj").text(status.Errmsj);
      row.find(".retry").text(status.retry);
      row.find(".plaid").text(status.plaid);
      row.find(".id").text(status.id);
      // enableChangePrecinto =
      //   enableChangePrecinto && parseInt(status.status) === 1;
      if (
        true ||
        (parseInt(status.status) !== 0 && parseInt(status.status) !== 1)
      ) {
        var correctBtn = $('<button type="button">');
        correctBtn.addClass("btn btn-warning");
        correctBtn.text("Corregir");
        var btnData = { ...data };
        var btnStatus = { ...status };
        correctBtn.on("click", function () {
          populateModal(btnData, btnStatus);
        });
        row.find(".corregir").html(correctBtn);
      }
      var cancelBtn = $('<button type="button">');
      cancelBtn.addClass("btn btn-danger");
      cancelBtn.text("Cancelar");
      cancelBtn.on("click", function () {
        cancelEvent(btnData, btnStatus);
      });
      row.find(".cancelar").html(cancelBtn);
      table.prepend(row);
    });
    if (enableChangePrecinto) {
      $(".btn-change-precinto").removeAttr("disabled");
    } else {
      $(".btn-change-precinto").attr("disabled", true);
    }
    console.log("enableConfirmExit", enableConfirmExit);
    if (enableConfirmExit) {
      $(".btn-approve-exit").removeAttr("disabled");
    } else {
      $(".btn-approve-exit").attr("disabled", true);
    }
  }

  fixEventModal.find("form").on("submit", function (e) {
    e.preventDefault();
    var form = $(e.currentTarget);
    const msg = form.find(".response .alert");
    msg.hide();
    msg.html("");
    msg.removeClass("alert-success");
    msg.removeClass("alert-danger");
    $.ajax({
      url: "/action/aduanaEditViaje",
      data: form.serializeArray(),
      method: "post",
      dataType: "json",
      success: function (r) {
        console.log("aduanaEditViaje", r);
        if (r.status === "success") {
          if (r?.aduana) {
            if (r.aduana?.status === "success") {
              msg.addClass("alert-success");
            } else {
              msg.addClass("alert-warning");
            }
          } else {
            msg.addClass("alert-success");
          }
          msg.html(
            `${
              r?.msg ? r.msg : "Datos actualizados correctamente"
            }<br>Aduana: ${r?.aduana?.msg ? r?.aduana?.msg : ""}`
          );
        } else {
          msg.addClass("alert-danger");
          msg.html(
            `${r?.msg ? r.msg : "Error al actualizar datos"}<br>Aduana: ${
              r?.aduana?.msg ? r?.aduana?.msg : ""
            }`
          );
        }
        msg.fadeIn();
        if (r && r.hasOwnProperty("status")) {
          if (r.status === "success") {
            const sendAduana = form
              .find("#fix-event-aduana-check")
              .prop("checked");
            if (sendAduana) {
              $.ajax({
                url: "/action/aduanaEditEvent",
                data: {
                  plaid: form.find("[name=plaid]").val(),
                  event: form.find("[name=event]").val(),
                  status: "0",
                },
                method: "post",
                dataType: "json",
                success: function (r) {
                  console.log("aduanaEditEvent", r);
                },
                error: function (e1, e2, e3) {
                  console.warn(e1, e2, e3);
                },
              });
            }
          }
        }
      },
      error: function (e1, e2, e3) {
        console.warn(e1, e2, e3);
      },
    });
    return false;
  });

  $(document).on(
    "click",
    '[data-target="#change-precinto-modal"]',
    function (event) {
      var btn = $(event.currentTarget);
      var VjeId = btn.data("vjeid");
      var precintoid = btn.data("precintoid");
      var modal = $("#change-precinto-modal");
      modal.find("[name=VjeId").val(VjeId);
      modal.find("[name=precintoid").val(precintoid);
    }
  );

  $(document).on("input", "#change-precinto-precintoidnew", function (event) {
    var input = $(event.currentTarget);
    var val = input.val();
    loadPrecinto(val);
  });

  $(document).on(
    "click",
    "#change-precinto-modal .btn-update-precinto",
    function (event) {
      var btn = $(event.currentTarget);
      var input = btn.siblings("[name=precintoidnew]");
      var val = input.val();
      loadPrecinto(val);
    }
  );

  function loadPrecinto(val) {
    var modal = $("#change-precinto-modal");
    var alert = modal.find(".alert");
    var submitBtn = modal.find("[type=submit]");

    alert.hide();
    alert.text("");

    modal.find("td.bateria").text("...");
    modal.find("td.gps").text("...");
    modal.find("td.senal").text("...");
    modal.find("td.eslinga").text("...");
    modal.find("td.monitoreo").text("...");

    submitBtn.attr("disabled", true);

    $.ajax({
      url: "/action/load",
      method: "POST",
      data: { nqr: val },
      dataType: "JSON",
      success: function (r) {
        if (r.status === "success") {
          var bateria = r.data.bateria;
          var gps = r.data.gps;
          var senal = r.data.senal;
          var senaltext = r.data.senaltext;
          var eslinga = "0";
          var statusread = r.data.statusread;

          if (r.data.ultimoreporte) {
            eslinga = r.data.ultimoreporte.linga;
          }
          console.log("precinto data: ", bateria, gps, senaltext, eslinga);
          modal.find("td.bateria").text(bateria);
          modal.find("td.gps").text(gps);
          modal.find("td.senal").text(senaltext);
          modal.find("td.eslinga").text(eslinga);
          modal.find("td.monitoreo").text(statusread);
          if (statusread === "Listo") {
            submitBtn.removeAttr("disabled");
          }
        } else {
          if (r.msg) {
            alert.text(r.msg);
          } else {
            alert.text("Algo malió sal");
          }
          modal.find("td.bateria").text("-");
          modal.find("td.gps").text("-");
          modal.find("td.senal").text("-");
          modal.find("td.eslinga").text("-");
          modal.find("td.monitoreo").text("-");
          alert.show();
        }
      },
      error: function (e) {
        console.warn(e);
        modal.find("td.bateria").text("-");
        modal.find("td.gps").text("-");
        modal.find("td.senal").text("-");
        modal.find("td.eslinga").text("-");
        modal.find("td.monitoreo").text("-");
        alert.text("Algo salió mal");
        alert.show();
      },
    });
  }

  $(document).on("submit", "#change-precinto-form", function (event) {
    event.preventDefault();
    var form = $(event.currentTarget);
    var VjeId = form.find("[name=VjeId]").val();
    var precintoid = form.find("[name=precintoid]").val();
    var precintoidnew = form.find("[name=precintoidnew]").val();
    var pictureid = form.find("[name=pictureid]").val();
    $.ajax({
      url: form.attr("action"),
      method: "POST",
      dataType: "JSON",
      data: {
        VjeId: VjeId,
        precintoid: precintoid,
        precintoidnew: precintoidnew,
        pictureid: pictureid,
      },
      success: function (r) {
        if (r.status === "success") {
          window.location.href = "/armado/" + precintoidnew + "/" + VjeId;
          return;
        }
        if (r.msg) {
          alert(r.msg);
        } else {
          alert("algo anduvo mal");
        }
      },
      error: function (e) {
        console.warn(e);
        alert("Algo anduvo mal");
      },
    });
    return false;
  });

  setInterval(function () {
    update();
  }, 3000);
  update();
})(jQuery);
