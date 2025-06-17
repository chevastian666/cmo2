$(document).ready(function (e) {
  $(".trokorTable").each((i, tableDom) => {
    console.log(
      "init data table",
      $(tableDom).data("table-call"),
      $(tableDom).data("table-data")
    );
    let table = $(tableDom).DataTable({
      pageLength: 20,
      serverSide: true,
      order: [[0, "desc"]],
      columns: $(tableDom)
        .data("table-columns")
        .map(function (column) {
          return {
            data: column.data,
            name: column.name,
            render: function (data, type, row) {
              if (column.hasOwnProperty("type")) {
                switch (column.type) {
                  case "date":
                    return moment.unix(data).format("MM/DD/YY HH:mm");
                  case "smscode":
                    var code = data.match(/(P\d+)/);
                    console.log("code match", code);
                    if (code !== null) {
                      return (
                        "<strong>" +
                        code[0] +
                        "</strong> <small>" +
                        data +
                        "</small>"
                      );
                    }
                    return data;
                  case "phone":
                    return data.replace(/^(\+598)/, "0");
                  default:
                    return data;
                }
              }
              return data;
            },
          };
        }),
      recordsTotal: $(tableDom).data("table-totalrows"),
      language: {
        decimal: "",
        emptyTable: "No hay datos disponibles en esta tabla",
        info: "Mostrando del _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "No hay entradas",
        infoFiltered: "(de un total de _MAX_)",
        infoPostFix: "",
        thousands: ",",
        lengthMenu: "Mostrar _MENU_ por página",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        search: "Buscar:",
        zeroRecords: "No se encontró",
        paginate: {
          first: "Primera",
          last: "Última",
          next: "Siguiente",
          previous: "Anterior",
        },
        aria: {
          sortAscending: ": activate to sort column ascending",
          sortDescending: ": activate to sort column descending",
        },
      },
      ajax: {
        url: $(tableDom).data("table-call"),
        method: "POST",
        dataType: "JSON",
        data: $(tableDom).data("table-data"),
        //dataSrc: "data",
      },
    }); // End of DataTable
    table.on("preDraw", (e) => {
      console.log("preDraw", e);
    });
    table.on("draw.dt", (e) => {
      console.log("draw.dt", e.currentTarget);
      let currTable = $(e.currentTarget);
    });
    setInterval(function () {
      table.ajax.reload();
    }, 10000);
  });
}); // End Document Ready Function
