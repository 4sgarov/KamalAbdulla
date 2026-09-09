/* ---------- ORTAQ DATA QATI ----------
   Sayt (index.html) və Admin Panel (admin.html) eyni localStorage
   açarlarını oxuyub yazır ki, admin paneldəki dəyişikliklər saytda
   dərhal görünsün. Bu, YALNIZ bu brauzer üçün etibarlıdır (demo) —
   real layihədə bu funksiyalar backend API çağırışları ilə
   əvəzlənməlidir (məs. fetch("/api/seminars") və s.), strukturu isə
   olduğu kimi saxlana bilər. */

const STORAGE_KEYS = {
  about: "site_about",
  seminars: "site_seminars",
  blog: "site_blog",
  portfolio: "site_portfolio",
  categories: "site_categories",
  users: "site_users"
};

const DEFAULT_ABOUT = {
  photo: "assets/photo.svg",
  paragraphs: [
    "Salam! Mən Kamal Abdulla — dizayn, texnologiya və ictimai çıxışlar üzərində işləyirəm. Bu sayt mənim işlərimi, seminarlarımı və yeniliklərimi bir yerdə toplayır.",
    "Missiyam sadədir: mürəkkəb ideyaları başa düşülən və faydalı formaya çevirmək."
  ]
};

const DEFAULT_CATEGORIES = [
  { id: "cover-up", label: "Cover Up" },
  { id: "fine-art", label: "Fine Art" },
  { id: "realism", label: "Realism" },
  { id: "color-realism", label: "Color Realism" }
];

const DEFAULT_SEMINARS = [
  {
    id: "say-growth",
    title: "Say Growth",
    price: "$49",
    cover: "assets/seminar-1.svg",
    description: "Brendin auditoriya ilə əlaqəsini gücləndirmək, bazar payını artırmaq və davamlı böyümə strategiyaları qurmaq üçün praktiki alətlər təqdim olunur.",
    trailerVideo: "",
    fullVideo: ""
  },
  {
    id: "digital-mindset",
    title: "Digital Mindset",
    price: "$39",
    cover: "assets/seminar-2.svg",
    description: "Rəqəmsal dövrdə düşüncə tərzini formalaşdırmaq, yeni texnologiyalara uyğunlaşmaq və innovativ həllər tapmaq bacarıqları üzərində işlənilir.",
    trailerVideo: "",
    fullVideo: ""
  },
  {
    id: "public-speaking-lab",
    title: "Public Speaking Lab",
    price: "$59",
    cover: "assets/seminar-3.svg",
    description: "Səhnə qorxusunu aradan qaldırmaq, inamlı və aydın nitq qurmaq, auditoriyanı cəlb edən çıxış texnikalarını mənimsəmək üçün praktiki məşğələ.",
    trailerVideo: "",
    fullVideo: ""
  }
];

const DEFAULT_BLOG = [
  {
    id: "post-1",
    date: "12 Yan 2026",
    title: "Yeni seminar seriyası elan olundu",
    paragraphs: [
      "2026-cı il üçün yeni seminar seriyasını elan etməkdən məmnunuq. Bu seriya böyümə strategiyaları, rəqəmsal düşüncə tərzi və natiqlik bacarıqları üzərində qurulub.",
      "Hər seminar praktiki məşğələlərlə müşayiət olunur və iştirakçılara real nümunələr üzərində işləmək imkanı verir.",
      "Qeydiyyat və qiymətlər Seminar bölməsində yerləşdirilib. Yerlərin sayı məhdud olduğu üçün əvvəlcədən qeydiyyatdan keçməyiniz tövsiyə olunur."
    ]
  },
  {
    id: "post-2",
    date: "03 Noy 2025",
    title: "Portfolio yeni layihələrlə yeniləndi",
    paragraphs: [
      "Son aylarda tamamlanan layihələr Portfolio bölməsinə əlavə olundu. Hər layihə fərqli sənaye və format üzərində işlənilib.",
      "Məqsəd sadəcə vizual nümunə göstərmək deyil, hər layihənin arxasındakı fikri və prosesi də əks etdirməkdir.",
      "Yeni layihələr barədə ətraflı məlumatı Portfolio bölməsindən əldə edə bilərsiniz."
    ]
  },
  {
    id: "post-3",
    date: "21 Sen 2025",
    title: "Digital Mindset seminarının nəticələri",
    paragraphs: [
      "Digital Mindset seminarı iştirakçıların rəqəmsal düşüncə tərzini formalaşdırmasına kömək etmək məqsədilə keçirildi.",
      "İştirakçıların əksəriyyəti seminardan sonra öz işlərində texnologiyaya daha strateji yanaşdıqlarını qeyd etdi.",
      "Növbəti Digital Mindset seminarının tarixi tezliklə elan olunacaq."
    ]
  }
];

