const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";
const MAX_FILE_SIZE_MB = 20;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

/* ===== ปุ่มถัดไป (ตรวจข้อมูล + เปิด modal ยืนยัน) ===== */
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
    alert("ไฟล์เกิน 20 MB");
    return;
  }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

/* ===== ปุ่มยืนยันส่งข้อมูล ===== */
btnSubmit.addEventListener("click", async () => {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();

  const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
  loadingModal.show();

  try {
    const fd = new FormData();
    fd.append("date", form.date.value);
    fd.append("subject", form.subject.value);
    fd.append("owner", form.owner.value);
    fd.append("note", form.note.value);
    fd.append("pdf", pdfFile.files[0]);

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: fd
    });

    const r = await res.json(); // GAS จะคืน JSON

    loadingModal.hide();

    if (r.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>เลขที่เอกสาร:</b> ${r.number}<br>
        <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a>
      `;
      document.getElementById("qrCodeImg").src = r.qrCodeUrl;
      form.reset();
      new bootstrap.Modal(document.getElementById("successModal")).show();
    } else {
      alert(r.message);
    }

  } catch (err) {
    loadingModal.hide();
    alert("ส่งข้อมูลไม่สำเร็จ");
    console.error(err);
  }
});
