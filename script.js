const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";
const MAX_FILE_SIZE_MB = 20;

const form = document.getElementById("formData");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const pdfFile = document.getElementById("pdfFile");

btnNext.addEventListener("click", () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = pdfFile.files[0];
  if (!file) return alert("กรุณาเลือกไฟล์ PDF");
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return alert("ไฟล์เกิน 20 MB");

  document.getElementById("confirmText").innerHTML = `
    <b>วันที่:</b> ${form.date.value}<br>
    <b>เรื่อง:</b> ${form.subject.value}<br>
    <b>ผู้เสนอ:</b> ${form.owner.value}<br>
    <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
    <b>ไฟล์:</b> ${file.name}
  `;

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
});

btnSubmit.addEventListener("click", async () => {
  bootstrap.Modal
    .getInstance(document.getElementById("confirmModal"))
    .hide();

  const loadingModal = new bootstrap.Modal(
    document.getElementById("loadingModal")
  );
  loadingModal.show();

  try {
    const file = pdfFile.files[0];

    // แปลงไฟล์เป็น Base64
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

    // ❗❗ สำคัญ: ห้ามใส่ headers
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const text = await res.text(); // ปลอดภัยกว่า json()
    const r = JSON.parse(text);

    loadingModal.hide();

    if (r.status === "success") {
      document.getElementById("successDetail").innerHTML = `
        <b>เลขที่เอกสาร:</b> ${r.number}<br>
        <a href="${r.pdfUrl}" target="_blank">เปิดไฟล์ PDF</a>
      `;
      document.getElementById("qrCodeImg").src = r.qrCodeUrl;
      form.reset();
      new bootstrap.Modal(
        document.getElementById("successModal")
      ).show();
    } else {
      alert(r.message);
    }

  } catch (err) {
    loadingModal.hide();
    alert("ส่งข้อมูลไม่สำเร็จ");
    console.error(err);
  }
});
