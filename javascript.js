const MAX_FILE_SIZE_MB = 50;
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";

const form = document.getElementById("formData");

document.getElementById("btnNext").addEventListener("click", () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = document.getElementById("pdfFile").files[0];
  if (!file) return alert("กรุณาเลือกไฟล์ PDF");
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return alert(`ไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE_MB} MB`);

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  new bootstrap.Modal(confirmModal).show();
});

document.getElementById("btnSubmit").addEventListener("click", () => {
  bootstrap.Modal.getInstance(confirmModal).hide();
  const loading = new bootstrap.Modal(loadingModal);
  loading.show();

  const file = pdfFile.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(reader.result)));

    const fd = new FormData();
    fd.append("data", JSON.stringify({
      date: form.date.value,
      subject: form.subject.value,
      owner: form.owner.value,
      note: form.note.value
    }));
    fd.append("pdf", base64);
    fd.append("filename", file.name);

    try {
      const res = await fetch(GAS_URL, { method: "POST", body: fd });
      const r = await res.json();
      loading.hide();

      if (r.status === "success") {
        successDetail.innerHTML = `
          <b>เลขที่เอกสาร:</b> ${r.number}<br>
          <b>เรื่อง:</b> ${form.subject.value}<br>
          <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a>
        `;
        qrCodeImg.src = r.qrCodeUrl;
        form.reset();
        new bootstrap.Modal(successModal).show();
      } else {
        alert(r.message);
      }
    } catch (err) {
      loading.hide();
      alert(err.message);
    }
  };

  reader.readAsArrayBuffer(file);
});
