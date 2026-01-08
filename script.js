const form = document.getElementById("docForm");
const resultDiv = document.getElementById("result");
const qrImg = document.getElementById("qrImg");
const downloadBtn = document.getElementById("downloadBtn");

// ใส่ URL ของ GAS Web App ของคุณ (Deploy เป็น "Anyone, even anonymous")
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoIvxr_ZfswqI-Yxw2rbL5BavUx2PLa8FbyU6W37OwXxcAE0eg5GcUBbBnL6KYEvmd/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = form.file.files[0];
  if (!file) return alert("เลือกไฟล์ PDF ด้วยค่ะ");

  const reader = new FileReader();
  reader.onload = async function() {
    const fileBase64 = reader.result.split(",")[1];

    const payload = {
      date: form.date.value,
      subject: form.subject.value,
      owner: form.owner.value,
      note: form.note.value,
      filename: file.name,
      mimeType: file.type,
      fileBase64
    };

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (data.status === "success") {
        qrImg.src = data.qrCodeUrl;
        downloadBtn.href = data.pdfUrl;
        resultDiv.style.display = "block";
        form.reset();
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch(err) {
      alert("เกิดข้อผิดพลาด: " + err);
    }
  };
  reader.readAsDataURL(file);
});
