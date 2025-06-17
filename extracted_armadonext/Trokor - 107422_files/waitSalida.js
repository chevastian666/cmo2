function getTransit() {
  const pvid = document.getElementById("pvid").value;
  $url = `/action/getTransit/${pvid}`;
  fetch($url)
    .then((response) => response.json())
    .then((data) => {
      console.log("response", data);
      if (typeof data?.data[0]?.aduana !== "undefined") {
        data.data[0].aduana.forEach((element, index) => {
          const isLast = index === data.data[0].aduana.length - 1;
          const praidTag = getPraidTag(element.praid);
          if (praidTag) {
            updatePraidTag(praidTag, element, isLast);
          } else {
            createPraidTag(element, isLast);
          }
        });
      }
      setTimeout(getTransit, 10000);
    })
    .catch((error) => {
      console.error("Error:", error);
      setTimeout(getTransit, 10000);
    });
}
getTransit();

function getPraidTag(praid) {
  return document.getElementById(`praid-${praid}`);
}

function createPraidTag(data, isLast) {
  const dom = document
    .querySelector(".templates #praid-template")
    .cloneNode(true);
  dom.setAttribute("id", `praid-${data.praid}`);
  updatePraidTag(dom, data, isLast);
  document.getElementById("praid-container").appendChild(dom);
}

function updatePraidTag(dom, data, isLast) {
  const praidDom = dom.querySelector(".praid-value");
  if (praidDom.innerHTML !== data.praid) {
    praidDom.innerHTML = data.praid;
  }
  const OprIdDom = dom.querySelector(".praid-OprId");
  if (OprIdDom.innerHTML !== data.OprId) {
    OprIdDom.innerHTML = data.OprId;
  }
  if (data.OprId == "SAL") {
    dom.classList.add("success");
    if (isLast) {
      document
        .getElementById("data-card")
        .classList.add("window-praid-success");
    }
  } else if (data.OprId === "LLE") {
    if (data?.Canal === "ROJO") {
      dom.classList.add("danger");
      if (isLast) {
        document
          .getElementById("data-card")
          .classList.add("window-praid-danger");
      }
    } else {
      dom.classList.add("success");
      if (isLast) {
        document
          .getElementById("data-card")
          .classList.add("window-praid-success");
      }
    }
  } else if (data.OprId === "LBR") {
    dom.classList.add("success");
    if (isLast) {
      document
        .getElementById("data-card")
        .classList.add("window-praid-success");
    }
  } else {
    dom.classList.add("warning");
  }
  const dateStr = readableDateAgo(data.trequest);
  const dateDom = dom.querySelector(".praid-date");
  if (dateDom.innerHTML !== dateStr) {
    dateDom.innerHTML = dateStr;
  }

  const msgStr = createMessage(data);
  const msgDom = dom.querySelector(".praid-msg");
  if (msgDom.innerHTML !== msgStr) {
    msgDom.innerHTML = msgStr;
  }
}

function createMessage(data) {
  if (data?.OprId === "SAL") {
    return "Salida de aduana confirmada";
  } else if (data.OprId === "LLE") {
    if (data?.Canal === "ROJO") {
      return "Revisión aduanera pendiente";
    } else {
      return "Llegada a aduana confirmada";
    }
  }
  return "";
}

function readableDateAgo(unixTimestamp) {
  const date = new Date(parseInt(unixTimestamp) * 1000);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    if (days === 1) {
      return `ayer`;
    }
    return `hace ${days} días`;
  } else if (hours > 0) {
    if (hours === 1) {
      return `hace 1 hora`;
    }
    return `hace ${hours} horas`;
  } else if (minutes > 0) {
    if (minutes === 1) {
      return `hace 1 minuto`;
    }
    return `hace ${minutes} minutos`;
  } else {
    if (seconds === 1) {
      return `hace 1 segundo`;
    }
    return `hace ${seconds} segundos`;
  }
}
