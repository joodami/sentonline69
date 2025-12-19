const MAX_FILE_SIZE_MB = 50;
// ใส่ Web App URL ของ Google Apps Script ที่ Deploy เป็น Web App แล้ว
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";

function getFormData() {
  const f = document.getElementById("formData");
  return {
    date: f.date.value,
    title: f.title.value,
    owner: f.owner.value,
    note: f.note.value,
    file: document.getElementById("pdfFile").files[0]
  };
}

function openConfirmModal() {
  const data = getFormData();
  if (!data.date || !data.title || !data.owner || !data.file) {
    alert("กรุณากรอกข้อมูลให้ครบและเลือกไฟล์ PDF");
    return;
  }
  if (data.file.size > MAX_FILE_SIZE_MB*1024*1024) {
    alert(`ไฟล์เกิน ${MAX_FILE_SIZE_MB} MB`);
    return;
  }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${data.date}<br>
    <b>เรื่อง:</b> ${data.title}<br>
    <b>ผู้เสนอ:</b> ${data.owner}<br>
    <b>หมายเหตุ:</b> ${data.note || "-"}<br>
    <b>ไฟล์:</b> ${data.file.name} (${(data.file.size/1024/1024).toFixed(2)} MB)
  `;
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}

async function sendToGAS(data) {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  try {
    const formData = new FormData();
    formData.append("date", data.date);
    formData.append("title", data.title);
    formData.append("owner", data.owner);
    formData.append("note", data.note);
    formData.append("pdf", data.file);

    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    loading.hide();

    if (result.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>วันที่:</b> ${data.date}<br>
        <b>เรื่อง:</b> ${data.title}<br>
        <b>ผู้เสนอ:</b> ${data.owner}<br>
        <b>หมายเหตุ:</b> ${data.note || "-"}<br>
        <b>ไฟล์:</b> <a href="${result.pdfUrl}" target="_blank">${data.file.name}</a>
      `;
      document.getElementById("formData").reset();
      document.getElementById("pdfFile").value = "";
      new bootstrap.Modal(document.getElementById("successModal")).show();
    } else {
      alert("ส่งข้อมูลล้มเหลว: " + result.message);
    }

  } catch (err) {
    loading.hide();
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
}
