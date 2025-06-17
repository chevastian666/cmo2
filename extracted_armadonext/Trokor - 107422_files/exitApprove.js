(function ($) {
  var approveExitModal = $("#approve-exit-modal");
  let currentCallback = () => {};

  function populateApproveExitModal(data, callback = () => {}) {
    console.log("populateApproveExitModal", data);
    approveExitModal.css("pointer-events", "none");
    approveExitModal.find("#approve-exit-pvid").val(data.pvid);
    approveExitModal.find("#approve-exit-NroTel").val(data.ConTel);
    approveExitModal.modal("show");
    currentCallback = callback;
  }

  window.populateApproveExitModal = populateApproveExitModal;

  $(document).on("click", ".btn-approve-exit", function (event) {
    var btn = $(event.currentTarget);
    var pvid = btn.data("pvid");
    var conTel = btn.data("contel");
    populateApproveExitModal({ pvid: pvid, ConTel: conTel });
  });

  $(document).on("submit", "#approve-exit-form", function (event) {
    event.preventDefault();
    var form = $(event.currentTarget);
    const formData = new FormData(form[0]);
    const submitBtn = $("#arm-confirm-btn");
    const loader = $("#loader-template-small").clone();
    loader.attr("id", "");
    submitBtn.html("");
    submitBtn.append(loader);
    submitBtn.prop("disabled", true);
    submitBtn.addClass("loading");

    $.ajax({
      url: form.attr("action"),
      method: "POST",
      dataType: "JSON",
      data: formData,
      processData: false,
      contentType: false,
      success: function (r) {
        if (currentCallback) {
          currentCallback(r);
          currentCallback = () => {};
        }
        if (r.status === "success") {
          if (
            window.location.pathname === "/" ||
            window.location.pathname === "/fast"
          ) {
            approveExitModal.modal("hide");
          } else {
            window.location.reload();
          }
          return;
        }
        if (r.msg) {
          alert(r.msg);
        } else {
          alert("algo anduvo mal");
        }
        submitBtn.html("Confirmar");
        $("#arm-confirm-btn").prop("disabled", false);
        $("#arm-confirm-btn").removeClass("loading");
      },
      error: function (e) {
        console.warn(e);
        alert("Algo anduvo mal");
        submitBtn.html("Confirmar");
        $("#arm-confirm-btn").prop("disabled", false);
        $("#arm-confirm-btn").removeClass("loading");
      },
    });
  });
})(jQuery);
