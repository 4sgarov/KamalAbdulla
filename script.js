import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm";

/* ---------- MOTION KÖMƏKÇİLƏRİ ----------
   Modallar üçün ortaq açılış/bağlanış keçidi (Motion.dev). "box" — modal
   daxilindəki mərkəzi kart (varsa); ötürülməzsə yalnız arxa fon sönür. */
const EASE_OUT = [0.22, 1, 0.36, 1];

function openModalAnimated(modal, box) {
  modal.classList.add("show");
  animate(modal, { opacity: [0, 1] }, { duration: 0.2 });
  if (box) animate(box, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.3, easing: EASE_OUT });
}

function closeModalAnimated(modal, after) {
  animate(modal, { opacity: [1, 0] }, { duration: 0.18, easing: "ease-in" }).finished.then(() => {
    modal.classList.remove("show");
    if (after) after();
  });
}

/* ---------- NAV / VIEW SWITCHING ---------- */
const navLinks = document.querySelectorAll(".nav-link");
const bookBtn = document.querySelector(".book-btn");
const views = document.querySelectorAll(".view");
const sidebar = document.getElementById("sidebar");
const burgerBtn = document.getElementById("burgerBtn");
const overlay = document.getElementById("overlay");

function showView(target) {
  views.forEach(view => {
    view.classList.toggle("active", view.dataset.view === target);
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.target === target);
  });
  bookBtn.classList.toggle("active", bookBtn.dataset.target === target);

  const activeView = document.querySelector(`.view[data-view="${target}"]`);
  if (activeView) {
    animate(activeView, { opacity: [0, 1], y: [14, 0] }, { duration: 0.4, easing: EASE_OUT });
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    showView(link.dataset.target);
    closeSidebar();
  });
});

bookBtn.addEventListener("click", () => {
  showView(bookBtn.dataset.target);
  closeSidebar();
});

function openSidebar() {
  sidebar.classList.add("show");
  overlay.classList.add("show");
}
function closeSidebar() {
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
}

burgerBtn.addEventListener("click", () => {
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});
overlay.addEventListener("click", closeSidebar);

/* ---------- RENDER: ABOUT ME ---------- */
const aboutPhoto = document.getElementById("aboutPhoto");
const aboutText = document.getElementById("aboutText");

function renderAbout() {
  const about = getAbout();
  aboutPhoto.src = about.photo;
  aboutText.innerHTML = about.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("");
}

/* ---------- RENDER: PORTFOLIO ---------- */
const portfolioGrid = document.getElementById("portfolioGrid");

function renderPortfolio() {
  const items = getPortfolio();
  portfolioGrid.innerHTML = items.map(item => `
    <button class="portfolio-item" data-id="${escapeHtml(item.id)}" data-category="${escapeHtml(item.category)}" data-img="${escapeHtml(item.img)}" data-title="${escapeHtml(item.title)}">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}">
    </button>
  `).join("");
  animate(".portfolio-item", { opacity: [0, 1], scale: [0.92, 1] }, { duration: 0.35, delay: stagger(0.035), easing: EASE_OUT });
}

/* ---------- PORTFOLIO FILTERS ---------- */
const portfolioFilters = document.getElementById("portfolioFilters");
let currentFilter = "all";

function renderPortfolioFilters() {
  const categories = getCategories();
  const buttons = [{ id: "all", label: "All" }].concat(categories);
  portfolioFilters.innerHTML = buttons.map(cat => `
    <button class="filter-btn${cat.id === currentFilter ? " active" : ""}" data-filter="${escapeHtml(cat.id)}">${escapeHtml(cat.label)}</button>
  `).join("");
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".portfolio-item").forEach(item => {
    item.hidden = filter !== "all" && item.dataset.category !== filter;
  });
  portfolioFilters.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

portfolioFilters.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (btn) applyFilter(btn.dataset.filter);
});

