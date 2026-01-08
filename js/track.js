const GAS_URL = "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec";

function getDocId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchDoc(docId) {
  try {
    const res = await fetch(`${GAS_URL}?id=${docId}`);
    const data = await res.json();
    document.getElementById("docNo").textContent = data.docNo;
    document.getElementById("date").textContent = data.date;
    document.getElementById("subject").textContent = data.subject;
    document.getElementById("presenter").textContent = data.presenter;
    document.getElementById("note").textContent = data.note;
    document.getElementById("fileLink").href = data.file;
    document.getElementById("status").textContent = data.status;
  } catch(err) {
    alert("ไม่สามารถดึงข้อมูลเอกสารได้");
  }
}

const docId = getDocId();
if (docId) fetchDoc(docId);
