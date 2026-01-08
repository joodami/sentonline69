const GAS_URL = "https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec";

document.getElementById("docForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);

  // สร้าง UUID สำหรับเอกสาร
  const docId = crypto.randomUUID();
  fd.append("docId", docId);

  // QR Code URL
  const trackUrl = `track.html?id=${docId}`;

  // ส่งข้อมูลไป GAS (no-cors)
  fetch(GAS_URL, {
    method: "POST",
    body: fd,
    mode: "no-cors"
  });

  // แสดง Modal + QR Code
  showSuccessModal(trackUrl);

  // ล้างฟอร์ม
  form.reset();
});

function showSuccessModal(trackUrl) {
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, { text: trackUrl, width: 180, height: 180 });

  const img = qrDiv.querySelector("img");
  if (img) {
    const downloadBtn = document.getElementById("downloadQR");
    downloadBtn.href = img.src;
  }

  const modal = new bootstrap.Modal(document.getElementById("successModal"));
  modal.show();
}
