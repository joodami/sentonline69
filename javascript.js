const MAX_FILE_SIZE_MB = 50;

document.getElementById("nextBtn").addEventListener("click", openConfirmModal);

function openConfirmModal(){
  const f = document.getElementById("formData");
  if(!f.checkValidity()){ f.reportValidity(); return; }

  const file = document.getElementById("pdfFile").files[0];
  if(!file){ alert("กรุณาเลือกไฟล์ PDF"); return; }
  if(file.size > MAX_FILE_SIZE_MB*1024*1024){ alert(`ไฟล์มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB`); return; }

  const modalHtml = `
<div class="modal fade" id="confirmModal" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content shadow-lg rounded-4 border-0" style="background: linear-gradient(135deg,#f0f8ff,#d0e7ff);">
      <div class="modal-header border-0 justify-content-center py-2">
        <h5 class="modal-title fw-bold text-primary m-0">🔍 ตรวจสอบข้อมูล</h5>
      </div>
      <div class="modal-body text-start py-2" style="line-height:1.4; word-wrap: break-word;">
        <b>วันที่:</b> ${f.date.value}<br>
        <b>เรื่อง:</b> ${f.title.value}<br>
        <b>ผู้เสนอ:</b> ${f.owner.value}<br>
        <b>หมายเหตุ:</b> ${f.note.value || "-"}<br>
        <b>ไฟล์:</b> ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)
      </div>
      <div class="modal-footer flex-column border-0 py-2">
        <button class="btn btn-primary w-100 py-2 mb-1" id="confirmSendBtn">✅ ยืนยันส่งข้อมูล</button>
        <button class="btn btn-secondary w-100 py-2" data-bs-dismiss="modal">✏️ แก้ไขข้อมูล</button>
      </div>
    </div>
  </div>
</div>`;
  document.getElementById("modals").innerHTML = modalHtml;
  const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
  modal.show();
  document.getElementById("confirmSendBtn").addEventListener("click", ()=>submitData(f,file,modal));
}

function submitData(form,file,modal){
  modal.hide();
  const loadingModalHtml = `
<div class="modal fade" id="loadingModal" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content shadow-lg rounded-4 border-0" style="background: linear-gradient(135deg,#e0f7ff,#b0e0ff);">
      <div class="modal-body text-center py-3">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <h5 class="fw-bold mb-0">กำลังส่งข้อมูล กรุณารอสักครู่...</h5>
      </div>
    </div>
  </div>
</div>`;
  document.getElementById("modals").innerHTML = loadingModalHtml;
  const loading = new bootstrap.Modal(document.getElementById("loadingModal"));
  loading.show();

  const formData = new FormData(form);
  fetch("", {method:"POST", body:formData})
    .then(res=>res.json())
    .then(res=>{
      loading.hide();
      if(res.status==="success"){
        const successHtml = `
<div class="modal fade" id="successModal" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content shadow-lg rounded-4 border-0" style="background: linear-gradient(135deg,#e6ffed,#b8f0c7);">
      <div class="modal-header border-0 justify-content-center py-2">
        <h4 class="modal-title fw-bold text-success m-0">🎉 ส่งข้อมูลสำเร็จ</h4>
      </div>
      <div class="modal-body text-start py-2" style="line-height:1.4; word-wrap: break-word;">
        <b>ลำดับเอกสาร:</b> ${res.number}<br>
        <b>วันที่:</b> ${form.date.value}<br>
        <b>เรื่อง:</b> ${form.title.value}<br>
        <b>ผู้เสนอ:</b> ${form.owner.value}<br>
        <b>หมายเหตุ:</b> ${form.note.value || "-"}<br>
        <b>ไฟล์:</b> <a href="${res.pdfUrl}" target="_blank">${file.name}</a>
      </div>
      <div class="modal-footer flex-column border-0 py-2">
        <button class="btn btn-success w-100 py-2" data-bs-dismiss="modal">✅ ตกลง</button>
      </div>
    </div>
  </div>
</div>`;
        document.getElementById("modals").innerHTML = successHtml;
        new bootstrap.Modal(document.getElementById("successModal")).show();
        form.reset(); document.getElementById("pdfFile").value="";
      } else alert("ผิดพลาด: "+res.message);
    })
    .catch(err=>{
      loading.hide();
      alert("ผิดพลาด: "+err.message);
    });
}
