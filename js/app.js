const GAS_URL = "https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec";

document.getElementById("docForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const fd = new FormData(form);

  fetch(GAS_URL, {
    method: "POST",
    body: fd,
    mode: "no-cors"   // ⭐ แก้ CORS ตรงนี้
  })
  .then(() => {
    // ❗ ห้ามอ่าน response
    // ถือว่าส่งสำเร็จ
    showSuccess();
    form.reset();
  })
  .catch(() => {
    alert("ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่");
  });
});

function showSuccess() {
  const modal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  modal.show();
}