/* ---------- PORTFOLIO LIGHTBOX ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

let currentIndex = 0;

function visiblePortfolioItems() {
  return Array.from(document.querySelectorAll(".portfolio-item")).filter(item => !item.hidden);
}

function renderLightbox() {
  const item = visiblePortfolioItems()[currentIndex];
  lightboxImg.src = item.dataset.img;
  lightboxImg.alt = item.dataset.title || "";
  animate(lightboxImg, { opacity: [0, 1] }, { duration: 0.25, easing: EASE_OUT });
}

function openLightbox(item) {
  currentIndex = visiblePortfolioItems().indexOf(item);
  renderLightbox();
  openModalAnimated(lightbox, lightboxImg);
}

function closeLightbox() {
  closeModalAnimated(lightbox, () => { lightboxImg.src = ""; });
}

function showPrev() {
  const list = visiblePortfolioItems();
  currentIndex = (currentIndex - 1 + list.length) % list.length;
  renderLightbox();
}

function showNext() {
  const list = visiblePortfolioItems();
  currentIndex = (currentIndex + 1) % list.length;
  renderLightbox();
}

portfolioGrid.addEventListener("click", e => {
  const item = e.target.closest(".portfolio-item");
  if (item) openLightbox(item);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", showPrev);
lightboxNext.addEventListener("click", showNext);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("show")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();
});

/* ---------- RENDER: SEMINARS ---------- */
const seminarGrid = document.getElementById("seminarGrid");

function renderSeminars() {
  const seminars = getSeminars();
  seminarGrid.innerHTML = seminars.map(s => `
    <article class="seminar-card">
      <div class="seminar-cover">
        <img src="${escapeHtml(s.cover)}" alt="${escapeHtml(s.title)}">
        <button class="play-btn" aria-label="Videoya bax" data-seminar-id="${escapeHtml(s.id)}" data-title="${escapeHtml(s.title)}" data-price="${escapeHtml(s.price)}"></button>
      </div>
      <div class="seminar-head">
        <h3 class="seminar-title">${escapeHtml(s.title)}</h3>
        <span class="seminar-price">${escapeHtml(s.price)}</span>
      </div>
      <p class="seminar-desc">${escapeHtml(s.description)}</p>
    </article>
  `).join("");
}

/* ---------- SEMINAR PLAYER (DEMO) ----------
   Bu, yalnız interfeys axınını göstərir: trailer -> ödəniş ekranı -> "kilidi aç".
   Satın alma vəziyyəti burada localStorage-da saxlanılır ki, demo işləsin —
   bu, YALNIZ bu brauzer üçün etibarlıdır. Real layihədə satın alma real
   istifadəçi hesabına serverdə (backend + verilənlər bazası) bağlanmalıdır ki,
   istifadəçi başqa cihazdan/brauzerdən daxil olanda da seminarı yenidən
   almasın. Ödəniş inteqrasiyası (Stripe və s.) da yalnız serverdə edilməlidir. */
const seminarModal = document.getElementById("seminarModal");
const seminarModalBox = document.querySelector(".seminar-modal-box");
const seminarModalClose = document.getElementById("seminarModalClose");
const seminarModalTitle = document.getElementById("seminarModalTitle");
const seminarVideo = document.getElementById("seminarVideo");
const videoFallback = document.getElementById("videoFallback");
const videoBadge = document.getElementById("videoBadge");
const videoProgressBar = document.getElementById("videoProgressBar");
const paywall = document.getElementById("paywall");
const unlocked = document.getElementById("unlocked");
const unlockedText = document.getElementById("unlockedText");
const unlockBtn = document.getElementById("unlockBtn");
const unlockPrice = document.getElementById("unlockPrice");

let activeSeminar = null;
let trailerTimer = null;

function isPurchased(id) {
  return getFlag("purchased_" + id) === "1";
}

function markPurchased(id) {
  setFlag("purchased_" + id, "1");
}

function stopSeminarVideo() {
  seminarVideo.pause();
  seminarVideo.removeAttribute("src");
  seminarVideo.load();
  seminarVideo.hidden = true;
  videoFallback.hidden = false;
}

function playSeminarVideo(url) {
  videoFallback.hidden = true;
  seminarVideo.hidden = false;
  seminarVideo.src = url;
  seminarVideo.currentTime = 0;
}

function showUnlockedState() {
  paywall.hidden = true;
  unlocked.hidden = false;

  if (activeSeminar && activeSeminar.fullVideo) {
    unlockedText.hidden = true;
    playSeminarVideo(activeSeminar.fullVideo);
  } else {
    unlockedText.hidden = false;
    stopSeminarVideo();
    videoBadge.textContent = "Tam dərs";
    videoProgressBar.classList.remove("playing");
    videoProgressBar.style.width = "100%";
  }
}

function showPaywallState() {
  paywall.hidden = false;
  unlocked.hidden = true;
}

function onTrailerEnded() {
  showPaywallState();
}

