const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec"; // <-- ใส่ URL ของ GAS Web App
const MAX_FILE_SIZE_MB = 50;

document.getElementById("nextBtn").addEventListener("click", () => {
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
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  const f = document.getElementById("formData");
  const file = document.getElementById("pdfFile").files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const bytes = new Uint8Array(e.target.result);
    const base64 = btoa(String.fromCharCode(...bytes));
    const data = {
      date: f.date.value,
      title: f.title.value,
      owner: f.owner.value,
      note: f.note.value
    };

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ formData: data, fileName: file.name, base64Pdf: base64 }),
        headers: { "Content-Type": "application/json" }
      }).then(r=>r.json());

      loading.hide();
      if (res.status === "success") {
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
      } else {
        alert("ส่งข้อมูลล้มเหลว: " + res.message);
      }
    } catch(err) {
      loading.hide();
      alert("ส่งข้อมูลล้มเหลว: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
});
