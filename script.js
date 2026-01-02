const form = document.getElementById("pdfForm");
const resultDiv = document.getElementById("result");

// ใส่ URL ของ GAS Web App
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultDiv.textContent = "กำลังส่ง...";
  resultDiv.className = "";

  try {
    const date = document.getElementById("date").value;
    const subject = document.getElementById("subject").value.trim();
    const owner = document.getElementById("owner").value.trim();
    const note = document.getElementById("note").value.trim();
    const fileInput = document.getElementById("file");

    if (!fileInput.files.length) throw new Error("กรุณาเลือกไฟล์ PDF");

    const file = fileInput.files[0];

    if (file.size > 20 * 1024 * 1024) throw new Error("ไฟล์ใหญ่เกิน 20 MB");

    const fileBase64 = await toBase64(file);

    const payload = {
      date,
      subject,
      owner,
      note,
      filename: file.name,
      mimeType: file.type,
      fileBase64
    };

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.status === "success") {
      resultDiv.className = "success";
      resultDiv.innerHTML = `ส่งเอกสารเรียบร้อย!<br>
        เลขที่: ${data.number}<br>
        <a href="${data.pdfUrl}" target="_blank">เปิด PDF</a><br>
        <a href="${data.qrUrl}" target="_blank">ดู QR Code</a>`;
    } else {
      throw new Error(data.message || "ส่งข้อมูลไม่สำเร็จ");
    }

  } catch (err) {
    resultDiv.className = "error";
    resultDiv.textContent = "เกิดข้อผิดพลาด: " + err.message;
  }
});

// แปลงไฟล์เป็น Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
