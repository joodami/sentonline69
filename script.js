const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec"; // ใส่ URL ใหม่ที่ deploy
const MAX_FILE_SIZE_MB = 20;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

// ---------------------------
// Next: แสดง Modal ยืนยัน
// ---------------------------
btnNext.addEventListener("click", () => {
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const file = pdfFile.files[0];
  if (!file) return alert("กรุณาเลือกไฟล์ PDF");
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return alert(`ไฟล์เกิน ${MAX_FILE_SIZE_MB} MB`);

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

// ---------------------------
// Submit: ส่งข้อมูล
// ---------------------------
btnSubmit.addEventListener("click", async () => {
  bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
  loadingModal.show();

  try {
    const file = pdfFile.files[0];
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const payload = {
      date: form.date.value,
      subject: form.subject.value,
      owner: form.owner.value,
      note: form.note.value,
      filename: file.name,
      mimeType: file.type,
      fileBase64: base64
    };

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const resText = await res.text();
    let r;
    try { 
      r = JSON.parse(resText); 
    } catch(err) { 
      loadingModal.hide(); 
      alert("ไม่สามารถ parse response จาก server"); 
      console.error(resText); 
      return; 
    }

    loadingModal.hide();

    if (r.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>เลขที่เอกสาร:</b> ${r.number}<br>
        <b>วันที่:</b> ${r.date}<br>
        <b>เรื่อง:</b> ${r.subject}<br>
        <b>ผู้เสนอ:</b> ${r.owner}<br>
        <b>หมายเหตุ:</b> ${r.note || "-"}<br>
        <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a>
      `;

      // ---------------------------
      // แสดง QR Code จาก Drive
      // ---------------------------
      const qrImg = document.getElementById("qrCodeImg");
      qrImg.src = r.qrUrl;

      // ---------------------------
      // ดาวน์โหลด QR Code ทันทีจาก Drive
      // ---------------------------
      const downloadLink = document.getElementById("downloadQR");
      downloadLink.href = r.qrUrl;
      downloadLink.setAttribute("download", `QR_${r.number}.png`);

      downloadLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const resp = await fetch(r.qrUrl);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `QR_${r.number}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });

      form.reset();
      new bootstrap.Modal(document.getElementById("successModal")).show();
    } else {
      alert(r.message);
    }

  } catch (err) {
    loadingModal.hide();
    alert("ส่งข้อมูลไม่สำเร็จ: " + err.message);
    console.error(err);
  }
});
