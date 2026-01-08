const GAS_URL = "https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec";

document.getElementById("docForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);

  // สร้าง UUID เพื่อส่งเป็น ID เอกสาร
  const docId = crypto.randomUUID();
  fd.append("docId", docId);

  // สร้าง QR Code URL track.html
  const trackUrl = `track.html?id=${docId}`;

  // ส่งไป GAS
  fetch(GAS_URL, {
    method: "POST",
    body: fd,
    mode: "no-cors" // ป้องกัน CORS
  });

  // แสดง Modal ทันที
  showSuccessModal(trackUrl);

  // ล้างฟอร์ม
  form.reset();
});

function showSuccessModal(trackUrl) {
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";

  // สร้าง QR Code
  new QRCode(qrDiv, {
    text: trackUrl,
    width: 180,
    height: 180
  });

  // ตั้งลิงก์ดาวน์โหลด QR
  const img = qrDiv.querySelector("img");
  if (img) {
    const downloadBtn = document.getElementById("downloadQR");
    downloadBtn.href = img.src;
    downloadBtn.download = "qr_document.png";
  }

  // แสดง Modal
  const modal = new bootstrap.Modal(document.getElementById("successModal"));
  modal.show();
}
