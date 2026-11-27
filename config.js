/* =====================================================================
 * AI NEXT Bootcamp · Season 2 (by Bizcore) — Shared configuration
 * ใช้ร่วมกันโดย index.html · admin.html · wall.html · guide.html
 * แก้ค่าการ Deploy ที่ไฟล์นี้ไฟล์เดียว
 * ===================================================================== */
window.AINEXT_CONFIG = {
  /* ---- Deployment ---- */
  DEMO_MODE: true,                                  // หลัง Deploy Code.gs: ตั้ง false + วาง URL ด้านล่าง
  API_BASE_URL: "https://script.google.com/macros/s/AKfycbyzXG_UTA9FAWE2vP-Z_DGYBAMF4zCq7fbLmht2WNEGgRyvqVMdpYdxuOuuvDDOinEG3Q/exec",      // URL ลงท้าย /exec จาก Apps Script

  /* ---- Links (⚠️ ตอนนี้ยังเป็นลิงก์ Season 1 — เปลี่ยนเป็นกลุ่ม Season 2) ---- */
  OPENCHAT_URL_FALLBACK: "https://line.me/ti/g2/j7M6cBYWprZOlbwT59vF0NFG83opEzuV8s3gNw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
  OPENCHAT_QR: "AIN2 Openchat.jpeg",
  LINE_MEETUP: "https://line.me/ti/g/srNQ_Rj82z",

  /* ---- Brand assets ---- */
  LOGO: "ainext-logo-bizcore.png",
  KEY_VISUAL: "ab-ai-next-01.jpg",
  EVENT_NAME: "AI NEXT Bootcamp",
  SEASON_LABEL: "Season 2",

  /* ---- Speakers ---- */
  SESSION1_NAME: "คุณหนุ่ย",     // Mission 1
  SESSION2_NAME: "คุณบูม",       // Mission 2

  /* ---- กลุ่ม (ต้องตรงกับ SEL_Group คอลัมน์ "กลุ่ม") — Group 1 โหวตได้เฉพาะ Group 1, Group 2 เฉพาะ Group 2 ---- */
  G1: ['A1', 'A2', 'A3', 'A4', 'A5'],
  G2: ['B1', 'B2', 'B3', 'B4', 'B5'],
  /* Wi-Fi จริงอยู่ในชีทแท็บ App_Wifi (ไม่เก็บรหัสในโค้ดสาธารณะ) */

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