const DEFAULT_PORTFOLIO = [
  { id: "port-1", category: "cover-up", img: "assets/portfolio-1.svg", title: "Layihə 01" },
  { id: "port-2", category: "fine-art", img: "assets/portfolio-2.svg", title: "Layihə 02" },
  { id: "port-3", category: "realism", img: "assets/portfolio-3.svg", title: "Layihə 03" },
  { id: "port-4", category: "color-realism", img: "assets/portfolio-4.svg", title: "Layihə 04" },
  { id: "port-5", category: "fine-art", img: "assets/portfolio-5.svg", title: "Layihə 05" },
  { id: "port-6", category: "realism", img: "assets/portfolio-6.svg", title: "Layihə 06" }
];

const DEFAULT_USERS = [];

/* localStorage bəzi kontekstlərdə (private browsing, sandboxed iframe,
   data: URL və s.) tamamilə bağlı ola bilər. Belə olduqda yaddaşdaxili
   (in-memory) ehtiyat anbara keçirik ki, sayt sınmasın — sadəcə
   dəyişikliklər səhifə yenilənəndə itir. */
const memoryStore = {};
let storageAvailable = true;
try {
  const testKey = "__storage_test__";
  localStorage.setItem(testKey, "1");
  localStorage.removeItem(testKey);
} catch (e) {
  storageAvailable = false;
}

/* Bir açar üçün son yazma localStorage kvotasını aşıb yaddaşa (memoryStore)
   düşübsə, o açarı "degraded" (yalnız yaddaşda) kimi işarələyirik — əks
   halda sonrakı oxumalar localStorage-dakı KÖHNƏ dəyəri qaytarardı və
   admin panelində "saxlanıb" görünən son dəyişiklik səhifə yenilənməmiş
   belə itmiş kimi göstərilə bilərdi. */
const degradedKeys = new Set();

function loadData(key, defaults) {
  if (!storageAvailable || degradedKeys.has(key)) {
    if (!(key in memoryStore)) memoryStore[key] = JSON.parse(JSON.stringify(defaults));
    return memoryStore[key];
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return JSON.parse(JSON.stringify(defaults));
    }
    return JSON.parse(raw);
  } catch (e) {
    degradedKeys.add(key);
    if (!(key in memoryStore)) memoryStore[key] = JSON.parse(JSON.stringify(defaults));
    return memoryStore[key];
  }
}

/* true qaytarır = localStorage-a həqiqətən (daimi) yazıldı.
   false qaytarır = yalnız bu səhifə açıq qaldığı müddətdə yaddaşdadır,
   səhifə yenilənəndə İTƏCƏK (adətən video/şəkil çox böyük olduğu üçün
   kvota aşılanda baş verir). Çağıran tərəf bunu istifadəçiyə bildirməlidir. */
function saveData(key, data) {
  if (storageAvailable) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      degradedKeys.delete(key);
      return true;
    } catch (e) {
      /* kvota aşıldı və ya başqa xəta — aşağıda yaddaşa yazılır */
    }
  }
  degradedKeys.add(key);
  memoryStore[key] = data;
  return false;
}

function getFlag(key) {
  if (!storageAvailable) return memoryStore[key] || null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return memoryStore[key] || null;
  }
}

function setFlag(key, value) {
  if (storageAvailable) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      /* aşağıya davam et, yaddaşa yaz */
    }
  }
  memoryStore[key] = value;
}

function getAbout() { return loadData(STORAGE_KEYS.about, DEFAULT_ABOUT); }
function setAbout(data) { return saveData(STORAGE_KEYS.about, data); }

function getCategories() { return loadData(STORAGE_KEYS.categories, DEFAULT_CATEGORIES); }
function setCategories(data) { return saveData(STORAGE_KEYS.categories, data); }

function getSeminars() { return loadData(STORAGE_KEYS.seminars, DEFAULT_SEMINARS); }
function setSeminars(data) { return saveData(STORAGE_KEYS.seminars, data); }

function getBlogPosts() { return loadData(STORAGE_KEYS.blog, DEFAULT_BLOG); }
function setBlogPosts(data) { return saveData(STORAGE_KEYS.blog, data); }

function getPortfolio() { return loadData(STORAGE_KEYS.portfolio, DEFAULT_PORTFOLIO); }
function setPortfolio(data) { return saveData(STORAGE_KEYS.portfolio, data); }

function getUsers() { return loadData(STORAGE_KEYS.users, DEFAULT_USERS); }
function setUsers(data) { return saveData(STORAGE_KEYS.users, data); }

function makeId(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* HTML-ə düz yazılan bütün istifadəçi/admin mətnləri bununla keçirilməlidir
   ki, kimsə başlıq/açıqlama sahəsinə "<script>" kimi məzmun yazanda
   saytda işə düşməsin (stored XSS-in qarşısını alır). */
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
