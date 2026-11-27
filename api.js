/* =====================================================================
 * AI NEXT Season 2 — API client + DEMO mock (shared by every page)
 * - DEMO_MODE=true  → ทำงานในเบราว์เซอร์ล้วน ๆ ด้วย localStorage (ข้อมูลสมมติ ไม่ใช่รายชื่อจริง)
 * - DEMO_MODE=false → POST ไป Google Apps Script (Code.gs) ที่ API_BASE_URL
 * ต้องโหลด config.js ก่อนไฟล์นี้
 * ===================================================================== */
(function () {
  var C = window.AINEXT_CONFIG;
  var LS_ROSTER = 'ainext2_roster_v5', LS_CONFIG = 'ainext2_config_v5', LS_RESULTS = 'ainext2_results_v5';

  /* ---------------- shared helpers ---------------- */
  function groupOf(t) { var s = String(t || '').toUpperCase().replace(/^TEAM\s*/, ''); return C.G1.indexOf(s) >= 0 ? 1 : (C.G2.indexOf(s) >= 0 ? 2 : 0); }
  function teamLabel(t) { return t ? 'Team ' + String(t).replace(/^Team\s*/i, '') : '—'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function readLS(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function last4(s) { return String(s || '').replace(/\D/g, '').slice(-4); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------------- demo seed (ข้อมูลสมมติทั้งหมด) ---------------- */
  var M1_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];
  var M3_KEYS = ['vote', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9_1', 'q9_2', 'q9_3', 'q9_4', 'q9_5', 'q9_6', 'q9_7', 'q9_8', 'q9_9', 'q9_10',
    'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19'];
  // Wi-Fi ตัวอย่าง (โหมดเดโม) — ของจริงอ่านจากแท็บ App_Wifi ในชีท
  var DEMO_WIFI = {
    A1: 1, A2: 1, A4: 1, A3: 2, A5: 2, B1: 3, B2: 3, B3: 3, B4: 4, B5: 4
  };
  var DEMO_WIFI_ROUTERS = {
    1: { router: 'Router UF#1', location: 'มุมซ้ายบน (Zone1)', ssid: 'AI@bootcamp1', password: 'demo-password' },
    2: { router: 'Router UF#2', location: 'มุมขวาบน (Zone2)', ssid: 'AI@bootcamp2', password: 'demo-password' },
    3: { router: 'Router UF#3', location: 'มุมซ้ายล่าง (Zone3)', ssid: 'AI@bootcamp3', password: 'demo-password' },
    4: { router: 'Router UF#4', location: 'มุมขวาล่าง (Zone4)', ssid: 'AI@bootcamp4', password: 'demo-password' }
  };

  function seedDemo() {
    if (!readLS(LS_ROSTER)) {
      var P = function (id, runNo, name, certName, nick, team, phone, extra) {
        var o = { no: id, runNo: runNo, name: name, certName: certName, nick: nick, team: team, phone: phone, called: false, joinedOpenChat: false, checkedIn: false, checkinAt: 0,
          m1: false, m2: false, m3: false, cert: false, vote: '', cannotAttend: false, isTest: /^TEST\d+$/.test(id), isMentor: /^MENTOR/.test(id) };
        for (var k in extra) o[k] = extra[k];
        return o;
      };
      var roster = [
        P('DEMO_0001', 'A1/01', 'ปิยาภา เดชฟุ้ง', 'PIYAPA DECHFUNG', 'แป้ง', 'A1', '0812341111'),
        P('DEMO_0002', 'A1/02', 'แพรวา ทองดี', 'PRAEWA THONGDEE', 'แพรว', 'A1', '0898762222', { joinedOpenChat: true }),
        P('DEMO_0003', 'B1/03', 'ธนกร กันไพเราะ', 'THANAKORN KANPAIRAO', 'แทน', 'B1', '0861233333'),
        P('DEMO_0004', 'A3/04', 'มีนา มานะจิระ', 'MEENA MANAJIRA', 'มีมี่', 'A3', '0824565555'),
        P('DEMO_0005', 'B4/05', 'ภูมิ สุขใจ', 'PHUM SUKJAI', 'ภูมิ', 'B4', '0807775555'),  // 4 ตัวท้ายซ้ำ 5555 → ทดสอบหน้าเลือกชื่อ
        P('MENTOR-A1/06', 'A1/06', 'พี่เนียน ตัวอย่าง', 'MENTOR SAMPLE', 'พี่เนียน', 'A1', '')
      ];
      var nicks = ['ต้น', 'ฝน', 'เจ', 'บีม', 'มิ้นท์', 'โอ๊ต', 'พลอย', 'ไผ่', 'นัท', 'ออม', 'กาย', 'เฟิร์น', 'ภูมิใจ', 'ข้าว', 'เมย์', 'แบงก์', 'ฟ้า', 'ตูน', 'จิ๊บ', 'ปอนด์', 'น้ำ', 'บอส', 'แนน', 'ปาล์ม', 'ดิว', 'กิ๊ฟ', 'เอิร์ธ', 'หมิว', 'โบ', 'จูน'];
      var teams = C.G1.concat(C.G2);
      nicks.forEach(function (n, i) {
        var T = teams[i % teams.length], r = (i * 37) % 100;
        roster.push(P('DEMO_' + (100 + i), T + '/' + (10 + i), 'สมาชิก ' + n + 'ทดลอง', 'DEMO MEMBER ' + (i + 1), n, T, '09' + String(20000000 + i * 7919).slice(0, 8),
          { checkedIn: r < 70, checkinAt: r < 70 ? Date.now() - (100 - i) * 60000 : 0, joinedOpenChat: r < 70, m1: r < 55, m2: r < 30 }));
      });
      // ผู้ทดสอบ — ชุดเดียวกับแถว 85–92 ของ SEL_Group (ดู Guide_QA_Tester.html)
      [['TEST01', 'A1', 'TEST ONE', 'ทดสอบ หนึ่ง', 'Test1', '0800000001'], ['TEST02', 'A3', 'TEST TWO', 'ทดสอบ สอง', 'Test2', '0800000002'],
       ['TEST03', 'A4', 'TEST THREE', 'ทดสอบ สาม', 'Test3', '0800000003'], ['TEST04', 'B1', 'TEST FOUR', 'ทดสอบ สี่', 'Test4', '0800000004'],
       ['TEST05', 'B4', 'TEST FIVE', 'ทดสอบ ห้า', 'Test5', '0800000005'], ['TEST06', 'B5', 'TEST SIX', 'ทดสอบ หก', 'Test6', '0800000006'],
       ['TEST07', 'A2', 'TEST SEVEN', 'ทดสอบ เจ็ด', 'Test7', '0899990006'], ['TEST08', 'B2', 'TEST EIGHT', 'ทดสอบ แปด', 'Test8', '']
      ].forEach(function (t, i) { roster.push(P(t[0], 'TEST/0' + (i + 1), t[3], t[2], t[4], t[1], t[5])); });
      writeLS(LS_ROSTER, roster);
    }
    if (!readLS(LS_CONFIG)) writeLS(LS_CONFIG, { checkin_open: true, mission1_open: true, mission2_open: false, mission3_open: false, cert_open: false, admin_password: 'ainext2026', event_name: 'AI NEXT Season 2', openchat_url: C.OPENCHAT_URL_FALLBACK, wall_mode: 'checkin' });
    if (!readLS(LS_RESULTS)) writeLS(LS_RESULTS, { m1: [], m2: [], m3: [] });
  }

  function voteOpts(group, ownTeam) { return (group === 1 ? C.G1 : group === 2 ? C.G2 : []).filter(function (t) { return t !== ownTeam; }); }
  function counted(p) { return !p.isTest && !p.isMentor && !p.cannotAttend; }
  function statusOf(p, cfg) {
    var parts = p.name.split(' ');
    return {
      success: true, attendeeId: p.no, runNo: p.runNo, firstName: parts[0], lastName: parts.slice(1).join(' '), certName: p.certName || p.name,
      name: p.name, nick: p.nick, team: p.team, group: groupOf(p.team), isMentor: !!p.isMentor,
      wifi: p.checkedIn ? (DEMO_WIFI_ROUTERS[DEMO_WIFI[p.team]] || null) : null,
      joinedOpenChat: !!p.joinedOpenChat, checkedIn: !!p.checkedIn, openchatUrl: cfg.openchat_url,
      done: { m1: !!p.m1, m2: !!p.m2, m3: !!p.m3 }, certIssued: !!p.cert,
      mission1_open: !!cfg.mission1_open, mission2_open: !!cfg.mission2_open, mission3_open: !!cfg.mission3_open, cert_open: !!cfg.cert_open,
      myVote: p.vote || '', voteOptions: voteOpts(groupOf(p.team), p.team)
    };
  }
  function tally(roster) { var t = {}; roster.forEach(function (p) { if (p.vote && !p.isMentor && !p.cannotAttend) t[p.vote] = (t[p.vote] || 0) + 1; }); return t; }
  function rankGroup(g, t) {
    return voteOpts(g, '').map(function (k) { return { team: k, votes: t[k] || 0 }; }).sort(function (a, b) { return b.votes - a.votes || a.team.localeCompare(b.team); });
  }
  function teamProgress(roster) {
    var map = {};
    roster.forEach(function (p) {
      if (!counted(p) || !p.team) return;
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
        var real = roster.filter(counted);

        if (action === 'checkin') {
          var digits = String(params.phone || params.query || '').replace(/\D/g, '');
          if (digits.length < 4) return resolve({ success: false, reason: 'need_last4' });
          if (!cfg.checkin_open) return resolve({ success: false, reason: 'checkin_closed' });
          var q = digits.slice(-4), matches = roster.filter(function (p) { return !p.cannotAttend && last4(p.phone) === q; });
          if (!matches.length) return resolve({ success: false, reason: 'not_found' });
          if (matches.length > 1) return resolve({ success: true, multiple: true, people: matches.map(function (p) { return { attendeeId: p.no, nick: p.nick, name: p.name, team: p.team, runNo: p.runNo }; }) });
          return resolve(statusOf(matches[0], cfg));
        }
        if (action === 'confirmCheckin') {
          if (!params.pdpa) return resolve({ success: false, reason: 'need_pdpa' });
          var p1 = find(params.attendeeId); if (!p1) return resolve({ success: false });
          if (params.joinedOpenChat) p1.joinedOpenChat = true;
          if (!p1.checkedIn) { p1.checkedIn = true; p1.checkinAt = Date.now(); }
          save(); return resolve(statusOf(p1, cfg));
        }
        if (action === 'getStatus') { var p2 = find(params.attendeeId); return resolve(p2 ? statusOf(p2, cfg) : { success: false }); }
        if (action === 'submitVote') {
          var p3 = find(params.attendeeId); if (!p3) return resolve({ success: false });
          if (!cfg.mission3_open) return resolve({ success: false, reason: 'mission_closed' });
          if (!p3.checkedIn) return resolve({ success: false, reason: 'not_checked_in' });
          if (voteOpts(groupOf(p3.team), p3.team).indexOf(params.vote) < 0) return resolve({ success: false, reason: 'bad_vote' });
          p3.vote = params.vote; save(); return resolve(statusOf(p3, cfg));
        }
        if (action === 'submitMission') {
          var p4 = find(params.attendeeId), n = Number(params.mission), a = params.answers || {};
          if (!p4) return resolve({ success: false });
          if (!cfg['mission' + n + '_open']) return resolve({ success: false, reason: 'mission_closed' });
          if (!p4.checkedIn) return resolve({ success: false, reason: 'not_checked_in' });
          if (p4['m' + n]) return resolve(statusOf(p4, cfg));
          if (n === 3) {
            var v = a.vote || p4.vote || ''; if (voteOpts(groupOf(p4.team), p4.team).indexOf(v) < 0) return resolve({ success: false, reason: 'bad_vote' });
            p4.vote = v;
          }
          results['m' + n].push([new Date().toLocaleString('th-TH'), p4.no, p4.nick, p4.team].concat((n === 3 ? M3_KEYS : M1_KEYS).map(function (k) { return a[k] == null ? '' : a[k]; })));
          writeLS(LS_RESULTS, results);
          p4['m' + n] = true;
          if (cfg.cert_open && p4.m1 && p4.m2 && p4.m3) p4.cert = true;
          save(); return resolve(statusOf(p4, cfg));
        }

        if (action === 'getWall') {
          var recent = real.filter(function (p) { return p.checkedIn; }).sort(function (a, b) { return (b.checkinAt || 0) - (a.checkinAt || 0); })
            .slice(0, 12).map(function (p) { return { nick: p.nick, group: teamLabel(p.team) }; });
          var t = tally(roster);
          return resolve({ success: true, mode: cfg.wall_mode || 'checkin', total: real.length, checked: real.filter(function (p) { return p.checkedIn; }).length,
            recent: recent, teams: teamProgress(roster), votes: { group1: rankGroup(1, t), group2: rankGroup(2, t), totalVotes: Object.keys(t).reduce(function (s, k) { return s + t[k]; }, 0) } });
        }

        var pwOk = String(params.password) === String(cfg.admin_password || 'ainext2026');
        if (action === 'adminLogin') return resolve({ success: pwOk });
        if (action.indexOf('admin') === 0 && !pwOk) return resolve({ success: false, reason: 'bad_password' });
        var statsObj = function () {
          var s = { total: real.length, mentors: roster.filter(function (p) { return p.isMentor; }).length, testers: roster.filter(function (p) { return p.isTest; }).length,
            cannotAttend: roster.filter(function (p) { return p.cannotAttend && !p.isTest; }).length, checkin: 0, m1: 0, m2: 0, m3: 0, cert: 0, openchat: 0, votes: 0,
            checkin_open: !!cfg.checkin_open, mission1_open: !!cfg.mission1_open, mission2_open: !!cfg.mission2_open, mission3_open: !!cfg.mission3_open, cert_open: !!cfg.cert_open, wall_mode: cfg.wall_mode || 'checkin' };
          real.forEach(function (p) { if (p.checkedIn) s.checkin++; if (p.m1) s.m1++; if (p.m2) s.m2++; if (p.m3) s.m3++; if (p.cert) s.cert++; if (p.joinedOpenChat) s.openchat++; if (p.vote) s.votes++; });
          return s;
        };
        if (action === 'adminStats') return resolve({ success: true, stats: statsObj() });
        if (action === 'adminSetOpen') {
          var key = { checkin: 'checkin_open', m1: 'mission1_open', m2: 'mission2_open', m3: 'mission3_open', cert: 'cert_open' }[params.key];
          if (key) { cfg[key] = !!params.open; if (params.key === 'cert' && params.open) { roster.forEach(function (p) { if (p.m1 && p.m2 && p.m3) p.cert = true; }); save(); } writeLS(LS_CONFIG, cfg); }
          return resolve({ success: true, stats: statsObj() });
        }
        if (action === 'adminSetWallMode') {
          if (['checkin', 'missions', 'votes'].indexOf(params.mode) < 0) return resolve({ success: false, reason: 'bad_mode' });
          cfg.wall_mode = params.mode; writeLS(LS_CONFIG, cfg); return resolve({ success: true, stats: statsObj() });
        }
        if (action === 'adminList' || action === 'adminSearchParticipants') {
          return resolve({ success: true, items: roster.map(function (p) {
            return { attendeeId: p.no, runNo: p.runNo, name: p.name, nick: p.nick, team: p.team, group: groupOf(p.team), phone: p.phone || '', sel: p.isMentor ? '' : 'Selected',
              called: !!p.called, checkin: !!p.checkedIn, openchat: !!p.joinedOpenChat, m1: !!p.m1, m2: !!p.m2, m3: !!p.m3, cert: !!p.cert, vote: p.vote || '',
              cannotAttend: !!p.cannotAttend, isMentor: !!p.isMentor, isTest: !!p.isTest };
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
        if (action === 'adminVotes') { var t2 = tally(roster); return resolve({ success: true, group1: rankGroup(1, t2), group2: rankGroup(2, t2), totalVotes: Object.keys(t2).reduce(function (s, k) { return s + t2[k]; }, 0) }); }
        if (action === 'adminResults') {
          var h1 = ['Timestamp', 'ID', 'ชื่อเล่น', 'กลุ่ม'].concat(M1_KEYS), h3 = ['Timestamp', 'ID', 'ชื่อเล่น', 'กลุ่ม'].concat(M3_KEYS);
          return resolve({ success: true, m1: { headers: h1, rows: results.m1 }, m2: { headers: h1, rows: results.m2 }, m3: { headers: h3, rows: results.m3 } });
        }
        if (action === 'adminCertified') return resolve({ success: true, items: roster.filter(function (p) { return p.cert && !p.isTest; }).map(function (p) { return { attendeeId: p.no, runNo: p.runNo, name: p.name, certName: p.certName, nick: p.nick, team: p.team, group: groupOf(p.team), isMentor: !!p.isMentor }; }) });
        resolve({ success: false, error: 'unknown_action' });
      }, 220 + Math.random() * 200);
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
        if (json && json.reason === 'busy' && attempt < 3) { await sleep(600 * (attempt + 1) + Math.random() * 600); continue; }
        return json;
      } catch (e) {
        if (attempt >= 1) return { success: false, reason: 'network', error: String(e) };
        await sleep(800 + Math.random() * 700);
      }
    }
    return { success: false, reason: 'busy' };
  }
  function jitterInterval(fn, base, spread) {
    var stopped = false, t = null;
    (function loop() { t = setTimeout(function () { if (stopped) return; Promise.resolve(fn()).catch(function () { }).then(loop); }, base + Math.random() * (spread == null ? 2000 : spread)); })();
    return function stop() { stopped = true; clearTimeout(t); };
  }
  function downloadCSV(filename, headers, rows) {
    var cell = function (v) { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var csv = [headers].concat(rows).map(function (r) { return r.map(cell).join(','); }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  window.AINEXT = {
    callApi: callApi, seedDemo: seedDemo, jitterInterval: jitterInterval, downloadCSV: downloadCSV,
    groupOf: groupOf, teamLabel: teamLabel, esc: esc, readLS: readLS, writeLS: writeLS, sleep: sleep
  };
})();
