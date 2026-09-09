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

/* ---------- LOGIN (DEMO) ----------
   Bu, real autentifikasiya deyil — sadəcə interfeys demo-sudur. İstifadəçi
   adı/şifrə brauzer kodunda açıq görünür, ona görə real layihədə admin
   girişi mütləq serverdə (backend) yoxlanılmalıdır, heç vaxt frontend-də
   deyil. */
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const ADMIN_SESSION_KEY = "admin_session";

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

adminLoginForm.addEventListener("submit", e => {
  e.preventDefault();
  const u = document.getElementById("adminUsername").value.trim();
  const p = document.getElementById("adminPassword").value;

  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
    adminLoginError.hidden = true;
    setFlag(ADMIN_SESSION_KEY, "1");
    showAdminApp();
  } else {
    adminLoginError.hidden = false;
  }
});

adminLogoutBtn.addEventListener("click", () => {
  setFlag(ADMIN_SESSION_KEY, "0");
  showAdminLogin();
});

if (getFlag(ADMIN_SESSION_KEY) === "1") {
  showAdminApp();
}

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
  renderDashboard();
  renderAboutForm();
  renderUsersTable();
  renderSeminarsTable();
  renderCategoriesList();
  renderBlogTable();
  renderPortfolioTable();
}
