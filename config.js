/* =====================================================================
 * AI NEXT Bootcamp · Season 2 (by Bizcore) — Shared configuration
 * ใช้ร่วมกันโดย index.html · admin.html · wall.html · guide.html
 * แก้ค่าการ Deploy ที่ไฟล์นี้ไฟล์เดียว
 * ===================================================================== */
window.AINEXT_CONFIG = {
  /* ---- Deployment ---- */
  DEMO_MODE: true,                                  // หลัง Deploy Code.gs: ตั้ง false + วาง URL ด้านล่าง
  API_BASE_URL: "PASTE_YOUR_WEB_APP_URL_HERE",      // URL ลงท้าย /exec จาก Apps Script

  /* ---- Links (⚠️ ตอนนี้ยังเป็นลิงก์ Season 1 — เปลี่ยนเป็นกลุ่ม Season 2) ---- */
  OPENCHAT_URL_FALLBACK: "https://line.me/ti/g2/rjoazgqKFHS_5oK3khzSAKXecKsuZqP40sLAOg",
  OPENCHAT_QR: "openchat-qr.jpg",
  LINE_MEETUP: "https://line.me/ti/g/srNQ_Rj82z",

  /* ---- Brand assets ---- */
  LOGO: "ainext-logo-bizcore.png",
  KEY_VISUAL: "ab-ai-next-01.jpg",
  EVENT_NAME: "AI NEXT Bootcamp",
  SEASON_LABEL: "Season 2",

  /* ---- Sessions (ชื่อ Speaker / Session ของ Season 2) ---- */
  SESSION1_NAME: "Session 1 (เช้า)",
  SESSION2_NAME: "Session 2 (บ่าย)",

  /* ---- Team → Pitch Group (ต้องตรงกับ GROUP1_TEAMS / GROUP2_TEAMS ใน Code.gs) ---- */
  G1: ['A', 'B', 'C', 'D', 'G', 'I', 'K'],
  G2: ['E', 'F', 'H', 'J', 'L', 'M', 'N'],

  /* ---- Polling (ms) — มี jitter สุ่มเพิ่มเพื่อกระจายโหลด ---- */
  HUB_POLL_MS: 7000,
  COOLDOWN_POLL_MS: 4000,
  ADMIN_POLL_MS: 8000,
  WALL_POLL_MS: 5000
};

/* shorthand globals (ใช้ใน inline script ของแต่ละหน้า) */
(function (c) {
  ['DEMO_MODE', 'API_BASE_URL', 'OPENCHAT_URL_FALLBACK', 'LINE_MEETUP', 'LOGO', 'G1', 'G2'].forEach(function (k) { window[k] = c[k]; });
})(window.AINEXT_CONFIG);
