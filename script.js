// ================= CONFIG =================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";
const MAX_FILE_SIZE_MB = 50;
// ========================================

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

const confirmModalEl = document.getElementById("confirmModal");
const loadingModalEl = document.getElementById("loadingModal");
const successModalEl = document.getElementById("successModal");

const confirmModal = new bootstrap.Modal(confirmModalEl);
const loadingModal = new bootstrap.Modal(loadingModalEl);
const successModal = new bootstrap.Modal(successModalEl);

// ===============================
// STEP 1 : ตรวจสอบ + แสดง Modal ยืนยัน
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

  confirmModal.show();
});

// ===============================
// STEP 2 : ส่งข้อมูลจริง (HTML Form POST)
// ===============================
btnSubmit.addEventListener("click", () => {
  confirmModal.hide();
  loadingModal.show();

  // ใช้ค่าเดิมจาก HTML (ไม่เขียนทับซ้ำ)
  // action, method, enctype, target ถูกต้องแล้ว

  form.submit();

  // ===============================
  // STEP 3 : UX แสดงผลลัพธ์ (เพราะ GAS ส่ง JSON กลับไม่ได้)
  // ===============================
  setTimeout(() => {
    loadingModal.hide();

    document.getElementById("successDetail").innerHTML = `
      <b>ระบบรับข้อมูลเรียบร้อยแล้ว</b><br>
      กรุณาตรวจสอบการแจ้งเตือนทาง LINE<br>
      และใช้ QR Code เพื่อติดตามสถานะเอกสาร
    `;

    // QR จริงจะถูกสร้างและส่งผ่าน LINE
    document.getElementById("qrCodeImg").style.display = "none";
    document.getElementById("downloadQR").style.display = "none";

    form.reset();
    successModal.show();
  }, 2500);
});
