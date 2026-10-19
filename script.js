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

/* ---------- DİL SEÇİMİ ---------- */
const langBtns = document.querySelectorAll(".lang-btn");

function setLang(lang) {
  langBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));
  document.documentElement.lang = lang;
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

let savedLang = "az";
try { savedLang = localStorage.getItem("lang") || "az"; } catch (e) {}
setLang(savedLang);
langBtns.forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.lang)));

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

/* ---------- BOOKING: KALENDAR ----------
   Sadə aylıq kalendar. Həftə bazar ertəsindən başlayır, keçmiş günlər
   seçilə bilmir. Seçilmiş tarix gizli #bookingDate input-unda
   "YYYY-MM-DD" formatında saxlanılır. */
const bookingForm = document.getElementById("bookingForm");
const bookingCalendar = document.getElementById("bookingCalendar");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const calendarSelected = document.getElementById("calendarSelected");
const bookingDate = document.getElementById("bookingDate");
const bookingNote = document.getElementById("bookingNote");

const AZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

const today = new Date();
today.setHours(0, 0, 0, 0);

/* Hazırda göstərilən ay (ayın 1-i) */
let calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;

function toISODate(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatAzDate(d) {
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  calendarMonth.textContent = `${AZ_MONTHS[month]} ${year}`;

  /* Cari aydan geriyə getmək olmaz — keçmiş günlər onsuz da seçilmir */
  calendarPrev.disabled = year === today.getFullYear() && month === today.getMonth();

  const first = new Date(year, month, 1);
  /* getDay(): 0 = bazar. Bazar ertəsini 0 edirik ki, həftə B.e-dən başlasın */
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - offset);

  /* Həmişə 6 sıra (42 xana) — ay dəyişəndə blokun hündürlüyü tullanmır */
  calendarDays.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "calendar-day";
    btn.textContent = d.getDate();
    btn.dataset.date = toISODate(d);

    const inMonth = d.getMonth() === month;
    if (!inMonth) btn.classList.add("muted");
    if (d < today) btn.disabled = true;
    if (d.getTime() === today.getTime()) btn.classList.add("today");
    if (selectedDate && d.getTime() === selectedDate.getTime()) btn.classList.add("selected");

    calendarDays.appendChild(btn);
  }
}

function selectDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  selectedDate = new Date(y, m - 1, d);
  bookingDate.value = iso;
  calendarSelected.textContent = `Seçilmiş tarix: ${formatAzDate(selectedDate)}`;
  calendarSelected.classList.add("has-date");
  bookingCalendar.classList.remove("error");
  hideBookingNote();
  /* Tarix dəyişəndə əvvəlki saat artıq keçərli olmaya bilər — yenidən seçilir */
  clearSelectedTime();
  showStep(bookingTimes);
  loadBookedTimes();

  /* Başqa ayın gününə klikləyəndə həmin aya keçirik */
  if (selectedDate.getMonth() !== calendarCursor.getMonth() ||
      selectedDate.getFullYear() !== calendarCursor.getFullYear()) {
    calendarCursor = new Date(y, m - 1, 1);
  }
  renderCalendar();
}

function clearSelectedDate() {
  selectedDate = null;
  bookingDate.value = "";
  calendarSelected.textContent = "Tarix seçin";
  calendarSelected.classList.remove("has-date");
  clearSelectedTime();
  bookingTimes.hidden = true;
}

/* ---------- BOOKING: SAAT VƏ ÖDƏNİŞ ----------
   Tarix seçiləndən sonra saatlar, saat seçiləndən sonra ödəniş növü görünür.
   Bu gün üçün artıq keçmiş saatlar seçilə bilmir. */
const bookingTimes = document.getElementById("bookingTimes");
const timeSlots = document.getElementById("timeSlots");
const bookingTime = document.getElementById("bookingTime");
const bookingPayment = document.getElementById("bookingPayment");

/* api/bookings.php-dəki TIME_SLOTS ilə eyni olmalıdır */
const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00"];
const BOOKINGS_API = "/api/bookings.php";

/* Seçilmiş gün üçün serverdən gələn dolu saatlar */
let bookedTimes = [];
let slotsRequest = 0;

const PAYMENT_LABELS = {
  card: "Kartla onlayn",
  transfer: "Bank köçürməsi",
  cash: "Nağd",
};

function showStep(el) {
  if (!el.hidden) return;
  el.hidden = false;
  animate(el, { opacity: [0, 1], y: [8, 0] }, { duration: 0.25 });
}

function renderTimeSlots() {
  const now = new Date();
  const isToday = selectedDate && selectedDate.getTime() === today.getTime();

  timeSlots.innerHTML = "";
  TIME_SLOTS.forEach(t => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-slot";
    btn.textContent = t;
    btn.dataset.time = t;

    const [h, m] = t.split(":").map(Number);
    if (isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()))) {
      btn.disabled = true;
    }
    if (bookedTimes.includes(t)) {
      btn.disabled = true;
      btn.classList.add("booked");
      btn.title = "Bu saat doludur";
      btn.innerHTML = `${t}<small>Dolu</small>`;
    }
    if (bookingTime.value === t) btn.classList.add("selected");
    timeSlots.appendChild(btn);
  });
}

