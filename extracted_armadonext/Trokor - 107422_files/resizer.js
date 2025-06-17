let stored, storage;
/*try {*/
storage = window.localStorage;
const storedString = storage.getItem("resizers");
//console.log(stored);
if (storedString == null) {
  stored = {};
} else {
  stored = JSON.parse(storedString);
}
/*} catch (error) {
  //console.log("localStorage error", error);
}*/
$(document).ready(function () {
  //console.log("ready!");
  $(".resizer").each((index, ele) => {
    const eleId = ele.id;
    const leftId = ele.dataset.left;
    const rightId = ele.dataset.right;
    const leftEle = document.getElementById(leftId);
    const rightEle = document.getElementById(rightId);
    // console.log(leftEle.offsetWidth);
    // console.log(window.innerWidth);
    let storedObject = {
      left: leftEle.offsetWidth / window.innerWidth,
    };
    //console.log(storedObject);
    if (stored.hasOwnProperty(eleId)) {
      storedObject = stored[eleId];
    }
    //console.log(storedObject);

    //Make the DIV element draggagle:
    dragElement(ele, leftEle, rightEle, storedObject);
    //console.log(leftEle.offsetWidth + "px");
    //console.log("storedObject", storedObject.left * window.innerWidth + "px");
  });
});

function dragElement(elmnt, leftEle, rightEle, storeObj) {
  elmnt.onmousedown = dragMouseDown;

  $(leftEle)
    .find(".resizer-minimize-btn")
    .on("click", () => {
      setSizes(240, 240, null);
    });

  $(leftEle)
    .find(".resizer-maximize-btn")
    .on("click", () => {
      setSizes(window.innerWidth, window.innerWidth, null);
    });

  $(leftEle)
    .find(".resizer-less-btn")
    .on("click", () => {
      if (leftEle.offsetWidth <= 300) {
        setSizes(240, 240, null);
      } else if (leftEle.offsetWidth <= 500) {
        setSizes(300, 300, null);
      } else if (leftEle.offsetWidth <= 700) {
        setSizes(500, 500, null);
      } else if (leftEle.offsetWidth <= 1000) {
        setSizes(700, 700, null);
      } else {
        setSizes(1000, 1000, null);
      }
    });

  $(leftEle)
    .find(".resizer-more-btn")
    .on("click", () => {
      if (leftEle.offsetWidth >= 1000) {
        setSizes(window.innerWidth, window.innerWidth, null);
      } else if (leftEle.offsetWidth >= 700) {
        setSizes(1000, 1000, null);
      } else if (leftEle.offsetWidth >= 500) {
        setSizes(700, 700, null);
      } else if (leftEle.offsetWidth >= 300) {
        setSizes(500, 500, null);
      } else {
        setSizes(300, 300, null);
      }
    });

  const iniLeftPos = storeObj.left * window.innerWidth;
  const inileftWidth = storeObj.left * window.innerWidth;
  setSizes(iniLeftPos, inileftWidth, null);

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    const leftPos = elmnt.offsetLeft - pos1;
    const leftWidth = elmnt.offsetLeft;
    setSizes(leftPos, leftWidth, null);
  }

  function setSizes(leftPos, leftWidth, rightWidth) {
    //$("#width-text").text(leftWidth + "px");
    if (!isNaN(leftPos)) {
      elmnt.style.left = leftPos + "px";
    }
    if (!isNaN(leftWidth)) {
      leftEle.style.width = leftWidth + "px";
      leftEle.style.maxWidth = leftWidth + "px";
      $(leftEle).removeClass("xs");
      $(leftEle).removeClass("sm");
      $(leftEle).removeClass("md");
      $(leftEle).removeClass("lg");
      $(leftEle).removeClass("xl");
      if (leftWidth < 300) {
        $(leftEle).addClass("xs");
      } else if (leftWidth < 500) {
        $(leftEle).addClass("sm");
      } else if (leftWidth < 700) {
        $(leftEle).addClass("md");
      } else if (leftWidth < 1000) {
        $(leftEle).addClass("lg");
      } else {
        $(leftEle).addClass("xl");
      }
    }
    if (!isNaN(rightWidth)) {
      rightEle.style.width = rightWidth + "px";
      rightEle.style.maxWidth = rightWidth + "px";
    }
    stored[elmnt.id] = {
      left: leftEle.offsetWidth / window.innerWidth,
    };
    //console.log("stored", stored);
    storage.setItem("resizers", JSON.stringify(stored));

    $(leftEle)
      .find(".resizer-minimize-btn")
      .on("click", () => {
        setSizes(240, 240, null);
      });

    $(leftEle)
      .find(".resizer-maximize-btn")
      .on("click", () => {
        setSizes(window.innerWidth, window.innerWidth, null);
      });

    if (leftEle.offsetWidth >= window.innerWidth) {
      $(leftEle).find(".resizer-maximize-btn").addClass("disabled");
      $(leftEle).find(".resizer-more-btn").addClass("disabled");
    } else {
      $(leftEle).find(".resizer-maximize-btn").removeClass("disabled");
      $(leftEle).find(".resizer-more-btn").removeClass("disabled");
    }

    if (leftEle.offsetWidth <= 240) {
      $(leftEle).find(".resizer-less-btn").addClass("disabled");
      $(leftEle).find(".resizer-minimize-btn").addClass("disabled");
    } else {
      $(leftEle).find(".resizer-less-btn").removeClass("disabled");
      $(leftEle).find(".resizer-minimize-btn").removeClass("disabled");
    }
    window.matchColumns(true);
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    window.matchColumns(true);
  }
}
