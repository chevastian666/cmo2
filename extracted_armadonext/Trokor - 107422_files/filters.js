const TAB_TRANSITO = "tab-in-transit";
const TAB_FINALIZADO = "tab-finished";
const STATUSES = {
  "tab-in-transit": 1,
  "tab-finished": 3,
};

var DashFilters = (function () {
  let instance;

  function createInstance(config) {
    const thisFilters = new Object();
    thisFilters.filters = {};
    thisFilters.sorts = {};
    thisFilters.offset = 0;
    thisFilters.limit = 10;
    thisFilters.tab = TAB_TRANSITO;

    let stored = localStorage.getItem("searchStatus");
    if (stored !== null) {
      thisFilters.offset = stored.offset;
      thisFilters.limit = stored.limit;
      thisFilters.tab = stored.tab;
    }
    thisFilters.status = STATUSES[thisFilters.tab];

    thisFilters.getAutocomplete = (name) => {
      if (
        name != "daterange" &&
        thisFilters.filters[name].autocomplete.loading !==
          thisFilters.filters[name].dom.val() &&
        (thisFilters.filters[name].autocomplete.value !=
          thisFilters.filters[name].dom.val() ||
          (thisFilters.filters[name].dom.val() === "" &&
            thisFilters.filters[name].autocomplete.list.length === 0))
      ) {
        const loader = $("#spinner-template").clone();
        loader.attr("id", "");
        const dataList = thisFilters.filters[name].dom.siblings(
          ".custom-datalist"
        );
        dataList.html("");
        dataList.append(loader);
        thisFilters.filters[name].autocomplete.timeout = setTimeout(() => {
          //console.log("autocomplete", name);
          const value = thisFilters.filters[name].dom.val();
          if (
            name != "daterange" &&
            thisFilters.filters[name].autocomplete.loading !== value &&
            (thisFilters.filters[name].autocomplete.value != value ||
              (value === "" &&
                thisFilters.filters[name].autocomplete.list.length === 0))
          ) {
            const params = {
              key: name,
              val: value,
            };
            thisFilters.filters[name].autocomplete.loading = value;
            callApi("autocomplete", params, (response) => {
              //console.log("Success:", response);
              thisFilters.filters[name].autocomplete.value = value;
              dataList.html("");
              if (response.data) {
                thisFilters.filters[name].autocomplete.list = response.data;
                let addElements = [];
                response.data.forEach((element) => {
                  let text = element[name];
                  if (text.indexOf("[") == 0) {
                    try {
                      let arr = JSON.parse(text);
                      arr.forEach((singleElement) => {
                        let obj = {};
                        obj[name] = singleElement;
                        addElements.push(obj);
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  } else {
                    addElements.push(element);
                  }
                });
                addElements.forEach((opt) => {
                  const optDom = $("<div>");
                  optDom.addClass("custom-datalist-option");
                  //console.log(opt);
                  let text = opt[name];
                  optDom.text(text);
                  dataList.append(optDom);
                  optDom.on("mousedown", (e) => {
                    let currOptDom = $(e.currentTarget);
                    let currVal = currOptDom.text();
                    let currInput = currOptDom
                      .closest(".filter-group")
                      .find("input");
                    currInput.val(currVal);
                    currInput.trigger("change");
                    currInput.focus();
                  });
                });
              }
            });
          }
        }, 1000);
      }
    };

    thisFilters.getFilters = () => {
      let result = {
        offset: thisFilters.offset,
        limit: thisFilters.limit,
        status: thisFilters.status,
        search_viaje: [],
      };
      $(".filters .sort-group input").each((i, ele) => {
        let radio = $(ele);
        if (radio.prop("checked")) {
          result[radio.attr("name")] = radio.val();
        }
      });
      for (const key in thisFilters.filters) {
        if (thisFilters.filters.hasOwnProperty(key)) {
          const filter = thisFilters.filters[key];
          if (key != "daterange") {
            if (filter.value != "") {
              result.search_viaje.push({
                metakey: key,
                metavalue: filter.value,
              });
            }
          } else if (thisFilters.tab != TAB_TRANSITO) {
            //console.log("Date", filter.value);
            let arr = filter.value.split(" - ");
            //console.log("date arr", arr);
            let startDate = moment(arr[0], "DD/MM/YYYY");
            let endDate = moment(arr[1], "DD/MM/YYYY");
            //console.log(startDate);
            //console.log(endDate);
            //console.log(startDate.unix());
            //console.log(endDate.unix());
            let numStart = startDate.unix();
            let numEnd = endDate.unix();
            if (!isNaN(numStart)) {
              result.startdate = numStart;
            }
            if (!isNaN(numEnd)) {
              result.enddate = numEnd + 86400; //agrega 24 horas al enddate para poder seleccionar un día inclusive
            }
          }
        }
      }
      return result;
    };

    thisFilters.updateFilters = (name = null) => {
      //console.log("updateFilters");
      let text = "";
      for (const key in thisFilters.filters) {
        //console.log("updateFilters", key);
        if (thisFilters.filters.hasOwnProperty(key)) {
          const filter = thisFilters.filters[key];
          //console.log(filter);
          if (
            filter.value != "" &&
            !(key == "daterange" && thisFilters.tab === TAB_TRANSITO)
          ) {
            filter.dom.closest(".filter-group").addClass("active");
            if (text !== "") {
              text += "<br>";
            }
            text += "<strong>" + filter.label + ": </strong>" + filter.value;
          } else {
            filter.dom.closest(".filter-group").removeClass("active");
          }
        }
      }
      if (text != "") {
        text = "<label>Filtrando por</label><br>" + text;
      }
      //console.log("updateFilters", text);
      //console.log("thisFilters", thisFilters);
      $("#filters-summary").html(text);
      //console.log("filters", thisFilters.filters);
      if (config.callback) {
        let currFilters = thisFilters.getFilters();
        config.callback(currFilters);
      }
    };

    //initialize each filter
    $(".filters .filter-group").each((index, filter) => {
      let input = $(filter).find("input");
      let name = input.attr("name");
      let label = input.attr("placeholder");
      let buttonClear = $(filter).find("button.clear");
      thisFilters.filters[name] = {
        name: name,
        dom: input,
        label: label,
        value: input.val(),
        autocomplete: {
          value: "",
          list: [],
          loading: null,
        },
      };
      input.on("change", (e) => {
        let ele = $(e.currentTarget);
        let name = ele.attr("name");
        thisFilters.filters[name].value = thisFilters.filters[name].dom.val();
        thisFilters.updateFilters(name);
      });
      input.on("keyup", (e) => {
        let ele = $(e.currentTarget);
        let name = ele.attr("name");
        //console.log("keyup", name);
        thisFilters.getAutocomplete(name);
      });
      input.on("focus", (e) => {
        //console.log("focus autocomplete");
        let ele = $(e.currentTarget);
        let name = ele.attr("name");
        thisFilters.getAutocomplete(name);
      });
      buttonClear.on("click", (e) => {
        let ele = $(e.currentTarget);
        let name = ele.siblings("input").attr("name");
        thisFilters.filters[name].value = "";
        input.val("");
        thisFilters.updateFilters(name);
      });
      if (input.data("isdaterange")) {
        if (thisFilters.tab == TAB_TRANSITO) {
          input.closest(".filter-group").hide();
        } else {
          input.closest(".filter-group").show();
        }
        //console.log("daterangepicker", input);
        $(input).on("cancel.daterangepicker", function (ev, picker) {
          //do something, like clearing an input
          $(input).val("");
        });

        $(input).on("apply.daterangepicker", function (ev, picker) {
          $(input).val(
            picker.startDate.format("DD/MM/YYYY") +
              " - " +
              picker.endDate.format("DD/MM/YYYY")
          );
        });
        let now = moment();
        let aMonthAgo = moment().subtract(1, "months");
        $(input).daterangepicker(
          {
            autoUpdateInput: false,
            locale: {
              cancelLabel: "Borrar",
              applyLabel: "Aplicar",
            },
          },
          function (start, end, label) {
            //console.log(
            //   "New date range selected: " +
            //     start.format("DD/MM/YYYY") +
            //     " to " +
            //     end.format("DD/MM/YYYY") +
            //     " (predefined range: " +
            //     label +
            //     ")"
            // );
          }
        );
      }
    });
    //console.log(thisFilters.filters);

    //initialize sort
    $(".filters .sort-group input").on("change", function (e) {
      let radio = $(e.currentTarget);
      //console.log(radio, radio.attr("name"), radio.val());

      thisFilters.updateFilters(radio.attr("name"));
    });
    $(".filters .toggle-more-sorts").on("click", function (e) {
      let btn = $(e.currentTarget);
      let target = btn.data("target");
      $('.toggle-hide [name="' + target + '"]').each((i, input) => {
        let formGroup = $(input).closest(".toggle-hide");
        if (formGroup.hasClass("hidden")) {
          formGroup.removeClass("hidden");
        } else {
          if (!$(input).prop("checked")) {
            formGroup.addClass("hidden");
          }
        }
      });
    });

    thisFilters.tabs = $(".map-side-panel .tabs-container .tab");
    thisFilters.tabsLabels = $(".map-side-panel .tabs-labels .tab-label");
    thisFilters.tabsLabels.each((index, label) =>
      $(label).on("click", (e) => {
        let tabLabel = $(e.currentTarget).data("target");
        thisFilters.switchTab(tabLabel);
      })
    );

    thisFilters.switchTab = (tabLabel) => {
      let executeCallback = false;
      if (thisFilters.tab != tabLabel && config.callback) {
        thisFilters.tab = tabLabel;
        thisFilters.status = STATUSES[thisFilters.tab];
        executeCallback = true;
      }
      thisFilters.tabsLabels.each((index, label) => {
        let target = $(label).data("target");
        if (target == tabLabel) {
          $(label).addClass("active");
        } else {
          $(label).removeClass("active");
        }
      });
      thisFilters.tabs.each((index, tab) => {
        if ($(tab).attr("id") == tabLabel) {
          $(tab).addClass("active");
          //$(tab).show();
        } else {
          $(tab).removeClass("active");
          //$(tab).hide();
        }
      });
      if (tabLabel === TAB_TRANSITO) {
        $(".daterange-filter").hide();
      } else {
        $(".daterange-filter").show();
      }
      if (executeCallback) {
        config.callback(thisFilters.getFilters());
      }
    };
    thisFilters.switchTab(TAB_TRANSITO);
    //console.log("filters", thisFilters.filters);
    return thisFilters;
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
