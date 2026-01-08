const GAS_URL = "https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec";

document.getElementById("docForm").addEventListener("submit", e => {
  e.preventDefault();

  const fd = new FormData(e.target);

  fetch(GAS_URL, { method:"POST", body: fd })
    .then(r => r.json())
    .then(d => {
      const trackUrl = `track.html?id=${d.docId}`;

      const qrDiv = document.getElementById("qrcode");
      qrDiv.innerHTML = "";
      new QRCode(qrDiv, { text: trackUrl, width:180, height:180 });

      document.getElementById("downloadQR").href =
        qrDiv.querySelector("img").src;

      new bootstrap.Modal("#successModal").show();
    });
});
