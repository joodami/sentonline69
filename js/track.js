const params = new URLSearchParams(window.location.search);
const docId = params.get("id");
if(docId){
  fetch(`https://script.google.com/macros/s/AKfycbwuDcU1vMre_FwOFpc-0HIP-SHwYepp25iBq2wJ8twk53BXNVaNklx0d7IzvRzFeEMi/exec?id=${docId}`)
  .then(r=>r.json())
  .then(data=>{
    const container = document.getElementById("docInfo");
    if(data.status==="error"){ container.innerText = data.message; return; }
    container.innerHTML = `
      <p><b>เลขเอกสาร:</b> ${data.docNo}</p>
      <p><b>วันที่:</b> ${data.date}</p>
      <p><b>เรื่อง:</b> ${data.subject}</p>
      <p><b>ผู้เสนอ:</b> ${data.presenter}</p>
      <p><b>หมายเหตุ:</b> ${data.note}</p>
      <p><b>ไฟล์เอกสาร:</b> <a href="${data.file}" target="_blank">คลิกดู PDF</a></p>
      <p><b>สถานะ:</b> ${data.status}</p>
    `;
  });
}
