const MAX_FILE_SIZE_MB = 50;
const GAS_URL = "YOUR_GAS_WEB_APP_URL"; // ใส่ URL ของ Web App ของคุณ

document.getElementById("btnNext").addEventListener("click", openConfirmModal);
document.getElementById("btnSubmit").addEventListener("click", submitData);

function openConfirmModal() {
  const f = document.getElementById("formData");
  if (!f.checkValidity()) { f.reportValidity(); return; }

  const file = document.getElementById("pdfFile").files[0];
  if (!file) { alert("กรุณาเลือกไฟล์ PDF"); return; }

  if (file.size > MAX_FILE_SIZE_MB*1024*1024) {
    alert(`ไฟล์มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB กรุณาเลือกไฟล์ขนาดเล็กกว่า`);
    return;
  }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${f.date.value}<br>
    <b>เรื่อง:</b> ${f.title.value}<br>
    <b>ผู้เสนอ:</b> ${f.owner.value}<br>
    <b>หมายเหตุ:</b> ${f.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)
  `;
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}

function submitData() {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  const f = document.getElementById("formData");
  const file = document.getElementById("pdfFile").files[0];

  const formData = new FormData();
  formData.append("date", f.date.value);
  formData.append("title", f.title.value);
  formData.append("owner", f.owner.value);
  formData.append("note", f.note.value);
  formData.append("pdf", file, file.name);

  fetch(GAS_URL, { method: "POST", body: formData })
    .then(res => res.json())
    .then(res => {
      loading.hide();
      if (res.status==="success") {
        document.getElementById("successDetail").innerHTML = `
          <b>ลำดับเอกสาร:</b> ${res.number}<br>
          <b>วันที่:</b> ${f.date.value}<br>
          <b>เรื่อง:</b> ${f.title.value}<br>
          <b>ผู้เสนอ:</b> ${f.owner.value}<br>
          <b>หมายเหตุ:</b> ${f.note.value || "-"}<br>
          <b>ไฟล์:</b> <a href="${res.pdfUrl}" target="_blank">${file.name}</a>
        `;
        f.reset(); document.getElementById("pdfFile").value = "";
        new bootstrap.Modal(document.getElementById("successModal")).show();
      } else alert("ส่งข้อมูลล้มเหลว: "+res.message);
    })
    .catch(err => { loading.hide(); alert("ส่งข้อมูลล้มเหลว: "+err.message); });
}
