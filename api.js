/* =====================================================================
 * AI NEXT Season 2 — API client + DEMO mock (shared by every page)
 * - DEMO_MODE=true  → ทำงานในเบราว์เซอร์ล้วน ๆ ด้วย localStorage (ทดสอบได้ทันที)
 * - DEMO_MODE=false → POST ไป Google Apps Script (Code.gs) ที่ API_BASE_URL
 * ต้องโหลด config.js ก่อนไฟล์นี้
 * ===================================================================== */
(function () {
  var C = window.AINEXT_CONFIG;
  var LS_ROSTER = 'ainext2_roster', LS_CONFIG = 'ainext2_config', LS_RESULTS = 'ainext2_results';

  /* ---------------- shared helpers ---------------- */
  function teamLetter(t) { var m = String(t || '').toUpperCase().match(/TEAM\s*([A-Z])/); return m ? m[1] : ''; }
  function groupOf(t) { var L = teamLetter(t); return C.G1.indexOf(L) >= 0 ? 1 : (C.G2.indexOf(L) >= 0 ? 2 : 0); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function readLS(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function last4(s) { return String(s || '').replace(/\D/g, '').slice(-4); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------------- demo seed ---------------- */
  var M1_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];
  var M3_KEYS = ['vote', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9_1', 'q9_2', 'q9_3', 'q9_4', 'q9_5', 'q9_6', 'q9_7', 'q9_8', 'q9_9', 'q9_10',
    'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21'];

  function seedDemo() {
    if (!readLS(LS_ROSTER)) {
      var P = function (no, runNo, name, nick, team, menu, phone, extra) {
        var o = { no: String(no), runNo: runNo, name: name, nick: nick, team: team, menu: menu, phone: phone, called: false, joinedOpenChat: false, checkedIn: false, checkinAt: 0, m1: false, m2: false, m3: false, cert: false, vote: '', cannotAttend: false, isTest: false };
        for (var k in extra) o[k] = extra[k];
        return o;
      };
      var roster = [
        P(1, 'A01', 'ปิยาภา เดชฟุ้ง', 'แป้ง', 'Team A', 'ไก่บอนชอน', '0812341111'),
        P(2, 'A02', 'แพรว ทองดี', 'แพรว', 'Team A', 'ไก่บอนชอน', '0898762222', { called: true, joinedOpenChat: true }),
        P(3, 'B01', 'ธนกาญจน์ กันไพเราะ', 'แทน', 'Team B', 'กิมจิหมู', '0861233333'),
        P(4, 'C01', 'เกศราภรณ์ มานะจิระ', 'มีมี่', 'Team C', 'ไก่บอนชอน', '0824564444'),
        P(5, 'E01', 'อธิคม มูฮำหมัดอารี', 'ร็อก', 'Team E', 'ปลาทอดบอนชอน', '0817895555'),
        P(6, 'F01', 'มณีรัตน์ วงศ์เพียรพันธุ์', 'เบลล์', 'Team F', 'กิมจิหมู', '0893216666'),
        P(7, 'B02', 'ปิยาภา ศรีสุข', 'ปุ้ย', 'Team B', 'ข้าวยำ', '0845557777')   // ชื่อต้นซ้ำ → ทดสอบหน้าเลือกชื่อ
      ];
      // filler members across Team A–N so the Live Wall has something to show
      var nicks = ['ต้น', 'ฝน', 'เจ', 'บีม', 'มิ้นท์', 'โอ๊ต', 'พลอย', 'ไผ่', 'นัท', 'ออม', 'กาย', 'เฟิร์น', 'ภูมิ', 'ข้าว', 'เมย์', 'แบงก์', 'ฟ้า', 'ตูน', 'จิ๊บ', 'ปอนด์', 'น้ำ', 'บอส', 'แนน', 'ปาล์ม', 'ดิว', 'กิ๊ฟ', 'เอิร์ธ', 'หมิว'];
      var letters = 'ABCDEFGHIJKLMN'.split('');
      nicks.forEach(function (n, i) {
        var L = letters[i % letters.length], r = (i * 37) % 100;
        roster.push(P(100 + i, L + String(10 + i), 'สมาชิก ' + n + 'ทดลอง', n, 'Team ' + L, ['ไก่บอนชอน', 'กิมจิหมู', 'ข้าวยำ'][i % 3], '08' + String(10000000 + i * 7919).slice(0, 8),
          { checkedIn: r < 70, checkinAt: r < 70 ? Date.now() - (100 - i) * 60000 : 0, joinedOpenChat: r < 70, m1: r < 55, m2: r < 30, m3: false }));
      });
      roster.push(P('T1', 'T01', 'Test1 ผู้ทดสอบ', 'Test1', 'Team A', 'ไก่บอนชอน', '0800000001', { isTest: true }));
      roster.push(P('T2', 'T02', 'Test2 ผู้ทดสอบ', 'Test2', 'Team E', 'ไก่บอนชอน', '0800000002', { isTest: true }));
      writeLS(LS_ROSTER, roster);
    }
    if (!readLS(LS_CONFIG)) {
      writeLS(LS_CONFIG, { checkin_open: true, mission1_open: true, mission2_open: false, mission3_open: false, cert_open: false, admin_password: 'ainext2026', event_name: 'AI NEXT Season 2', openchat_url: C.OPENCHAT_URL_FALLBACK, wall_mode: 'checkin' });
    }
    if (!readLS(LS_RESULTS)) writeLS(LS_RESULTS, { m1: [], m2: [], m3: [] });
  }

  function stageOf(p) { return p.m3 ? 4 : p.m2 ? 3 : p.m1 ? 2 : 1; }
  function groupFor(p) { return p.isTest ? (p.no === 'T1' ? 1 : 2) : groupOf(p.team); }
  function voteOpts(roster, group, ownTeam) {
    var s = {}; roster.forEach(function (p) { if (!p.isTest && groupOf(p.team) === group && p.team && p.team !== ownTeam) s[p.team] = true; });
    return Object.keys(s).sort();
  }
  function statusOf(p, cfg, roster) {
    var parts = p.name.split(' ');
    return {
      success: true, event_name: cfg.event_name, attendeeId: p.no, runNo: p.runNo, firstName: parts[0], lastName: parts.slice(1).join(' '),
      name: p.name, nick: p.nick, team: p.team, group: groupFor(p), menu: p.menu, joinedOpenChat: !!p.joinedOpenChat, checkedIn: !!p.checkedIn,
      openchatUrl: cfg.openchat_url, stage: stageOf(p), done: { m1: !!p.m1, m2: !!p.m2, m3: !!p.m3 }, certIssued: !!p.cert,
      mission1_open: !!cfg.mission1_open, mission2_open: !!cfg.mission2_open, mission3_open: !!cfg.mission3_open, cert_open: !!cfg.cert_open,
      myVote: p.vote || '', voteOptions: voteOpts(roster, groupFor(p), p.team)
    };
  }
  function tally(roster) { var t = {}; roster.forEach(function (p) { if (p.vote) t[p.vote] = (t[p.vote] || 0) + 1; }); return t; }
  function rankGroup(roster, g, t) {
    var teams = {}; roster.forEach(function (p) { if (!p.isTest && groupOf(p.team) === g && p.team) teams[p.team] = true; });
    return Object.keys(teams).map(function (k) { return { team: k, votes: t[k] || 0 }; }).sort(function (a, b) { return b.votes - a.votes || a.team.localeCompare(b.team); });
  }
  function teamProgress(roster) {
    var map = {};
    roster.forEach(function (p) {
      if (p.isTest || p.cannotAttend || !p.team) return;
      var m = map[p.team] || (map[p.team] = { team: p.team, group: groupOf(p.team), members: 0, checked: 0, stamps: 0, m1: 0, m2: 0, m3: 0 });
      m.members++; if (p.checkedIn) m.checked++;
      ['m1', 'm2', 'm3'].forEach(function (k) { if (p[k]) { m[k]++; m.stamps++; } });
    });
    return Object.keys(map).map(function (k) { var m = map[k]; m.pct = m.members ? Math.round(m.stamps / (m.members * 3) * 100) : 0; return m; })
      .sort(function (a, b) { return b.pct - a.pct || b.stamps - a.stamps || a.team.localeCompare(b.team); });
  }

  /* ---------------- mock router ---------------- */
  function mockApi(action, params) {
    seedDemo();
    return new Promise(function (resolve) {
      setTimeout(function () {
        var cfg = readLS(LS_CONFIG), roster = readLS(LS_ROSTER), results = readLS(LS_RESULTS);
        var find = function (id) { return roster.find(function (p) { return String(p.no) === String(id); }); };
        var save = function () { writeLS(LS_ROSTER, roster); };
        var real = roster.filter(function (p) { return !p.isTest && !p.cannotAttend; });

        /* ----- participant ----- */
        if (action === 'checkin') {
          var q = norm(params.name || params.query); if (!q) return resolve({ success: false, reason: 'empty_name' });
          if (!cfg.checkin_open) return resolve({ success: false, reason: 'checkin_closed' });
          var pool = roster.filter(function (p) { return !p.cannotAttend; }), matches;
          if (/^\d{4}$/.test(q)) matches = pool.filter(function (p) { return last4(p.phone) === q; });
          else {
            matches = pool.filter(function (p) { return norm(p.name.split(' ')[0]) === q; });
            if (!matches.length) matches = pool.filter(function (p) { return norm(p.nick) === q || norm(p.name).indexOf(q) === 0; });
          }
          if (!matches.length) return resolve({ success: false, reason: 'not_found' });
          if (matches.length > 1) return resolve({ success: true, multiple: true, people: matches.map(function (p) { return { attendeeId: p.no, nick: p.nick, name: p.name, team: p.team, runNo: p.runNo }; }) });
          return resolve(statusOf(matches[0], cfg, roster));
        }
        if (action === 'confirmCheckin') {
          if (!params.pdpa) return resolve({ success: false, reason: 'need_pdpa' });
          var p1 = find(params.attendeeId); if (!p1) return resolve({ success: false });
          if (params.joinedOpenChat) p1.joinedOpenChat = true;
          if (!p1.checkedIn) { p1.checkedIn = true; p1.checkinAt = Date.now(); }
          save(); return resolve(statusOf(p1, cfg, roster));
        }
        if (action === 'getStatus') { var p2 = find(params.attendeeId); return resolve(p2 ? statusOf(p2, cfg, roster) : { success: false }); }
        if (action === 'submitVote') {
          var p3 = find(params.attendeeId); if (!p3) return resolve({ success: false });
          if (!cfg.mission3_open) return resolve({ success: false, reason: 'mission_closed' });
          if (!p3.checkedIn) return resolve({ success: false, reason: 'not_checked_in' });
          if (!params.vote || voteOpts(roster, groupFor(p3), p3.team).indexOf(params.vote) < 0) return resolve({ success: false, reason: 'bad_vote' });
          p3.vote = params.vote; save(); return resolve(statusOf(p3, cfg, roster));
        }
        if (action === 'submitMission') {
          var p4 = find(params.attendeeId), n = Number(params.mission), a = params.answers || {};
          if (!p4) return resolve({ success: false });
          if (!cfg['mission' + n + '_open']) return resolve({ success: false, reason: 'mission_closed' });
          if (!p4.checkedIn) return resolve({ success: false, reason: 'not_checked_in' });
          if (p4['m' + n]) return resolve(statusOf(p4, cfg, roster));
          if (n === 3) {
            var v = a.vote || ''; if (!v || voteOpts(roster, groupFor(p4), p4.team).indexOf(v) < 0) return resolve({ success: false, reason: 'bad_vote' });
            if (!p4.vote) p4.vote = v;
          }
          var keys = n === 3 ? M3_KEYS : M1_KEYS;
          results['m' + n].push([new Date().toLocaleString('th-TH'), p4.no, p4.nick, p4.team].concat(keys.map(function (k) { return a[k] == null ? '' : a[k]; })));
          writeLS(LS_RESULTS, results);
          p4['m' + n] = true;
          if (cfg.cert_open && p4.m1 && p4.m2 && p4.m3) p4.cert = true;   // ปล่อย Cert แล้ว → ออกให้ทันทีเมื่อครบ
          save(); return resolve(statusOf(p4, cfg, roster));
        }

        /* ----- public wall ----- */
        if (action === 'getWall') {
          var recent = roster.filter(function (p) { return p.checkedIn && !p.isTest; }).sort(function (a, b) { return (b.checkinAt || 0) - (a.checkinAt || 0); })
            .slice(0, 12).map(function (p) { return { nick: p.nick, group: p.team }; });
          var t = tally(roster);
          return resolve({
            success: true, mode: cfg.wall_mode || 'checkin', total: real.length, checked: real.filter(function (p) { return p.checkedIn; }).length,
            recent: recent, teams: teamProgress(roster),
            votes: { group1: rankGroup(roster, 1, t), group2: rankGroup(roster, 2, t), totalVotes: Object.keys(t).reduce(function (s, k) { return s + t[k]; }, 0) }
          });
        }

        /* ----- admin ----- */
        var pwOk = String(params.password) === String(cfg.admin_password || 'ainext2026');
        if (action === 'adminLogin') return resolve({ success: pwOk });
        if (action.indexOf('admin') === 0 && !pwOk) return resolve({ success: false, reason: 'bad_password' });
        var statsObj = function () {
          var s = { total: real.length, testers: roster.filter(function (p) { return p.isTest; }).length, cannotAttend: roster.filter(function (p) { return p.cannotAttend && !p.isTest; }).length,
            checkin: 0, m1: 0, m2: 0, m3: 0, cert: 0, openchat: 0, votes: 0, checkin_open: !!cfg.checkin_open, mission1_open: !!cfg.mission1_open,
            mission2_open: !!cfg.mission2_open, mission3_open: !!cfg.mission3_open, cert_open: !!cfg.cert_open, wall_mode: cfg.wall_mode || 'checkin' };
          real.forEach(function (p) { if (p.checkedIn) s.checkin++; if (p.m1) s.m1++; if (p.m2) s.m2++; if (p.m3) s.m3++; if (p.cert) s.cert++; if (p.joinedOpenChat) s.openchat++; if (p.vote) s.votes++; });
          return s;
        };
        if (action === 'adminStats') return resolve({ success: true, stats: statsObj() });
        if (action === 'adminSetOpen') {
          var map = { checkin: 'checkin_open', m1: 'mission1_open', m2: 'mission2_open', m3: 'mission3_open', cert: 'cert_open' }, key = map[params.key];
          if (key) { cfg[key] = !!params.open; if (params.key === 'cert' && params.open) { roster.forEach(function (p) { if (p.m1 && p.m2 && p.m3) p.cert = true; }); save(); } writeLS(LS_CONFIG, cfg); }
          return resolve({ success: true, stats: statsObj() });
        }
        if (action === 'adminSetWallMode') {
          if (['checkin', 'missions', 'votes'].indexOf(params.mode) < 0) return resolve({ success: false, reason: 'bad_mode' });
          cfg.wall_mode = params.mode; writeLS(LS_CONFIG, cfg); return resolve({ success: true, stats: statsObj() });
        }
        if (action === 'adminList' || action === 'adminSearchParticipants') {
          var qq = norm(params.query || ''), rows = roster;
          if (qq) rows = rows.filter(function (p) { return norm(p.no + ' ' + p.runNo + ' ' + p.name + ' ' + p.nick + ' ' + p.team).indexOf(qq) >= 0; });
          return resolve({ success: true, items: rows.map(function (p) {
            return { attendeeId: p.no, runNo: p.runNo, name: p.name, nick: p.nick, team: p.team, group: groupFor(p), phone: p.phone || '', menu: p.menu || '', called: !!p.called,
              checkin: !!p.checkedIn, openchat: !!p.joinedOpenChat, m1: !!p.m1, m2: !!p.m2, m3: !!p.m3, cert: !!p.cert, vote: p.vote || '', cannotAttend: !!p.cannotAttend, isTest: !!p.isTest };
          }) });
        }
        if (action === 'adminUpdateParticipant') {
          var p5 = find(params.attendeeId); if (!p5) return resolve({ success: false });
          var patch = params.patch || {};
          ['checkin', 'openchat', 'm1', 'm2', 'm3', 'cert', 'cannotAttend', 'called'].forEach(function (k) {
            if (typeof patch[k] !== 'boolean') return;
            if (k === 'checkin') { p5.checkedIn = patch[k]; if (patch[k] && !p5.checkinAt) p5.checkinAt = Date.now(); }
            else if (k === 'openchat') p5.joinedOpenChat = patch[k]; else p5[k] = patch[k];
          });
          save(); return resolve({ success: true });
        }
        if (action === 'adminVotes') { var t2 = tally(roster); return resolve({ success: true, group1: rankGroup(roster, 1, t2), group2: rankGroup(roster, 2, t2), totalVotes: Object.keys(t2).reduce(function (s, k) { return s + t2[k]; }, 0) }); }
        if (action === 'adminResults') {
          var h1 = ['Timestamp', 'No', 'ชื่อเล่น', 'ทีม'].concat(M1_KEYS), h3 = ['Timestamp', 'No', 'ชื่อเล่น', 'ทีม'].concat(M3_KEYS);
          return resolve({ success: true, m1: { headers: h1, rows: results.m1 }, m2: { headers: h1, rows: results.m2 }, m3: { headers: h3, rows: results.m3 } });
        }
        if (action === 'adminCertified') return resolve({ success: true, items: roster.filter(function (p) { return p.cert && !p.isTest; }).map(function (p) { return { attendeeId: p.no, runNo: p.runNo, name: p.name, nick: p.nick, team: p.team, group: groupOf(p.team) }; }) });
        resolve({ success: false, error: 'unknown_action' });
      }, 260 + Math.random() * 240);
    });
  }

  /* ---------------- real API with busy-retry ---------------- */
  async function callApi(action, params) {
    params = params || {};
    if (C.DEMO_MODE) return mockApi(action, params);
    var body = JSON.stringify(Object.assign({ action: action }, params));
    for (var attempt = 0; attempt < 4; attempt++) {
      try {
        var res = await fetch(C.API_BASE_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body });
        var json = await res.json();
        // Code.gs ตอบ reason:'busy' เมื่อ LockService รอคิวไม่ทัน → ถอยแล้วลองใหม่อัตโนมัติ
        if (json && json.reason === 'busy' && attempt < 3) { await sleep(600 * (attempt + 1) + Math.random() * 600); continue; }
        return json;
      } catch (e) {
        if (attempt >= 1) return { success: false, reason: 'network', error: String(e) };
        await sleep(800 + Math.random() * 700);
      }
    }
    return { success: false, reason: 'busy' };
  }

  /* jittered interval: แต่ละรอบสุ่มเวลาใหม่ (base … base+spread) */
  function jitterInterval(fn, base, spread) {
    var stopped = false, t = null;
    (function loop() { t = setTimeout(function () { if (stopped) return; Promise.resolve(fn()).catch(function () { }).then(loop); }, base + Math.random() * (spread == null ? 2000 : spread)); })();
    return function stop() { stopped = true; clearTimeout(t); };
  }

  /* CSV download (UTF-8 BOM ให้ Excel อ่านภาษาไทยได้) */
  function downloadCSV(filename, headers, rows) {
    var cell = function (v) { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var csv = [headers].concat(rows).map(function (r) { return r.map(cell).join(','); }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  window.AINEXT = {
    callApi: callApi, seedDemo: seedDemo, jitterInterval: jitterInterval, downloadCSV: downloadCSV,
    teamLetter: teamLetter, groupOf: groupOf, esc: esc, readLS: readLS, writeLS: writeLS, sleep: sleep
  };
})();
