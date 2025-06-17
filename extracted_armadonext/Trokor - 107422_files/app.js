$(document).ready(() => {});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var initMap = function () {
  window.updateColumns = function (refElement) {
    const max = {};
    $("#result-list .single-result:not(.ref-element) [data-column]").each(
      (i, col) => {
        const colName = $(col).data("column");
        const currWidth = $(col).width();
        if (max.hasOwnProperty(colName)) {
          max[colName] = Math.max(max[colName], currWidth);
        } else {
          max[colName] = currWidth;
        }
        if (max[colName] == currWidth) {
          refElement
            .find('[data-column="' + colName + '"]')
            .html($(col).html());
        }
      }
    );
    window.columnsReady = true;
  };

  var observer = new MutationObserver(function (mutations, observer) {
    // fired when a mutation occurs
    window.matchColumns();
    // ...
  });
  // define what element should be observed by the observer
  // and what types of mutations trigger the callback
  observer.observe(document, {
    subtree: true,
    attributes: true,
    //...
  });

  dash = Dashboard.getInstance();
};
window.lastColumnsUpdate = 0;
window.matchColumns = function (force = false) {
  let now = new Date().getTime();
  if (window.columnsReady && (force || now - window.lastColumnsUpdate > 5000)) {
    window.lastColumnsUpdate = now;
    const max = {};
    let refElement = $("#result-list .ref-element");
    if (refElement.length > 0) {
      refElement.find("[data-column]").each((i, col) => {
        const colName = $(col).data("column");
        const currWidth = $(col).width();
        $(
          '#result-list .single-result:not(.ref-element) [data-column="' +
            colName +
            '"]'
        ).css("width", currWidth + "px");
      });
    }
  }
};

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