/* Seçilmiş gün üçün dolu saatları serverdən alır. Tez-tez tarix dəyişəndə
   köhnə cavab yenisinin üstünə yazılmasın deyə sorğuları nömrələyirik. */
async function loadBookedTimes() {
  const req = ++slotsRequest;
  bookedTimes = [];
  timeSlots.classList.add("loading");
  renderTimeSlots();
  try {
    const res = await fetch(`${BOOKINGS_API}?date=${bookingDate.value}`, { cache: "no-store" });
    const data = await res.json();
    if (req !== slotsRequest) return;
    bookedTimes = Array.isArray(data.booked) ? data.booked : [];
  } catch {
    if (req !== slotsRequest) return;
    showBookingNote("Boş saatları yükləmək olmadı. İnternet bağlantınızı yoxlayın.");
  }
  timeSlots.classList.remove("loading");
  if (bookedTimes.includes(bookingTime.value)) clearSelectedTime();
  renderTimeSlots();
}

function clearSelectedTime() {
  bookingTime.value = "";
  bookingTimes.classList.remove("error");
  bookingPayment.hidden = true;
  bookingPayment.classList.remove("error");
  bookingForm.querySelectorAll('input[name="payment"]').forEach(r => { r.checked = false; });
}

timeSlots.addEventListener("click", e => {
  const btn = e.target.closest(".time-slot");
  if (!btn || btn.disabled) return;
  bookingTime.value = btn.dataset.time;
  bookingTimes.classList.remove("error");
  hideBookingNote();
  renderTimeSlots();
  showStep(bookingPayment);
});

bookingPayment.addEventListener("change", () => {
  bookingPayment.classList.remove("error");
  hideBookingNote();
});

function shiftCalendarMonth(delta) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderCalendar();
  animate(calendarDays, { opacity: [0, 1] }, { duration: 0.2 });
}

calendarPrev.addEventListener("click", () => shiftCalendarMonth(-1));
calendarNext.addEventListener("click", () => shiftCalendarMonth(1));

calendarDays.addEventListener("click", e => {
  const btn = e.target.closest(".calendar-day");
  if (btn && !btn.disabled) selectDate(btn.dataset.date);
});

function showBookingNote(text, isSuccess) {
  bookingNote.textContent = text;
  bookingNote.classList.toggle("success", !!isSuccess);
  bookingNote.hidden = false;
}

function hideBookingNote() {
  bookingNote.hidden = true;
}

/* Formada novalidate var — yoxlamanı özümüz edirik ki, mesajlar
   brauzer dilində yox, Azərbaycan dilində görünsün */
bookingForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("bookingName").value.trim();
  const email = document.getElementById("bookingEmail").value.trim();
  const phone = document.getElementById("bookingPhone").value.trim();
  const message = document.getElementById("bookingMessage").value.trim();

  if (!name) { showBookingNote("Zəhmət olmasa ad və soyadınızı yazın."); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showBookingNote("Düzgün email ünvanı yazın."); return; }
  if (!phone) { showBookingNote("Telefon nömrənizi yazın."); return; }
  if (!bookingDate.value) {
    bookingCalendar.classList.add("error");
    showBookingNote("Kalendardan tarix seçin.");
    return;
  }
  if (!bookingTime.value) {
    bookingTimes.classList.add("error");
    showBookingNote("Saat seçin.");
    return;
  }
  const payment = bookingForm.querySelector('input[name="payment"]:checked');
  if (!payment) {
    bookingPayment.classList.add("error");
    showBookingNote("Ödəniş növünü seçin.");
    return;
  }

  /* Saat serverdə yalnız bir nəfərə verilir — eyni anda başqası tutubsa 409 gəlir */
  const submitBtn = bookingForm.querySelector(".submit-btn");
  submitBtn.disabled = true;
  hideBookingNote();
  let res, data;
  try {
    res = await fetch(BOOKINGS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, phone, message,
        date: bookingDate.value,
        time: bookingTime.value,
        payment: payment.value,
      }),
    });
    data = await res.json();
  } catch {
    submitBtn.disabled = false;
    showBookingNote("Rezervasiyanı göndərmək olmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.");
    return;
  }
  submitBtn.disabled = false;

  if (res.status === 409) {
    bookedTimes = Array.isArray(data.booked) ? data.booked : bookedTimes;
    clearSelectedTime();
    renderTimeSlots();
    bookingTimes.classList.add("error");
    showBookingNote(data.error);
    return;
  }
  if (!res.ok) {
    showBookingNote(data.error || "Xəta baş verdi. Yenidən cəhd edin.");
    return;
  }

  showBookingNote(`Rezervasiyanız qəbul edildi — ${formatAzDate(selectedDate)}, saat ${bookingTime.value}. Ödəniş: ${PAYMENT_LABELS[payment.value]}. Tezliklə sizinlə əlaqə saxlayacağıq.`, true);
  bookingForm.reset();
  clearSelectedDate();
  calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
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
renderCalendar();
