function tableSearch() {
  const $ = jQuery;
  //----------------- precinto search start -------------------------

  console.log($("#table-search-key"));
  const updateSearchField = (select, clearData = true) => {
    const type = select.val();
    const selectedOption = select
      .find("option")
      .filter((i, opt) => {
        return $(opt).attr("value") === type;
      })
      .get(0);
    console.log("selected option", type, $(selectedOption).data("keytype"));
    const keytype = $(selectedOption).data("keytype");
    $("#table-search, #table-search-status, #table-search-empresaid").hide();
    if (clearData) {
      $("#table-search, #table-search-status, #table-search-empresaid").val("");
    }
    console.log(
      "table-search",
      $("#table-search").val(),
      $("#table-search").attr("type"),
      $("#table-search").attr("value")
    );
    switch (keytype) {
      case "enum":
        $("#table-search-" + type).show();
        $("#table-search").attr("type", "text");
        break;
      case "text":
      case "number":
      case "search":
      default: //keytype);
        $("#table-search").show();
        $("#table-search").attr("type", "search");
        break;
    }
  };

  if (
    window.hasOwnProperty("precintostatus") &&
    Array.isArray(window.precintostatus)
  ) {
    $("#table-search-status").smartAutoComplete({
      source: window.precintostatus.map(
        (status) => status.status + " " + status.text
      ),
      filter: function (term, source) {
        console.log("filter", term, source);
        var filtered_and_sorted_list = $.map(source, function (item) {
          var score = item.toLowerCase().score(term.toLowerCase());
          if (score > 0) return { name: item, value: score };
        }).sort(function (a, b) {
          return b.value - a.value;
        });
        return $.map(filtered_and_sorted_list, function (item) {
          return item.name;
        });
      },
    });
  }

  $("#table-search-status").bind({
    itemSelect: function (ev, selected_item) {
      console.log("select", ev, selected_item);
      var options = $(this).smartAutoComplete();

      //get the text from selected item
      var selected_value = $(selected_item).text();
      var cur_list = $(this).val().split(",");
      cur_list[cur_list.length - 1] = selected_value;
      $(this).val(selected_value);

      var selectedStatus = window.precintostatus.filter(
        (status) => status.status + " " + status.text == selected_value
      );
      if (selectedStatus.length > 0) {
        $("#table-search").val(selectedStatus[0].status);
      }

      //set item selected property
      options.setItemSelected(true);

      //hide results container
      $(this).trigger("lostFocus");

      //prevent default event handler from executing
      ev.preventDefault();
    },
  });
  if (window.hasOwnProperty("empresas") && Array.isArray(window.empresas)) {
    $("#table-search-empresaid").smartAutoComplete({
      source: window.empresas.map(
        (empresa) => empresa.empresaid + " " + empresa.enombre
      ),
      filter: function (term, source) {
        console.log("filter", term, source);
        var filtered_and_sorted_list = $.map(source, function (item) {
          var score = item.toLowerCase().score(term.toLowerCase());
          if (score > 0) return { name: item, value: score };
        }).sort(function (a, b) {
          return b.value - a.value;
        });
        return $.map(filtered_and_sorted_list, function (item) {
          return item.name;
        });
      },
    });
  }

  $("#table-search-empresaid").bind({
    itemSelect: function (ev, selected_item) {
      console.log("select", ev, selected_item);
      var options = $(this).smartAutoComplete();

      //get the text from selected item
      var selected_value = $(selected_item).text();
      var cur_list = $(this).val().split(",");
      cur_list[cur_list.length - 1] = selected_value;
      $(this).val(selected_value);

      var empresa = window.empresas.filter(
        (emp) => emp.empresaid + " " + emp.enombre == selected_value
      );
      if (empresa.length > 0) {
        $("#table-search").val(empresa[0].empresaid);
      }

      //set item selected property
      options.setItemSelected(true);

      //hide results container
      $(this).trigger("lostFocus");

      //prevent default event handler from executing
      ev.preventDefault();
    },
  });

  $("#table-search-ubicacion").bind({
    itemSelect: function (ev, selected_item) {
      console.log("select", ev, selected_item);
      var options = $(this).smartAutoComplete();

      //get the text from selected item
      var selected_value = $(selected_item).text();
      var cur_list = $(this).val().split(",");
      cur_list[cur_list.length - 1] = selected_value;
      $(this).val(selected_value);

      var ubicacion = window.possibleLocations.filter(
        (ubc) => ubc.plid + " " + ubc.name == selected_value
      );

      if (ubicacion.length > 0) {
        $("#table-search").val(ubicacion[0].plid);
      }

      //set item selected property
      options.setItemSelected(true);

      //hide results container
      $(this).trigger("lostFocus");

      //prevent default event handler from executing
      ev.preventDefault();
    },
  });

  $("#table-search-key").on("change", (e) => {
    const select = $(e.currentTarget);
    updateSearchField(select);
  });

  updateSearchField($("#table-search-key"), false);

  //----------------- precinto search end -------------------------
}
