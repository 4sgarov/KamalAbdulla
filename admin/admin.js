/* ---------- TOAST BİLDİRİŞİ ---------- */
const adminToast = document.getElementById("adminToast");
let toastTimer = null;

function showToast(message) {
  adminToast.textContent = message;
  adminToast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => adminToast.classList.remove("show"), 2200);
}

/* ---------- İKON QISAYOLLARI ---------- */
const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
const ICON_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
const ICON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';

/* ---------- FAYL YÜKLƏMƏ KÖMƏKÇİLƏRİ (video/şəkil) ----------
   Seçilən fayl base64 data: URI-ya çevrilib localStorage-da saxlanılır.
   Bu YALNIZ kiçik fayllar üçün etibarlıdır (~5-8 MB-a qədər) — brauzer
   yaddaşının həcm limiti var. Böyük fayl seçiləndə saveData() false
   qaytarır və çağıran tərəf istifadəçini xəbərdar edir. */
function humanFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  const units = ["KB", "MB", "GB"];
  let i = -1;
  do {
    bytes /= 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return bytes.toFixed(1) + " " + units[i];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleFileChange(fileInput, statusEl, onLoaded) {
  const file = fileInput.files[0];
  if (!file) return;
  statusEl.textContent = "Yüklənir…";
  try {
    const dataUrl = await readFileAsDataUrl(file);
    onLoaded(dataUrl);
    statusEl.textContent = file.name + " (" + humanFileSize(file.size) + ")";
  } catch (err) {
    statusEl.textContent = "Xəta baş verdi";
  }
}

/* ---------- LOGIN ----------
   Giriş serverdə yoxlanılır (api/admin-bookings.php, admin-config.php-dəki
   hash ilə). Uğurlu girişdən sonra məlumatlar yalnız bu tab-ın
   sessionStorage-ında saxlanılır və hər API sorğusuna başlıq kimi əlavə
   olunur — tab bağlananda silinir. */
const ADMIN_API = "../api/admin-bookings.php";
const ADMIN_SESSION_KEY = "admin_credentials";

let adminCredentials = null;
try { adminCredentials = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)); } catch (e) {}

/* Admin API sorğusu. 401 gəlsə sessiya bitir və giriş ekranı açılır. */
async function adminFetch(options) {
  const opts = options || {};
  const res = await fetch(ADMIN_API, {
    method: opts.method || "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-User": adminCredentials ? adminCredentials.u : "",
      "X-Admin-Password": adminCredentials ? adminCredentials.p : "",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (res.status === 401) {
    adminCredentials = null;
    try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch (e) {}
    showAdminLogin();
  }
  return { res, data };
}

const adminLogin = document.getElementById("adminLogin");
const adminApp = document.getElementById("adminApp");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");
const adminLogoutBtn = document.getElementById("adminLogout");

function showAdminApp() {
  adminLogin.hidden = true;
  adminApp.hidden = false;
  renderAll();
}

function showAdminLogin() {
  adminApp.hidden = true;
  adminLogin.hidden = false;
}

adminLoginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = adminLoginForm.querySelector(".submit-btn");
  adminCredentials = {
    u: document.getElementById("adminUsername").value.trim(),
    p: document.getElementById("adminPassword").value,
  };
  submitBtn.disabled = true;
  adminLoginError.hidden = true;
  try {
    const { res } = await adminFetch({ method: "POST", body: { action: "login" } });
    if (res.ok) {
      try { sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminCredentials)); } catch (err) {}
      adminLoginForm.reset();
      showAdminApp();
    } else {
      adminCredentials = null;
      adminLoginError.textContent = res.status === 401
        ? "İstifadəçi adı və ya şifrə yanlışdır."
        : "Server cavab vermir. Bir az sonra yenidən cəhd edin.";
      adminLoginError.hidden = false;
    }
  } catch (err) {
    adminCredentials = null;
    adminLoginError.textContent = "Serverə qoşulmaq olmadı. İnternet bağlantınızı yoxlayın.";
    adminLoginError.hidden = false;
  }
  submitBtn.disabled = false;
});

adminLogoutBtn.addEventListener("click", () => {
  adminCredentials = null;
  try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch (e) {}
  showAdminLogin();
});


/* ---------- BÖLMƏ NAVİQASİYASI ---------- */
const adminNavButtons = document.querySelectorAll(".admin-nav-link[data-section]");
const adminSections = document.querySelectorAll(".admin-section");

adminNavButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    adminNavButtons.forEach(b => b.classList.toggle("active", b === btn));
    adminSections.forEach(s => s.classList.toggle("active", s.dataset.section === btn.dataset.section));
  });
});

