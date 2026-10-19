/* ---------- TƏRCÜMƏLƏR (AZ / EN / RU) ----------
   index.html-də mətnlər data-i18n atributları ilə bu açarlara bağlanır:
     data-i18n       → textContent
     data-i18n-html  → innerHTML (yalnız bu fayldakı etibarlı mətn)
     data-i18n-ph    → placeholder
     data-i18n-aria  → aria-label
   script.js-dəki dinamik mətnlər t("açar", { dəyişən }) ilə alınır. */

const I18N = {
  az: {
    "nav.about": "Haqqımda",
    "nav.portfolio": "Portfolio",
    "nav.seminar": "Seminar",
    "nav.contact": "Əlaqə",
    "nav.book": "Rezervasiya",
    "menu": "Menyu",
    "language": "Dil",
    "close": "Bağla",
    "prev": "Əvvəlki",
    "next": "Növbəti",

    "portfolio.all": "Hamısı",
    "seminar.play": "Videoya bax",

    "contact.email": "Email",
    "contact.location": "Məkan",
    "contact.locationValue": "Bakı, Azərbaycan",
    "contact.map": "Xəritədə məkan",

    "booking.intro": "Seminar və ya konsultasiya üçün məlumatlarınızı yazın, uyğun gün və saatı seçin, ödəniş növünü qeyd edin.",
    "booking.name": "Ad Soyad",
    "booking.email": "Email",
    "booking.phone": "Telefon nömrəsi",
    "booking.message": "Mesajınız",
    "booking.submit": "Rezerv et",
    "cal.prev": "Əvvəlki ay",
    "cal.next": "Növbəti ay",
    "cal.pick": "Tarix seçin",
    "cal.selected": "Seçilmiş tarix: {date}",
    "cal.weekdays": ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"],
    "cal.months": ["yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
    "cal.monthsGen": ["yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
    "time.pick": "Saat seçin",
    "time.booked": "Dolu",
    "time.bookedTitle": "Bu saat doludur",
    "pay.title": "Ödəniş növü",
    "pay.card": "Kartla onlayn",
    "pay.cardDesc": "Visa / Mastercard",
    "pay.transfer": "Bank köçürməsi",
    "pay.transferDesc": "Rekvizitlər emailə göndərilir",
    "pay.cash": "Nağd",
    "pay.cashDesc": "Görüş zamanı yerində",

    "note.slotsFail": "Boş saatları yükləmək olmadı. İnternet bağlantınızı yoxlayın.",
    "note.name": "Zəhmət olmasa ad və soyadınızı yazın.",
    "note.email": "Düzgün email ünvanı yazın.",
    "note.phone": "Telefon nömrənizi yazın.",
    "note.date": "Kalendardan tarix seçin.",
    "note.time": "Saat seçin.",
    "note.payment": "Ödəniş növünü seçin.",
    "note.sendFail": "Rezervasiyanı göndərmək olmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.",
    "note.slotTaken": "Bu saat artıq tutulub. Zəhmət olmasa başqa saat seçin.",
    "note.error": "Xəta baş verdi. Yenidən cəhd edin.",
    "note.success": "Rezervasiyanız qəbul edildi — {date}, saat {time}. Ödəniş: {payment}. Tezliklə sizinlə əlaqə saxlayacağıq.",

    "video.trailer": "Trailer",
    "video.trailerEnded": "Trailer bitdi",
    "video.full": "Tam dərs",
    "paywall.text": "Trailer bitdi. Dərsi sonuna kimi izləmək üçün ödəniş etməlisiniz. Bir dəfə aldıqdan sonra bu seminar hesabınıza bağlanır — başqa yerdən daxil olsanız da yenidən ödəniş etmədən baxa bilərsiniz.",
    "paywall.unlock": "Kilidi aç",
    "unlocked.badge": "✓ Satın alınıb",
    "unlocked.text": "Bu seminar hesabınıza bağlıdır. Tam dərs burada oynayacaq (backend qoşulduqdan sonra).",

    "auth.signin": "Daxil ol",
    "auth.signup": "Qeydiyyat",
    "auth.email": "Email",
    "auth.password": "Şifrə",
    "auth.remember": "Məni xatırla",
    "auth.login": "Daxil ol",
    "auth.firstName": "Ad",
    "auth.lastName": "Soyad",
    "auth.instagram": "Instagram səhifəsi (@istifadəçi)",
    "auth.terms": "Bütün <a href=\"#\" id=\"termsLink\" class=\"terms-link\">istifadə şərtlərini</a> oxudum, razıyam",
    "auth.register": "Qeydiyyatdan keç",
    "auth.purchases": "Aldığınız seminarlar",
    "auth.noPurchases": "Hələ heç bir seminar almamısınız.",

    "terms.title": "İstifadə şərtləri",
    "terms.body": `
      <p>Bu istifadə şərtləri Kamal Abdulla platformasından (bundan sonra "Platforma") istifadə edən bütün istifadəçilərə şamil olunur. Qeydiyyatdan keçməklə siz aşağıdakı şərtləri qəbul etmiş sayılırsınız.</p>
      <p><strong>Şəxsi məlumatların qorunması.</strong> Qeydiyyat zamanı təqdim etdiyiniz ad, soyad, email və Instagram səhifəsi kimi məlumatlar yalnız hesabınızı yaratmaq və sizinlə əlaqə saxlamaq məqsədilə istifadə olunur. Bu məlumatlar heç bir üçüncü tərəfə — reklam şirkətlərinə, marketinq xidmətlərinə və ya başqa şəxslərə — satılmır, icarəyə verilmir və ya paylaşılmır.</p>
      <p><strong>Ödəniş və kart məlumatları.</strong> Seminar alışları zamanı daxil etdiyiniz kart məlumatları Platforma tərəfindən heç vaxt saxlanılmır və görünmür. Bütün ödəniş əməliyyatları sertifikatlı, təhlükəsiz ödəniş provayderi tərəfindən emal olunur. Platforma yalnız ödənişin uğurlu olub-olmadığı barədə təsdiq siqnalı alır, kartın nömrəsi, son istifadə tarixi və ya CVV kodu kimi həssas məlumatlar bizim serverlərimizə heç vaxt ötürülmür və saxlanılmır.</p>
      <p><strong>Satın alınan məzmun.</strong> Bir dəfə satın aldığınız seminar hesabınıza bağlanır. Başqa cihazdan və ya brauzerdən hesabınıza daxil olduqda həmin seminarı yenidən almağa ehtiyac yoxdur — giriş hüququ hesabınız üzərindən avtomatik tanınır.</p>
      <p><strong>Məlumatların saxlanması.</strong> Məlumatlarınız şifrələnmiş şəkildə saxlanılır və yalnız qanunla tələb olunan hallarda müvafiq orqanlarla paylaşıla bilər. İstənilən vaxt hesabınızın silinməsini və məlumatlarınızın tam şəkildə sistemdən çıxarılmasını tələb edə bilərsiniz.</p>
      <p>Platformadan istifadə etməklə yuxarıdakı şərtləri oxuduğunuzu və qəbul etdiyinizi təsdiqləyirsiniz.</p>`
  },

  en: {
    "nav.about": "About Me",
    "nav.portfolio": "Portfolio",
    "nav.seminar": "Seminar",
    "nav.contact": "Contact",
    "nav.book": "Book Now",
    "menu": "Menu",
    "language": "Language",
    "close": "Close",
    "prev": "Previous",
    "next": "Next",

    "portfolio.all": "All",
    "seminar.play": "Watch video",

    "contact.email": "Email",
    "contact.location": "Location",
    "contact.locationValue": "Baku, Azerbaijan",
    "contact.map": "Location on the map",

    "booking.intro": "Leave your details for a seminar or consultation, pick a convenient day and time, and choose a payment method.",
    "booking.name": "Full name",
    "booking.email": "Email",
    "booking.phone": "Phone number",
    "booking.message": "Your message",
    "booking.submit": "Book",
    "cal.prev": "Previous month",
    "cal.next": "Next month",
    "cal.pick": "Pick a date",
    "cal.selected": "Selected date: {date}",
    "cal.weekdays": ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    "cal.months": ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    "cal.monthsGen": ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    "time.pick": "Pick a time",
    "time.booked": "Booked",
    "time.bookedTitle": "This time is already booked",
    "pay.title": "Payment method",
    "pay.card": "Card online",
    "pay.cardDesc": "Visa / Mastercard",
    "pay.transfer": "Bank transfer",
    "pay.transferDesc": "Bank details are sent by email",
    "pay.cash": "Cash",
    "pay.cashDesc": "On site at the meeting",

    "note.slotsFail": "Couldn't load available times. Check your internet connection.",
    "note.name": "Please enter your full name.",
    "note.email": "Please enter a valid email address.",
    "note.phone": "Please enter your phone number.",
    "note.date": "Pick a date in the calendar.",
    "note.time": "Pick a time.",
    "note.payment": "Choose a payment method.",
    "note.sendFail": "Couldn't send your booking. Check your internet connection and try again.",
    "note.slotTaken": "This time has just been booked. Please pick another time.",
    "note.error": "Something went wrong. Please try again.",
    "note.success": "Your booking is confirmed — {date} at {time}. Payment: {payment}. We'll be in touch soon.",

    "video.trailer": "Trailer",
    "video.trailerEnded": "Trailer ended",
    "video.full": "Full lesson",
    "paywall.text": "The trailer has ended. To watch the full lesson you need to pay. Once purchased, the seminar is linked to your account — you can watch it from any device without paying again.",
    "paywall.unlock": "Unlock",
    "unlocked.badge": "✓ Purchased",
    "unlocked.text": "This seminar is linked to your account. The full lesson will play here (once the backend is connected).",

    "auth.signin": "Sign In",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.remember": "Remember me",
    "auth.login": "Sign in",
    "auth.firstName": "First name",
    "auth.lastName": "Last name",
    "auth.instagram": "Instagram page (@username)",
    "auth.terms": "I have read and agree to the <a href=\"#\" id=\"termsLink\" class=\"terms-link\">terms of use</a>",
    "auth.register": "Create account",
    "auth.purchases": "Your seminars",
    "auth.noPurchases": "You haven't purchased any seminars yet.",

    "terms.title": "Terms of use",
    "terms.body": `
      <p>These terms of use apply to everyone who uses the Kamal Abdulla platform (the "Platform"). By signing up you accept the terms below.</p>
      <p><strong>Personal data protection.</strong> The details you provide when signing up — first name, last name, email and Instagram page — are used only to create your account and to contact you. This data is never sold, rented or shared with third parties such as advertising companies, marketing services or other individuals.</p>
      <p><strong>Payments and card details.</strong> Card details you enter when buying a seminar are never stored or seen by the Platform. All payments are processed by a certified, secure payment provider. The Platform only receives a confirmation of whether the payment succeeded; sensitive data such as the card number, expiry date or CVV code is never sent to or stored on our servers.</p>
      <p><strong>Purchased content.</strong> A seminar you buy once is linked to your account. When you sign in from another device or browser you don't need to buy it again — access is recognised automatically through your account.</p>
      <p><strong>Data storage.</strong> Your data is stored encrypted and may be shared with the relevant authorities only where required by law. You can ask at any time for your account to be deleted and your data to be fully removed from the system.</p>
      <p>By using the Platform you confirm that you have read and accept the terms above.</p>`
  },

  ru: {
    "nav.about": "Обо мне",
    "nav.portfolio": "Портфолио",
    "nav.seminar": "Семинары",
    "nav.contact": "Контакты",
    "nav.book": "Записаться",
    "menu": "Меню",
    "language": "Язык",
    "close": "Закрыть",
    "prev": "Назад",
    "next": "Вперёд",

    "portfolio.all": "Все",
    "seminar.play": "Смотреть видео",

    "contact.email": "Email",
    "contact.location": "Адрес",
    "contact.locationValue": "Баку, Азербайджан",
    "contact.map": "Место на карте",

    "booking.intro": "Оставьте свои данные для семинара или консультации, выберите удобный день и время и укажите способ оплаты.",
    "booking.name": "Имя и фамилия",
    "booking.email": "Email",
    "booking.phone": "Номер телефона",
    "booking.message": "Ваше сообщение",
    "booking.submit": "Записаться",
    "cal.prev": "Предыдущий месяц",
    "cal.next": "Следующий месяц",
    "cal.pick": "Выберите дату",
    "cal.selected": "Выбранная дата: {date}",
    "cal.weekdays": ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    "cal.months": ["январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
    "cal.monthsGen": ["января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    "time.pick": "Выберите время",
    "time.booked": "Занято",
    "time.bookedTitle": "Это время уже занято",
    "pay.title": "Способ оплаты",
    "pay.card": "Картой онлайн",
    "pay.cardDesc": "Visa / Mastercard",
    "pay.transfer": "Банковский перевод",
    "pay.transferDesc": "Реквизиты отправим на email",
    "pay.cash": "Наличными",
    "pay.cashDesc": "На месте при встрече",

    "note.slotsFail": "Не удалось загрузить свободное время. Проверьте подключение к интернету.",
    "note.name": "Пожалуйста, укажите имя и фамилию.",
    "note.email": "Укажите корректный email.",
    "note.phone": "Укажите номер телефона.",
    "note.date": "Выберите дату в календаре.",
    "note.time": "Выберите время.",
    "note.payment": "Выберите способ оплаты.",
    "note.sendFail": "Не удалось отправить запись. Проверьте подключение к интернету и попробуйте снова.",
    "note.slotTaken": "Это время уже заняли. Пожалуйста, выберите другое.",
    "note.error": "Произошла ошибка. Попробуйте ещё раз.",
    "note.success": "Ваша запись принята — {date}, в {time}. Оплата: {payment}. Мы скоро свяжемся с вами.",

    "video.trailer": "Трейлер",
    "video.trailerEnded": "Трейлер закончился",
    "video.full": "Полный урок",
    "paywall.text": "Трейлер закончился. Чтобы посмотреть урок до конца, нужно оплатить. После покупки семинар привязывается к вашему аккаунту — его можно смотреть с любого устройства без повторной оплаты.",
    "paywall.unlock": "Открыть доступ",
    "unlocked.badge": "✓ Куплено",
    "unlocked.text": "Этот семинар привязан к вашему аккаунту. Полный урок будет воспроизводиться здесь (после подключения backend).",

    "auth.signin": "Вход",
    "auth.signup": "Регистрация",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.remember": "Запомнить меня",
    "auth.login": "Войти",
    "auth.firstName": "Имя",
    "auth.lastName": "Фамилия",
    "auth.instagram": "Страница в Instagram (@имя)",
    "auth.terms": "Я прочитал(а) и принимаю <a href=\"#\" id=\"termsLink\" class=\"terms-link\">условия использования</a>",
    "auth.register": "Зарегистрироваться",
    "auth.purchases": "Ваши семинары",
    "auth.noPurchases": "Вы ещё не купили ни одного семинара.",

    "terms.title": "Условия использования",
    "terms.body": `
      <p>Настоящие условия использования распространяются на всех пользователей платформы Kamal Abdulla (далее — «Платформа»). Регистрируясь, вы принимаете приведённые ниже условия.</p>
      <p><strong>Защита персональных данных.</strong> Данные, которые вы указываете при регистрации — имя, фамилия, email и страница в Instagram, — используются только для создания аккаунта и связи с вами. Эти данные не продаются, не сдаются в аренду и не передаются третьим лицам — рекламным компаниям, маркетинговым сервисам или другим лицам.</p>
      <p><strong>Оплата и данные карты.</strong> Данные карты, которые вы вводите при покупке семинара, никогда не хранятся и не видны Платформе. Все платежи обрабатывает сертифицированный безопасный платёжный провайдер. Платформа получает только подтверждение того, прошла ли оплата; номер карты, срок действия или CVV-код никогда не передаются на наши серверы и не хранятся на них.</p>
      <p><strong>Купленный контент.</strong> Однажды купленный семинар привязывается к вашему аккаунту. При входе с другого устройства или браузера покупать его повторно не нужно — доступ определяется автоматически по вашему аккаунту.</p>
      <p><strong>Хранение данных.</strong> Ваши данные хранятся в зашифрованном виде и могут быть переданы соответствующим органам только в случаях, предусмотренных законом. В любой момент вы можете потребовать удалить аккаунт и полностью стереть ваши данные из системы.</p>
      <p>Используя Платформу, вы подтверждаете, что прочитали и принимаете изложенные выше условия.</p>`
  }
};

/* Admin paneldən gələn standart (default) məzmunun tərcüməsi. Yalnız mətn
   data.js-dəki AZ default ilə eyni qaldıqda tətbiq olunur — admin mətni
   dəyişibsə, yazdığı mətn olduğu kimi göstərilir. */
const CONTENT_I18N = {
  en: {
    about: {
      paragraphs: [
        "Hello! I'm Kamal Abdulla — I work in design, technology and public speaking. This site brings my work, seminars and news together in one place.",
        "My mission is simple: to turn complex ideas into something clear and useful."
      ]
    },
    seminars: {
      "say-growth": { description: "Practical tools for strengthening a brand's connection with its audience, growing market share and building sustainable growth strategies." },
      "digital-mindset": { description: "Developing the right mindset for the digital age, adapting to new technologies and finding innovative solutions." },
      "public-speaking-lab": { description: "A hands-on workshop for overcoming stage fright, speaking with confidence and clarity, and mastering techniques that engage an audience." }
    }
  },
  ru: {
    about: {
      paragraphs: [
        "Здравствуйте! Я Камал Абдулла — работаю в сфере дизайна, технологий и публичных выступлений. На этом сайте собраны мои работы, семинары и новости.",
        "Моя миссия проста: превращать сложные идеи в понятные и полезные."
      ]
    },
    seminars: {
      "say-growth": { description: "Практические инструменты для укрепления связи бренда с аудиторией, увеличения доли рынка и построения стратегий устойчивого роста." },
      "digital-mindset": { description: "Формирование мышления цифровой эпохи, адаптация к новым технологиям и поиск инновационных решений." },
      "public-speaking-lab": { description: "Практический тренинг, который поможет преодолеть страх сцены, говорить уверенно и ясно и освоить техники, вовлекающие аудиторию." }
    }
  }
};

const LANGS = ["az", "en", "ru"];
let currentLang = "az";

function t(key, vars) {
  const dict = I18N[currentLang] || I18N.az;
  let val = key in dict ? dict[key] : I18N.az[key];
  if (val === undefined) return key;
  if (typeof val === "string" && vars) {
    val = val.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m));
  }
  return val;
}

/* Default məzmunun tərcüməsini qaytarır; admin mətni dəyişibsə — orijinalı.
   kind: "about" | "seminars"; id: about üçün null. */
function tContent(kind, id, field, original) {
  const langContent = CONTENT_I18N[currentLang];
  if (!langContent || !langContent[kind]) return original;
  const translated = id ? (langContent[kind][id] || {})[field] : langContent[kind][field];
  if (translated === undefined) return original;

  let def;
  if (kind === "about") def = DEFAULT_ABOUT;
  else if (kind === "seminars") def = DEFAULT_SEMINARS.find(s => s.id === id);
  if (!def || JSON.stringify(def[field]) !== JSON.stringify(original)) return original;
  return translated;
}

function applyStaticTranslations(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  scope.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  scope.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  scope.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  scope.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
}
