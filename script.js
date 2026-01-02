const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec"; // เปลี่ยนเป็น URL ของคุณ
const MAX_FILE_SIZE_MB = 20;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

// แสดง modal ยืนยัน
btnNext.addEventListener("click", () => {
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const file = pdfFile.files[0];
  if (!file) return alert("กรุณาเลือกไฟล์ PDF");
  if (file.size > MAX_FILE_SIZE_MB*1024*1024) return alert(`ไฟล์เกิน ${MAX_FILE_SIZE_MB} MB`);

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

// ส่งข้อมูลไป GAS (FormData POST)
btnSubmit.addEventListener("click", async () => {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
  loadingModal.show();

  try {
    const file = pdfFile.files[0];
    if(!file) throw new Error("กรุณาเลือกไฟล์ PDF");

    const formData = new FormData();
    formData.append("date", form.date.value);
    formData.append("subject", form.subject.value);
    formData.append("owner", form.owner.value);
    formData.append("note", form.note.value);
    formData.append("pdfFile", file);

    const res = await fetch(GAS_URL, { method: "POST", body: formData });
    const r = await res.json();
    loadingModal.hide();

    if(r.status==="success"){
      document.getElementById("successDetail").innerHTML = `
        <b>เลขที่เอกสาร:</b> ${r.number}<br>
        <b>วันที่:</b> ${r.date}<br>
        <b>เรื่อง:</b> ${r.subject}<br>
        <b>ผู้เสนอ:</b> ${r.owner}<br>
        <b>หมายเหตุ:</b> ${r.note || "-"}<br>
        <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a><br>
        <b>LINE Status:</b> ${r.lineStatus}
      `;

      const qrImg = document.getElementById("qrCodeImg");
      qrImg.src = r.qrUrl;
      const downloadLink = document.getElementById("downloadQR");
      downloadLink.href = r.qrUrl;
      downloadLink.setAttribute("download", `QR_${r.number}.png`);

      form.reset();
      new bootstrap.Modal(document.getElementById("successModal")).show();
    } else {
      alert("ส่งข้อมูลไม่สำเร็จ: " + r.message);
    }
  } catch(err){
    loadingModal.hide();
    alert("ส่งข้อมูลไม่สำเร็จ: " + err.message);
    console.error(err);
  }
});