/* ---------- DASHBOARD ---------- */
function renderDashboard() {
  document.getElementById("statUsers").textContent = getUsers().length;
  document.getElementById("statSeminars").textContent = getSeminars().length;
  document.getElementById("statBlog").textContent = getBlogPosts().length;
  document.getElementById("statPortfolio").textContent = getPortfolio().length;
}

/* ============================================================
   REZERVASİYALAR (serverdən — api/admin-bookings.php)
   ============================================================ */
const bookingsTableBody = document.getElementById("bookingsTableBody");
const bookingsEmpty = document.getElementById("bookingsEmpty");
const bookingFilters = document.getElementById("bookingFilters");
const pendingBadge = document.getElementById("pendingBadge");
const refreshBookingsBtn = document.getElementById("refreshBookingsBtn");

const BOOKING_STATUS_LABELS = {
  pending: "Gözləyir",
  approved: "Təsdiqlənib",
  rejected: "İmtina",
};

const PAYMENT_STATUS_LABELS = {
  paid: "Ödənilib",
  unpaid: "Ödənilməyib",
  failed: "Ödəniş alınmadı",
};

let allBookings = [];
let bookingFilter = "pending";

/* Köhnə rezervasiyalarda status "booked" ola bilər — onlar da gözləyəndir */
function bookingStatus(b) {
  return BOOKING_STATUS_LABELS[b.status] ? b.status : "pending";
}

/* "12:00–14:00"; köhnə rezervasiyalarda bitmə yoxdursa — bir saat */
function formatBookingRange(b) {
  const end = b.end || String(Number(String(b.time).slice(0, 2)) + 1).padStart(2, "0") + ":00";
  return `${b.time}–${end}`;
}

