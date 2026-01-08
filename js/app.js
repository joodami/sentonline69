document.getElementById("docForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const docId = crypto.randomUUID();
  formData.append("docId", docId);

  try {
    const resp = await fetch("https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec", {
      method: "POST",
      body: formData
    });
    const data = await resp.json();
    if(data.status==="success"){
      // แสดง QR Code
      const trackUrl = `track.html?id=${docId}`;
      QRCode.toCanvas(document.getElementById("qrCode"), trackUrl, function (error) {
        if (error) console.error(error);
      });
      const trackLink = document.getElementById("trackLink");
      trackLink.href = trackUrl;
      trackLink.download = `track_${docId}.png`;

      new bootstrap.Modal(document.getElementById("successModal")).show();
      form.reset();
    }
  } catch(err){ console.error(err); alert("ส่งข้อมูลไม่สำเร็จ"); }
});
