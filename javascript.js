const MAX_FILE_SIZE_MB = 50;
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";

document.getElementById("btnNext").addEventListener("click", () => {
  const f = document.getElementById("formData");
  if (!f.checkValidity()) { f.reportValidity(); return; }

  const file = document.getElementById("pdfFile").files[0];
  if (!file) { alert("กรุณาเลือกไฟล์ PDF"); return; }
  if (file.size > MAX_FILE_SIZE_MB*1024*1024) { alert(`ไฟล์มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB`); return; }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${f.date.value}<br>
    <b>เรื่อง:</b> ${f.title.value}<br>
    <b>ผู้เสนอ:</b> ${f.owner.value}<br>
    <b>หมายเหตุ:</b> ${f.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)
  `;
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

document.getElementById("btnSubmit").addEventListener("click", () => {
  const f = document.getElementById("formData");
  const file = document.getElementById("pdfFile").files[0];

  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(e.target.result)));

    const formData = new FormData();
    formData.append("data", JSON.stringify({
      date: f.date.value,
      title: f.title.value,
      owner: f.owner.value,
      note: f.note.value
    }));
    formData.append("pdf", base64);
    formData.append("filename", file.name);

    try {
      const res = await fetch(GAS_URL, { method: "POST", body: formData });
      const result = await res.json();
      loading.hide();

      if (result.status==="success") {
        document.getElementById("successDetail").innerHTML = `
          <b>ลำดับเอกสาร:</b> ${result.number}<br>
          <b>วันที่:</b> ${f.date.value}<br>
          <b>เรื่อง:</b> ${f.title.value}<br>
          <b>ผู้เสนอ:</b> ${f.owner.value}<br>
          <b>หมายเหตุ:</b> ${f.note.value || "-"}<br>
          <b>ไฟล์:</b> <a href="${result.pdfUrl}" target="_blank">${file.name}</a>
        `;
        document.getElementById("qrCodeImg").src = result.qrCodeUrl;
        f.reset();
        document.getElementById("pdfFile").value = "";
        new bootstrap.Modal(document.getElementById("successModal")).show();
      } else {
        alert("ส่งข้อมูลล้มเหลว: " + result.message);
      }
    } catch (err) {
      loading.hide();
      alert("ส่งข้อมูลล้มเหลว: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
});
