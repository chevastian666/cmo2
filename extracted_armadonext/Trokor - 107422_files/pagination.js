var Pagination = (function () {
  let instance;
  function createInstance(config) {
    const thisPag = new Object();

    thisPag.createBtn = (content, offset) => {
      let pageElement = $("#pagination-template").clone();
      pageElement.attr("id", "");
      let btn = pageElement.find(".btn");
      btn.html(content);
      btn.data("offset", offset);
      btn.on("click", (e) => {
        let currBtn = $(e.currentTarget);
        let currOffset = currBtn.data("offset");
        config.callback(currOffset);
      });
      return pageElement;
    };

    thisPag.update = (total, limit, offset) => {
      config.container.html("");

      let pageCount = Math.ceil(total / limit);
      let currPage = Math.floor(offset / limit) + 1;

      let firstBtn = thisPag.createBtn("<<", 0);
      if(offset == 0) {
        firstBtn.addClass("disabled");
      }
      config.container.append(firstBtn);

      let prevBtn = thisPag.createBtn("<", Math.max(offset - limit, 0));
      if(offset - limit < 0) {
        prevBtn.addClass("disabled");
      }
      config.container.append(prevBtn);

      let lastOffset = 0;
      for (let currOffset = 0; currOffset < total; currOffset += limit) {
        let page = Math.floor(currOffset / limit) + 1;
        let pageElement = thisPag.createBtn(page, currOffset);
        console.log("ele", page, currPage);
        if(offset == currOffset) {
          pageElement.addClass("active");
        }
        if(page < currPage - 2 || page > currPage + 2) {
          pageElement.addClass("hidden");
        }
        config.container.append(pageElement);
        lastOffset = currOffset;
      }
      let nextBtn = thisPag.createBtn(">", Math.min(offset + limit, lastOffset));
      if(offset + limit > lastOffset) {
        nextBtn.addClass("disabled");
      }
      config.container.append(nextBtn);

      let lastBtn = thisPag.createBtn(">> ", lastOffset);
      if(offset == lastOffset) {
        lastBtn.addClass("disabled");
      }
      config.container.append(lastBtn);

      let summary = $("<span>");
      summary.addClass("pagination-summary");
      summary.text("pág. " + currPage + " de " + pageCount);
      config.container.append(summary);
    };
    return thisPag;
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
