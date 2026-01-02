const MAX_FILE_SIZE_MB = 50;
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec"; // ใส่ URL Web App ของคุณ

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
const successModal = new bootstrap.Modal(document.getElementById("successModal"));

const qrImg = document.getElementById("qrCodeImg");
const downloadQR = document.getElementById("downloadQR");

// STEP 1: ตรวจสอบ + แสดง Modal ยืนยัน
btnNext.addEventListener("click", () => {
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const file = pdfFile.files[0];
  if (!file) { alert("กรุณาเลือกไฟล์ PDF"); return; }
  if (file.size > MAX_FILE_SIZE_MB*1024*1024) { alert(`ไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE_MB} MB`); return; }

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  confirmModal.show();
});

// STEP 2: ส่งข้อมูลจริง
btnSubmit.addEventListener("click", () => {
  confirmModal.hide();
  loadingModal.show();

  const formData = new FormData(form);

  fetch(GAS_URL, { method: "POST", body: formData })
    .then(res => res.text())
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const script = temp.querySelector('script');
      let data = {};
      if(script){
        const match = script.textContent.match(/window\.parent\.postMessage\((.*), "\*"\)/);
        if(match && match[1]){
          data = JSON.parse(match[1]);
        }
      }

      loadingModal.hide();

      if(data.status === "success"){
        qrImg.src = data.qrUrl;
        downloadQR.href = data.qrUrl;
        document.getElementById("successDetail").innerHTML = `
          <b>ระบบรับข้อมูลเรียบร้อยแล้ว</b><br>
          เลขที่เอกสาร: <b>${data.number}</b><br>
          กรุณาตรวจสอบการแจ้งเตือนทาง LINE<br>
          ใช้ QR Code เพื่อติดตามสถานะเอกสาร
        `;
        form.reset();
        successModal.show();
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + (data.message || "ไม่สามารถส่งข้อมูลได้"));
      }

    }).catch(err => {
      loadingModal.hide();
      alert("❌ เกิดข้อผิดพลาด: " + err.message);
    });
});
