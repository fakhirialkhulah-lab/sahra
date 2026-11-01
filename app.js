
const SUPABASE_URL = "https://hzbkffvnpqhomxumbmbt.supabase.co";
const SUPABASE_KEY = "sb_publishable_7ye80yInwwrDCSLb3zFhjA_RR0coVTv";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// نوافذ تفاصيل الأفلام
const dialog = document.getElementById("infoDialog");
const title = document.getElementById("dialogTitle");
const desc = document.getElementById("dialogDesc");

document.querySelectorAll(".details").forEach(button => {
  button.addEventListener("click", () => {
    if (!dialog) return;
    if (title) title.textContent = button.dataset.title || "";
    if (desc) desc.textContent = button.dataset.desc || "";
    dialog.showModal();
  });
});

document.getElementById("closeDialog")?.addEventListener("click", () => {
  dialog?.close();
});

dialog?.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

// نافذة تسجيل الدخول
const loginBtn = document.getElementById("loginBtn");

const authDialog = document.createElement("dialog");
authDialog.id = "authDialog";
authDialog.dir = "rtl";

authDialog.innerHTML = `
  <div style="background:#151515;color:#fff;padding:25px;
    border:1px solid #c8a66a;border-radius:14px;
    width:min(85vw,360px);font-family:Arial">

    <button id="closeAuth" type="button"
      style="float:left;background:none;color:white;
      border:none;font-size:25px;cursor:pointer">×</button>

    <h2 style="color:#d6b77c">أهلًا بك في سهرة</h2>

    <form id="authForm">
      <input id="authEmail" type="email" placeholder="البريد الإلكتروني"
        autocomplete="email" required
        style="width:100%;padding:12px;margin:8px 0;
        box-sizing:border-box;border-radius:7px">

      <input id="authPassword" type="password"
        placeholder="كلمة المرور (6 أحرف على الأقل)"
        autocomplete="current-password" minlength="6" required
        style="width:100%;padding:12px;margin:8px 0;
        box-sizing:border-box;border-radius:7px">

      <button id="submitAuth" type="submit"
        style="width:100%;padding:12px;background:#c8a66a;
        color:#111;border:0;border-radius:7px;margin-top:10px">
        تسجيل الدخول
      </button>
    </form>

    <button id="switchAuth" type="button"
      style="background:none;color:#d6b77c;border:none;
      margin-top:15px;cursor:pointer">
      ليس لديك حساب؟ إنشاء حساب
    </button>

    <p id="authMessage" role="status" aria-live="polite"
      style="font-size:14px;line-height:1.7"></p>
  </div>
`;

authDialog.style.cssText =
  "padding:0;border:none;background:transparent;" +
  "max-width:95vw;max-height:90vh;";

document.body.appendChild(authDialog);

let signupMode = false;

const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const switchAuth = document.getElementById("switchAuth");
const submitAuth = document.getElementById("submitAuth");

function setMode(signup) {
  signupMode = signup;
  submitAuth.textContent = signup ? "إنشاء حساب" : "تسجيل الدخول";
  switchAuth.textContent = signup
    ? "لديك حساب؟ تسجيل الدخول"
    : "ليس لديك حساب؟ إنشاء حساب";
  authMessage.textContent = "";
}

switchAuth.addEventListener("click", () => {
  setMode(!signupMode);
});

document.getElementById("closeAuth").addEventListener("click", () => {
  authDialog.close();
});

authDialog.addEventListener("click", event => {
  if (event.target === authDialog) authDialog.close();
});

authForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  submitAuth.disabled = true;
  authMessage.textContent = "يرجى الانتظار...";

  try {
    if (signupMode) {
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.session) {
        authMessage.textContent = "تم إنشاء الحساب وتسجيل الدخول بنجاح.";
        authDialog.close();
      } else {
        authMessage.textContent =
          "تم إرسال طلب التسجيل. افحص بريدك الإلكتروني واضغط رابط التأكيد.";
      }
    } else {
      const { error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      authMessage.textContent = "تم تسجيل الدخول بنجاح.";
      authDialog.close();
    }
  } catch (error) {
    authMessage.textContent = "تعذر إكمال العملية: " + error.message;
  } finally {
    submitAuth.disabled = false;
  }
});

// تحديث زر الحساب
async function updateLoginButton() {
  const { data: { user }, error } = await db.auth.getUser();

  if (error || !user) {
    loginBtn.textContent = "تسجيل الدخول";
    return;
  }

  loginBtn.textContent = "تسجيل الخروج";
}

loginBtn?.addEventListener("click", async () => {
  const { data: { user } } = await db.auth.getUser();

  if (user) {
    const confirmed = confirm("هل تريد تسجيل الخروج؟");
    if (!confirmed) return;

    const { error } = await db.auth.signOut();

    if (error) {
      alert("تعذر تسجيل الخروج: " + error.message);
      return;
    }

    await updateLoginButton();
  } else {
    setMode(false);
    authForm.reset();
    authDialog.showModal();
  }
});

db.auth.onAuthStateChange(() => {
  updateLoginButton();
});

updateLoginButton();
