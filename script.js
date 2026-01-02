const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";
const MAX_FILE_SIZE_MB = 50;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

const confirmModal = document.getElementById("confirmModal");
const loadingModal = document.getElementById("loadingModal");
const successModal = document.getElementById("successModal");

// ===============================
// STEP 1 : แสดง Modal ตรวจสอบข้อมูล
// ===============================
btnNext.addEventListener("click", () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = pdfFile.files[0];
  if (!file) {
    alert("กรุณาเลือกไฟล์ PDF");
    return;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    alert(`ไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE_MB} MB`);
    return;
  }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  new bootstrap.Modal(confirmModal).show();
});

// ===============================
// STEP 2 : ส่งข้อมูลจริง (ใช้ form POST)
// ===============================
btnSubmit.addEventListener("click", () => {
  bootstrap.Modal.getInstance(confirmModal).hide();
  new bootstrap.Modal(loadingModal).show();

  // 🔹 กำหนด action ให้ฟอร์ม
  form.action = GAS_URL;
  form.method = "POST";
  form.enctype = "multipart/form-data";
  form.target = "hidden_iframe";

  form.submit();
});

// ===============================
// STEP 3 : รับผลลัพธ์จาก iframe
// ===============================
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.status === "success") {
    bootstrap.Modal.getInstance(loadingModal).hide();

    document.getElementById("successDetail").innerHTML = `
      <b>เลขที่เอกสาร:</b> ${event.data.number}<br>
      <b>วันที่:</b> ${event.data.date}<br>
      <b>เรื่อง:</b> ${event.data.subject}<br>
      <b>ผู้เสนอ:</b> ${event.data.owner}<br>
      <b>หมายเหตุ:</b> ${event.data.note || "-"}<br>
      <a href="${event.data.pdfUrl}" target="_blank">📎 เปิดไฟล์ PDF</a><br>
      <a href="${event.data.trackUrl}" target="_blank"
        class="btn btn-sm btn-outline-primary mt-2">ติดตามเอกสาร</a>
    `;

    const qrImg = document.getElementById("qrCodeImg");
    qrImg.src = event.data.qrUrl;

    const downloadLink = document.getElementById("downloadQR");
    downloadLink.href = event.data.qrUrl;
    downloadLink.download = `QR_${event.data.number}.png`;

    form.reset();
    new bootstrap.Modal(successModal).show();
  }

  if (event.data.status === "error") {
    bootstrap.Modal.getInstance(loadingModal).hide();
    alert("ส่งข้อมูลไม่สำเร็จ: " + event.data.message);
  }
});
