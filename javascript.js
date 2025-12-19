const MAX_FILE_SIZE_MB = 50;

// ปุ่มถัดไป → เปิด modal ยืนยัน
document.getElementById("btnNext").addEventListener("click", () => {
  const f = document.getElementById("formData");
  const file = document.getElementById("pdfFile").files[0];

  const date = f.elements['date'].value.trim();
  const title = f.elements['title'].value.trim();
  const owner = f.elements['owner'].value.trim();
  const note = f.elements['note'].value.trim();

  if (!date || !title || !owner) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  if (!file) {
    alert("กรุณาเลือกไฟล์ PDF");
    return;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    alert(`ไฟล์มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB กรุณาเลือกไฟล์ขนาดเล็กกว่า`);
    return;
  }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${date}<br>
    <b>เรื่อง:</b> ${title}<br>
    <b>ผู้เสนอ:</b> ${owner}<br>
    <b>หมายเหตุ:</b> ${note || "-"}<br>
    <b>ไฟล์:</b> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
  `;

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

// ปุ่มยืนยันส่งข้อมูล → ส่งไป GAS
document.getElementById("btnSubmit").addEventListener("click", async () => {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  const f = document.getElementById("formData");
  const file = document.getElementById("pdfFile").files[0];

  const formData = new FormData();
  formData.append("data", JSON.stringify({
    date: f.elements['date'].value,
    title: f.elements['title'].value,
    owner: f.elements['owner'].value,
    note: f.elements['note'].value
  }));
  formData.append("pdf", file);

  try {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec"; // เปลี่ยนเป็น URL Web App ของคุณ
    const res = await fetch(GAS_URL, { method: "POST", body: formData });
    const result = await res.json();

    loading.hide();

    if (result.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>ลำดับเอกสาร:</b> ${result.number}<br>
        <b>วันที่:</b> ${f.elements['date'].value}<br>
        <b>เรื่อง:</b> ${f.elements['title'].value}<br>
        <b>ผู้เสนอ:</b> ${f.elements['owner'].value}<br>
        <b>หมายเหตุ:</b> ${f.elements['note'].value || "-"}<br>
        <b>ไฟล์:</b> <a href="${result.pdfUrl}" target="_blank">${file.name}</a>
      `;
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
});
