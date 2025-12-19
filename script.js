const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";
const MAX_FILE_SIZE_MB = 50;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
const successModal = new bootstrap.Modal(document.getElementById("successModal"));

btnNext.addEventListener("click", () => {

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = pdfFile.files[0];
  if (!file) return alert("กรุณาเลือกไฟล์ PDF");
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return alert("ไฟล์เกิน 50 MB");

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  confirmModal.show();
});

btnSubmit.addEventListener("click", async () => {
  confirmModal.hide();
  loadingModal.show();

  const reader = new FileReader();
  reader.onload = async () => {

    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(reader.result))
    );

    const fd = new FormData();
    fd.append("data", JSON.stringify({
      date: form.date.value,
      subject: form.subject.value,
      owner: form.owner.value,
      note: form.note.value
    }));
    fd.append("pdf", base64);
    fd.append("filename", pdfFile.files[0].name);

    const res = await fetch(GAS_URL, { method: "POST", body: fd });
    const r = await res.json();

    loadingModal.hide();

    if (r.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>เลขที่เอกสาร:</b> ${r.number}<br>
        <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a>
      `;
      document.getElementById("qrCodeImg").src = r.qrCodeUrl;
      form.reset();
      successModal.show();
    } else {
      alert(r.message);
    }
  };

  reader.readAsArrayBuffer(pdfFile.files[0]);
});