function openSeminarModal(btn) {
  /* Modal artıq açıq ola-ola başqa seminara keçilə bilər — köhnə
     trailer timer-i və video "ended" dinləyicisini əvvəlcə təmizləyirik
     ki, üst-üstə yığılıb səhv vaxtda paywall açmasın. */
  clearTimeout(trailerTimer);
  seminarVideo.removeEventListener("ended", onTrailerEnded);

  const seminar = getSeminars().find(s => s.id === btn.dataset.seminarId);
  activeSeminar = seminar || { id: btn.dataset.seminarId };
  seminarModalTitle.textContent = btn.dataset.title;
  unlockPrice.textContent = btn.dataset.price;
  openModalAnimated(seminarModal, seminarModalBox);

  if (isPurchased(activeSeminar.id)) {
    showUnlockedState();
    return;
  }

  showPaywallState();
  paywall.hidden = true;

  if (activeSeminar.trailerVideo) {
    playSeminarVideo(activeSeminar.trailerVideo);
    seminarVideo.addEventListener("ended", onTrailerEnded, { once: true });
    return;
  }

  stopSeminarVideo();
  videoBadge.textContent = "Trailer";
  videoProgressBar.classList.remove("playing");
  videoProgressBar.style.width = "0%";

  requestAnimationFrame(() => {
    videoProgressBar.classList.add("playing");
  });

  trailerTimer = setTimeout(() => {
    videoBadge.textContent = "Trailer bitdi";
    paywall.hidden = false;
  }, 5000);
}

function closeSeminarModal() {
  clearTimeout(trailerTimer);
  seminarVideo.removeEventListener("ended", onTrailerEnded);
  stopSeminarVideo();
  videoProgressBar.classList.remove("playing");
  videoProgressBar.style.width = "0%";
  closeModalAnimated(seminarModal);
}

seminarGrid.addEventListener("click", e => {
  const btn = e.target.closest(".play-btn");
  if (btn) openSeminarModal(btn);
});

unlockBtn.addEventListener("click", () => {
  if (!activeSeminar) return;
  markPurchased(activeSeminar.id);
  showUnlockedState();
});

seminarModalClose.addEventListener("click", closeSeminarModal);
seminarModal.addEventListener("click", e => {
  if (e.target === seminarModal) closeSeminarModal();
});
document.addEventListener("keydown", e => {
  if (seminarModal.classList.contains("show") && e.key === "Escape") closeSeminarModal();
});

/* ---------- AUTH MODAL (DEMO) ----------
   Sign In / Sign Up interfeysi. "Qeydiyyatdan keç" formu doldurulanda
   istifadəçi həqiqətən data.js-in users siyahısına əlavə olunur (bu
   brauzerdə) və Admin Panel > Users bölməsində görünür. Real layihədə
   bu, backend-də login/qeydiyyat endpoint-lərinə bağlanmalıdır. */
const subscribeBtn = document.getElementById("subscribeBtn");
const authModal = document.getElementById("authModal");
const authModalBox = document.querySelector(".auth-modal-box");
const authModalClose = document.getElementById("authModalClose");
const authTabs = document.querySelectorAll(".auth-tab");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const authPurchases = document.getElementById("authPurchases");
const purchasedList = document.getElementById("purchasedList");

function setAuthTab(target) {
  authTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === target));
  signinForm.hidden = target !== "signin";
  signupForm.hidden = target !== "signup";
  authPurchases.hidden = true;
}

function openAuthModal() {
  setAuthTab("signin");
  signinForm.reset();
  signupForm.reset();
  openModalAnimated(authModal, authModalBox);
}

function closeAuthModal() {
  closeModalAnimated(authModal);
}

function renderPurchasedList() {
  purchasedList.innerHTML = "";
  const seminars = getSeminars();
  const owned = seminars.filter(s => isPurchased(s.id));

  if (owned.length === 0) {
    const li = document.createElement("li");
    li.className = "purchased-empty";
    li.textContent = "Hələ heç bir seminar almamısınız.";
    purchasedList.appendChild(li);
    return;
  }

  owned.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s.title;
    purchasedList.appendChild(li);
  });
}

subscribeBtn.addEventListener("click", openAuthModal);
authModalClose.addEventListener("click", closeAuthModal);
authModal.addEventListener("click", e => {
  if (e.target === authModal) closeAuthModal();
});

authTabs.forEach(tab => {
  tab.addEventListener("click", () => setAuthTab(tab.dataset.tab));
});