function formatBookingDate(iso) {
  const [y, m, d] = String(iso).split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

function renderBookingsTable() {
  const pendingCount = allBookings.filter(b => bookingStatus(b) === "pending").length;
  pendingBadge.textContent = pendingCount;
  pendingBadge.hidden = pendingCount === 0;

  const list = bookingFilter === "all"
    ? allBookings
    : allBookings.filter(b => bookingStatus(b) === bookingFilter);
  bookingsEmpty.hidden = list.length > 0;
  bookingsTableBody.innerHTML = list.map(b => {
    const status = bookingStatus(b);
    return `
    <tr>
      <td>${escapeHtml(formatBookingDate(b.date))}</td>
      <td class="admin-cell-time">${escapeHtml(formatBookingRange(b))}</td>
      <td>${escapeHtml(b.name)}</td>
      <td><a class="admin-phone" href="tel:${escapeHtml(String(b.phone).replace(/[^\d+]/g, ""))}">${escapeHtml(b.phone)}</a></td>
      <td class="admin-cell-time">
        ${b.total !== undefined ? escapeHtml(b.total + " AZN") : "—"}
        ${b.payment ? `<span class="payment-status ${escapeHtml(b.payment)}">${PAYMENT_STATUS_LABELS[b.payment] || ""}</span>` : ""}
        ${b.payriff_order_id && b.payment !== "paid" ? `<button class="admin-link-btn" data-action="check_payment" data-id="${escapeHtml(b.id)}">Yoxla</button>` : ""}
      </td>
      <td class="admin-cell-muted admin-cell-note">${escapeHtml(b.message || "—")}</td>
      <td><span class="booking-status ${status}">${BOOKING_STATUS_LABELS[status]}</span></td>
      <td>
        <div class="admin-row-actions">
          ${status !== "approved" ? `<button class="admin-text-btn approve" data-action="approve" data-id="${escapeHtml(b.id)}">Təsdiqlə</button>` : ""}
          ${status !== "rejected" ? `<button class="admin-text-btn" data-action="reject" data-id="${escapeHtml(b.id)}">İmtina</button>` : ""}
          <button class="admin-icon-btn danger" data-action="delete" data-id="${escapeHtml(b.id)}" aria-label="Sil">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

async function loadBookings() {
  refreshBookingsBtn.disabled = true;
  try {
    const { res, data } = await adminFetch();
    if (res.ok) {
      allBookings = Array.isArray(data.bookings) ? data.bookings : [];
      renderBookingsTable();
      if (data.settings) renderSettings(data.settings);
    } else if (res.status !== 401) {
      showToast(data.error || "Rezervasiyaları yükləmək olmadı");
    }
  } catch (e) {
    showToast("Serverə qoşulmaq olmadı");
  }
  refreshBookingsBtn.disabled = false;
}

bookingFilters.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  bookingFilter = btn.dataset.status;
  bookingFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
  renderBookingsTable();
});

refreshBookingsBtn.addEventListener("click", loadBookings);

bookingsTableBody.addEventListener("click", async e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "delete" && !confirm("Bu rezervasiya silinsin?")) return;

  btn.disabled = true;
  try {
    const { res, data } = await adminFetch({ method: "POST", body: { action, id } });
    if (res.ok) {
      showToast({
        approve: "Təsdiqləndi — saatlar saytda dolu görünür",
        reject: "İmtina edildi",
        delete: "Silindi",
        check_payment: "Ödəniş statusu: " + (PAYMENT_STATUS_LABELS[data.payment] || data.payment),
      }[action]);
    } else if (res.status !== 401) {
      showToast(data.error || "Xəta baş verdi");
    }
  } catch (err) {
    showToast("Serverə qoşulmaq olmadı");
  }
  loadBookings();
});

/* ============================================================
   AYARLAR — saat başı qiymət və admin şifrəsi (serverdə saxlanılır)
   ============================================================ */
const priceForm = document.getElementById("priceForm");
const pricePerHourInput = document.getElementById("pricePerHour");
const priceExample = document.getElementById("priceExample");
const passwordForm = document.getElementById("passwordForm");
const passwordError = document.getElementById("passwordError");

function renderPriceExample() {
  const price = Number(pricePerHourInput.value) || 0;
  priceExample.textContent = `Məsələn: 1 saat — ${price} AZN, 2 saat — ${price * 2} AZN, 3 saat — ${price * 3} AZN`;
}

const payriffForm = document.getElementById("payriffForm");
const payriffSecret = document.getElementById("payriffSecret");
const payriffStatus = document.getElementById("payriffStatus");
const payriffDisable = document.getElementById("payriffDisable");

function renderPayriffStatus(configured) {
  payriffStatus.textContent = configured ? "Qoşulub — ödəniş aktivdir" : "Qoşulmayıb — rezervasiyalar ödənişsiz qəbul olunur";
  payriffStatus.classList.toggle("is-on", !!configured);
  payriffDisable.hidden = !configured;
}

async function savePayriffSecret(secret) {
  try {
    const { res, data } = await adminFetch({ method: "POST", body: { action: "set_payriff", secret } });
    if (res.ok) {
      payriffSecret.value = "";
      renderPayriffStatus(data.settings && data.settings.payriff_configured);
      showToast(secret ? "Payriff qoşuldu" : "Onlayn ödəniş söndürüldü");
    } else if (res.status !== 401) {
      showToast(data.error || "Xəta baş verdi");
    }
  } catch (err) {
    showToast("Serverə qoşulmaq olmadı");
  }
}

payriffForm.addEventListener("submit", e => {
  e.preventDefault();
  const secret = payriffSecret.value.trim();
  if (!secret) { showToast("Açarı yapışdırın"); return; }
  savePayriffSecret(secret);
});

payriffDisable.addEventListener("click", () => {
  if (confirm("Onlayn ödəniş söndürülsün? Rezervasiyalar ödənişsiz qəbul olunacaq.")) savePayriffSecret("");
});

function renderSettings(settings) {
  renderPayriffStatus(settings.payriff_configured);
  /* İstifadəçi hazırda yazırsa, dəyəri üstündən yazmırıq */
  if (document.activeElement !== pricePerHourInput) {
    pricePerHourInput.value = settings.price_per_hour;
  }
  renderPriceExample();
}

pricePerHourInput.addEventListener("input", renderPriceExample);

priceForm.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = priceForm.querySelector(".submit-btn");
  submitBtn.disabled = true;
  try {
    const { res, data } = await adminFetch({
      method: "POST",
      body: { action: "set_price", price_per_hour: Number(pricePerHourInput.value) },
    });
    if (res.ok) showToast("Qiymət yadda saxlanıldı");
    else if (res.status !== 401) showToast(data.error || "Xəta baş verdi");
  } catch (err) {
    showToast("Serverə qoşulmaq olmadı");
  }
  submitBtn.disabled = false;
});

passwordForm.addEventListener("submit", async e => {
  e.preventDefault();
  const next = document.getElementById("newPassword").value;
  const repeat = document.getElementById("newPasswordRepeat").value;
  passwordError.hidden = true;
  if (next.length < 8) {
    passwordError.textContent = "Yeni şifrə ən azı 8 simvol olmalıdır.";
    passwordError.hidden = false;
    return;
  }
  if (next !== repeat) {
    passwordError.textContent = "Şifrələr eyni deyil.";
    passwordError.hidden = false;
    return;
  }

  const submitBtn = passwordForm.querySelector(".submit-btn");
  submitBtn.disabled = true;
  try {
    const { res, data } = await adminFetch({ method: "POST", body: { action: "change_password", new_password: next } });
    if (res.ok) {
      /* Sonrakı sorğular yeni şifrə ilə getsin */
      adminCredentials = { u: adminCredentials.u, p: next };
      try { sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminCredentials)); } catch (err) {}
      passwordForm.reset();
      showToast("Şifrə dəyişdirildi");
    } else if (res.status !== 401) {
      passwordError.textContent = data.error || "Xəta baş verdi";
      passwordError.hidden = false;
    }
  } catch (err) {
    passwordError.textContent = "Serverə qoşulmaq olmadı";
    passwordError.hidden = false;
  }
  submitBtn.disabled = false;
});

/* ============================================================
   ABOUT ME
   ============================================================ */
const aboutForm = document.getElementById("aboutForm");
const aboutPreview = document.getElementById("aboutPreview");
const aboutPhotoFile = document.getElementById("aboutPhotoFile");
const aboutPhotoStatus = document.getElementById("aboutPhotoStatus");
const aboutBody = document.getElementById("aboutBody");

let pendingAboutPhoto = null;

function renderAboutForm() {
  const about = getAbout();
  pendingAboutPhoto = null;
  aboutPhotoFile.value = "";
  aboutPreview.src = about.photo;
  aboutPhotoStatus.textContent = "Seçilməyib";
  aboutBody.value = about.paragraphs.join("\n\n");
}

aboutPhotoFile.addEventListener("change", () => {
  handleFileChange(aboutPhotoFile, aboutPhotoStatus, url => {
    pendingAboutPhoto = url;
    aboutPreview.src = url;
  });
});

aboutForm.addEventListener("submit", e => {
  e.preventDefault();
  const paragraphs = aboutBody.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  if (paragraphs.length === 0) {
    aboutBody.focus();
    return;
  }

  const current = getAbout();
  const data = {
    photo: pendingAboutPhoto !== null ? pendingAboutPhoto : current.photo,
    paragraphs: paragraphs
  };

  const saved = setAbout(data);
  if (!saved) {
    alert("Diqqət: seçdiyiniz şəkil brauzerin daimi yaddaşına sığmadı. Dəyişiklik yalnız bu səhifə açıq qaldığı müddətdə görünəcək — daha kiçik ölçülü şəkil seçin.");
  } else {
    showToast("Yadda saxlanıldı ✓");
  }
  renderAboutForm();
});

/* ---------- ÜMUMİ: SİLMƏ TƏSDİQİ ---------- */
const confirmModal = document.getElementById("confirmModal");
const confirmModalClose = document.getElementById("confirmModalClose");
const confirmText = document.getElementById("confirmText");
const confirmCancel = document.getElementById("confirmCancel");
const confirmDelete = document.getElementById("confirmDelete");

let pendingDelete = null;

function askDeleteConfirm(message, onConfirm) {
  confirmText.textContent = message;
  pendingDelete = onConfirm;
  confirmModal.classList.add("show");
}

function closeConfirmModal() {
  confirmModal.classList.remove("show");
  pendingDelete = null;
}

confirmModalClose.addEventListener("click", closeConfirmModal);
confirmCancel.addEventListener("click", closeConfirmModal);
confirmModal.addEventListener("click", e => {
  if (e.target === confirmModal) closeConfirmModal();
});
confirmDelete.addEventListener("click", () => {
  if (pendingDelete) pendingDelete();
  closeConfirmModal();
});

/* ============================================================
   USERS
   ============================================================ */
const usersTableBody = document.getElementById("usersTableBody");
const usersEmpty = document.getElementById("usersEmpty");
const userModal = document.getElementById("userModal");
const userModalClose = document.getElementById("userModalClose");
const userModalTitle = document.getElementById("userModalTitle");
const userForm = document.getElementById("userForm");
const addUserBtn = document.getElementById("addUserBtn");

let editingUserId = null;

function renderUsersTable() {
  const users = getUsers();
  usersEmpty.hidden = users.length > 0;
  usersTableBody.innerHTML = users.map(u => `
    <tr>
      <td>${escapeHtml(u.firstName)}</td>
      <td>${escapeHtml(u.lastName)}</td>
      <td class="admin-cell-muted">${escapeHtml(u.instagram || "—")}</td>
      <td class="admin-cell-muted">${escapeHtml(u.email)}</td>
      <td class="admin-cell-muted">${escapeHtml(u.joined || "—")}</td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-edit="${escapeHtml(u.id)}" aria-label="Redaktə et">${ICON_EDIT}</button>
          <button class="admin-icon-btn danger" data-delete="${escapeHtml(u.id)}" aria-label="Sil">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openUserModal(user) {
  editingUserId = user ? user.id : null;
  userModalTitle.textContent = user ? "İstifadəçini redaktə et" : "Yeni istifadəçi";
  document.getElementById("userFirstName").value = user ? user.firstName : "";
  document.getElementById("userLastName").value = user ? user.lastName : "";
  document.getElementById("userInstagram").value = user ? (user.instagram || "") : "";
  document.getElementById("userEmail").value = user ? user.email : "";
  userModal.classList.add("show");
}

function closeUserModal() {
  userModal.classList.remove("show");
}

addUserBtn.addEventListener("click", () => openUserModal(null));
userModalClose.addEventListener("click", closeUserModal);
userModal.addEventListener("click", e => { if (e.target === userModal) closeUserModal(); });

userForm.addEventListener("submit", e => {
  e.preventDefault();
  const users = getUsers();
  const data = {
    firstName: document.getElementById("userFirstName").value.trim(),
    lastName: document.getElementById("userLastName").value.trim(),
    instagram: document.getElementById("userInstagram").value.trim(),
    email: document.getElementById("userEmail").value.trim()
  };

  if (editingUserId) {
    const idx = users.findIndex(u => u.id === editingUserId);
    if (idx !== -1) users[idx] = Object.assign({}, users[idx], data);
  } else {
    users.push(Object.assign({ id: makeId("user"), joined: new Date().toISOString().slice(0, 10) }, data));
  }

  const saved = setUsers(users);
  if (!saved) {
    alert("Diqqət: dəyişiklik brauzerin daimi yaddaşına sığmadı və yalnız bu səhifə açıq qaldığı müddətdə görünəcək.");
  } else {
    showToast("Yadda saxlanıldı ✓");
  }
  closeUserModal();
  renderUsersTable();
  renderDashboard();
});

usersTableBody.addEventListener("click", e => {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    const user = getUsers().find(u => u.id === editId);
    if (user) openUserModal(user);
  }

  if (deleteId) {
    askDeleteConfirm("Bu istifadəçini silmək istədiyinizə əminsiniz?", () => {
      setUsers(getUsers().filter(u => u.id !== deleteId));
      renderUsersTable();
      renderDashboard();
    });
  }
});

/* ============================================================
   SEMINARS
   ============================================================ */
const seminarsTableBody = document.getElementById("seminarsTableBody");
const seminarModalAdmin = document.getElementById("seminarModalAdmin");
const seminarAdminModalClose = document.getElementById("seminarAdminModalClose");
const seminarModalAdminTitle = document.getElementById("seminarModalAdminTitle");
const seminarForm = document.getElementById("seminarForm");
const addSeminarBtn = document.getElementById("addSeminarBtn");
const seminarTrailerFile = document.getElementById("seminarTrailerFile");
const seminarFullFile = document.getElementById("seminarFullFile");
const seminarTrailerStatus = document.getElementById("seminarTrailerStatus");
const seminarFullStatus = document.getElementById("seminarFullStatus");

let editingSeminarId = null;
/* null = bu sahə dəyişdirilmir (redaktədə mövcud videonu saxla).
   "" və ya data: URI = istifadəçi bu formada faktiki seçim edib. */
let pendingTrailerData = null;
let pendingFullData = null;

seminarTrailerFile.addEventListener("change", () => {
  handleFileChange(seminarTrailerFile, seminarTrailerStatus, url => { pendingTrailerData = url; });
});

seminarFullFile.addEventListener("change", () => {
  handleFileChange(seminarFullFile, seminarFullStatus, url => { pendingFullData = url; });
});

function renderSeminarsTable() {
  const seminars = getSeminars();
  seminarsTableBody.innerHTML = seminars.map(s => `
    <tr>
      <td><img class="admin-thumb" src="${escapeHtml(s.cover)}" alt=""></td>
      <td>${escapeHtml(s.title)}</td>
      <td class="admin-cell-muted">${escapeHtml(s.price)}</td>
      <td class="admin-cell-muted">${escapeHtml((s.description || "").slice(0, 60))}${s.description && s.description.length > 60 ? "…" : ""}</td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-edit="${escapeHtml(s.id)}" aria-label="Redaktə et">${ICON_EDIT}</button>
          <button class="admin-icon-btn danger" data-delete="${escapeHtml(s.id)}" aria-label="Sil">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openSeminarModal(seminar) {
  editingSeminarId = seminar ? seminar.id : null;
  pendingTrailerData = null;
  pendingFullData = null;
  seminarTrailerFile.value = "";
  seminarFullFile.value = "";
  seminarModalAdminTitle.textContent = seminar ? "Seminarı redaktə et" : "Yeni seminar";
  document.getElementById("seminarTitle").value = seminar ? seminar.title : "";
  document.getElementById("seminarPrice").value = seminar ? seminar.price : "";
  document.getElementById("seminarCover").value = seminar ? seminar.cover : "";
  document.getElementById("seminarDescription").value = seminar ? seminar.description : "";
  seminarTrailerStatus.textContent = seminar && seminar.trailerVideo ? "Video mövcuddur" : "Seçilməyib";
  seminarFullStatus.textContent = seminar && seminar.fullVideo ? "Video mövcuddur" : "Seçilməyib";
  seminarModalAdmin.classList.add("show");
}

function closeSeminarModal() {
  seminarModalAdmin.classList.remove("show");
}

addSeminarBtn.addEventListener("click", () => openSeminarModal(null));
seminarAdminModalClose.addEventListener("click", closeSeminarModal);
seminarModalAdmin.addEventListener("click", e => { if (e.target === seminarModalAdmin) closeSeminarModal(); });

seminarForm.addEventListener("submit", e => {
  e.preventDefault();
  const seminars = getSeminars();
  const data = {
    title: document.getElementById("seminarTitle").value.trim(),
    price: document.getElementById("seminarPrice").value.trim(),
    cover: document.getElementById("seminarCover").value.trim(),
    description: document.getElementById("seminarDescription").value.trim()
  };
  if (pendingTrailerData !== null) data.trailerVideo = pendingTrailerData;
  if (pendingFullData !== null) data.fullVideo = pendingFullData;

  if (editingSeminarId) {
    const idx = seminars.findIndex(s => s.id === editingSeminarId);
    if (idx !== -1) seminars[idx] = Object.assign({}, seminars[idx], data);
  } else {
    seminars.push(Object.assign({ id: makeId("seminar"), trailerVideo: "", fullVideo: "" }, data));
  }

  const saved = setSeminars(seminars);
  if (!saved) {
    alert("Diqqət: seçdiyiniz video brauzerin daimi yaddaşına sığmadı. Dəyişiklik yalnız bu səhifə açıq qaldığı müddətdə görünəcək — səhifəni yeniləsəniz itəcək. Daha kiçik ölçülü video seçin.");
  } else {
    showToast("Yadda saxlanıldı ✓");
  }

  closeSeminarModal();
  renderSeminarsTable();
  renderDashboard();
});

seminarsTableBody.addEventListener("click", e => {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    const seminar = getSeminars().find(s => s.id === editId);
    if (seminar) openSeminarModal(seminar);
  }

  if (deleteId) {
    askDeleteConfirm("Bu seminarı silmək istədiyinizə əminsiniz?", () => {
      setSeminars(getSeminars().filter(s => s.id !== deleteId));
      renderSeminarsTable();
      renderDashboard();
    });
  }
});

/* ============================================================
   BLOG
   ============================================================ */
const blogTableBody = document.getElementById("blogTableBody");
const blogModalAdmin = document.getElementById("blogModalAdmin");
const blogAdminModalClose = document.getElementById("blogAdminModalClose");
const blogModalAdminTitle = document.getElementById("blogModalAdminTitle");
const blogForm = document.getElementById("blogForm");
const addBlogBtn = document.getElementById("addBlogBtn");

let editingBlogId = null;

function renderBlogTable() {
  const posts = getBlogPosts();
  blogTableBody.innerHTML = posts.map(p => `
    <tr>
      <td class="admin-cell-muted">${escapeHtml(p.date)}</td>
      <td>${escapeHtml(p.title)}</td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-edit="${escapeHtml(p.id)}" aria-label="Redaktə et">${ICON_EDIT}</button>
          <button class="admin-icon-btn danger" data-delete="${escapeHtml(p.id)}" aria-label="Sil">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openBlogModal(post) {
  editingBlogId = post ? post.id : null;
  blogModalAdminTitle.textContent = post ? "Yazını redaktə et" : "Yeni yazı";
  document.getElementById("blogDate").value = post ? post.date : "";
  document.getElementById("blogTitleInput").value = post ? post.title : "";
  document.getElementById("blogBody").value = post ? post.paragraphs.join("\n\n") : "";
  blogModalAdmin.classList.add("show");
}

function closeBlogModal() {
  blogModalAdmin.classList.remove("show");
}

addBlogBtn.addEventListener("click", () => openBlogModal(null));
blogAdminModalClose.addEventListener("click", closeBlogModal);
blogModalAdmin.addEventListener("click", e => { if (e.target === blogModalAdmin) closeBlogModal(); });

blogForm.addEventListener("submit", e => {
  e.preventDefault();
  const posts = getBlogPosts();
  const paragraphs = document.getElementById("blogBody").value
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    document.getElementById("blogBody").focus();
    return;
  }

  const data = {
    date: document.getElementById("blogDate").value.trim(),
    title: document.getElementById("blogTitleInput").value.trim(),
    paragraphs: paragraphs
  };

  if (editingBlogId) {
    const idx = posts.findIndex(p => p.id === editingBlogId);
    if (idx !== -1) posts[idx] = Object.assign({}, posts[idx], data);
  } else {
    posts.unshift(Object.assign({ id: makeId("post") }, data));
  }

  const saved = setBlogPosts(posts);
  if (!saved) {
    alert("Diqqət: dəyişiklik brauzerin daimi yaddaşına sığmadı və yalnız bu səhifə açıq qaldığı müddətdə görünəcək.");
  } else {
    showToast("Yadda saxlanıldı ✓");
  }
  closeBlogModal();
  renderBlogTable();
  renderDashboard();
});

blogTableBody.addEventListener("click", e => {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    const post = getBlogPosts().find(p => p.id === editId);
    if (post) openBlogModal(post);
  }

  if (deleteId) {
    askDeleteConfirm("Bu blog yazısını silmək istədiyinizə əminsiniz?", () => {
      setBlogPosts(getBlogPosts().filter(p => p.id !== deleteId));
      renderBlogTable();
      renderDashboard();
    });
  }
});

/* ============================================================
   PORTFOLIO KATEQORİYALARI
   ============================================================ */
const categoryList = document.getElementById("categoryList");
const categoryAddForm = document.getElementById("categoryAddForm");
const categoryNameInput = document.getElementById("categoryNameInput");

function categoryLabel(id) {
  const cat = getCategories().find(c => c.id === id);
  return cat ? cat.label : id;
}

function populateCategorySelect(selectEl, selectedId) {
  const categories = getCategories();
  selectEl.innerHTML = categories.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  if (selectedId) selectEl.value = selectedId;
}

function renderCategoriesList() {
  const categories = getCategories();
  if (categories.length === 0) {
    categoryList.innerHTML = '<span class="category-empty">Hələ heç bir kateqoriya yoxdur.</span>';
    return;
  }
  categoryList.innerHTML = categories.map(c => `
    <span class="category-pill">
      ${escapeHtml(c.label)}
      <button type="button" data-delete-category="${escapeHtml(c.id)}" aria-label="Kateqoriyanı sil">&times;</button>
    </span>
  `).join("");
}

categoryAddForm.addEventListener("submit", e => {
  e.preventDefault();
  const label = categoryNameInput.value.trim();
  if (!label) return;

  const categories = getCategories();
  const id = label.toLowerCase()
    .replace(/[^a-z0-9əıöüşç\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-") || makeId("cat");

  if (categories.some(c => c.id === id)) {
    alert("Bu adda kateqoriya artıq mövcuddur.");
    return;
  }

  categories.push({ id, label });
  setCategories(categories);
  categoryNameInput.value = "";
  renderCategoriesList();
});

categoryList.addEventListener("click", e => {
  const catId = e.target.closest("[data-delete-category]")?.dataset.deleteCategory;
  if (!catId) return;

  askDeleteConfirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz? Bu kateqoriyadakı şəkillər silinməyəcək, sadəcə kateqoriyasız qalacaq.", () => {
    setCategories(getCategories().filter(c => c.id !== catId));
    renderCategoriesList();
    renderPortfolioTable();
  });
});

/* ============================================================
   PORTFOLIO
   ============================================================ */
const portfolioTableBody = document.getElementById("portfolioTableBody");
const portfolioModalAdmin = document.getElementById("portfolioModalAdmin");
const portfolioAdminModalClose = document.getElementById("portfolioAdminModalClose");
const portfolioModalAdminTitle = document.getElementById("portfolioModalAdminTitle");
const portfolioForm = document.getElementById("portfolioForm");
const addPortfolioBtn = document.getElementById("addPortfolioBtn");

let editingPortfolioId = null;

function renderPortfolioTable() {
  const items = getPortfolio();
  portfolioTableBody.innerHTML = items.map((item, index) => `
    <tr>
      <td>
        <div class="reorder-btns">
          <button class="admin-icon-btn" data-move-up="${escapeHtml(item.id)}" aria-label="Yuxarı" ${index === 0 ? "disabled" : ""}>${ICON_UP}</button>
          <button class="admin-icon-btn" data-move-down="${escapeHtml(item.id)}" aria-label="Aşağı" ${index === items.length - 1 ? "disabled" : ""}>${ICON_DOWN}</button>
        </div>
      </td>
      <td><img class="admin-thumb" src="${escapeHtml(item.img)}" alt=""></td>
      <td>${escapeHtml(item.title)}</td>
      <td><span class="admin-badge">${escapeHtml(categoryLabel(item.category))}</span></td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-edit="${escapeHtml(item.id)}" aria-label="Redaktə et">${ICON_EDIT}</button>
          <button class="admin-icon-btn danger" data-delete="${escapeHtml(item.id)}" aria-label="Sil">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openPortfolioModal(item) {
  editingPortfolioId = item ? item.id : null;
  portfolioModalAdminTitle.textContent = item ? "Layihəni redaktə et" : "Yeni layihə";
  document.getElementById("portfolioTitle").value = item ? item.title : "";
  document.getElementById("portfolioImg").value = item ? item.img : "";
  populateCategorySelect(document.getElementById("portfolioCategory"), item ? item.category : null);
  portfolioModalAdmin.classList.add("show");
}

function closePortfolioModal() {
  portfolioModalAdmin.classList.remove("show");
}

addPortfolioBtn.addEventListener("click", () => openPortfolioModal(null));
portfolioAdminModalClose.addEventListener("click", closePortfolioModal);
portfolioModalAdmin.addEventListener("click", e => { if (e.target === portfolioModalAdmin) closePortfolioModal(); });

portfolioForm.addEventListener("submit", e => {
  e.preventDefault();
  const items = getPortfolio();
  const data = {
    title: document.getElementById("portfolioTitle").value.trim(),
    img: document.getElementById("portfolioImg").value.trim(),
    category: document.getElementById("portfolioCategory").value
  };

  if (editingPortfolioId) {
    const idx = items.findIndex(i => i.id === editingPortfolioId);
    if (idx !== -1) items[idx] = Object.assign({}, items[idx], data);
  } else {
    items.push(Object.assign({ id: makeId("port") }, data));
  }

  const saved = setPortfolio(items);
  if (!saved) {
    alert("Diqqət: dəyişiklik brauzerin daimi yaddaşına sığmadı və yalnız bu səhifə açıq qaldığı müddətdə görünəcək.");
  } else {
    showToast("Yadda saxlanıldı ✓");
  }
  closePortfolioModal();
  renderPortfolioTable();
  renderDashboard();
});

function movePortfolioItem(id, direction) {
  const items = getPortfolio();
  const idx = items.findIndex(i => i.id === id);
  const swapWith = idx + direction;
  if (idx === -1 || swapWith < 0 || swapWith >= items.length) return;

  [items[idx], items[swapWith]] = [items[swapWith], items[idx]];
  setPortfolio(items);
  renderPortfolioTable();
}

portfolioTableBody.addEventListener("click", e => {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = e.target.closest("[data-delete]")?.dataset.delete;
  const moveUpId = e.target.closest("[data-move-up]")?.dataset.moveUp;
  const moveDownId = e.target.closest("[data-move-down]")?.dataset.moveDown;

  if (editId) {
    const item = getPortfolio().find(i => i.id === editId);
    if (item) openPortfolioModal(item);
  }

  if (deleteId) {
    askDeleteConfirm("Bu portfolio layihəsini silmək istədiyinizə əminsiniz?", () => {
      setPortfolio(getPortfolio().filter(i => i.id !== deleteId));
      renderPortfolioTable();
      renderDashboard();
    });
  }

  if (moveUpId) movePortfolioItem(moveUpId, -1);
  if (moveDownId) movePortfolioItem(moveDownId, 1);
});

/* ---------- ESC İLƏ BAĞLAMA (bütün admin modallar) ---------- */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (confirmModal.classList.contains("show")) pendingDelete = null;
  [seminarModalAdmin, blogModalAdmin, portfolioModalAdmin, userModal, confirmModal].forEach(modal => {
    if (modal.classList.contains("show")) modal.classList.remove("show");
  });
});

/* ---------- INIT ---------- */
function renderAll() {
  loadBookings();
  renderDashboard();
  renderAboutForm();
  renderUsersTable();
  renderSeminarsTable();
  renderCategoriesList();
  renderBlogTable();
  renderPortfolioTable();
}

/* Sessiya varsa paneli dərhal aç — faylın sonunda olmalıdır ki, yuxarıdakı
   bütün dəyişənlər artıq təyin olunsun */
if (adminCredentials) {
  showAdminApp();
}
