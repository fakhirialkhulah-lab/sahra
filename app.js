const dialog = document.getElementById('infoDialog');
const title = document.getElementById('dialogTitle');
const desc = document.getElementById('dialogDesc');
document.querySelectorAll('.details').forEach(button => {
  button.addEventListener('click', () => {
    title.textContent = button.dataset.title || 'تفاصيل العمل';
    desc.textContent = button.dataset.desc || '';
    dialog.showModal();
  });
});
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
document.getElementById('loginBtn').addEventListener('click', () => {
  alert('تسجيل الدخول غير مفعّل في النسخة التجريبية. سنضيفه بعد إعداد قاعدة البيانات.');
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