signinForm.addEventListener("submit", e => {
  e.preventDefault();
  signinForm.hidden = true;
  authPurchases.hidden = false;
  renderPurchasedList();
});

signupForm.addEventListener("submit", e => {
  e.preventDefault();

  const users = getUsers();
  users.push({
    id: makeId("user"),
    firstName: document.getElementById("signupFirstName").value.trim(),
    lastName: document.getElementById("signupLastName").value.trim(),
    instagram: document.getElementById("signupInstagram").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    joined: new Date().toISOString().slice(0, 10)
  });
  setUsers(users);

  signupForm.hidden = true;
  authPurchases.hidden = false;
  renderPurchasedList();
});

document.addEventListener("keydown", e => {
  if (authModal.classList.contains("show") && e.key === "Escape") closeAuthModal();
});

/* ---------- TERMS MODAL ---------- */
const termsLink = document.getElementById("termsLink");
const termsModal = document.getElementById("termsModal");
const termsModalBox = document.querySelector(".terms-modal-box");
const termsModalClose = document.getElementById("termsModalClose");

function closeTermsModal() {
  closeModalAnimated(termsModal);
}

termsLink.addEventListener("click", e => {
  e.preventDefault();
  openModalAnimated(termsModal, termsModalBox);
});

termsModalClose.addEventListener("click", closeTermsModal);

termsModal.addEventListener("click", e => {
  if (e.target === termsModal) closeTermsModal();
});

document.addEventListener("keydown", e => {
  if (termsModal.classList.contains("show") && e.key === "Escape") closeTermsModal();
});

/* ---------- RENDER + READ: BLOG ---------- */
const blogList = document.getElementById("blogList");
const blogModal = document.getElementById("blogModal");
const blogModalBox = document.querySelector(".blog-modal-box");
const blogModalClose = document.getElementById("blogModalClose");
const blogModalDate = document.getElementById("blogModalDate");
const blogModalTitle = document.getElementById("blogModalTitle");
const blogModalBody = document.getElementById("blogModalBody");

function renderBlogList() {
  const posts = getBlogPosts();
  blogList.innerHTML = posts.map(post => `
    <button class="blog-item" data-post="${escapeHtml(post.id)}">
      <span class="blog-date">${escapeHtml(post.date)}</span>
      <span class="blog-title">${escapeHtml(post.title)}</span>
    </button>
  `).join("");
}

function openBlogPost(id) {
  const post = getBlogPosts().find(p => p.id === id);
  if (!post) return;

  blogModalDate.textContent = post.date;
  blogModalTitle.textContent = post.title;
  blogModalBody.innerHTML = "";
  post.paragraphs.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    blogModalBody.appendChild(p);
  });

  openModalAnimated(blogModal, blogModalBox);
  blogModal.scrollTop = 0;
}

function closeBlogPost() {
  closeModalAnimated(blogModal);
}

blogList.addEventListener("click", e => {
  const item = e.target.closest(".blog-item");
  if (item) openBlogPost(item.dataset.post);
});

blogModalClose.addEventListener("click", closeBlogPost);
document.addEventListener("keydown", e => {
  if (blogModal.classList.contains("show") && e.key === "Escape") closeBlogPost();
});

/* ---------- BAŞQA TAB-DAN CANLI YENİLƏNMƏ ----------
   Admin Panel (/admin) başqa bir tab-da açıq olarkən məzmunu
   dəyişəndə, "storage" hadisəsi bu tab-a da çatır və uyğun bölməni
   yenidən çəkirik — səhifəni əl ilə yeniləmək lazım qalmır. (Bu hadisə
   yalnız DİGƏR tab-larda baş verən dəyişikliklər üçün işə düşür, öz
   tab-ının dəyişikliyi üçün yox — bu, brauzerlərin normal davranışıdır.) */
window.addEventListener("storage", e => {
  if (e.key === STORAGE_KEYS.about) renderAbout();
  if (e.key === STORAGE_KEYS.portfolio) { renderPortfolio(); applyFilter(currentFilter); }
  if (e.key === STORAGE_KEYS.categories) { renderPortfolioFilters(); applyFilter(currentFilter); }
  if (e.key === STORAGE_KEYS.seminars) renderSeminars();
  if (e.key === STORAGE_KEYS.blog) renderBlogList();
});

/* ---------- INIT ---------- */
renderAbout();
renderPortfolioFilters();
renderPortfolio();
renderSeminars();
renderBlogList();
