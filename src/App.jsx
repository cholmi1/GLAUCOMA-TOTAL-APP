import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Line, ScatterChart, Scatter, ComposedChart, Area, Bar, BarChart, Cell, XAxis, YAxis, ZAxis,
  ResponsiveContainer, ReferenceArea, ReferenceLine, Tooltip, CartesianGrid,
} from "recharts";
import {
  Eye, EyeOff, Home, Gauge, Activity, Settings, Bluetooth, Check, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, ChevronsUpDown, Bell, Clock, Stethoscope, Smartphone, Send, User, Users,
  UserPlus, UserCog, RefreshCw, X, Trash2, Plus, CalendarDays, AlertTriangle, AlertCircle, LineChart,
  Circle, Sunrise, Sun, Sunset, Moon, TrendingUp, Share2, ShieldCheck, Shield, Info, ListChecks,
  Search, Lock, LogIn, LogOut, KeyRound, Mail, Phone, Flag, Globe, Monitor, FileText, Download,
  Building2, PackageCheck, Undo2, Link2, Unlink, BatteryLow, WifiOff, MessageSquare, CheckCheck,
  Timer, BellRing, Play, PhoneCall, ServerCog, History, Droplets, Droplet, ClipboardList, Watch, Footprints,
  HeartPulse, Coffee, Wine, Leaf, Wind, Bed, Dumbbell, Cigarette, Waves, Pill, Sparkles,
  CheckCircle2, QrCode, ScanLine, Beaker, CircleDot, ThermometerSun, Package,
} from "lucide-react";

/* ============================================================
   안압케어 — 녹내장 통합관리 v3  (환자 앱 + 의료진 웹)
   C&V Tech · CVT200 companion

   v3 = 통합앱(안압·점안·문진·건강) + 안압관리 전용앱 v2의 개선사항 통합
   ─ 계정/로그인(개별·SNS·비회원) · 역할별 권한 · 고객 DB
   ─ 좌/우안 선택 측정 · 그래프 형식 선택(Chart/Scatter/Diurnal)
   ─ 기기 소유 이원화(병원 대여/개인 소유) · 반납 알림 자동화 · 감사 로그
   ─ 점안관리 전면 개선: 좌우안 구분 점안, 약병 수명·잔량, 부작용 기록,
     점안↔안압 연동, 리필/폐기 알림
   ============================================================ */

const C = {
  ink: "#0A2A31", primary: "#0E5563", primaryDeep: "#083841", aqua: "#3EA6A6",
  mint: "#E6F0EF", mintDeep: "#D3E6E4", bg: "#F3F7F6", card: "#FFFFFF", line: "#E2EAE9",
  sub: "#5E7A7C", gold: "#C39A2E", goldSoft: "#F3E9CC",
  low: "#2E9E7B", lowSoft: "#E4F2EC", mid: "#D79A2B", midSoft: "#FBEFD3",
  high: "#D25C46", highSoft: "#FBE6E0", od: "#0E5563", os: "#C39A2E",
  odC: "#0E5563", osC: "#C39A2E", grey: "#AAB9B8",
};
const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif";
const RISK = {
  저: { label: "낮음", c: C.low, soft: C.lowSoft },
  중: { label: "주의", c: C.mid, soft: C.midSoft },
  고: { label: "높음", c: C.high, soft: C.highSoft },
  "-": { label: "참고", c: C.sub, soft: "#EEF2F1" },
};

/* ---------- 역할 · 권한 ---------- */
const ROLES = {
  admin: { id: "admin", label: "관리자", short: "관리자", c: C.high, desc: "기관 전체 설정·사용자 계정·데이터 관리" },
  physician: { id: "physician", label: "의사", short: "의사", c: C.low, desc: "환자 진료·목표 안압·처방·인증" },
  trainer: { id: "trainer", label: "교육 담당자", short: "교육", c: C.gold, desc: "환자 등록·측정 교육·기기 관리" },
};
const PERMISSIONS = [
  { t: "신규 사용자(직원) 생성", p: [0, 0, 0, 1] },
  { t: "사용자 명단 보기 및 편집", p: [0, 0, 0, 1] },
  { t: "기관 정보 보기 및 편집", p: [0, 0, 0, 1] },
  { t: "기관 데이터 다운로드", p: [0, 0, 0, 1] },
  { t: "알림 스케줄·채널 설정", p: [0, 0, 0, 1] },
  { t: "기관 장치(CVT200) 관리", p: [0, 1, 1, 1] },
  { t: "환자 추가 · 명단 보기", p: [0, 1, 1, 1] },
  { t: "환자 정보 보기 및 편집", p: [0, 1, 1, 1] },
  { t: "환자 활성화 및 비활성화", p: [0, 1, 1, 1] },
  { t: "환자 계정 인증", p: [0, 1, 1, 1] },
  { t: "목표 안압 설정·변경", p: [0, 1, 0, 1] },
  { t: "점안제 처방 등록·변경", p: [0, 1, 0, 1] },
  { t: "측정 결과 및 보고서 보기", p: [0, 1, 1, 1] },
  { t: "측정 결과 제외 처리", p: [0, 1, 0, 1] },
  { t: "문진 응답 · 위험 플래그 보기", p: [0, 1, 1, 1] },
  { t: "기기 대여 배정 · 반납 처리", p: [0, 1, 1, 1] },
  { t: "본인 프로필 · 측정 결과 보기", p: [1, 1, 1, 1] },
  { t: "본인 안압계에서 결과 업로드", p: [1, 1, 1, 1] },
];
const CAN = {
  admin: { users: 1, org: 1, devices: 1, patients: 1, addPatient: 1, editTarget: 1, rx: 1, exclude: 1, download: 1, notifySend: 1, notifyEdit: 1, runBatch: 1 },
  physician: { users: 0, org: 0, devices: 1, patients: 1, addPatient: 1, editTarget: 1, rx: 1, exclude: 1, download: 0, notifySend: 1, notifyEdit: 0, runBatch: 1 },
  trainer: { users: 0, org: 0, devices: 1, patients: 1, addPatient: 1, editTarget: 0, rx: 0, exclude: 0, download: 0, notifySend: 1, notifyEdit: 0, runBatch: 0 },
};

/* ---------- SNS 로그인 (국가별) ---------- */
const SNS = [
  { region: "한국", items: [
    { id: "kakao", label: "카카오", c: "#FEE500", fg: "#191600", mark: "K" },
    { id: "naver", label: "네이버", c: "#03C75A", fg: "#fff", mark: "N" },
  ]},
  { region: "미국 · 글로벌", items: [
    { id: "google", label: "Google", c: "#fff", fg: "#3C4043", mark: "G", border: true },
    { id: "apple", label: "Apple", c: "#000", fg: "#fff", mark: "A" },
    { id: "facebook", label: "Facebook", c: "#1877F2", fg: "#fff", mark: "f" },
  ]},
  { region: "중국", items: [
    { id: "wechat", label: "WeChat 위챗", c: "#07C160", fg: "#fff", mark: "W" },
    { id: "weibo", label: "Weibo 웨이보", c: "#E6162D", fg: "#fff", mark: "微" },
    { id: "qq", label: "QQ", c: "#12B7F5", fg: "#fff", mark: "Q" },
  ]},
];
const SNS_MAP = SNS.reduce((a, g) => { g.items.forEach((i) => (a[i.id] = i)); return a; }, {});

/* ---------- 공통 날짜 유틸 ---------- */
const _pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`;
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const TODAY_REF = new Date(2026, 6, 3);
const TODAY_STR = "2026-07-03";
const RANGE_FROM_DEFAULT = isoDate(new Date(2026, 5, 3));
const RANGE_TO_DEFAULT = TODAY_STR;
const hmToMin = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const minToHM = (min) => `${_pad(Math.floor((((min % 1440) + 1440) % 1440) / 60))}:${_pad((((min % 1440) + 1440) % 1440) % 60)}`;
function nowHM() { const d = new Date(); return `${_pad(d.getHours())}:${_pad(d.getMinutes())}`; }

/* ============================================================
   장치 · 반납 알림 엔진
   ============================================================ */
const DEVICES_INIT = [
  { serial: "CVT2-1719BD007", name: "1진료실 CVT200", type: "CVT200", owner: "기관", use: "clinic", org: "씨엔브이 안과", assignedTo: null, rentFrom: null, rentTo: null, linkedAt: null, battery: 82, fw: "1.4.2", active: true },
  { serial: "CVT2-1717BD095", name: "2진료실 CVT200", type: "CVT200", owner: "기관", use: "clinic", org: "씨엔브이 안과", assignedTo: null, rentFrom: null, rentTo: null, linkedAt: null, battery: 64, fw: "1.4.2", active: true },
  { serial: "CVT2H-2033AA11", name: "홈 대여기 #1", type: "CVT200 HOME", owner: "기관", use: "home", org: "씨엔브이 안과", assignedTo: "P-1042", rentFrom: "2026-06-03", rentTo: "2026-07-03", linkedAt: null, battery: 47, fw: "1.4.0", active: true },
  { serial: "CVT2H-2041CC03", name: "홈 대여기 #2", type: "CVT200 HOME", owner: "기관", use: "home", org: "씨엔브이 안과", assignedTo: "P-1044", rentFrom: "2026-06-15", rentTo: "2026-06-30", linkedAt: null, battery: 12, fw: "1.4.0", active: true },
  { serial: "CVT2H-2049FF62", name: "홈 대여기 #3", type: "CVT200 HOME", owner: "기관", use: "home", org: "씨엔브이 안과", assignedTo: null, rentFrom: null, rentTo: null, linkedAt: null, battery: 100, fw: "1.4.2", active: true },
  { serial: "CVT2H-2062GG40", name: "홈 대여기 #4", type: "CVT200 HOME", owner: "기관", use: "home", org: "씨엔브이 안과", assignedTo: "P-1047", rentFrom: "2026-06-20", rentTo: "2026-07-20", linkedAt: null, battery: 71, fw: "1.4.2", active: true },
  { serial: "CVT2H-2033AB27", name: "김도현 개인 기기", type: "CVT200 HOME", owner: "개인", use: "home", org: "씨엔브이 안과", assignedTo: "P-1043", rentFrom: null, rentTo: null, linkedAt: "2026-05-20", battery: 88, fw: "1.4.2", active: true },
  { serial: "CVT2H-2050DD88", name: "Wang Lei 개인 기기", type: "CVT200 HOME", owner: "개인", use: "home", org: "씨엔브이 안과", assignedTo: "P-1045", rentFrom: null, rentTo: null, linkedAt: "2026-06-01", battery: 55, fw: "1.4.1", active: true },
  { serial: "CVT2H-2051EE14", name: "정해린 개인 기기", type: "CVT200 HOME", owner: "개인", use: "home", org: "씨엔브이 안과", assignedTo: "P-1046", rentFrom: null, rentTo: null, linkedAt: "2026-06-10", battery: 93, fw: "1.4.2", active: true },
  { serial: "CVT2-9001XX02", name: "Topeye 데모기", type: "CVT200", owner: "기관", use: "clinic", org: "Topeye Clinic", assignedTo: null, rentFrom: null, rentTo: null, linkedAt: null, battery: 0, fw: "1.3.8", active: false },
];
function deviceState(d) {
  if (!d) return { k: "none", label: "기기 미배정", c: C.sub, bg: "#EEF2F1" };
  if (!d.active) return { k: "inactive", label: "비활성", c: C.sub, bg: "#EEF2F1" };
  if (d.owner === "개인") return { k: "owned", label: "개인 소유 · 연동됨", c: C.aqua, bg: "#E2F1F0" };
  if (d.use === "clinic") return { k: "clinic", label: "원내 사용", c: C.primary, bg: C.mint };
  if (!d.assignedTo) return { k: "free", label: "대여 가능", c: C.low, bg: C.lowSoft };
  const dd = dayDiff(TODAY_STR, d.rentTo);
  if (dd < 0) return { k: "overdue", label: `반납 연체 ${-dd}일`, c: C.high, bg: C.highSoft, dd };
  if (dd === 0) return { k: "due", label: "오늘 반납 예정", c: C.mid, bg: C.midSoft, dd };
  if (dd <= 3) return { k: "due", label: `반납 D-${dd}`, c: C.mid, bg: C.midSoft, dd };
  return { k: "rent", label: `대여 중 D-${dd}`, c: C.primary, bg: C.mint, dd };
}
const SYNC_GRACE = 3;
const RENT_LEVEL = {
  d3: { key: "d3", icon: CalendarDays, c: C.primary, bg: C.mint, title: "반납 3일 전 안내", ch: "앱 푸시" },
  d1: { key: "d1", icon: BellRing, c: C.mid, bg: C.midSoft, title: "반납 1일 전 알림", ch: "앱 푸시 + SMS" },
  d0: { key: "d0", icon: BellRing, c: C.mid, bg: C.midSoft, title: "오늘 반납 예정", ch: "앱 푸시 + SMS" },
  overdue: { key: "overdue", icon: AlertTriangle, c: C.high, bg: C.highSoft, title: "반납 연체", ch: "앱 푸시 + SMS + 유선" },
  blocked: { key: "blocked", icon: WifiOff, c: C.high, bg: C.highSoft, title: "측정 데이터 수신 중단", ch: "앱 푸시 + SMS + 유선" },
};
function rentAlert(rentTo, today) {
  if (!rentTo) return null;
  const dd = dayDiff(today, rentTo);
  if (dd > 3) return null;
  let key;
  if (dd >= 2) key = "d3"; else if (dd === 1) key = "d1"; else if (dd === 0) key = "d0";
  else if (dd > -SYNC_GRACE) key = "overdue"; else key = "blocked";
  const L = RENT_LEVEL[key];
  const msg = dd > 0 ? `반납 예정일까지 ${dd}일 남았습니다.`
    : dd === 0 ? "오늘이 반납 예정일입니다."
    : key === "overdue" ? `반납 예정일이 ${-dd}일 지났습니다. ${SYNC_GRACE + dd}일 후 측정 데이터 수신이 중단됩니다.`
    : `반납 연체 ${-dd}일 · 측정 데이터가 의료진에게 전송되지 않습니다.`;
  return { ...L, dd, msg, blocked: key === "blocked" };
}
function rentAlertList(devices, patients, today = TODAY_STR) {
  return devices
    .filter((d) => d.owner === "기관" && d.use === "home" && d.active && d.assignedTo)
    .map((d) => ({ dev: d, a: rentAlert(d.rentTo, today), pt: patients.find((x) => x.id === d.assignedTo) }))
    .filter((x) => x.a).sort((x, y) => x.a.dd - y.a.dd);
}
const CHANNELS = [
  { id: "push", label: "앱 푸시", icon: Smartphone, gw: "FCM / APNs", c: C.primary },
  { id: "sms", label: "SMS", icon: MessageSquare, gw: "문자 발송사 API", c: C.gold },
  { id: "call", label: "유선 안내", icon: PhoneCall, gw: "콜 리스트 생성", c: C.high },
];
const NOTIFY_CFG_INIT = {
  enabled: true, runAt: "09:00", grace: SYNC_GRACE, resendDaily: true, quiet: true, retry: 2,
  ch: {
    d3: { push: true, sms: false, call: false },
    d1: { push: true, sms: true, call: false },
    d0: { push: true, sms: true, call: false },
    overdue: { push: true, sms: true, call: true },
    blocked: { push: true, sms: true, call: true },
  },
};
const chLabel = (cfg, key) => CHANNELS.filter((c) => cfg.ch[key] && cfg.ch[key][c.id]).map((c) => c.label).join(" + ") || "발송 없음";
const AUDIT_INIT = [
  { id: "L-018", at: "2026-07-03 09:00", pid: "P-1042", name: "이순영", serial: "CVT2H-2033AA11", level: "d0", chs: ["push", "sms"], mode: "자동", result: "성공", actor: "스케줄러", detail: "당일 반납 안내 발송" },
  { id: "L-017", at: "2026-07-03 09:00", pid: "P-1044", name: "박미정", serial: "CVT2H-2041CC03", level: "blocked", chs: ["push", "sms", "call"], mode: "자동", result: "부분 실패", actor: "스케줄러", detail: "SMS 수신 거부 번호 · 푸시 성공" },
  { id: "L-016", at: "2026-07-02 09:00", pid: "P-1044", name: "박미정", serial: "CVT2H-2041CC03", level: "overdue", chs: ["push", "sms", "call"], mode: "자동", result: "성공", actor: "스케줄러", detail: "연체 2일 재발송" },
  { id: "L-015", at: "2026-07-02 14:22", pid: "P-1044", name: "박미정", serial: "CVT2H-2041CC03", level: "overdue", chs: ["sms"], mode: "수동", result: "성공", actor: "박정민", detail: "담당자 수동 재발송" },
  { id: "L-014", at: "2026-07-02 09:00", pid: "P-1042", name: "이순영", serial: "CVT2H-2033AA11", level: "d1", chs: ["push", "sms"], mode: "자동", result: "성공", actor: "스케줄러", detail: "반납 1일 전 알림" },
  { id: "L-013", at: "2026-07-01 09:00", pid: "P-1044", name: "박미정", serial: "CVT2H-2041CC03", level: "overdue", chs: ["push", "sms"], mode: "자동", result: "실패", actor: "스케줄러", detail: "푸시 토큰 만료 · 재시도 2회 초과" },
  { id: "L-012", at: "2026-06-30 09:00", pid: "P-1042", name: "이순영", serial: "CVT2H-2033AA11", level: "d3", chs: ["push"], mode: "자동", result: "성공", actor: "스케줄러", detail: "반납 3일 전 안내" },
];
const RESULT_C = { "성공": C.low, "부분 실패": C.mid, "실패": C.high };

/* ============================================================
   고객 DB · 직원 계정
   ============================================================ */
const PATIENTS_DB = [
  { id: "P-1042", name: "이순영", gender: "남", birth: "1962-01-02", phone: "010-3355-7712", email: "sylee@naver.com", loginId: "sylee62", join: "kakao", dx: "정상안압녹내장 (NTG)", targetOD: 15, targetOS: 16, lastAt: "2026-07-03 18:30", lastOD: 17.2, cnt: 128, adh: 88, notify: "고", active: true, period: "2026-06-03 ~ 2026-07-03", serial: "CVT2H-2033AA11", certified: true },
  { id: "P-1043", name: "김도현", gender: "남", birth: "1958-11-20", phone: "010-2211-9080", email: "dhkim@gmail.com", loginId: "dhkim58", join: "google", dx: "원발개방각녹내장", targetOD: 16, targetOS: 16, lastAt: "2026-07-03 09:12", lastOD: 15.4, cnt: 96, adh: 96, notify: "-", active: true, period: "2026-05-20 ~ 2026-07-20", serial: "CVT2H-2033AB27", certified: true },
  { id: "P-1044", name: "박미정", gender: "여", birth: "1971-04-08", phone: "010-7788-1122", email: "mjpark@kakao.com", loginId: "mjpark71", join: "개별", dx: "고안압증", targetOD: 18, targetOS: 18, lastAt: "2026-07-02 21:40", lastOD: 19.6, cnt: 54, adh: 61, notify: "고", active: true, period: "2026-06-15 ~ 2026-07-15", serial: "CVT2H-2041CC03", certified: false },
  { id: "P-1045", name: "Wang Lei", gender: "남", birth: "1965-09-30", phone: "+86 138-0011-2233", email: "wanglei@wechat.cn", loginId: "wanglei65", join: "wechat", dx: "폐쇄각녹내장 의증", targetOD: 15, targetOS: 15, lastAt: "2026-07-01 07:35", lastOD: 18.3, cnt: 41, adh: 74, notify: "중", active: true, period: "2026-06-01 ~ 2026-08-01", serial: "CVT2H-2050DD88", certified: true },
  { id: "P-1046", name: "정해린", gender: "여", birth: "1980-02-14", phone: "010-9090-3344", email: "hrjung@apple.com", loginId: "hrjung80", join: "apple", dx: "녹내장 의증", targetOD: 17, targetOS: 17, lastAt: "2026-06-28 13:05", lastOD: 14.8, cnt: 22, adh: 92, notify: "-", active: true, period: "2026-06-10 ~ 2026-07-10", serial: "CVT2H-2051EE14", certified: true },
  { id: "P-1047", name: "Sarah Miller", gender: "여", birth: "1954-07-19", phone: "+1 415-220-8891", email: "smiller@topeye.com", loginId: "smiller54", join: "facebook", dx: "정상안압녹내장 (NTG)", targetOD: 14, targetOS: 15, lastAt: "2026-06-25 07:20", lastOD: 16.9, cnt: 77, adh: 83, notify: "중", active: true, period: "2026-05-01 ~ 2026-07-01", serial: "CVT2H-2062GG40", certified: true },
  { id: "P-1048", name: "최우석", gender: "남", birth: "1949-12-03", phone: "010-4455-6677", email: "-", loginId: "guest-8842", join: "비회원", dx: "미지정", targetOD: 16, targetOS: 16, lastAt: "2026-06-20 10:40", lastOD: 15.1, cnt: 8, adh: null, notify: "-", active: false, period: "-", serial: "—", certified: false },
];
const USERS_DB = [
  { id: "U-01", name: "김선우", email: "swkim@cnvtech.co.kr", org: "씨엔브이 안과", role: "admin", phone: "010-1111-2222", last: "2026-07-03", active: true },
  { id: "U-02", name: "이재훈", email: "jhlee@cnvtech.co.kr", org: "씨엔브이 안과", role: "physician", phone: "010-3333-4444", last: "2026-07-03", active: true },
  { id: "U-03", name: "한소진", email: "sjhan@cnvtech.co.kr", org: "씨엔브이 안과", role: "physician", phone: "010-5555-6666", last: "2026-07-02", active: true },
  { id: "U-04", name: "박정민", email: "jmpark@cnvtech.co.kr", org: "씨엔브이 안과", role: "trainer", phone: "010-7777-8888", last: "2026-07-01", active: true },
  { id: "U-05", name: "Ann Lewinsky", email: "ann@topeye.com", org: "Topeye Clinic", role: "trainer", phone: "+1 415-220-1010", last: "2026-06-28", active: false },
];

/* ---------- 오늘 안압 측정 세션 (좌/우안 개별 기록) ---------- */
const SESSIONS_INIT = [
  { id: "s1", t: "07:40", tv: 7.67, od: 16.4, os: 15.2, ctx: "기상 직후", src: "auto", eye: "both" },
  { id: "s2", t: "12:10", tv: 12.17, od: 17.2, os: null, ctx: "", src: "auto", eye: "od" },
  { id: "s3", t: "18:30", tv: 18.5, od: 16.1, os: 15.0, ctx: "저녁 점안 전", src: "manual", eye: "both" },
];

/* ============================================================
   안압 추세 데이터 생성
   ============================================================ */
const PERIODS = ["2주", "1개월", "3개월", "6개월", "1년", "누적"];
function _rnd(seed) { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }
function _hash(s) { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 100000; return x; }
function _fmt(date, kind) {
  const m = date.getMonth() + 1, d = date.getDate(), yy = String(date.getFullYear()).slice(2);
  if (kind === "mon") return `${m}월`;
  if (kind === "ym") return `${yy}.${m}`;
  return `${m}/${d}`;
}
const _CFG = {
  "2주": { n: 14, step: 1, kind: "md", spread: 1.6 },
  "1개월": { n: 15, step: 2, kind: "md", spread: 1.9 },
  "3개월": { n: 13, step: 7, kind: "md", spread: 2.4 },
  "6개월": { n: 12, step: 15, kind: "md", spread: 2.8 },
  "1년": { n: 12, step: 30, kind: "mon", spread: 3.3 },
  "누적": { n: 16, step: 40, kind: "ym", spread: 3.6 },
};
function _point(date, kind, base, i, spread) {
  const wave = Math.sin(i * 0.5 + (base % 6)) * 0.9;
  /* 점안 순응도는 실제 점안 기록(DOSE_LOG)에서 계산한 일별 값을 사용한다.
     기록이 없는 날짜만 의사난수로 대체한다. */
  const rec = typeof ADH_BY_DAY !== "undefined" ? ADH_BY_DAY[isoDate(date)] : null;
  const adh = rec ? rec.pct : (_rnd(base + 300 + i) < 0.22 ? Math.round(40 + _rnd(base + 40 + i) * 30) : Math.round(94 + _rnd(base + 60 + i) * 6));
  const miss = adh < ADH_TARGET;
  const bump = miss ? +(2.2 * ((ADH_TARGET - adh) / ADH_TARGET) * 2).toFixed(2) : 0;
  const odAvg = +(16.3 + wave + bump + (_rnd(base + i) - 0.5) * 0.7).toFixed(1);
  const osAvg = +(15.2 + wave * 0.8 + bump * 0.8 + (_rnd(base + 500 + i) - 0.5) * 0.6).toFixed(1);
  const dOD = spread * (0.6 + _rnd(base + 90 + i) * 0.5);
  const dOS = spread * (0.55 + _rnd(base + 130 + i) * 0.5);
  const odMin = +(odAvg - dOD * 0.55).toFixed(1), odMax = +(odAvg + dOD * 0.6).toFixed(1);
  const osMin = +(osAvg - dOS * 0.5).toFixed(1), osMax = +(osAvg + dOS * 0.55).toFixed(1);
  return {
    d: _fmt(date, kind), i, odAvg, odMin, odMax, osAvg, osMin, osMax, adh, missed: miss,
    cnt: 2 + Math.round(_rnd(base + 700 + i) * 2),
    odRange: [odMin, odMax], osRange: [osMin, osMax], fluc: +(odMax - odMin).toFixed(1),
  };
}
function trendData(period) {
  const c = _CFG[period] || _CFG["1개월"]; const base = _hash(period);
  const out = [];
  for (let i = 0; i < c.n; i++) {
    const date = new Date(TODAY_REF); date.setDate(date.getDate() - (c.n - 1 - i) * c.step);
    out.push(_point(date, c.kind, base, i, c.spread));
  }
  return out;
}
function _spanCfg(days) {
  if (days <= 30) return { step: Math.max(1, Math.round(days / 13)), kind: "md", spread: 1.9 };
  if (days <= 120) return { step: 7, kind: "md", spread: 2.4 };
  if (days <= 210) return { step: 15, kind: "md", spread: 2.8 };
  if (days <= 400) return { step: 30, kind: "mon", spread: 3.3 };
  return { step: Math.round(days / 15), kind: "ym", spread: 3.6 };
}
function trendDataRange(fromStr, toStr) {
  const from = new Date(fromStr), to = new Date(toStr);
  if (isNaN(from) || isNaN(to) || to <= from) return trendData("1개월");
  const days = Math.round((to - from) / 86400000);
  const c = _spanCfg(days);
  const n = Math.max(2, Math.min(24, Math.floor(days / c.step) + 1));
  const base = _hash(fromStr + toStr);
  const out = [];
  for (let i = 0; i < n; i++) {
    const date = new Date(from); date.setDate(date.getDate() + Math.round((i * days) / (n - 1)));
    out.push(_point(date, c.kind, base, i, c.spread));
  }
  return out;
}
function rawPoints(pts) {
  const out = [];
  pts.forEach((p, i) => {
    const n = p.cnt;
    for (let k = 0; k < n; k++) {
      const r = _rnd(p.i * 31 + k * 7 + 11);
      const hr = +(6.5 + (k / Math.max(1, n - 1)) * 15 + (r - 0.5) * 1.6).toFixed(2);
      const w = (n === 1 ? 0.5 : k / (n - 1));
      out.push({
        x: i, d: p.d, hr,
        od: +(p.odMax - (p.odMax - p.odMin) * w + (r - 0.5) * 0.5).toFixed(1),
        os: +(p.osMax - (p.osMax - p.osMin) * w + (r - 0.5) * 0.45).toFixed(1),
      });
    }
  });
  return out;
}
function diurnalCurve(raw) {
  const b = {};
  raw.forEach((p) => { const h = Math.round(p.hr); if (!b[h]) b[h] = { h, od: [], os: [] }; b[h].od.push(p.od); b[h].os.push(p.os); });
  const mean = (a) => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  return Object.values(b).sort((a, z) => a.h - z.h).map((x) => ({
    h: x.h, odAvg: mean(x.od), osAvg: mean(x.os), n: x.od.length,
    odBand: [+Math.min(...x.od).toFixed(1), +Math.max(...x.od).toFixed(1)],
  }));
}
const TOD_PROFILE = [
  { k: "기상 직후", range: "05–08시", icon: Sunrise, od: 17.3, os: 15.9, n: 26 },
  { k: "오전", range: "08–12시", icon: Sun, od: 16.5, os: 15.3, n: 22 },
  { k: "오후", range: "12–17시", icon: Sun, od: 16.9, os: 15.5, n: 24 },
  { k: "저녁", range: "17–21시", icon: Sunset, od: 16.0, os: 15.0, n: 19 },
  { k: "취침 전", range: "21–24시", icon: Moon, od: 15.6, os: 14.7, n: 17 },
];

/* ============================================================
   ★ 점안 관리 — 개선된 데이터 모델
   좌/우안 구분 · 약병 수명(개봉일·폐기일) · 잔량 · 부작용 기록
   ============================================================ */
const DRUG_LIB = [
  { cat: "라타노프로스트", items: [
    { name: "잘타라노 점안액", ingr: "라타노프로스트", maker: "대우제약", dose: "일회용", def: "1일 1회 · 취침 전", own: true },
  ]},
  { cat: "도르졸라미드 + 티몰롤 (복합)", items: [
    { name: "제티솝 점안액", ingr: "도르졸라미드+티몰롤", maker: "대우제약", dose: "다회용", def: "1일 2회", own: true },
    { name: "코솝-에스 점안액", ingr: "도르졸라미드+티몰롤", maker: "한국엠에스디", dose: "일회용", def: "1일 2회" },
  ]},
  { cat: "트라보프로스트", items: [
    { name: "트라바탄 점안액", ingr: "트라보프로스트", maker: "한국알콘", dose: "다회용", def: "1일 1회 · 취침 전" },
  ]},
  { cat: "비마토프로스트", items: [
    { name: "루미간 점안액", ingr: "비마토프로스트", maker: "한국애브비", dose: "다회용", def: "1일 1회 · 취침 전" },
  ]},
  { cat: "티몰롤", items: [
    { name: "티모프틱 점안액", ingr: "티몰롤", maker: "한국엠에스디", dose: "다회용", def: "1일 2회" },
  ]},
  { cat: "브리모니딘", items: [
    { name: "알파간 점안액", ingr: "브리모니딘", maker: "한국애브비", dose: "다회용", def: "1일 2~3회" },
  ]},
  { cat: "도르졸라미드", items: [
    { name: "트루솝 점안액", ingr: "도르졸라미드", maker: "한국엠에스디", dose: "다회용", def: "1일 3회" },
  ]},
  { cat: "브린졸라미드", items: [
    { name: "아좁트 점안액", ingr: "브린졸라미드", maker: "한국알콘", dose: "다회용", def: "1일 2회" },
  ]},
  { cat: "브리모니딘 + 티몰롤 (복합)", items: [
    { name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용", def: "1일 2회" },
  ]},
  { cat: "히알루론산 (인공눈물)", items: [
    { name: "히알산 점안액", ingr: "히알루론산", maker: "대우제약", dose: "다회용", def: "필요 시", own: true },
    { name: "리안점안액 (일회용)", ingr: "히알루론산 0.15%", maker: "삼일제약", dose: "일회용", def: "필요 시" },
    { name: "히아박점안액 (다회용)", ingr: "히알루론산 0.1%", maker: "태준제약", dose: "다회용", def: "필요 시" },
  ]},
];
const MEDS_SAMPLE = [
  { id: "m1", name: "잘타라노 점안액", ingr: "라타노프로스트", maker: "대우제약", dose: "일회용", time: "21:00", freq: "1일 1회 · 취침 전", eye: "양안", taken: false, src: "manual" },
  { id: "m2", name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용", time: "08:00", freq: "1일 2회", eye: "양안", taken: true, at: "08:05", src: "device" },
  { id: "m3", name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용", time: "20:00", freq: "1일 2회", eye: "양안", taken: false, src: "device" },
  { id: "m4", name: "리안점안액 (일회용)", ingr: "히알루론산 0.15%", maker: "삼일제약", dose: "일회용", time: "필요 시", freq: "건조감 시", eye: "양안", taken: false, src: "manual" },
];

const WATCH = { device: "Galaxy Watch", steps: 6420, stepGoal: 8000, sleepH: 6, sleepM: 40, sleepQuality: "보통", hr: 72, irn: true, irnDate: "6/30" };
const ALL_DRUGS = DRUG_LIB.flatMap((g) => g.items);

/* ============================================================
   ★ 의약품개요정보(e약은요) 연동
   식품의약품안전처 공공데이터 · DrbEasyDrugInfoService
   운영 시 EYAK_API.key 에 서비스키를 넣으면 실 API를 호출하고,
   키가 없거나 호출이 실패하면 내장 데이터로 대체한다.
   ============================================================ */
const EYAK_API = {
  base: "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList",
  key: "",                       // 공공데이터포털 발급 서비스키
  rows: 20,
};
/* e약은요 응답 항목 정의 (실제 필드명과 동일) */
const EYAK_FIELDS = [
  { k: "efcyQesitm", t: "효능", icon: Sparkles },
  { k: "useMethodQesitm", t: "사용법", icon: Droplet },
  { k: "atpnWarnQesitm", t: "사용 전 확인", icon: AlertTriangle },
  { k: "atpnQesitm", t: "사용상 주의사항", icon: Info },
  { k: "intrcQesitm", t: "함께 주의할 약·음식", icon: Pill },
  { k: "seQesitm", t: "이상반응", icon: AlertCircle },
  { k: "depositMethodQesitm", t: "보관법", icon: Package },
];
/* 내장 데이터 (실 API 미연결 시 사용) */
const EYAK_DB = [
  { itemSeq: "200806148", itemName: "잘타라노점안액", entpName: "대우제약", ingr: "라타노프로스트", dose: "일회용", own: true,
    efcyQesitm: "개방각녹내장과 고안압증 환자의 안압을 낮추는 데 사용합니다.",
    useMethodQesitm: "보통 1일 1회, 저녁에 1회 1방울을 결막낭에 점안합니다. 정해진 시각을 지켜 사용하세요.",
    atpnWarnQesitm: "이 약에 과민반응이 있는 환자, 콘택트렌즈 착용자는 사용 전 의사와 상의하세요.",
    atpnQesitm: "홍채·눈꺼풀·속눈썹의 색이 진해지거나 속눈썹이 길어질 수 있으며, 일부는 되돌아오지 않을 수 있습니다.",
    intrcQesitm: "다른 프로스타글란딘 계열 점안제와 병용 시 안압이 오히려 오를 수 있습니다.",
    seQesitm: "결막 충혈, 눈 자극감, 시야 흐림, 눈꺼풀 색소침착이 나타날 수 있습니다.",
    depositMethodQesitm: "개봉 전에는 2~8℃ 냉장 보관하고, 개봉 후에는 실온에서 4주 이내 사용하세요." },
  { itemSeq: "199700481", itemName: "잘라탄점안액", entpName: "한국화이자제약", ingr: "라타노프로스트", dose: "다회용",
    efcyQesitm: "개방각녹내장, 고안압증 환자의 상승된 안압을 낮춥니다.",
    useMethodQesitm: "1일 1회 저녁에 1방울씩 점안합니다.",
    atpnWarnQesitm: "임부·수유부, 무수정체안 환자는 사용 전 의사와 상의하세요.",
    atpnQesitm: "황반부종이 보고된 바 있어 무수정체안·인공수정체안 환자는 주의가 필요합니다.",
    intrcQesitm: "티몰롤 등 다른 안압하강제와 병용 시 5분 이상 간격을 두세요.",
    seQesitm: "결막 충혈, 눈 통증, 홍채 색소침착이 나타날 수 있습니다.",
    depositMethodQesitm: "개봉 전 냉장(2~8℃), 개봉 후 실온에서 4주 이내." },
  { itemSeq: "201304563", itemName: "콤비간점안액", entpName: "한국애브비", ingr: "브리모니딘+티몰롤", dose: "다회용",
    efcyQesitm: "베타차단제 단독요법으로 조절되지 않는 개방각녹내장·고안압증의 안압을 낮춥니다.",
    useMethodQesitm: "1일 2회, 약 12시간 간격으로 1방울씩 점안합니다.",
    atpnWarnQesitm: "천식·만성폐쇄성폐질환, 서맥·심부전 환자는 사용해서는 안 됩니다.",
    atpnQesitm: "점안 후 눈 안쪽을 1~2분 눌러 전신 흡수를 줄이면 부작용을 낮출 수 있습니다.",
    intrcQesitm: "혈압약·부정맥약과 함께 쓰면 서맥·저혈압이 심해질 수 있어 반드시 알리세요.",
    seQesitm: "결막 충혈, 작열감, 입 마름, 졸음, 피로감이 나타날 수 있습니다.",
    depositMethodQesitm: "실온(1~30℃)에서 보관하고 개봉 후 4주 이내 사용하세요." },
  { itemSeq: "199602313", itemName: "티모프틱점안액", entpName: "한국엠에스디", ingr: "티몰롤", dose: "다회용",
    efcyQesitm: "고안압증 및 개방각녹내장 환자의 안압을 낮춥니다.",
    useMethodQesitm: "1일 2회 1방울씩 점안하며, 조절되면 1일 1회로 줄일 수 있습니다.",
    atpnWarnQesitm: "기관지 천식, 서맥, 심부전 환자에게는 금기입니다.",
    atpnQesitm: "당뇨 환자는 저혈당 증상이 가려질 수 있으므로 주의하세요.",
    intrcQesitm: "칼슘길항제·베타차단제 경구제와 병용 시 심혈관 억제가 커질 수 있습니다.",
    seQesitm: "눈 자극감, 서맥, 호흡곤란, 피로감이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 직사광선을 피하세요." },
  { itemSeq: "200502547", itemName: "트루솝점안액", entpName: "한국엠에스디", ingr: "도르졸라미드", dose: "다회용",
    efcyQesitm: "방수 생성을 줄여 개방각녹내장·고안압증의 안압을 낮춥니다.",
    useMethodQesitm: "1일 3회 1방울씩 점안합니다. 다른 점안제와 병용 시 1일 2회로 조정할 수 있습니다.",
    atpnWarnQesitm: "설파계 약물에 과민반응이 있었던 환자는 사용 전 알리세요.",
    atpnQesitm: "중증 신장애 환자에게는 권장되지 않습니다.",
    intrcQesitm: "경구 탄산탈수효소억제제와 병용은 권장되지 않습니다.",
    seQesitm: "점안 후 쓴맛, 작열감, 일시적 시야 흐림이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 개봉 후 4주 이내 사용." },
  { itemSeq: "200906723", itemName: "아좁트점안현탁액", entpName: "한국알콘", ingr: "브린졸라미드", dose: "다회용",
    efcyQesitm: "개방각녹내장·고안압증 환자의 안압을 낮춥니다.",
    useMethodQesitm: "사용 전 충분히 흔든 뒤 1일 2회 1방울씩 점안합니다.",
    atpnWarnQesitm: "설파계 과민반응 병력이 있으면 사용 전 상의하세요.",
    atpnQesitm: "현탁액이므로 반드시 흔들어 사용해야 약효가 균일합니다.",
    intrcQesitm: "경구 탄산탈수효소억제제와 병용은 피하세요.",
    seQesitm: "일시적 시야 흐림, 쓴맛, 눈 자극감이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 얼리지 마세요." },
  { itemSeq: "201105512", itemName: "루미간점안액", entpName: "한국애브비", ingr: "비마토프로스트", dose: "다회용",
    efcyQesitm: "개방각녹내장·고안압증 환자의 안압을 낮춥니다.",
    useMethodQesitm: "1일 1회 저녁에 1방울씩 점안합니다. 1일 2회 이상 사용하면 효과가 떨어질 수 있습니다.",
    atpnWarnQesitm: "포도막염·황반부종 병력이 있는 환자는 주의가 필요합니다.",
    atpnQesitm: "속눈썹이 길어지고 짙어지며 눈 주위 피부색이 진해질 수 있습니다.",
    intrcQesitm: "다른 프로스타글란딘 제제와 병용하지 마세요.",
    seQesitm: "결막 충혈, 속눈썹 성장, 안구 건조감이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 개봉 후 4주 이내 사용." },
  { itemSeq: "200712233", itemName: "알파간피점안액", entpName: "한국애브비", ingr: "브리모니딘", dose: "다회용",
    efcyQesitm: "개방각녹내장·고안압증 환자의 안압을 낮춥니다.",
    useMethodQesitm: "1일 3회 약 8시간 간격으로 1방울씩 점안합니다.",
    atpnWarnQesitm: "영유아에게는 사용하지 않으며, MAO 억제제 복용자는 금기입니다.",
    atpnQesitm: "졸음이나 어지러움이 있을 수 있어 운전 시 주의하세요.",
    intrcQesitm: "진정제·알코올과 함께 쓰면 졸음이 심해질 수 있습니다.",
    seQesitm: "알레르기성 결막염, 입 마름, 졸음이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관." },
  { itemSeq: "201105230", itemName: "제티솝점안액", entpName: "대우제약", ingr: "도르졸라미드+티몰롤", dose: "다회용", own: true,
    efcyQesitm: "단독요법으로 조절되지 않는 개방각녹내장·고안압증 환자의 안압을 낮춥니다.",
    useMethodQesitm: "1일 2회, 1회 1방울씩 양쪽 눈에 점안합니다.",
    atpnWarnQesitm: "기관지 천식, 서맥, 심부전 환자에게는 사용할 수 없습니다.",
    atpnQesitm: "설파계 과민반응 병력이 있으면 사용 전 알리세요. 점안 후 눈 안쪽을 1~2분 눌러 주세요.",
    intrcQesitm: "경구 베타차단제·칼슘길항제와 병용 시 서맥·저혈압이 심해질 수 있습니다.",
    seQesitm: "쓴맛, 작열감, 결막 충혈, 일시적 시야 흐림이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 개봉 후 4주 이내 사용하세요." },
  { itemSeq: "201703344", itemName: "히알산점안액", entpName: "대우제약", ingr: "히알루론산 0.1%", dose: "다회용", own: true,
    efcyQesitm: "안구건조증 등으로 인한 각결막상피장애를 개선합니다.",
    useMethodQesitm: "1회 1방울씩 1일 5~6회 점안하며 증상에 따라 조절합니다.",
    atpnWarnQesitm: "점안 시 용기 끝이 눈에 닿지 않도록 하세요.",
    atpnQesitm: "안압하강제와 함께 쓸 때는 5분 이상 간격을 두고 인공눈물을 나중에 넣으세요.",
    intrcQesitm: "다른 점안제와 병용 시 간격을 두면 약효 손실을 줄일 수 있습니다.",
    seQesitm: "드물게 가려움, 충혈, 이물감이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 개봉 후 4주 이내 사용하세요." },
  { itemSeq: "200401182", itemName: "트라바탄점안액", entpName: "한국알콘", ingr: "트라보프로스트", dose: "다회용",
    efcyQesitm: "개방각녹내장·고안압증 환자의 안압을 낮춥니다.",
    useMethodQesitm: "1일 1회 저녁에 1방울씩 점안합니다.",
    atpnWarnQesitm: "임부는 사용하지 않으며, 콘택트렌즈는 빼고 점안 후 15분 뒤 착용하세요.",
    atpnQesitm: "홍채 색소침착과 속눈썹 변화가 나타날 수 있습니다.",
    intrcQesitm: "다른 프로스타글란딘 제제와 병용하지 마세요.",
    seQesitm: "결막 충혈, 눈 자극감, 시야 흐림이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 개봉 후 4주 이내 사용." },
  { itemSeq: "201408811", itemName: "리안점안액", entpName: "삼일제약", ingr: "히알루론산 0.15%", dose: "일회용",
    efcyQesitm: "쇼그렌증후군, 스티븐스존슨증후군, 안구건조증 등에서 각결막상피장애를 개선합니다.",
    useMethodQesitm: "1회 1방울씩 1일 5~6회 점안하며 증상에 따라 조절합니다.",
    atpnWarnQesitm: "일회용 제품은 개봉 후 즉시 사용하고 남은 약은 버리세요.",
    atpnQesitm: "점안 후 시야가 흐려질 수 있으니 회복될 때까지 기다리세요.",
    intrcQesitm: "다른 점안제와 병용 시 5분 이상 간격을 두세요.",
    seQesitm: "드물게 눈꺼풀 염증, 가려움, 충혈이 나타날 수 있습니다.",
    depositMethodQesitm: "실온 보관, 직사광선을 피하세요." },
];
/* 검색 없이 바로 고르는 대표 녹내장 안압약 */
const QUICK_GROUPS = [
  { label: "대우제약 제품", accent: true, seqs: ["200806148", "201105230", "201703344"] },
  { label: "프로스타글란딘 계열", seqs: ["199700481", "201105512", "200401182"] },
  { label: "베타차단제 · 복합제", seqs: ["201304563", "199602313"] },
  { label: "탄산탈수효소억제제 · 알파작용제", seqs: ["200502547", "200906723", "200712233"] },
  { label: "인공눈물", seqs: ["201408811"] },
];
const eyakBySeq = (seq) => EYAK_DB.find((d) => d.itemSeq === seq);

/* 로컬 검색 — 제품명·성분·업체명 부분 일치 */
function eyakLocalSearch(q) {
  const k = (q || "").trim().toLowerCase();
  if (!k) return [];
  return EYAK_DB.filter((d) => [d.itemName, d.ingr, d.entpName].join(" ").toLowerCase().includes(k));
}
/* e약은요 조회 — 실 API 우선, 실패 시 내장 데이터 */
async function searchEyak(q) {
  const query = (q || "").trim();
  if (!query) return { items: [], source: "none" };
  if (!EYAK_API.key) return { items: eyakLocalSearch(query), source: "local" };
  try {
    const url = `${EYAK_API.base}?serviceKey=${EYAK_API.key}&itemName=${encodeURIComponent(query)}`
      + `&pageNo=1&numOfRows=${EYAK_API.rows}&type=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    const raw = ((json.body && json.body.items) || []).map((it) => ({
      itemSeq: it.itemSeq, itemName: it.itemName, entpName: it.entpName,
      ingr: it.itemName, dose: "다회용", itemImage: it.itemImage,
      efcyQesitm: it.efcyQesitm, useMethodQesitm: it.useMethodQesitm,
      atpnWarnQesitm: it.atpnWarnQesitm, atpnQesitm: it.atpnQesitm,
      intrcQesitm: it.intrcQesitm, seQesitm: it.seQesitm,
      depositMethodQesitm: it.depositMethodQesitm,
    }));
    return { items: raw, source: "api" };
  } catch (e) {
    return { items: eyakLocalSearch(query), source: "local", error: true };
  }
}
function drugDesc(ingr) {
  const map = {
    "라타노프로스트": "프로스타글란딘 유사체. 방수 유출을 늘려 안압을 낮춥니다. 보통 1일 1회 취침 전 점안.",
    "비마토프로스트": "프로스타글란딘 유사체. 방수 배출을 촉진해 안압을 낮춥니다. 1일 1회 취침 전.",
    "트라보프로스트": "프로스타글란딘 유사체. 방수 배출 촉진. 1일 1회 취침 전 점안.",
    "티몰롤": "베타 차단제. 방수 생성을 줄여 안압을 낮춥니다. 보통 1일 2회.",
    "브리모니딘": "알파-2 작용제. 방수 생성 감소·배출 증가. 보통 1일 2~3회.",
    "도르졸라미드": "탄산탈수효소 억제제. 방수 생성을 줄입니다. 보통 1일 3회.",
    "브린졸라미드": "탄산탈수효소 억제제. 방수 생성 감소. 보통 1일 2회.",
    "도르졸라미드+티몰롤": "CAI+베타차단제 복합제. 두 기전으로 안압을 낮춥니다. 1일 2회.",
    "브리모니딘+티몰롤": "알파작용제+베타차단제 복합제. 1일 2회.",
    "히알루론산": "인공눈물. 점안 치료로 인한 안구 건조감을 완화합니다. 필요 시 사용.",
  };
  for (const k in map) { if (ingr && ingr.includes(k)) return map[k]; }
  return "안압 조절 또는 안구 표면 보호를 위한 점안제입니다. 처방된 용법에 따라 사용하세요.";
}

/* ---------- 약제 계열 · 부작용 사전 ---------- */
const DRUG_CLASS = [
  { key: "PG", match: ["라타노프로스트", "비마토프로스트", "타플루프로스트", "트라보프로스트"], label: "PG 유사체", c: C.primary, se: ["결막 충혈", "속눈썹 길어짐", "눈 주위 색소침착", "따가움"] },
  { key: "BB", match: ["티몰롤", "베타조롤", "카테올롤"], label: "베타차단제", c: C.aqua, se: ["서맥·저혈압", "호흡 곤란", "피로감", "따가움"] },
  { key: "CAI", match: ["도르졸라미드", "브린졸라미드"], label: "탄산탈수효소억제제", c: C.gold, se: ["쓴맛", "따가움", "일시적 흐림"] },
  { key: "A2", match: ["브리모니딘", "아프라클로니딘"], label: "알파2 작용제", c: "#8A6FBF", se: ["입 마름", "졸음", "알레르기성 결막염"] },
  { key: "AT", match: ["히알루론산", "카르복시메틸", "트레할로스"], label: "인공눈물", c: C.low, se: ["일시적 흐림"] },
];
function drugClass(ingr) {
  for (const g of DRUG_CLASS) if (ingr && g.match.some((m) => ingr.includes(m))) return g;
  return { key: "ETC", label: "기타", c: C.sub, se: ["따가움", "일시적 흐림"] };
}
const SIDE_EFFECTS = ["결막 충혈", "따가움·자극감", "가려움", "눈물 흘림", "일시적 흐림", "이물감", "눈 주위 색소침착", "두통", "입 마름", "가슴 두근거림"];

/* ---------- 약병 수명: 개봉 후 사용기한 ---------- */
const OPEN_LIFE = { "다회용": 28, "일회용": 1 };   // 다회용은 개봉 후 28일 폐기 원칙
function bottleState(m, today = isoDate(new Date())) {
  if (m.dose === "일회용") {
    const left = m.unitsLeft == null ? null : m.unitsLeft;
    if (left == null) return { k: "na", label: "-", c: C.sub, bg: "#EEF2F1" };
    if (left <= 0) return { k: "out", label: "소진", c: C.high, bg: C.highSoft, left };
    if (left <= 5) return { k: "low", label: `${left}개 남음`, c: C.mid, bg: C.midSoft, left };
    return { k: "ok", label: `${left}개 남음`, c: C.low, bg: C.lowSoft, left };
  }
  if (!m.openedAt) return { k: "sealed", label: "미개봉", c: C.sub, bg: "#EEF2F1" };
  const used = dayDiff(m.openedAt, today);
  const left = OPEN_LIFE["다회용"] - used;
  if (left < 0) return { k: "expired", label: `폐기 필요 (${-left}일 초과)`, c: C.high, bg: C.highSoft, left };
  if (left <= 3) return { k: "soon", label: `폐기 D-${left}`, c: C.mid, bg: C.midSoft, left };
  return { k: "ok", label: `사용 가능 D-${left}`, c: C.low, bg: C.lowSoft, left };
}
/* 남은 용량(방울) 추정 — 다회용 5mL ≈ 100방울 기준 */
const dropsLeft = (m) => (m.dose === "다회용" && m.dropsTotal ? Math.max(0, m.dropsTotal - (m.dropsUsed || 0)) : null);

/* ---------- 점안 모니터링 기기 (블루투스) ----------
   점안약 1개와 기기 1대를 1:1로 매칭한다. 매칭 후에는 기기1·기기2… 로 표시. */
const DROP_DEVICES_INIT = [
  { id: "DM-01", label: "기기1", serial: "CVTD-3301AA", model: "DropSense", battery: 78, rssi: -42, fw: "1.2.0", pairedTo: "m1", connected: true },
  { id: "DM-02", label: "기기2", serial: "CVTD-3318BB", model: "DropSense", battery: 64, rssi: -55, fw: "1.2.0", pairedTo: "m2", connected: true },
  { id: "DM-03", label: "기기3", serial: "CVTD-3327CC", model: "DropSense", battery: 91, rssi: -61, fw: "1.1.8", pairedTo: null, connected: false },
  { id: "DM-04", label: "기기4", serial: "CVTD-3340DD", model: "DropSense Mini", battery: 45, rssi: -73, fw: "1.1.8", pairedTo: null, connected: false },
];
const medKey = (m) => m.linkOf || m.id;                       // 같은 약병을 쓰는 스케줄은 하나로 묶음
const monitorOf = (devs, m) => devs.find((d) => d.pairedTo === medKey(m)) || null;
const rssiBars = (r) => (r >= -50 ? 3 : r >= -65 ? 2 : 1);

/* ---------- 오늘 점안 스케줄 (좌/우안 구분) ---------- */
const MEDS_INIT = [
  {
    id: "m1", name: "잘타라노 점안액", ingr: "라타노프로스트", maker: "대우제약", dose: "일회용",
    eye: "both", time: "22:00", times: ["22:00"], freq: "1일 1회 · 취침 전", src: "manual",
    taken: false, at: null, takenEye: {}, openedAt: null, unitsLeft: 4, rxFrom: "2026-06-03", rxBy: "이재훈", dropMode: "auto", itemSeq: "200806148", info: EYAK_DB[0],
  },
  {
    id: "m2", name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용",
    eye: "both", time: "08:00", times: ["08:00", "20:00"], freq: "1일 2회 · 08·20시", src: "device",
    taken: true, at: "08:04", takenEye: { od: "08:04", os: "08:05" }, openedAt: "2026-06-08", dropsTotal: 100, dropsUsed: 78, rxFrom: "2026-06-03", rxBy: "이재훈", dropMode: "auto",
  },
  {
    id: "m3", name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용",
    eye: "both", time: "20:00", times: ["08:00", "20:00"], freq: "1일 2회 · 08·20시", src: "device",
    taken: false, at: null, takenEye: {}, openedAt: "2026-06-08", dropsTotal: 100, dropsUsed: 78, rxFrom: "2026-06-03", rxBy: "이재훈", dropMode: "auto", linkOf: "m2",
  },
  {
    id: "m4", name: "리안점안액", ingr: "히알루론산 0.15%", maker: "삼일제약", dose: "일회용",
    eye: "both", time: "필요 시", times: [], freq: "필요 시", src: "manual",
    taken: false, at: null, takenEye: {}, openedAt: null, unitsLeft: 22, rxFrom: "2026-06-03", rxBy: "이재훈", dropMode: "manual",
  },
];
const SE_LOG_INIT = [
  { id: "e1", at: "2026-07-01 22:20", med: "잘타라노 점안액", eye: "od", items: ["결막 충혈"], severity: "경도", note: "점안 후 20분 정도 붉어짐" },
  { id: "e2", at: "2026-06-05 08:10", med: "콤비간 점안액", eye: "both", items: ["따가움·자극감", "가려움"], severity: "중등도", note: "점안 후 5분 정도 따갑고 가려움" },
];

/* ============================================================
   ★ 점안 기록 로그 · 순응도 계산 엔진
   화면에 표시되는 모든 순응도 수치는 아래 DOSE_LOG(점안 1회 = 1행)에서
   계산된다. 하드코딩된 퍼센트는 사용하지 않는다.
   행 구조: { date, medId, med, ingr, time, eye, taken, at }
   ============================================================ */
const ADH_TARGET = 80;              // 순응도 목표(%)
const LOG_DAYS = 120;               // 보관 기간
/* 약제별 점안 성공 경향(데모용 시드) — 실제 서비스에서는 서버 기록을 그대로 사용 */
const _MED_BIAS = { m1: 0.85, m2: 0.965, m3: 0.895 };
const shiftDate = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return isoDate(d); };
/* 부작용을 보고한 뒤 일정 기간 그 약제의 점안률이 떨어지는 현실을 반영 */
function sePenalty(medName, iso) {
  const ev = SE_LOG_INIT.filter((e) => e.med === medName && e.at.slice(0, 10) <= iso)
    .sort((a, b) => a.at.localeCompare(b.at));
  if (!ev.length) return 0;
  const last = ev[ev.length - 1].at.slice(0, 10);
  const gap = dayDiff(last, iso);
  if (gap < 0 || gap > 28) return 0;
  return +(0.30 * (1 - gap / 56)).toFixed(3);      // 직후 최대 30%p, 4주에 걸쳐 회복
}
function buildDoseLog(meds, days = LOG_DAYS) {
  const rows = [];
  const sched = meds.filter((m) => m.time !== "필요 시");
  for (let k = days; k >= 1; k--) {
    const d = new Date(TODAY_REF); d.setDate(d.getDate() - k);
    const iso = isoDate(d);
    const dow = d.getDay();                                  // 0=일
    const weekendPenalty = dow === 0 || dow === 6 ? 0.06 : 0; // 주말에 조금 더 거름
    sched.forEach((m) => {
      const base = (_MED_BIAS[m.id] != null ? _MED_BIAS[m.id] : 0.9) - weekendPenalty - sePenalty(m.name, iso);
      const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
      /* 하루 단위로 "그날 그 시간대를 통째로 걸렀는지"를 먼저 판정하고,
         걸르지 않은 날은 눈 단위로 한쪽만 빠뜨렸는지 따로 판정한다. */
      const skipSlot = _rnd(_hash(iso + m.id) + 1) > base;
      eyes.forEach((e, ei) => {
        const skipEye = !skipSlot && _rnd(_hash(iso + m.id + e) + 7) > 0.975;
        const taken = !skipSlot && !skipEye;
        const jitter = Math.round((_rnd(_hash(iso + m.id + e) + 3) - 0.5) * 24);
        rows.push({
          date: iso, medId: m.id, med: m.name, ingr: m.ingr, time: m.time, eye: e, taken,
          at: taken ? minToHM(hmToMin(m.time) + jitter + ei) : null,
        });
      });
    });
  }
  return rows;
}
const DOSE_LOG = buildDoseLog(MEDS_INIT);
/* 일별 순응도 — 안압 추세 생성기가 참조 */
const ADH_BY_DAY = DOSE_LOG.reduce((acc, r) => {
  const a = acc[r.date] || (acc[r.date] = { total: 0, taken: 0, pct: 0 });
  a.total += 1; if (r.taken) a.taken += 1;
  a.pct = Math.round((a.taken / a.total) * 100);
  return acc;
}, {});

const inRange = (r, from, to) => r.date >= from && r.date <= to;
/* 오늘 분은 화면 상태(meds)에서 직접 계산해 로그와 합산한다 */
function todayDoses(meds) {
  let total = 0, taken = 0;
  meds.filter((m) => m.time !== "필요 시").forEach((m) => {
    const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
    total += eyes.length;
    taken += eyes.filter((e) => m.takenEye && m.takenEye[e]).length;
  });
  return { total, taken };
}
function overallAdherence(from, to, meds) {
  const rows = DOSE_LOG.filter((r) => inRange(r, from, to));
  let total = rows.length, taken = rows.filter((r) => r.taken).length;
  if (meds && to >= isoDate(new Date())) { const t = todayDoses(meds); total += t.total; taken += t.taken; }
  return { total, taken, missed: total - taken, pct: total ? Math.round((taken / total) * 100) : 0 };
}
function adherenceBy(keyFn, from, to) {
  const map = new Map();
  DOSE_LOG.filter((r) => inRange(r, from, to)).forEach((r) => {
    const k = keyFn(r);
    const v = map.get(k) || { key: k, total: 0, taken: 0, sample: r };
    v.total += 1; if (r.taken) v.taken += 1;
    map.set(k, v);
  });
  return Array.from(map.values()).map((v) => ({ ...v, pct: v.total ? Math.round((v.taken / v.total) * 100) : 0 }));
}
const adherenceByMed = (from, to) => adherenceBy((r) => r.med, from, to).sort((a, b) => a.pct - b.pct);
const adherenceByEye = (from, to) => adherenceBy((r) => r.eye, from, to);
const adherenceBySlot = (from, to) => adherenceBy((r) => r.time, from, to).sort((a, b) => a.key.localeCompare(b.key));
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const adherenceByDow = (from, to) => {
  const out = adherenceBy((r) => new Date(r.date).getDay(), from, to);
  return DOW.map((t, i) => { const f = out.find((x) => x.key === i); return { t, pct: f ? f.pct : null, total: f ? f.total : 0 }; });
};
/* 최근 연속 누락 구간 */
function missStreak(to = TODAY_STR) {
  const days = Object.keys(ADH_BY_DAY).filter((d) => d <= to).sort().reverse();
  let n = 0;
  for (const d of days) { if (ADH_BY_DAY[d].pct < 100) n += 1; else break; }
  return n;
}


/* ============================================================
   ★ 순응도 저하 원인 분석
   부작용 기록 · 투약 시각 · 요일 · 좌우안 · 용법 복잡도 · 약병 상태를
   실제 점안 기록과 대조해 "왜 거르는지"를 순위로 제시한다.
   ============================================================ */
function medWindowAdh(med, from, to) {
  const rows = DOSE_LOG.filter((r) => r.med === med && r.date >= from && r.date <= to);
  const taken = rows.filter((r) => r.taken).length;
  return { total: rows.length, taken, pct: rows.length ? Math.round((taken / rows.length) * 100) : null };
}
/* 부작용 보고 전후 순응도 비교 */
function seImpact(to = TODAY_STR, win = 14) {
  return SE_LOG_INIT.map((e) => {
    const d = e.at.slice(0, 10);
    const before = medWindowAdh(e.med, shiftDate(d, -win), shiftDate(d, -1));
    const after = medWindowAdh(e.med, d, to);
    return { ...e, date: d, before, after, delta: before.pct != null && after.pct != null ? after.pct - before.pct : null };
  }).filter((x) => x.delta != null && x.before.total >= 8 && x.after.total >= 8)
    .sort((a, b) => a.delta - b.delta);
}
/* 원인 후보를 영향도(%p) 순으로 반환 */
function rootCauses(from, to, meds = []) {
  const all = overallAdherence(from, to);
  const out = [];
  if (!all.total) return { all, causes: [] };

  seImpact(to).forEach((e) => {
    if (e.delta > -3) return;
    out.push({
      key: "se-" + e.id, icon: AlertCircle, c: C.high, cat: "부작용",
      title: `${e.med} 부작용 보고 이후 순응도 하락`,
      detail: `${e.date} ${e.items.join(", ")}(${e.severity}) 기록 이후 ${e.before.pct}% → ${e.after.pct}%`,
      impact: Math.abs(e.delta),
      action: "보존제 무함유 제형이나 같은 계열 다른 성분으로 변경을 검토하세요.",
      chart: { before: e.before, after: e.after, at: e.date },
    });
  });

  const slots = adherenceBySlot(from, to);
  if (slots.length > 1) {
    const w = [...slots].sort((a, b) => a.pct - b.pct)[0];
    const gap = all.pct - w.pct;
    if (gap >= 3) out.push({
      key: "slot", icon: Clock, c: C.mid, cat: "투약 시각",
      title: `${w.key} 시각 점안을 자주 놓침`,
      detail: `해당 시각 ${w.pct}% (${w.taken}/${w.total}회) · 전체 평균보다 ${gap}%p 낮음`,
      impact: gap,
      action: hmToMin(w.key) >= 1200 ? "취침 준비 루틴(양치·세면) 직후로 시각을 당겨 보세요." : "기상·식사 등 매일 반복되는 행동에 붙여 알림을 재설정하세요.",
    });
  }

  const dows = adherenceByDow(from, to).filter((d) => d.pct != null);
  if (dows.length) {
    const w = [...dows].sort((a, b) => a.pct - b.pct)[0];
    const gap = all.pct - w.pct;
    if (gap >= 3) out.push({
      key: "dow", icon: CalendarDays, c: C.mid, cat: "요일 패턴",
      title: `${w.t}요일에 누락이 몰림`,
      detail: `${w.t}요일 ${w.pct}% · 전체 평균보다 ${gap}%p 낮음`,
      impact: gap,
      action: "생활 리듬이 달라지는 요일입니다. 해당 요일만 알림을 한 번 더 받도록 설정하세요.",
    });
  }

  const eyes = adherenceByEye(from, to);
  if (eyes.length === 2) {
    const [lo, hi] = [...eyes].sort((a, b) => a.pct - b.pct);
    const gap = hi.pct - lo.pct;
    if (gap >= 3) out.push({
      key: "eye", icon: Eye, c: C.primary, cat: "좌·우안",
      title: `${EYE_LABEL[lo.key]}만 빠뜨리는 패턴`,
      detail: `${EYE_LABEL[lo.key]} ${lo.pct}% · ${EYE_LABEL[hi.key]} ${hi.pct}% (차이 ${gap}%p)`,
      impact: gap,
      action: "점안 자세나 손의 편의성 문제일 수 있습니다. 거울 앞에서 양안 순서를 고정해 연습하도록 안내하세요.",
    });
  }

  const byMed = adherenceByMed(from, to);
  if (byMed.length > 1) {
    const w = byMed[0], b = byMed[byMed.length - 1];
    const gap = b.pct - w.pct;
    const src = meds.find((m) => m.name === w.key);
    const daily = src ? (src.times || []).length : 0;
    if (gap >= 5 && !out.some((o) => o.title.includes(w.key))) out.push({
      key: "med", icon: Pill, c: C.gold, cat: "약제",
      title: `${w.key} 순응도가 가장 낮음`,
      detail: `${w.pct}% (${w.taken}/${w.total}회)${daily >= 2 ? ` · 1일 ${daily}회 용법` : ""} · 최고 약제와 ${gap}%p 차이`,
      impact: gap,
      action: daily >= 2 ? "복합제로 묶어 점안 횟수를 줄이는 방안을 검토하세요." : "해당 약제의 사용감·부작용을 먼저 확인하세요.",
    });
  }

  const bot = bottleAlerts(meds);
  if (bot.length) out.push({
    key: "bottle", icon: Package, c: C.mid, cat: "약병",
    title: "약병 상태가 점안을 방해할 수 있음",
    detail: bot.map((x) => `${x.med.name}(${x.b.label})`).join(" · "),
    impact: 2,
    action: "폐기 예정일 전에 새 병을 준비하고, 일회용은 잔량 5개 이하일 때 리필을 요청하세요.",
  });

  return { all, causes: out.sort((a, b) => b.impact - a.impact) };
}


/* ============================================================
   ★ 순응도 기반 점안 알림 자동 강화
   최근 순응도와 연속 누락에 따라 알림 강도를 자동으로 올린다.
   ============================================================ */
const ADH_ESC_CFG_INIT = {
  enabled: true,
  window: 14,          // 판정 기간(일)
  watch: 90,           // 이 미만이면 주의
  warn: 80,            // 이 미만이면 경고
  crit: 70,            // 이 미만이면 위험
  streakCrit: 3,       // 연속 누락 n일 이상이면 즉시 위험
  slotWarn: 85,        // 특정 시간대가 이 미만이면 그 시각만 추가 강화
  caregiver: false,    // 보호자 통보 동의
};
const ADH_LEVEL = {
  ok: { key: "ok", title: "순응도 양호", short: "양호", icon: CheckCheck, c: C.low, bg: C.lowSoft, pre: 0, retry: 0, retryEvery: 0, caregiver: false, clinic: false,
    desc: "예정 시각에 기본 알림만 보냅니다." },
  watch: { key: "watch", title: "순응도 주의 · 사전 알림", short: "주의", icon: Bell, c: C.primary, bg: C.mint, pre: 30, retry: 0, retryEvery: 0, caregiver: false, clinic: false,
    desc: "예정 30분 전 사전 알림을 추가합니다." },
  warn: { key: "warn", title: "순응도 경고 · 재알림", short: "경고", icon: BellRing, c: C.mid, bg: C.midSoft, pre: 30, retry: 1, retryEvery: 15, caregiver: false, clinic: false,
    desc: "사전 알림과 함께 시간 초과 15분 후 재알림 1회를 보냅니다." },
  crit: { key: "crit", title: "순응도 위험 · 보호자·의료진 통보", short: "위험", icon: AlertTriangle, c: C.high, bg: C.highSoft, pre: 45, retry: 2, retryEvery: 15, caregiver: true, clinic: true,
    desc: "사전 45분 알림과 재알림 2회, 보호자 알림과 의료진 통보가 함께 나갑니다." },
};
function adhLevel(pct, streak, cfg = ADH_ESC_CFG_INIT) {
  if (!cfg.enabled) return ADH_LEVEL.ok;
  if (pct < cfg.crit || streak >= cfg.streakCrit) return ADH_LEVEL.crit;
  if (pct < cfg.warn) return ADH_LEVEL.warn;
  if (pct < cfg.watch) return ADH_LEVEL.watch;
  return ADH_LEVEL.ok;
}
function slotEscalation(from, to, cfg = ADH_ESC_CFG_INIT) {
  return adherenceBySlot(from, to).map((s) => ({ ...s, boost: s.pct < cfg.slotWarn }));
}
function dueRetries(lateMin, lv) {
  if (!lv.retry || !lv.retryEvery) return 0;
  return Math.min(lv.retry, Math.floor(lateMin / lv.retryEvery));
}
const LEVEL_ALL = { ...RENT_LEVEL, ...ADH_LEVEL };

function medAlerts(meds, nowMin, lv = ADH_LEVEL.ok, boostSlots = []) {
  const up = [], over = [];
  const pre = Math.max(30, lv.pre || 0);
  meds.forEach((m) => {
    if (m.time === "필요 시" || m.taken) return;
    const t = hmToMin(m.time), diff = t - nowMin;
    const boosted = boostSlots.includes(m.time);
    const win = boosted ? pre + 15 : pre;                 // 취약 시간대는 더 일찍 알림
    if (diff > 0 && diff <= win) up.push({ ...m, diff, boosted });
    else if (diff < 0 && diff >= -180) over.push({ ...m, late: -diff, boosted, retries: dueRetries(-diff, lv) });
  });
  return { upcoming: up, overdue: over };
}
function medStatus(m, nowMin) {
  if (m.time === "필요 시") return null;
  const t = hmToMin(m.time), diff = t - nowMin;
  if (m.taken) return { kind: "done", label: "완료", c: C.low };
  if (diff > 0 && diff <= 30) return { kind: "soon", label: `${diff}분 후 예정`, c: C.mid };
  if (diff < 0 && diff >= -180) return { kind: "late", label: `${-diff}분 지남`, c: C.high };
  if (diff < 0) return { kind: "missed", label: "미점안", c: C.sub };
  return null;
}
/* 약병 관련 알림(폐기 임박·소진) */
function bottleAlerts(meds) {
  const seen = new Set(), out = [];
  meds.forEach((m) => {
    const key = m.linkOf || m.id;
    if (seen.has(key)) return; seen.add(key);
    const b = bottleState(m);
    if (["expired", "soon", "low", "out"].includes(b.k)) out.push({ med: m, b });
  });
  return out;
}

/* ============================================================
   전자 문진 12항목
   ============================================================ */
const Q = [
  { id: "Q1", pri: 1, title: "수면 자세·머리 높이", freq: "월 1회", icon: Bed,
    save: "주된 수면 자세, 머리 올림 방식, 월별 추세",
    subs: [
      { id: "Q1-1", type: "single", q: "평소 주무실 때 어떤 자세로 가장 오래 주무십니까?", opts: [
        { t: "침대 머리를 20~30° 올리고 잔다", r: "저", fb: "잘하고 계십니다. 이 자세는 야간 안압을 약 1.5~2.0 mmHg 낮춥니다. 유지해 주세요." },
        { t: "평평하게 바로 누워 잔다", r: "중", fb: "바로 누운 자세는 야간 안압을 최대 6 mmHg 높일 수 있습니다. 침대 헤드를 올리거나 웨지 베개를 사용해 보세요." },
        { t: "주로 옆으로 누워 잔다", r: "중", fb: "옆으로 자면 아래쪽 눈의 안압이 더 높아질 수 있습니다. 머리를 함께 올리고 다음 진료 때 상의해 보세요." },
        { t: "엎드려 잔다", r: "고", fb: "엎드린 자세는 안압을 가장 많이 올립니다. 옆으로 눕도록 바꾸고 진료 때 자세 교정을 상의하세요." },
      ]},
      { id: "Q1-2", type: "single", q: "수면 시 머리를 올리는 방식은?", opts: [
        { t: "침대 헤드 자체를 올림", r: "저", fb: "가장 권장되는 방식입니다. 상체 경사가 안정적입니다." },
        { t: "경사형 웨지 베개 사용", r: "저", fb: "좋은 방법입니다. 일반 베개보다 경사가 안정적입니다." },
        { t: "일반 베개 여러 개 겹침", r: "중", fb: "자는 중 자세가 흐트러져 효과가 제한적입니다. 헤드 상승이나 웨지 베개를 권장합니다." },
        { t: "머리를 별도로 올리지 않음", r: "고", fb: "가능한 방법으로 머리를 20~30° 올리기를 권장합니다." },
      ]},
    ]},
  { id: "Q2", pri: 2, title: "수면무호흡 · 진단 · CPAP", freq: "초기 1회", icon: Waves,
    save: "OSA 진단 상태, CPAP 사용·빈도, 선별 증상 점수(0~4), 분기별 변화",
    subs: [
      { id: "Q2-1", type: "single", q: "수면무호흡증을 진단받은 적이 있습니까?", opts: [
        { t: "진단받은 적 없음", r: "-", fb: "아래 증상이 있다면 수면 전문의 상담을 고려해 보세요." },
        { t: "진단받았으나 치료하지 않음", r: "고", fb: "OSA는 녹내장 위험을 약 65% 높인다는 연구가 있습니다. CPAP 등 치료 재개를 상의해 보세요." },
        { t: "진단받았고 CPAP 사용 중", r: "중", fb: "CPAP을 꾸준히 사용해 주세요. 사용이 줄면 야간 저산소·안압 변동이 다시 나타날 수 있습니다." },
        { t: "진단받았으나 CPAP 사용 중단", r: "고", fb: "중단 후 OSA 증상이 재발할 수 있고 녹내장 진행과 연관됩니다. 재개 여부를 상의해 보세요." },
      ]},
      { id: "Q2-2", type: "multi", q: "최근 1개월간 해당하는 증상을 모두 선택하세요.", intg: (s) => s.filter((i) => i !== 4).length >= 2 ? "코골이·무호흡·아침 두통·낮 졸음은 OSA 대표 증상입니다. OSA가 있으면 녹내장 위험이 최대 65% 높다는 연구가 있습니다. 수면 클리닉/이비인후과 상담을 권장합니다." : null, opts: [
        { t: "가족이 지적할 정도의 심한 코골이", r: "중" },
        { t: "자다가 숨이 멎는 모습을 목격당함", r: "고" },
        { t: "아침에 두통이 자주 있음", r: "중" },
        { t: "낮에 참기 어려운 졸음", r: "중" },
        { t: "위 증상 모두 없음", r: "저" },
      ]},
    ]},
  { id: "Q3", pri: 3, title: "혈압약 복용 시점", freq: "초기 1회", icon: Pill,
    save: "혈압약 복용 여부·시점, 분복 여부, 혈관성 증상 점수, 변경 이력",
    subs: [
      { id: "Q3-1", type: "single", q: "현재 혈압약을 복용하십니까? 복용 시점을 선택하세요.", opts: [
        { t: "복용하지 않음", r: "-", fb: "가정 혈압을 정기적으로 측정해 주세요." },
        { t: "아침에만 복용", r: "저", fb: "아침 복용은 야간 저혈압 위험이 낮습니다. 현재 시점을 유지해 주세요." },
        { t: "아침·저녁 분복", r: "중", fb: "저녁 복용 후 야간 혈압이 과도하게 떨어질 수 있습니다. NTG가 있으면 복용 시점을 상의해 보세요." },
        { t: "취침 전 복용", r: "고", fb: "취침 전 복용은 야간 저혈압으로 시신경 관류를 떨어뜨릴 수 있습니다. 안과·내과와 시점 조정을 상의하세요." },
        { t: "복용 시간이 불규칙", r: "고", fb: "복용 시점이 일정하지 않으면 야간 혈압 변동이 커집니다. 일정한 시간에 복용하시고 상의해 보세요." },
      ]},
      { id: "Q3-2", type: "multi", q: "평소 다음 증상이 있습니까? (참고용)", intg: (s) => s.filter((i) => i !== 3).length >= 1 ? "혈관성 위험 요인이 있으실 수 있습니다. 안과 진료 시 함께 말씀해 주세요." : null, opts: [
        { t: "일어설 때 어지럼증", r: "중" }, { t: "기립성 저혈압 진단 이력", r: "중" },
        { t: "손발이 자주 차가움", r: "중" }, { t: "위 증상 없음", r: "저" },
      ]},
    ]},
  { id: "Q4", pri: 4, title: "동반 질환 (당뇨·고혈압)", freq: "초기 1회", icon: Activity,
    save: "당뇨 유무·유형, HbA1c 구간, 고혈압 단계, 분기별 변화",
    subs: [
      { id: "Q4-1", type: "single", q: "당뇨 진단을 받으셨습니까?", opts: [
        { t: "없음", r: "저", fb: "현재 진단 이력이 없습니다." },
        { t: "공복혈당 장애 (당뇨 전단계)", r: "중", fb: "전단계는 미세혈관에 영향을 줄 수 있습니다. 식이·운동 관리를 함께 해주세요." },
        { t: "제2형 당뇨", r: "중", fb: "당뇨 관리 상태가 시신경 건강에도 영향을 줍니다. HbA1c 7% 이하 유지가 권장됩니다." },
        { t: "제1형 당뇨", r: "중", fb: "당뇨 관리 상태가 시신경 건강에도 영향을 줍니다." },
      ]},
      { id: "Q4-2", type: "single", q: "최근 HbA1c(당화혈색소) 수치는? (당뇨 진단 시)", showIf: (a) => a["Q4-1"] != null && a["Q4-1"] !== 0, opts: [
        { t: "7% 미만 (조절 양호)", r: "저", fb: "혈당 조절이 잘 되고 있습니다. 유지해 주세요." },
        { t: "7~8% (조절 보통)", r: "중", fb: "내과 주치의와 혈당 조절 강화를 상의해 보세요." },
        { t: "8% 이상 (조절 불량)", r: "고", fb: "조절되지 않는 고혈당은 미세혈관 건강에 영향을 줍니다. 적극적 관리를 상의해 주세요." },
        { t: "모름", r: "-", fb: "다음 내과 진료 때 HbA1c를 확인해 주세요." },
      ]},
      { id: "Q4-3", type: "single", q: "고혈압 진단을 받으셨습니까?", opts: [
        { t: "없음 (120/80 미만)", r: "저", fb: "혈압이 정상 범위입니다." },
        { t: "전고혈압 (120~139/80~89)", r: "저", fb: "식이·운동·체중 관리를 권장합니다." },
        { t: "고혈압 1단계 (140~159/90~99)", r: "중", fb: "야간 혈압 패턴이 녹내장에 영향을 줄 수 있어 약 복용 시점을 상의해 주세요." },
        { t: "고혈압 2단계 (160↑/100↑)", r: "고", fb: "적극적 관리가 필요합니다. 내과와 즉시 상의하고 안과 진료 시 알려 주세요." },
      ]},
    ]},
  { id: "Q5", pri: 5, title: "안압 급상승 유발 행동", freq: "분기 1회", icon: Dumbbell,
    save: "선택된 위험 행동 목록, 분기별 변화",
    subs: [
      { id: "Q5-1", type: "multi", q: "평소 자주 하시는 것을 모두 선택하세요.", opts: [
        { t: "역전 요가/스트레칭 (다운독·물구나무·쟁기)", r: "고", fb: "역전 자세는 안압을 급격히 높입니다. 복식호흡이나 일반 자세 요가로 대체하세요." },
        { t: "숨을 참으며 무거운 중량 운동", r: "고", fb: "발살바 호흡은 안압을 최대 4 mmHg 높입니다. 숨을 내쉬며 중등 중량·고반복으로 바꿔 보세요." },
        { t: "꽉 끼는 수영 고글 자주 착용", r: "중", fb: "안와 압박이 안압을 일시적으로 높입니다. 큰 사이즈/마스크형 고글을 권장합니다." },
        { t: "목을 조이는 넥타이·칼라 오래 착용", r: "중", fb: "목 조임은 경정맥 압력을 높여 안압을 올릴 수 있습니다. 느슨하게 매세요." },
        { t: "눈을 자주 비비거나 세게 누름", r: "중", fb: "일시적으로 안압을 크게 높입니다. 가려움·건조감엔 처방 인공눈물을 사용하세요." },
        { t: "트럼펫·호른 등 고압 관악기 연주", r: "중", fb: "발살바 유사 상승을 유발할 수 있습니다. 연주 후 안압 변동을 정기 점검해 주세요." },
        { t: "단시간에 물 1L 이상 급하게 마심", r: "중", fb: "일시적 안압 상승(water-drinking test 원리)이 있을 수 있습니다. 나눠서 천천히 드세요." },
        { t: "위 항목 모두 해당 없음", r: "저", fb: "위험 행동이 적은 편입니다. 현재 패턴을 유지해 주세요." },
      ]},
    ]},
  { id: "Q6", pri: 6, title: "흡연 상태·강도·금연", freq: "초기 1회", icon: Cigarette,
    save: "흡연 상태, 일평균 흡연량, 기간, 자동 산출 Pack-year, 금연 후 경과",
    subs: [
      { id: "Q6-1", type: "single", q: "흡연 상태는?", opts: [
        { t: "비흡연 (평생 100개비 미만)", r: "저", fb: "비흡연 상태입니다. 잘 유지해 주세요." },
        { t: "과거 흡연 (현재 금연)", r: "중", fb: "금연을 잘 유지하고 계십니다. 장기 금연은 시야 진행 위험을 낮춥니다." },
        { t: "현재 흡연 중", r: "고", fb: "20 pack-year 이상 누적 흡연은 시야 악화 속도와 관련됩니다. 금연을 권장하며 금연상담전화(1544-9030)를 이용할 수 있습니다." },
      ]},
      { id: "Q6-2", type: "packyear", q: "일평균 흡연량과 흡연 기간 (현재/과거 흡연자)", showIf: (a) => a["Q6-1"] === 1 || a["Q6-1"] === 2 },
      { id: "Q6-3", type: "single", q: "금연 후 경과 기간 (과거 흡연자만)", showIf: (a) => a["Q6-1"] === 1, opts: [
        { t: "1년 미만", r: "중", fb: "금연 초기입니다. 1년 이상 지속하면 위험 감소가 본격화됩니다." },
        { t: "1~5년", r: "중", fb: "잘 유지하고 계십니다. 5년 이상 지속하면 추가 감소가 기대됩니다." },
        { t: "5~10년", r: "저", fb: "장기 금연을 잘 유지하고 계십니다." },
        { t: "10년 이상", r: "저", fb: "비흡연자에 가까운 위험 수준으로 보고됩니다." },
      ]},
    ]},
  { id: "Q7", pri: 7, title: "카페인 섭취", freq: "주 1회", icon: Coffee,
    save: "일평균 카페인 잔 수 구간, 진한 섭취 빈도, 주별 변화",
    subs: [
      { id: "Q7-1", type: "single", q: "하루 카페인 음료(커피·에너지음료·진한 차) 섭취량은?", opts: [
        { t: "마시지 않음", r: "저", fb: "카페인 섭취가 없으십니다." },
        { t: "1~2잔", r: "저", fb: "적정 범위입니다. 안압이 잘 조절되면 현재 수준을 유지하셔도 됩니다." },
        { t: "3~4잔", r: "중", fb: "녹내장 환자는 카페인 후 안압이 일시 상승할 수 있습니다. 2잔 이내로 줄이거나 일부 디카페인으로 바꿔 보세요." },
        { t: "5잔 이상", r: "고", fb: "하루 5잔 이상은 녹내장 위험을 약 1.6배 높인다는 연구가 있습니다. 점진적으로 줄이기를 권장합니다." },
      ]},
      { id: "Q7-2", type: "single", q: "한 번에 진한 커피(더블샷 등)를 드시는 편입니까?", opts: [
        { t: "거의 없음", r: "저", fb: "" },
        { t: "가끔", r: "중", fb: "진한 농도는 안압을 더 크게 올릴 수 있습니다. 농도를 낮추거나 나누어 드세요." },
        { t: "자주", r: "고", fb: "진한 카페인은 안압 변동을 키웁니다. 농도를 낮추거나 디카페인으로 일부 대체하세요." },
      ]},
    ]},
  { id: "Q8", pri: 8, title: "식이 (녹색 잎채소·질산염)", freq: "주 1회", icon: Leaf,
    save: "녹색 잎채소 섭취 빈도, 식단 패턴, 주별 변화",
    subs: [
      { id: "Q8-1", type: "single", q: "시금치·케일·상추 등 녹색 잎채소를 얼마나 자주 드십니까?", opts: [
        { t: "매일 1접시 이상", r: "저", fb: "잘하고 계십니다. 질산염 매개 시신경 보호 효과가 기대됩니다." },
        { t: "주 3~5회", r: "저", fb: "충분한 빈도입니다. 가능하면 매일로 늘려 보세요." },
        { t: "주 1~2회", r: "중", fb: "빈도가 낮은 편입니다. 매 식사에 잎채소 한 가지를 추가해 보세요." },
        { t: "거의 먹지 않음", r: "고", fb: "충분히 드시면 녹내장 위험이 최대 44% 낮아질 수 있다는 연구가 있습니다. 단계적으로 늘려 보세요." },
      ]},
      { id: "Q8-2", type: "single", q: "평소 식단을 가장 잘 설명하는 항목은?", opts: [
        { t: "채소·과일·생선·올리브오일 위주 (지중해·MIND)", r: "저", fb: "위험 감소와 연관된 식단입니다. 유지해 주세요." },
        { t: "일반적 한식 (채소 반찬·생선·잡곡)", r: "저", fb: "균형 잡힌 식단입니다. 잎채소 비중을 조금 더 늘려 보세요." },
        { t: "육류·정제 탄수화물 위주", r: "중", fb: "채소·생선·견과류 비중을 늘리면 시신경 보호에 도움이 됩니다." },
        { t: "외식·가공식품 위주", r: "고", fb: "채소·질산염 섭취가 부족할 수 있습니다. 하루 한 끼라도 채소 위주로 바꿔 보세요." },
      ]},
    ]},
  { id: "Q9", pri: 9, title: "유산소 운동 습관", freq: "주 1회", icon: Footprints, watchLink: "걸음 수 연동 시 자동값 우선",
    save: "주당 유산소 빈도·시간, 강도, 발살바 동반, 신체 제약, 주별 추세",
    subs: [
      { id: "Q9-1", type: "single", q: "일주일에 유산소 운동을 어느 정도 하십니까?", opts: [
        { t: "주 3회 이상, 회당 30분 이상", r: "저", fb: "잘하고 계십니다. 안압을 낮추고 눈 혈류를 개선합니다. 유지해 주세요." },
        { t: "주 1~2회", r: "중", fb: "'약간 숨이 차는' 강도로 주 3회·회당 30분을 목표로 늘려 보세요." },
        { t: "거의 하지 않음 (좌식 생활)", r: "고", fb: "활동량이 많을수록 시야 진행이 느렸다는 연구가 있습니다. 하루 20~30분 빠르게 걷기부터 시작하세요." },
        { t: "운동하고 싶으나 신체 제약", r: "중", fb: "무리 없는 활동(짧은 산책·실내 자전거)을 시도하고, 진료 때 적절한 방법을 상의해 보세요." },
      ]},
      { id: "Q9-2", type: "single", q: "운동 강도는 어느 정도입니까?", opts: [
        { t: "숨이 약간 차고 땀나는(중강도) 이상", r: "저", fb: "중강도 이상은 안압 강하·혈류 개선 효과가 큽니다. 좋은 강도입니다." },
        { t: "가볍게 걷는 정도(저강도)", r: "중", fb: "가능하면 '약간 숨이 차는' 중강도까지 올리면 효과가 더 큽니다." },
        { t: "숨을 참거나 힘주어 버티는 동작 많음", r: "중", fb: "발살바 동작은 안압을 일시적으로 높입니다. 숨을 내쉬며 수행하고 Q5도 확인해 주세요." },
      ]},
    ]},
  { id: "Q10", pri: 10, title: "수면 시간·수면의 질", freq: "월 1회", icon: Moon, watchLink: "수면 시간 연동 시 자동값 우선",
    save: "평균 수면 시간 구간, 규칙성, 질 등급, 수면제 복용, 월별 추세",
    subs: [
      { id: "Q10-1", type: "single", q: "평소 하루 수면 시간은 어느 정도입니까?", opts: [
        { t: "6시간 미만 (부족)", r: "중", fb: "수면 부족은 위험을 다소 높입니다. 하루 약 7시간을 목표로 규칙적으로 맞춰 보세요." },
        { t: "6~9시간 (적정)", r: "저", fb: "적정 수면입니다. 약 7시간 전후가 최적으로 보고됩니다. 유지해 주세요." },
        { t: "9시간 초과 (과다)", r: "중", fb: "지나치게 길어도 위험이 다소 높아집니다. 배경 요인을 살펴보고 지속되면 상의해 보세요." },
        { t: "일정하지 않음 (교대근무 등)", r: "중", fb: "불규칙하면 안압·혈압 주기 리듬이 흐트러집니다. 가능한 범위에서 일정하게 유지해 보세요." },
      ]},
      { id: "Q10-2", type: "single", q: "최근 1개월간 수면의 질은 어떠십니까?", opts: [
        { t: "잘 자고 개운함", r: "저", fb: "수면의 질이 양호합니다. 유지해 주세요." },
        { t: "잠들기 어렵거나 자주 깸 (경도)", r: "중", fb: "취침 전 카페인·스마트폰을 줄이고 규칙적 습관을 시도해 보세요. Q7도 확인해 보세요." },
        { t: "거의 매일 불면으로 힘듦", r: "고", fb: "지속 불면은 위험 증가와 연관됩니다. 개선되지 않으면 수면 클리닉 상담을 권장합니다." },
        { t: "수면제를 복용해야 잠듦", r: "중", fb: "정기 복용 중이면 진료 때 알려 주세요. 일부 약물은 전신 상태에 영향을 줄 수 있습니다." },
      ]},
    ]},
  { id: "Q11", pri: 11, title: "부정맥·심방세동", freq: "초기 1회", icon: HeartPulse, watchFlag: true, watchLink: "워치 불규칙 맥박(IRN) 자동 병기",
    save: "부정맥·AF 진단·유형, 불규칙 맥박 자각, 워치 IRN 유무·감지일, 확진 여부, 변경 이력",
    subs: [
      { id: "Q11-1", type: "single", q: "부정맥 또는 심방세동을 진단받은 적이 있습니까?", opts: [
        { t: "진단받은 적 없음", r: "저", fb: "부정맥·심방세동 진단 이력이 없습니다." },
        { t: "심방세동(AF) 진단받음", r: "중", fb: "AF는 혈관성 경로로 위험을 다소 높일 수 있습니다(특히 NTG). 안과 진료 시 알려 주고 정기 검사를 유지하세요." },
        { t: "기타 부정맥 진단받음", r: "중", fb: "안과 진료 시 함께 말씀해 주세요. 심장내과 관리 상태 유지가 도움이 됩니다." },
        { t: "진단 없으나 불규칙 / 워치에서 감지됨", r: "중", fb: "불규칙 맥박을 느끼셨다면 심장내과 심전도(ECG) 확인을 권장합니다. 미확진 부정맥이 있을 수 있습니다." },
      ]},
    ]},
  { id: "Q12", pri: 12, title: "음주", freq: "주 1회", icon: Wine,
    save: "주당 음주 빈도, 1회 섭취량, 폭음 여부, 주별 추세",
    subs: [
      { id: "Q12-1", type: "single", q: "평소 1주간 음주 빈도는?", opts: [
        { t: "음주 안 함", r: "저", fb: "안압 관리에 유리한 습관입니다." },
        { t: "주 1회 이하", r: "저", fb: "빈도가 낮습니다. 한 번에 많이 마시지 않도록 유의해 주세요." },
        { t: "주 2~3회", r: "중", fb: "잦은 음주는 안압을 다소 높일 수 있습니다. 빈도와 1회량을 줄여 보세요." },
        { t: "주 4회 이상", r: "고", fb: "안압 상승과 연관됩니다. 절주를 권하며 진료 때 상의해 보세요." },
      ]},
      { id: "Q12-2", type: "single", q: "1회 섭취량은? (맥주 1캔/소주 2~3잔 ≈ 1~2잔)", opts: [
        { t: "1잔 이하", r: "저", fb: "소량 음주입니다. 유지해 주세요." },
        { t: "2~3잔", r: "중", fb: "총 음주량이 늘수록 안압이 높아진다는 보고가 있습니다. 양을 줄여 보세요." },
        { t: "4잔 이상", r: "고", fb: "1회 다량 음주는 안압 변동과 연관됩니다. 폭음을 피하고 절주하세요." },
      ]},
    ]},
];
const FREQ_ORDER = ["초기 1회", "주 1회", "월 1회", "분기 1회"];

/* ============================================================
   UI ATOMS
   ============================================================ */
function Card({ children, style, className = "", onClick }) {
  return <div onClick={onClick} className={className} style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.line}`, ...style }}>{children}</div>;
}
function Eyebrow({ children, color = C.sub }) {
  return <div style={{ fontSize: 11, letterSpacing: "0.14em", color, fontWeight: 700, textTransform: "uppercase" }}>{children}</div>;
}
function SectionTitle({ icon: Ic, children, right }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
      <div className="flex items-center gap-2">{Ic && <Ic size={17} color={C.primary} strokeWidth={2.2} />}<span style={{ fontSize: 15.5, fontWeight: 800, color: C.ink }}>{children}</span></div>{right}
    </div>
  );
}
function DeviceChip({ icon: Ic, label, connected = true }) {
  return <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: connected ? C.lowSoft : "#F0F2F2", color: connected ? C.low : C.sub }}><Ic size={12} /> {label}</span>;
}
function Legend({ c, t, soft }) {
  return <div className="flex items-center gap-1.5"><span style={{ width: 14, height: 4, borderRadius: 99, background: c, opacity: soft ? 0.35 : 1 }} /><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{t}</span></div>;
}
function RiskPill({ r, small }) {
  const m = RISK[r]; if (!m) return null;
  return <span className="inline-flex items-center gap-1" style={{ background: m.soft, color: m.c, borderRadius: 999, padding: small ? "2px 8px" : "3px 10px", fontSize: small ? 11 : 12, fontWeight: 700 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: m.c }} />{m.label}</span>;
}
function RiskPillHover({ r, tip }) {
  const [pos, setPos] = useState(null);
  if (!r) return null;
  return (
    <span style={{ position: "relative", display: "inline-flex", cursor: "help" }}
      onMouseEnter={(e) => tip && setPos({ x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => tip && setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}>
      <RiskPill r={r} small />
      {pos && tip && (
        <div style={{ position: "fixed", left: Math.min(pos.x + 12, (typeof window !== "undefined" ? window.innerWidth : 1200) - 270), top: pos.y + 16, zIndex: 60, width: 250, background: C.ink, color: "#fff", fontSize: 11.5, lineHeight: 1.5, padding: "9px 12px", borderRadius: 10, boxShadow: "0 10px 28px rgba(0,0,0,.28)", pointerEvents: "none" }}>
          <div style={{ fontWeight: 800, marginBottom: 3, color: C.gold, fontSize: 11 }}>맞춤 안내</div>{tip}
        </div>
      )}
    </span>
  );
}
function RoleBadge({ role, small }) {
  const r = ROLES[role]; if (!r) return null;
  return <span className="inline-flex items-center gap-1.5" style={{ fontSize: small ? 10.5 : 11.5, fontWeight: 700, color: r.c, background: r.c + "18", padding: small ? "2px 8px" : "3px 10px", borderRadius: 999 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: r.c }} />{r.label}</span>;
}
function JoinBadge({ join }) {
  if (join === "개별") return <span style={{ fontSize: 10.5, fontWeight: 700, color: C.primary, background: C.mint, padding: "2px 8px", borderRadius: 99 }}>개별 등록</span>;
  if (join === "비회원") return <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, background: "#EEF2F1", padding: "2px 8px", borderRadius: 99 }}>비회원</span>;
  const s = SNS_MAP[join]; if (!s) return null;
  return <span className="inline-flex items-center gap-1.5" style={{ fontSize: 10.5, fontWeight: 700, color: C.ink, background: "#F4F7F6", padding: "2px 8px 2px 4px", borderRadius: 99 }}>
    <span className="inline-flex items-center justify-center" style={{ width: 14, height: 14, borderRadius: 99, background: s.c, color: s.fg, fontSize: 8.5, fontWeight: 800, border: s.border ? `1px solid ${C.line}` : "none" }}>{s.mark}</span>{s.label}
  </span>;
}
function OwnerBadge({ owner, small }) {
  const rental = owner === "기관";
  return <span className="inline-flex items-center gap-1" style={{ fontSize: small ? 10 : 11, fontWeight: 700, color: rental ? C.primary : C.aqua, background: rental ? C.mint : "#E2F1F0", padding: small ? "2px 7px" : "3px 9px", borderRadius: 99 }}>
    {rental ? <Building2 size={10} /> : <User size={10} />}{rental ? "병원 대여" : "개인 소유"}
  </span>;
}
function DevStateChip({ st, small }) {
  return <span style={{ fontSize: small ? 10 : 11, fontWeight: 700, color: st.c, background: st.bg, padding: small ? "2px 8px" : "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{st.label}</span>;
}
function AlertChip({ a, small }) {
  return <span className="inline-flex items-center gap-1" style={{ fontSize: small ? 10 : 11, fontWeight: 700, color: a.c, background: a.bg, padding: small ? "2px 8px" : "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}><a.icon size={small ? 10 : 11} />{a.title}</span>;
}
function DoseBadge({ dose, small }) {
  const single = dose === "일회용";
  return <span style={{ fontSize: small ? 9.5 : 10, fontWeight: 700, color: single ? C.aqua : C.primary, background: single ? "#E2F1F0" : C.mint, padding: "1px 7px", borderRadius: 99 }}>{dose}</span>;
}
function FreqBadge({ f }) {
  const map = { "초기 1회": C.sub, "주 1회": C.aqua, "월 1회": C.primary, "분기 1회": C.gold };
  return <span style={{ fontSize: 10, fontWeight: 700, color: map[f] || C.sub, background: "#F0F4F3", padding: "1px 7px", borderRadius: 99 }}>{f}</span>;
}
function ClassBadge({ ingr, small }) {
  const g = drugClass(ingr);
  return <span style={{ fontSize: small ? 9.5 : 10.5, fontWeight: 700, color: g.c, background: g.c + "16", padding: "2px 8px", borderRadius: 99 }}>{g.label}</span>;
}
const EYE_LABEL = { both: "양안", od: "우안", os: "좌안" };
function EyeBadge({ eye, small }) {
  return <span style={{ fontSize: small ? 9.5 : 10.5, fontWeight: 700, color: C.primary, background: C.mint, padding: "1px 7px", borderRadius: 99 }}>{EYE_LABEL[eye] || "양안"}</span>;
}
const inp = { width: "100%", border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px", fontSize: 14, fontFamily: FONT, color: C.ink, outline: "none", boxSizing: "border-box", background: "#fff" };
const inpSm = { ...inp, borderRadius: 9, padding: "8px 10px", fontSize: 12.5 };
function Field({ label, children, req }) {
  return <div className="flex-1"><div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, marginBottom: 6 }}>{label}{req && <span style={{ color: C.high }}> *</span>}</div>{children}</div>;
}
function ChoiceRow({ value, set, opts }) {
  return <div className="flex gap-2">{opts.map((o) => <button key={o} onClick={() => set(o)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${value === o ? C.primary : C.line}`, background: value === o ? C.mint : "#fff", color: value === o ? C.primary : C.sub, borderRadius: 10, padding: "8px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>{o}</button>)}</div>;
}


/* ---------- 블루투스 점안 모니터링 기기 배지 · 페어링 팝업 ---------- */
function MonitorBadge({ dev, small }) {
  if (!dev) return <span style={{ fontSize: small ? 9.5 : 10.5, fontWeight: 700, color: C.sub, background: "#EEF2F1", padding: "1px 7px", borderRadius: 99 }}>기기 미연결</span>;
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: small ? 9.5 : 10.5, fontWeight: 800, color: dev.connected ? C.primary : C.sub, background: dev.connected ? C.mint : "#EEF2F1", padding: "1px 7px", borderRadius: 99 }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: dev.connected ? C.low : C.grey }} />
      <Bluetooth size={small ? 9 : 10} /> {dev.label}
    </span>
  );
}
function SignalBars({ rssi }) {
  const n = rssiBars(rssi);
  return (
    <span className="inline-flex items-end" style={{ gap: 1.5, height: 11 }}>
      {[1, 2, 3].map((i) => <span key={i} style={{ width: 3, height: 3 + i * 3, borderRadius: 1, background: i <= n ? C.primary : C.line }} />)}
    </span>
  );
}
function BtPairModal({ med, devices, onClose, onPair, onUnpair }) {
  const [scanning, setScanning] = useState(true);
  const [found, setFound] = useState([]);
  const [pairing, setPairing] = useState(null);
  const [done, setDone] = useState(null);
  const current = monitorOf(devices, med);

  useEffect(() => {
    const t1 = setTimeout(() => setFound(devices.slice(0, 2)), 700);
    const t2 = setTimeout(() => setFound(devices.slice(0, 3)), 1400);
    const t3 = setTimeout(() => { setFound(devices); setScanning(false); }, 2100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [devices]);

  const rescan = () => { setFound([]); setScanning(true); setTimeout(() => { setFound(devices); setScanning(false); }, 1600); };
  const pick = (d) => {
    if (d.pairedTo && d.pairedTo !== medKey(med)) return;
    setPairing(d.id);
    setTimeout(() => { onPair(d.id); setPairing(null); setDone(d); }, 1100);
  };

  return (
    <Modal title="점안 모니터링 기기 연결" onClose={onClose}>
      <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginBottom: 12 }}>
        <b style={{ color: C.ink }}>{med.name}</b>에 사용할 기기를 선택하세요. 약 1개당 기기 1대만 연결됩니다.
      </div>

      {done ? (
        <div className="flex flex-col items-center" style={{ padding: "14px 0 6px" }}>
          <div className="flex items-center justify-center" style={{ width: 54, height: 54, borderRadius: 999, background: C.lowSoft, color: C.low, marginBottom: 12 }}><Check size={26} strokeWidth={3} /></div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{done.label} 연결 완료</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>
            이제 이 기기로 점안하면 <b style={{ color: C.primary }}>{med.name}</b> 기록이 자동으로 반영됩니다.
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 10, fontSize: 10.5, color: C.sub }}>
            <span style={{ fontFamily: "monospace" }}>{done.serial}</span><span>·</span><span>배터리 {done.battery}%</span><span>·</span><span>FW {done.fw}</span>
          </div>
          <button onClick={onClose} className="cursor-pointer" style={{ width: "100%", border: "none", background: C.primary, color: "#fff", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 800, fontFamily: FONT, marginTop: 18 }}>확인</button>
        </div>
      ) : (
        <>
          {current && (
            <div className="flex items-center gap-2.5" style={{ padding: "10px 12px", borderRadius: 11, background: C.mint, marginBottom: 11 }}>
              <Bluetooth size={15} color={C.primary} className="flex-shrink-0" />
              <div className="flex-1">
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>현재 연결 · {current.label}</div>
                <div style={{ fontSize: 10.5, color: C.sub, fontFamily: "monospace" }}>{current.serial}</div>
              </div>
              <button onClick={() => { onUnpair(); onClose(); }} className="cursor-pointer flex items-center gap-1"
                style={{ border: `1px solid ${C.high}45`, background: "#fff", color: C.high, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 800, fontFamily: FONT }}><Unlink size={11} /> 연결 해제</button>
            </div>
          )}

          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>
              {scanning ? <><RefreshCw size={12} color={C.primary} className="animate-spin" /> 주변 기기 검색 중…</> : <><Bluetooth size={12} color={C.primary} /> 검색된 기기 {found.length}대</>}
            </span>
            {!scanning && <span onClick={rescan} className="cursor-pointer flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: C.primary }}><RefreshCw size={11} /> 다시 검색</span>}
          </div>

          <div className="flex flex-col gap-2" style={{ minHeight: 150 }}>
            {found.map((d) => {
              const busy = d.pairedTo && d.pairedTo !== medKey(med);
              const mine = d.pairedTo === medKey(med);
              return (
                <div key={d.id} onClick={() => !busy && pick(d)} className={busy ? "flex items-center gap-2.5" : "cursor-pointer flex items-center gap-2.5"}
                  style={{ border: `1.5px solid ${mine ? C.primary : C.line}`, background: mine ? C.mint : busy ? C.bg : "#fff", borderRadius: 12, padding: "11px 13px", opacity: busy ? 0.6 : 1 }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 11, background: mine ? "#fff" : C.mint, color: C.primary }}><Bluetooth size={17} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{d.label}</span>
                      <span style={{ fontSize: 10, color: C.sub }}>{d.model}</span>
                      {mine && <span style={{ fontSize: 9.5, fontWeight: 800, color: C.primary, background: "#fff", padding: "1px 7px", borderRadius: 99 }}>연결됨</span>}
                      {busy && <span style={{ fontSize: 9.5, fontWeight: 800, color: C.sub, background: "#EEF2F1", padding: "1px 7px", borderRadius: 99 }}>다른 약에 연결됨</span>}
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>
                      <span style={{ fontFamily: "monospace" }}>{d.serial}</span>
                      <span>배터리 {d.battery}%</span>
                      <SignalBars rssi={d.rssi} />
                    </div>
                  </div>
                  {pairing === d.id
                    ? <RefreshCw size={15} color={C.primary} className="animate-spin flex-shrink-0" />
                    : !busy && <ChevronRight size={15} color={C.grey} className="flex-shrink-0" />}
                </div>
              );
            })}
            {scanning && found.length === 0 && (
              <div className="flex flex-col items-center justify-center" style={{ padding: "34px 0", color: C.sub }}>
                <Bluetooth size={22} color={C.mintDeep} />
                <div style={{ fontSize: 12, marginTop: 8 }}>기기의 전원을 켜고 가까이 두세요.</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: 10.5, color: C.sub, marginTop: 12, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
            점안 모니터링 기기는 약병에 끼워 사용합니다. 점안이 감지되면 좌·우 구분과 시각이 앱으로 전송되어 자동 기록됩니다.
          </div>
        </>
      )}
    </Modal>
  );
}

/* ---------- 순응도 저하 원인 분석 카드 ---------- */
function CauseRank({ n }) {
  const c = n === 1 ? C.high : n === 2 ? C.mid : C.sub;
  return <span className="flex items-center justify-center flex-shrink-0" style={{ width: 20, height: 20, borderRadius: 6, background: c + "18", color: c, fontSize: 11, fontWeight: 800 }}>{n}</span>;
}
function BeforeAfterBar({ before, after, at }) {
  const rows = [{ l: "이전 14일", v: before.pct, n: before.total, c: C.primary }, { l: "이후", v: after.pct, n: after.total, c: C.high }];
  return (
    <div style={{ marginTop: 9, padding: "10px 12px", borderRadius: 10, background: "#fff", border: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700, marginBottom: 7 }}>부작용 보고({at}) 전후 순응도</div>
      {rows.map((r) => (
        <div key={r.l} className="flex items-center gap-2.5" style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 10.5, color: C.sub, width: 52, flexShrink: 0 }}>{r.l}</span>
          <div style={{ flex: 1, height: 9, borderRadius: 99, background: C.mint, overflow: "hidden" }}>
            <div style={{ width: `${r.v}%`, height: "100%", background: r.c, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: r.c, width: 34, textAlign: "right" }}>{r.v}%</span>
          <span style={{ fontSize: 9.5, color: C.grey, width: 44, textAlign: "right" }}>{r.n}회</span>
        </div>
      ))}
    </div>
  );
}
function CauseList({ causes, compact }) {
  if (!causes.length) return (
    <div className="flex flex-col items-center" style={{ padding: "26px 0", color: C.sub }}>
      <Check size={20} color={C.low} />
      <div style={{ fontSize: 12.5, marginTop: 7 }}>뚜렷한 누락 패턴이 발견되지 않았습니다.</div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2.5">
      {causes.slice(0, compact ? 3 : 6).map((x, i) => (
        <div key={x.key} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px" }}>
          <div className="flex items-start gap-2.5">
            <CauseRank n={i + 1} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5" style={{ flexWrap: "wrap" }}>
                <x.icon size={13} color={x.c} />
                <span style={{ fontSize: 10, fontWeight: 800, color: x.c, background: x.c + "16", padding: "1px 7px", borderRadius: 99 }}>{x.cat}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{x.title}</span>
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 3, lineHeight: 1.45 }}>{x.detail}</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: x.c, flexShrink: 0 }}>−{x.impact}%p</span>
          </div>
          {x.chart && !compact && <BeforeAfterBar {...x.chart} />}
          <div className="flex items-start gap-1.5" style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
            <Sparkles size={12} color={C.primary} className="flex-shrink-0" style={{ marginTop: 1 }} />
            <span style={{ fontSize: 11, color: C.ink, lineHeight: 1.45 }}>{x.action}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="flex items-center justify-center" style={{ position: "absolute", inset: 0, background: "rgba(10,42,49,.45)", zIndex: 40, padding: 20 }}>
      <div style={{ width: wide ? 620 : 460, maxWidth: "100%", maxHeight: "88%", overflowY: "auto", background: "#fff", borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: "0 30px 60px -20px rgba(8,52,62,.45)" }}>
        <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{title}</span>
          <X size={19} color={C.sub} className="cursor-pointer" onClick={onClose} />
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}
function SortHead({ label, k, sort, setSort, align }) {
  const on = sort.k === k;
  return (
    <span className="cursor-pointer inline-flex items-center gap-1" onClick={() => setSort({ k, dir: on && sort.dir === "asc" ? "desc" : "asc" })}
      style={{ color: on ? C.primary : C.sub, fontWeight: 700, justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      {label}{on ? (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={11} opacity={0.5} />}
    </span>
  );
}
function PwCell({ value }) {
  const [show, setShow] = useState(false);
  return <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "monospace", fontSize: 12, color: C.sub }}>
    {show ? value : "••••••••"}
    <span className="cursor-pointer" onClick={() => setShow(!show)}>{show ? <EyeOff size={13} color={C.grey} /> : <Eye size={13} color={C.grey} />}</span>
  </span>;
}
function NoPermission({ role }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: "60px 20px", color: C.sub }}>
      <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 999, background: C.highSoft, color: C.high, marginBottom: 12 }}><Lock size={26} /></div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>접근 권한이 없습니다</div>
      <div style={{ fontSize: 12.5, marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>
        현재 역할은 <b style={{ color: ROLES[role].c }}>{ROLES[role].label}</b>입니다.<br />이 메뉴는 관리자만 사용할 수 있습니다.
      </div>
    </div>
  );
}

/* ---------- IOP 게이지 ---------- */
function arcPath(cx, cy, r, a1, a2, n = 64) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = (a1 + (a2 - a1) * (i / n)) * (Math.PI / 180); pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]); }
  return "M" + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L");
}
const v2a = (v, min = 8, max = 30) => 180 - Math.min(1, Math.max(0, (v - min) / (max - min))) * 180;
function IOPGauge({ value, target, eye }) {
  const W = 190, H = 118, cx = W / 2, cy = 104, r = 78;
  if (value == null) return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 150, color: C.sub }}>
      <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 999, background: C.bg, marginBottom: 8 }}><EyeOff size={24} color={C.grey} /></div>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.sub }}>{eye}</div>
      <div style={{ fontSize: 11.5, color: C.grey, marginTop: 2 }}>측정 기록 없음</div>
    </div>
  );
  const a = v2a(value) * (Math.PI / 180);
  const needle = { x: cx + (r - 6) * Math.cos(a), y: cy - (r - 6) * Math.sin(a) };
  const over = value > target;
  const st = value <= target ? C.low : value <= target + 3 ? C.mid : C.high;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 200 }}>
        <path d={arcPath(cx, cy, r, 180, 0)} fill="none" stroke={C.mintDeep} strokeWidth={11} strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, v2a(target - 3), v2a(target + 1))} fill="none" stroke={C.low} strokeWidth={11} strokeLinecap="round" opacity={0.55} />
        <path d={arcPath(cx, cy, r, 180, v2a(value))} fill="none" stroke={st} strokeWidth={11} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={C.ink} />
        <text x={cx - r} y={cy + 14} fontSize="9" fill={C.sub} textAnchor="middle">8</text>
        <text x={cx + r} y={cy + 14} fontSize="9" fill={C.sub} textAnchor="middle">30</text>
      </svg>
      <div className="flex items-baseline gap-1" style={{ marginTop: -6 }}>
        <span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{eye}</span>
        <span style={{ fontSize: 34, fontWeight: 800, color: st, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value.toFixed(1)}</span>
        <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>mmHg</span>
      </div>
      <div style={{ fontSize: 11.5, color: over ? C.high : C.low, fontWeight: 600 }}>목표 {target} · {over ? `+${(value - target).toFixed(1)} 초과` : "목표 이내"}</div>
    </div>
  );
}

/* ============================================================
   그래프 엔진 — Chart / Scatter / Diurnal
   ============================================================ */
const GRAPH_TYPES = [
  { id: "chart", label: "Chart", ko: "추세 그래프", icon: LineChart, desc: "날짜별 평균 안압과 일중 최소–최대 범위를 선으로 표시합니다." },
  { id: "scatter", label: "Scatter", ko: "산점도", icon: Circle, desc: "개별 측정값을 하나씩 점으로 표시해 분포와 이상치를 봅니다." },
  { id: "diurnal", label: "Diurnal", ko: "일중 변동", icon: Clock, desc: "측정 시각(0–24시) 기준으로 겹쳐 하루 중 안압 리듬을 봅니다." },
];
function GraphTypeSwitch({ value, onChange, compact }) {
  return (
    <div className="flex" style={{ background: compact ? C.bg : "#fff", borderRadius: compact ? 9 : 12, padding: compact ? 2 : 3, border: `1px solid ${C.line}` }}>
      {GRAPH_TYPES.map((g) => {
        const on = value === g.id;
        return (
          <button key={g.id} onClick={() => onChange(g.id)} className="cursor-pointer flex items-center justify-center gap-1.5"
            style={{ flex: 1, border: "none", borderRadius: compact ? 7 : 10, padding: compact ? "5px 12px" : "8px 0", fontSize: compact ? 11.5 : 12.5, fontWeight: 700, fontFamily: FONT, background: on ? (compact ? "#fff" : C.mint) : "transparent", color: on ? C.primary : C.sub, boxShadow: on && compact ? "0 1px 3px rgba(0,0,0,.06)" : "none", whiteSpace: "nowrap" }}>
            <g.icon size={compact ? 12 : 14} /> {g.label}
          </button>
        );
      })}
    </div>
  );
}
function EyeFilterSwitch({ value, onChange }) {
  return (
    <div className="flex" style={{ gap: 4 }}>
      {[{ id: "both", t: "양안" }, { id: "od", t: "우안 OD" }, { id: "os", t: "좌안 OS" }].map((e) => (
        <button key={e.id} onClick={() => onChange(e.id)} className="cursor-pointer"
          style={{ border: `1px solid ${value === e.id ? C.primary : C.line}`, background: value === e.id ? C.primary : "#fff", color: value === e.id ? "#fff" : C.sub, borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT }}>{e.t}</button>
      ))}
    </div>
  );
}
function TrendTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0] && payload[0].payload; if (!p) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 10px", fontSize: 11.5, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
      <div style={{ fontWeight: 700, color: C.ink, marginBottom: 3 }}>{label} <span style={{ color: C.sub, fontWeight: 500 }}>· {p.cnt}회 측정</span></div>
      <div style={{ color: C.od }}>우안 평균 {p.odAvg} <span style={{ color: C.sub }}>(최소 {p.odMin} · 최대 {p.odMax})</span></div>
      <div style={{ color: C.os }}>좌안 평균 {p.osAvg} <span style={{ color: C.sub }}>(최소 {p.osMin} · 최대 {p.osMax})</span></div>
      {p.adh != null && <div style={{ color: p.missed ? C.high : C.low, marginTop: 2 }}>점안 순응도 {p.adh}%{p.missed ? " · 누락일" : ""}</div>}
    </div>
  );
}
function IopGraph({ type, pts, height = 190, targetOD = 15, targetOS = 16, eyeFilter = "both" }) {
  const raw = useMemo(() => rawPoints(pts), [pts]);
  const diu = useMemo(() => diurnalCurve(raw), [raw]);
  const showOD = eyeFilter === "both" || eyeFilter === "od";
  const showOS = eyeFilter === "both" || eyeFilter === "os";
  const labels = pts.map((p) => p.d);
  const tickIdx = pts.length <= 8 ? pts.map((_, i) => i) : [0, Math.floor(pts.length / 3), Math.floor((pts.length * 2) / 3), pts.length - 1];

  if (type === "scatter") return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <ReferenceArea y1={12} y2={targetOS + 1} fill={C.low} fillOpacity={0.07} />
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis type="number" dataKey="x" domain={[-0.4, pts.length - 0.6]} ticks={tickIdx} tickFormatter={(v) => labels[v] || ""} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} />
        <YAxis type="number" domain={[10, 24]} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} width={38} tickMargin={4} />
        <ZAxis range={[26, 26]} />
        <ReferenceLine y={targetOD} stroke={C.low} strokeDasharray="3 3" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }}
          formatter={(v, n) => [`${v} mmHg`, n === "od" ? "우안 OD" : "좌안 OS"]} labelFormatter={(v) => labels[Math.round(v)] || ""} />
        {showOD && <Scatter name="od" data={raw} dataKey="od" fill={C.od} fillOpacity={0.75} />}
        {showOS && <Scatter name="os" data={raw} dataKey="os" fill={C.os} fillOpacity={0.75} />}
      </ScatterChart>
    </ResponsiveContainer>
  );
  if (type === "diurnal") return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={diu} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <ReferenceArea y1={12} y2={targetOS + 1} fill={C.low} fillOpacity={0.07} />
        <ReferenceArea x1={0} x2={7} fill={C.ink} fillOpacity={0.045} />
        <ReferenceArea x1={22} x2={24} fill={C.ink} fillOpacity={0.045} />
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis type="number" dataKey="h" domain={[5, 24]} ticks={[6, 9, 12, 15, 18, 21, 24]} tickFormatter={(v) => `${v}시`} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} />
        <YAxis domain={[10, 24]} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} width={38} tickMargin={4} />
        <ReferenceLine y={targetOD} stroke={C.low} strokeDasharray="3 3" />
        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }}
          formatter={(v, n) => (n === "odAvg" ? [`${v} mmHg`, "우안 평균"] : n === "osAvg" ? [`${v} mmHg`, "좌안 평균"] : null)} labelFormatter={(v) => `${v}시대`} />
        {showOD && <Area dataKey="odBand" stroke="none" fill={C.od} fillOpacity={0.12} isAnimationActive={false} />}
        {showOD && <Line type="monotone" dataKey="odAvg" stroke={C.od} strokeWidth={2.6} dot={{ r: 3, fill: C.od }} isAnimationActive={false} />}
        {showOS && <Line type="monotone" dataKey="osAvg" stroke={C.os} strokeWidth={2.4} dot={{ r: 2.5, fill: C.os }} isAnimationActive={false} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={pts} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <ReferenceArea y1={12} y2={targetOS + 1} fill={C.low} fillOpacity={0.07} />
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="d" interval="preserveStartEnd" minTickGap={16} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} />
        <YAxis domain={[10, 24]} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} width={38} tickMargin={4} />
        <Tooltip content={<TrendTip />} />
        {showOD && <Area dataKey="odRange" stroke="none" fill={C.od} fillOpacity={0.13} isAnimationActive={false} />}
        {showOS && <Area dataKey="osRange" stroke="none" fill={C.os} fillOpacity={0.13} isAnimationActive={false} />}
        {showOD && <Line type="monotone" dataKey="odAvg" stroke={C.od} strokeWidth={2.4} dot={false} isAnimationActive={false} />}
        {showOS && <Line type="monotone" dataKey="osAvg" stroke={C.os} strokeWidth={2.4} dot={false} isAnimationActive={false} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
function GraphLegend({ type, eyeFilter }) {
  const showOD = eyeFilter !== "os", showOS = eyeFilter !== "od";
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap" style={{ marginTop: 6 }}>
      {showOD && <Legend c={C.od} t="우안 OD" />}
      {showOS && <Legend c={C.os} t="좌안 OS" />}
      {type === "chart" && <div className="flex items-center gap-1.5"><span style={{ width: 14, height: 9, borderRadius: 2, background: C.od, opacity: 0.2 }} /><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>일중 범위</span></div>}
      {type === "scatter" && <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>점 1개 = 측정 1회</span>}
      {type === "diurnal" && <div className="flex items-center gap-1.5"><span style={{ width: 14, height: 9, borderRadius: 2, background: C.ink, opacity: 0.08 }} /><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>야간 시간대</span></div>}
    </div>
  );
}
/* 점안 순응도 ↔ 안압 병렬 시각화 */
function AdhIopDot(props) {
  const { cx, cy, payload, stroke } = props;
  if (cx == null) return null;
  return <circle cx={cx} cy={cy} r={payload.missed ? 5 : 3} fill={payload.missed ? C.high : stroke} stroke="#fff" strokeWidth={1.4} />;
}
function AdhIopChart({ data, height = 190 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <ReferenceArea yAxisId="l" y1={12} y2={16} fill={C.low} fillOpacity={0.07} />
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="d" interval="preserveStartEnd" minTickGap={16} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="l" domain={[12, 24]} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} width={38} tickMargin={4} />
        <YAxis yAxisId="r" orientation="right" domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 9.5, fill: C.grey }} axisLine={false} tickLine={false} width={36} tickMargin={4} />
        <ReferenceLine yAxisId="l" y={15} stroke={C.low} strokeDasharray="3 3" />
        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} formatter={(v, n) => n === "adh" ? [`${v}%`, "순응도"] : [`${v} mmHg`, n === "odAvg" ? "우안" : "좌안"]} />
        <Bar yAxisId="r" dataKey="adh" name="adh" barSize={12} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((e, i) => <Cell key={i} fill={e.missed ? "#F2C9C0" : C.mintDeep} />)}
        </Bar>
        <Line yAxisId="l" type="monotone" dataKey="odAvg" name="odAvg" stroke={C.od} strokeWidth={2.4} dot={<AdhIopDot />} isAnimationActive={false} />
        <Line yAxisId="l" type="monotone" dataKey="osAvg" name="osAvg" stroke={C.os} strokeWidth={2.4} dot={<AdhIopDot />} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
function FlucChart({ data, height = 130 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="d" interval="preserveStartEnd" minTickGap={16} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} tick={{ fontSize: 9.5, fill: C.sub }} axisLine={false} tickLine={false} width={34} tickMargin={4} />
        <ReferenceLine y={5} stroke={C.high} strokeDasharray="3 3" />
        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} formatter={(v) => [`${v} mmHg`, "일중 변동폭"]} />
        <Bar dataKey="fluc" radius={[3, 3, 0, 0]} barSize={12} isAnimationActive={false}>
          {data.map((e, i) => <Cell key={i} fill={e.fluc >= 5 ? C.high : e.fluc >= 2 ? C.mid : C.primary} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
function DayStat({ eye, avg, min, max, col }) {
  if (avg == null) return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 11px" }}>
      <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>{eye}</div>
      <div style={{ fontSize: 11, color: C.grey, marginTop: 3 }}>오늘 측정 없음</div>
    </div>
  );
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 11px" }}>
      <div className="flex items-baseline gap-1.5"><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>{eye}</span><span style={{ fontSize: 18, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{avg}</span><span style={{ fontSize: 10.5, color: C.sub }}>평균</span></div>
      <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>최소 {min} · 최대 {max} mmHg</div>
    </div>
  );
}
const _dateInp = { border: `1px solid ${C.line}`, borderRadius: 8, padding: "5px 8px", fontSize: 11.5, fontFamily: FONT, color: C.ink, outline: "none", background: "#fff" };
function PeriodPicker({ period, from, to, onPreset, onFrom, onTo, options = PERIODS, resetTo = "1개월" }) {
  const custom = period === "custom";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex" style={{ gap: 4, flexWrap: "wrap" }}>
        {options.map((p) => (
          <button key={p} onClick={() => onPreset(p)} className="cursor-pointer"
            style={{ border: `1px solid ${period === p ? C.primary : C.line}`, background: period === p ? C.primary : "#fff", color: period === p ? "#fff" : C.sub, borderRadius: 999, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>{p}</button>
        ))}
        <button onClick={() => onPreset(custom ? resetTo : "custom")} className="cursor-pointer inline-flex items-center gap-1"
          style={{ border: `1px solid ${custom ? C.primary : C.line}`, background: custom ? C.primary : "#fff", color: custom ? "#fff" : C.sub, borderRadius: 999, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>
          <CalendarDays size={12} /> 직접 선택
        </button>
      </div>
      {custom && (
        <div className="flex items-center gap-2" style={{ flexWrap: "wrap", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.primary}`, background: C.mint }}>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 800 }}>기간 지정</span>
          <input type="date" value={from} max={to} onChange={(e) => onFrom(e.target.value)} style={_dateInp} />
          <span style={{ color: C.sub, fontSize: 12 }}>~</span>
          <input type="date" value={to} min={from} onChange={(e) => onTo(e.target.value)} style={_dateInp} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   푸시 알림 훅 (점안 · 측정 · 반납 · 약병)
   ============================================================ */
function usePush(medUp, medOver, rent, bottles, lv = ADH_LEVEL.ok, escOn = true) {
  let supported = false;
  try { supported = typeof window !== "undefined" && "Notification" in window; } catch (e) { supported = false; }
  const readPerm = () => { try { return supported ? Notification.permission : "unsupported"; } catch (e) { return "unsupported"; } };
  const [permission, setPermission] = useState(readPerm);
  const [enabled, setEnabled] = useState(false);
  const sent = useRef(new Set());
  const fire = (title, body, tag) => {
    if (!supported || readPerm() !== "granted") return;
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then((r) => r.showNotification(title, { body, tag }));
      else new Notification(title, { body, tag });
    } catch (e) { try { new Notification(title, { body, tag }); } catch (_) {} }
  };
  const request = async () => {
    if (!supported) return;
    try {
      const p = await Notification.requestPermission(); setPermission(p);
      if (p === "granted") { setEnabled(true); fire("안압케어 알림이 켜졌습니다", "점안·측정·기기 반납 알림을 보내드립니다."); }
    } catch (e) {}
  };
  useEffect(() => {
    if (!enabled || permission !== "granted") return;
    (medUp || []).forEach((m) => { const k = `soon-${m.id}-${m.time}`; if (!sent.current.has(k)) { sent.current.add(k); fire("점안 예정 알림", `${m.diff}분 후(${m.time}) ${m.name} 점안 예정입니다.`, k); } });
    (medOver || []).forEach((m) => {
      const k = `late-${m.id}-${m.time}`;
      if (!sent.current.has(k)) { sent.current.add(k); fire("⚠️ 점안 시간 초과", `${m.name} 예정 시간(${m.time})이 ${m.late}분 지났습니다.`, k); }
      /* 순응도 강화: 재알림 */
      if (escOn) {
        for (let r = 1; r <= (m.retries || 0); r++) {
          const rk = `retry-${m.id}-${m.time}-${r}`;
          if (!sent.current.has(rk)) {
            sent.current.add(rk);
            fire(`🔔 점안 재알림 ${r}회차`, `${m.name}을(를) 아직 점안하지 않으셨습니다. (${m.time} 예정 · ${m.late}분 경과)`, rk);
          }
        }
        if (lv.caregiver && (m.retries || 0) >= lv.retry) {
          const ck = `care-${m.id}-${m.time}`;
          if (!sent.current.has(ck)) { sent.current.add(ck); fire("보호자 알림 발송", `${m.name} 점안이 반복해서 지연되어 보호자에게 알림을 보냈습니다.`, ck); }
        }
      }
    });
    (bottles || []).forEach((x) => {
      const k = `bot-${x.med.id}-${x.b.k}`;
      if (!sent.current.has(k)) { sent.current.add(k); fire(x.b.k === "expired" ? "⚠️ 점안제 폐기 필요" : x.b.k === "out" ? "점안제 소진" : "점안제 교체 예정", `${x.med.name} · ${x.b.label}`, k); }
    });
    if (rent) {
      const k = `rent-${rent.key}-${rent.dd}`;
      if (!sent.current.has(k)) { sent.current.add(k); fire(rent.blocked ? "⛔ 측정 데이터 수신 중단" : rent.dd < 0 ? "⚠️ 대여 기기 반납 연체" : "📦 대여 기기 반납 안내", rent.msg, k); }
    }
  }, [enabled, permission, medUp, medOver, rent, bottles, lv, escOn]);
  return { supported, permission, enabled, setEnabled, request };
}
function PushToggleCard({ push }) {
  const st = !push.supported ? { t: "이 환경에서는 브라우저 알림을 지원하지 않습니다.", c: C.sub }
    : push.permission === "denied" ? { t: "알림이 차단되어 있습니다. 브라우저 설정에서 허용해 주세요.", c: C.high }
    : push.permission === "granted" && push.enabled ? { t: "알림 켜짐 · 점안·측정·기기 반납 알림을 받습니다.", c: C.low }
    : { t: "점안 30분 전, 측정 예정, 기기 반납 알림을 받으세요.", c: C.sub };
  const on = push.permission === "granted" && push.enabled;
  return (
    <Card style={{ padding: 13 }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: on ? C.lowSoft : C.mint, color: on ? C.low : C.primary }}><Bell size={18} /></div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>푸시 알림</div>
          <div style={{ fontSize: 11, color: st.c, marginTop: 1, lineHeight: 1.45 }}>{st.t}</div>
        </div>
        {push.supported && push.permission !== "denied" && (
          <button onClick={() => (on ? push.setEnabled(false) : push.request())} className="cursor-pointer flex-shrink-0"
            style={{ border: "none", borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 800, fontFamily: FONT, background: on ? C.mintDeep : C.primary, color: on ? C.primary : "#fff" }}>{on ? "끄기" : "켜기"}</button>
        )}
      </div>
    </Card>
  );
}

/* ============================================================
   환자 로그인 · 회원가입 · 비회원
   ============================================================ */
function SnsButton({ s, onClick }) {
  return (
    <button onClick={onClick} className="cursor-pointer flex items-center gap-2.5"
      style={{ width: "100%", border: s.border ? `1px solid ${C.line}` : "none", background: s.c, color: s.fg, borderRadius: 12, padding: "11px 14px", fontSize: 13.5, fontWeight: 700, fontFamily: FONT }}>
      <span className="flex items-center justify-center" style={{ width: 22, height: 22, borderRadius: 6, background: s.border ? "#F4F7F6" : "rgba(255,255,255,.22)", color: s.fg, fontSize: 12, fontWeight: 800 }}>{s.mark}</span>
      {s.label}(으)로 계속하기
    </button>
  );
}
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [region, setRegion] = useState("한국");
  const [showPw, setShowPw] = useState(false);
  const [f, setF] = useState({ id: "", pw: "", name: "", gender: "", birth: "", phone: "", email: "", pw2: "", serial: "", owner: "기관", agree: false });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const grp = SNS.find((g) => g.region === region) || SNS[0];
  const serialOK = /^CVT2H?-[0-9A-Z]{6,10}$/.test(f.serial.trim());
  const canJoin = f.name && f.id && f.pw && f.pw === f.pw2 && f.phone && f.agree && (!f.serial || serialOK);
  const demo = { serial: "CVT2H-2033AA11", owner: "기관" };

  return (
    <div className="flex flex-col" style={{ padding: "10px 4px 20px" }}>
      <div className="flex flex-col items-center" style={{ marginBottom: 18 }}>
        <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 16, background: C.primary, marginBottom: 10 }}><Eye size={28} color="#fff" /></div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>안압케어</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 3, textAlign: "center", lineHeight: 1.5 }}>안압·점안·문진·건강을 한 곳에서 관리하고<br />기록을 의료진과 공유합니다.</div>
      </div>

      <div className="flex" style={{ background: "#fff", borderRadius: 12, padding: 3, border: `1px solid ${C.line}`, marginBottom: 14 }}>
        {[{ id: "login", t: "로그인" }, { id: "join", t: "회원가입" }, { id: "guest", t: "비회원" }].map((m) => (
          <button key={m.id} onClick={() => setTab(m.id)} className="cursor-pointer" style={{ flex: 1, border: "none", borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: tab === m.id ? C.mint : "transparent", color: tab === m.id ? C.primary : C.sub }}>{m.t}</button>
        ))}
      </div>

      {tab === "login" && (
        <div className="flex flex-col gap-3">
          <Card style={{ padding: 14 }}>
            <div className="flex flex-col gap-2.5">
              <Field label="아이디"><input value={f.id} onChange={(e) => set("id", e.target.value)} placeholder="아이디 또는 이메일" style={inp} /></Field>
              <Field label="비밀번호">
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={f.pw} onChange={(e) => set("pw", e.target.value)} placeholder="비밀번호" style={{ ...inp, paddingRight: 40 }} />
                  <span className="cursor-pointer" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: 11, color: C.sub }}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</span>
                </div>
              </Field>
              <button onClick={() => onAuth({ mode: "member", name: "이순영", join: "개별", id: f.id || "sylee62", ...demo })} className="cursor-pointer flex items-center justify-center gap-2"
                style={{ border: "none", borderRadius: 12, padding: "13px 0", background: C.primary, color: "#fff", fontSize: 14.5, fontWeight: 800, fontFamily: FONT, marginTop: 4 }}><LogIn size={17} /> 로그인</button>
              <div className="flex items-center justify-center gap-3" style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>
                <span className="cursor-pointer">아이디 찾기</span><span style={{ color: C.line }}>|</span><span className="cursor-pointer">비밀번호 재설정</span>
              </div>
            </div>
          </Card>
          <div className="flex items-center gap-2" style={{ margin: "2px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.line }} />
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>SNS 계정으로 계속하기</span>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div className="flex" style={{ gap: 4 }}>
            {SNS.map((g) => (
              <button key={g.region} onClick={() => setRegion(g.region)} className="cursor-pointer flex items-center justify-center gap-1"
                style={{ flex: 1, border: `1px solid ${region === g.region ? C.primary : C.line}`, background: region === g.region ? C.mint : "#fff", color: region === g.region ? C.primary : C.sub, borderRadius: 999, padding: "6px 4px", fontSize: 11, fontWeight: 700, fontFamily: FONT }}>
                <Globe size={11} /> {g.region}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {grp.items.map((s) => <SnsButton key={s.id} s={s} onClick={() => onAuth({ mode: "member", name: "이순영", join: s.id, id: `${s.id}_user`, ...demo })} />)}
          </div>
        </div>
      )}

      {tab === "join" && (
        <div className="flex flex-col gap-3">
          <Card style={{ padding: 14 }}>
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2.5">
                <Field label="이름" req><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="홍길동" style={inp} /></Field>
                <Field label="성별" req>
                  <div className="flex" style={{ gap: 5 }}>
                    {["남", "여"].map((g) => (
                      <button key={g} onClick={() => set("gender", g)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${f.gender === g ? C.primary : C.line}`, background: f.gender === g ? C.mint : "#fff", color: f.gender === g ? C.primary : C.sub, borderRadius: 11, padding: "10px 0", fontSize: 13.5, fontWeight: 700, fontFamily: FONT }}>{g}</button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="생년월일"><input type="date" value={f.birth} onChange={(e) => set("birth", e.target.value)} style={inp} /></Field>
              <Field label="연락처" req><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" style={inp} /></Field>
              <Field label="이메일"><input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" style={inp} /></Field>
              <Field label="아이디" req><input value={f.id} onChange={(e) => set("id", e.target.value)} placeholder="영문·숫자 6자 이상" style={inp} /></Field>
              <div className="flex gap-2.5">
                <Field label="비밀번호" req><input type="password" value={f.pw} onChange={(e) => set("pw", e.target.value)} placeholder="8자 이상" style={inp} /></Field>
                <Field label="비밀번호 확인" req><input type="password" value={f.pw2} onChange={(e) => set("pw2", e.target.value)} placeholder="다시 입력" style={inp} /></Field>
              </div>
              {f.pw && f.pw2 && f.pw !== f.pw2 && <div style={{ fontSize: 11, color: C.high, fontWeight: 700 }}>비밀번호가 일치하지 않습니다.</div>}

              <div style={{ border: `1px solid ${serialOK ? C.low : C.line}`, borderRadius: 12, padding: "11px 12px", background: serialOK ? C.lowSoft : C.bg, marginTop: 2 }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
                  <Bluetooth size={13} color={serialOK ? C.low : C.primary} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>안압계 기기 등록</span>
                  <span style={{ fontSize: 10, color: C.sub }}>선택 · 나중에 가능</span>
                </div>
                <input value={f.serial} onChange={(e) => set("serial", e.target.value.toUpperCase())} placeholder="CVT2H-0000AA00" style={{ ...inp, fontFamily: "monospace", letterSpacing: "0.04em" }} />
                <div className="flex" style={{ gap: 6, marginTop: 8 }}>
                  {[{ id: "기관", t: "병원에서 대여" }, { id: "개인", t: "직접 구입" }].map((o) => (
                    <button key={o.id} onClick={() => set("owner", o.id)} className="cursor-pointer"
                      style={{ flex: 1, border: `1.5px solid ${f.owner === o.id ? C.primary : C.line}`, background: f.owner === o.id ? C.mint : "#fff", color: f.owner === o.id ? C.primary : C.sub, borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{o.t}</button>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: serialOK ? C.low : C.sub, marginTop: 7, lineHeight: 1.45 }}>
                  {serialOK ? (f.owner === "기관" ? "✓ 병원 대여 기기로 연결됩니다. 반납 예정일이 앱에 표시됩니다." : "✓ 개인 소유 기기로 병원 계정에 연동됩니다.")
                    : "기기 뒷면 라벨의 시리얼 번호를 입력하세요. (예: CVT2H-2033AA11)"}
                </div>
              </div>

              <div className="flex items-center gap-2 cursor-pointer" onClick={() => set("agree", !f.agree)} style={{ marginTop: 2 }}>
                <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${f.agree ? C.primary : C.line}`, background: f.agree ? C.primary : "#fff", flexShrink: 0 }}>{f.agree && <Check size={13} color="#fff" strokeWidth={3.5} />}</span>
                <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.4 }}>개인정보 수집·이용 및 <b style={{ color: C.primary }}>의료진 데이터 공유</b>에 동의합니다.</span>
              </div>
              <button onClick={() => canJoin && onAuth({ mode: "member", name: f.name, join: "개별", id: f.id, serial: f.serial.trim(), owner: f.owner })} disabled={!canJoin} className="cursor-pointer flex items-center justify-center gap-2"
                style={{ border: "none", borderRadius: 12, padding: "13px 0", background: canJoin ? C.primary : C.mintDeep, color: canJoin ? "#fff" : C.sub, fontSize: 14.5, fontWeight: 800, fontFamily: FONT, marginTop: 4 }}><UserPlus size={17} /> 가입하고 시작하기</button>
            </div>
          </Card>
          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.55, background: C.mint, borderRadius: 12, padding: "10px 12px" }}>
            가입 후 의료기관에서 <b style={{ color: C.primary }}>환자 인증</b>을 완료하면 안압·점안·문진 기록이 담당 의료진에게 전달됩니다.
          </div>
        </div>
      )}

      {tab === "guest" && (
        <div className="flex flex-col gap-3">
          <Card style={{ padding: 16 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, borderRadius: 13, background: C.bg, color: C.sub }}><User size={20} /></div>
              <div><div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>비회원으로 사용하기</div><div style={{ fontSize: 11.5, color: C.sub, marginTop: 1 }}>가입 없이 바로 측정·점안 기록</div></div>
            </div>
            <div className="flex flex-col gap-2" style={{ marginBottom: 14 }}>
              {[
                { ok: true, t: "안압 측정 · 점안 기록 (이 기기 안에만 저장)" },
                { ok: true, t: "추세·일중 변동 그래프 확인" },
                { ok: false, t: "의료진 웹으로 데이터 전송 불가" },
                { ok: false, t: "문진 결과의 의료진 위험도 평가 불가" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, borderRadius: 99, background: r.ok ? C.lowSoft : C.highSoft, color: r.ok ? C.low : C.high }}>{r.ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}</span>
                  <span style={{ fontSize: 12.5, color: r.ok ? C.ink : C.sub }}>{r.t}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onAuth({ mode: "guest", name: "비회원", join: "비회원", id: `guest-${Math.floor(Math.random() * 9000 + 1000)}` })} className="cursor-pointer"
              style={{ width: "100%", border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 12, padding: "13px 0", fontSize: 14.5, fontWeight: 800, fontFamily: FONT }}>비회원으로 시작</button>
          </Card>
          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.55, background: C.goldSoft, borderRadius: 12, padding: "10px 12px" }}>
            <b style={{ color: C.gold }}>안내:</b> 비회원 기록은 앱 삭제 시 사라집니다. 나중에 회원가입하면 이 기기의 기록을 계정으로 옮길 수 있습니다.
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   안압 측정 패널 (좌/우안 선택)
   ============================================================ */
/* ============================================================
   안압 측정 패널 — 기기 신호 기반
   CVT200은 좌·우를 분리한 신호로 전송하므로 사전 선택 없이
   수신되는 대로 해당 눈의 슬롯이 채워진다. 값은 수기 수정 가능.
   ============================================================ */
const ampm = (hm) => {
  if (!hm) return "";
  const [h, m, s] = hm.split(":").map(Number);
  const ap = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ap} ${_pad(h12)}:${_pad(m)}${s != null && !isNaN(s) ? ":" + _pad(s) : ""}`;
};
function EyeValueSlot({ eye, label, target, value, onChange, receivedAt, live, manual }) {
  const [edit, setEdit] = useState(false);
  const [buf, setBuf] = useState("");
  const has = value != null;
  const st = !has ? C.grey : value <= target ? C.low : value <= target + 3 ? C.mid : C.high;
  const commit = (raw) => {
    const v = parseFloat(raw);
    onChange(isNaN(v) ? null : +Math.min(80, Math.max(1, v)).toFixed(1));
  };
  const editing = manual || edit;
  return (
    <div style={{ border: `1.5px solid ${live ? C.primary : has ? st + "45" : C.line}`, borderRadius: 14, padding: "12px 14px", background: live ? C.mint : "#fff" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: eye === "od" ? C.od : C.os, padding: "2px 9px", borderRadius: 99 }}>{label}</span>
          <span style={{ fontSize: 10, color: C.sub }}>목표 {target}</span>
        </div>
        {live ? (
          <span className="flex items-center gap-1" style={{ fontSize: 10, fontWeight: 800, color: C.primary }}><RefreshCw size={10} className="animate-spin" /> 수신 중</span>
        ) : manual ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>수기 입력</span>
        ) : edit ? (
          <span onClick={() => setEdit(false)} className="cursor-pointer" style={{ fontSize: 10, fontWeight: 700, color: C.sub }}>완료</span>
        ) : (
          <span onClick={() => { setBuf(has ? String(value) : ""); setEdit(true); }} className="cursor-pointer flex items-center gap-1" style={{ fontSize: 10, fontWeight: 700, color: C.low }}>
            <Sparkles size={10} /> 수기 수정
          </span>
        )}
      </div>

      {editing ? (
        <input autoFocus={edit} type="number" step="0.1" min="1" max="80"
          value={manual ? (has ? value : "") : buf}
          onChange={(e) => { if (manual) commit(e.target.value); else setBuf(e.target.value); }}
          onBlur={() => { if (!manual) { commit(buf); setEdit(false); } }}
          onKeyDown={(e) => { if (e.key === "Enter" && !manual) { commit(buf); setEdit(false); } }}
          placeholder="0"
          style={{ ...inp, fontSize: 30, fontWeight: 800, textAlign: "center", padding: "4px 8px", color: has ? st : C.ink, fontVariantNumeric: "tabular-nums" }} />
      ) : (
        <div className="flex items-baseline justify-center gap-1.5" style={{ padding: "3px 0" }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: has ? st : C.mintDeep, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {has ? value.toFixed(1) : "0"}
          </span>
          <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>mmHg</span>
        </div>
      )}

      <div style={{ fontSize: 10.5, textAlign: "center", color: has ? st : C.grey, fontWeight: 600, marginTop: 3 }}>
        {has ? (value > target ? `목표 +${(value - target).toFixed(1)} 초과` : "목표 이내")
             : live ? "신호 수신 중" : manual ? "값을 입력하세요" : "대기 중"}
        {receivedAt && !manual && <span style={{ color: C.sub, fontWeight: 500 }}> · {receivedAt}</span>}
      </div>
    </div>
  );
}
function MeasurePanel({ onClose, onSave, targetOD, targetOS, baseOD }) {
  const now = new Date();
  const [mDate, setMDate] = useState(isoDate(now));
  const [mTime, setMTime] = useState(`${_pad(now.getHours())}:${_pad(now.getMinutes())}:${_pad(now.getSeconds())}`);
  const [auto, setAuto] = useState(true);
  const [live, setLive] = useState(null);
  const [vals, setVals] = useState({ od: null, os: null });
  const [recv, setRecv] = useState({ od: null, os: null });
  const [log, setLog] = useState([]);
  const [ctx, setCtx] = useState("");
  const [round, setRound] = useState(0);          // 재측정 시 증가
  const timers = useRef([]);
  const CTX_OPTS = ["기상 직후", "점안 전", "점안 후", "운동 후", "저녁 식후", "취침 전"];
  const hasAny = vals.od != null || vals.os != null;
  const bothDone = vals.od != null && vals.os != null;

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearAll(), []);

  /* 자동측정 ON → 기기 신호를 계속 대기하다가 좌·우가 들어오는 대로 자동 반영.
     실제 구현에서는 BLE characteristic notify 구독으로 대체한다. */
  useEffect(() => {
    clearAll();
    setLive(null);
    if (!auto) return;
    const order = ["od", "os"].filter((e) => vals[e] == null);
    if (!order.length) return;
    const stamp = () => { const d = new Date(); return `${_pad(d.getHours())}:${_pad(d.getMinutes())}:${_pad(d.getSeconds())}`; };
    order.forEach((eye, i) => {
      timers.current.push(setTimeout(() => setLive(eye), 700 + i * 2100));
      timers.current.push(setTimeout(() => {
        const v = +((eye === "od" ? baseOD : 15.4) + (Math.random() - 0.5) * 1.6).toFixed(1);
        const at = stamp();
        setVals((o) => ({ ...o, [eye]: v }));
        setRecv((o) => ({ ...o, [eye]: ampm(at) }));
        setLog((l) => [{ eye, v, at: ampm(at), re: l.some((x) => x.eye === eye) }, ...l]);
        setMTime(at);
        setLive(null);
      }, 1900 + i * 2100));
    });
    return clearAll;
  }, [auto, round]);

  const remeasure = () => { clearAll(); setVals({ od: null, os: null }); setRecv({ od: null, os: null }); setLive(null); setRound((r) => r + 1); };
  const save = () => {
    if (!hasAny) return;
    const eye = bothDone ? "both" : vals.od != null ? "od" : "os";
    onSave({ od: vals.od, os: vals.os, date: mDate, time: mTime.slice(0, 5), src: log.length ? "auto" : "manual", eye, ctx });
  };

  return (
    <Card style={{ padding: 0, overflow: "hidden", border: `1.5px solid ${C.mintDeep}` }}>
      <div className="flex items-center justify-between" style={{ padding: "13px 16px", borderBottom: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2">
          <Gauge size={17} color={C.primary} />
          <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>안압 측정</span>
        </div>
        <X size={20} color={C.sub} className="cursor-pointer" onClick={onClose} />
      </div>

      {/* 측정일 · 측정시간 */}
      <div style={{ padding: "13px 16px", background: C.bg, borderBottom: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sub }}>측정일</span>
          <input type="date" value={mDate} max={isoDate(new Date())} onChange={(e) => setMDate(e.target.value)}
            style={{ ...inpSm, width: 158, textAlign: "center", fontWeight: 700 }} />
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, lineHeight: 1.35 }}>측정시간<br /><span style={{ fontSize: 10.5, fontWeight: 500 }}>(오전/오후 포함)</span></span>
          <div className="flex flex-col items-end" style={{ gap: 3 }}>
            <input type="time" step="1" value={mTime} onChange={(e) => setMTime(e.target.value)}
              style={{ ...inpSm, width: 158, textAlign: "center", fontWeight: 700 }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.primary }}>{ampm(mTime)}</span>
          </div>
        </div>
      </div>

      {/* 자동측정 토글 */}
      <div className="flex items-center justify-between" style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2">
          <Bluetooth size={14} color={auto ? C.primary : C.grey} />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>자동측정</span>
          <span style={{ fontSize: 10.5, color: auto ? C.primary : C.gold, fontWeight: 700 }}>
            {auto ? (bothDone ? "측정 완료" : live ? `${live === "od" ? "우안" : "좌안"} 신호 수신 중` : "기기 신호 대기 중") : "수기 입력 모드"}
          </span>
        </div>
        <div onClick={() => setAuto(!auto)} className="cursor-pointer flex items-center"
          style={{ width: 46, height: 26, borderRadius: 99, background: auto ? C.primary : C.mintDeep, padding: 3, justifyContent: auto ? "flex-end" : "flex-start", transition: "all .15s" }}>
          <span style={{ width: 20, height: 20, borderRadius: 99, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
        </div>
      </div>

      {/* 현재 입력/측정치 */}
      <div style={{ padding: "14px 16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>현재 입력/측정치</span>
          {auto
            ? <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: C.low }}><Sparkles size={11} /> 수기 수정 가능</span>
            : <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: C.gold }}><Sparkles size={11} /> 좌·우 직접 입력</span>}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <EyeValueSlot eye="od" label="우안 OD" target={targetOD} value={vals.od} live={live === "od"} receivedAt={recv.od} manual={!auto}
            onChange={(v) => setVals((o) => ({ ...o, od: v }))} />
          <EyeValueSlot eye="os" label="좌안 OS" target={targetOS} value={vals.os} live={live === "os"} receivedAt={recv.os} manual={!auto}
            onChange={(v) => setVals((o) => ({ ...o, os: v }))} />
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 11 }}>
          {auto ? (
            <>
              <span style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5, textAlign: "center" }}>
                {bothDone ? "좌·우 측정이 모두 반영되었습니다. 값을 확인하고 저장하세요."
                          : "CVT200을 눈에 맞추면 좌·우가 자동으로 구분되어 위 칸에 반영됩니다."}
              </span>
              {hasAny && (
                <span onClick={remeasure} className="cursor-pointer flex items-center gap-1 flex-shrink-0" style={{ fontSize: 11, fontWeight: 800, color: C.primary }}>
                  <RefreshCw size={11} /> 다시 측정
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5, textAlign: "center" }}>
              병원에서 측정한 값이나 다른 기기의 값을 직접 기록합니다. 한쪽만 입력해도 저장됩니다.
            </span>
          )}
        </div>

        {/* 기기 수신 이력 */}
        {auto && log.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.sub, marginBottom: 6 }}>기기 수신 이력</div>
            <div className="flex flex-col gap-1">
              {log.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                  <span style={{ fontWeight: 800, color: "#fff", background: r.eye === "od" ? C.od : C.os, padding: "1px 7px", borderRadius: 99, fontSize: 9.5 }}>{r.eye === "od" ? "우안" : "좌안"}</span>
                  <span style={{ fontWeight: 800, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{r.v.toFixed(1)}</span>
                  <span style={{ color: C.sub }}>mmHg</span>
                  {r.re && <span style={{ fontSize: 9.5, fontWeight: 700, color: C.mid, background: C.midSoft, padding: "1px 6px", borderRadius: 99 }}>재측정 갱신</span>}
                  <span style={{ color: C.grey, marginLeft: "auto" }}>{r.at}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 측정 상황 */}
        {hasAny && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, marginBottom: 6 }}>측정 상황 (선택)</div>
            <div className="flex flex-wrap" style={{ gap: 5 }}>
              {CTX_OPTS.map((o) => (
                <button key={o} onClick={() => setCtx(ctx === o ? "" : o)} className="cursor-pointer"
                  style={{ border: `1px solid ${ctx === o ? C.primary : C.line}`, background: ctx === o ? C.mint : "#fff", color: ctx === o ? C.primary : C.sub, borderRadius: 999, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>{o}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 취소 · 저장 */}
      <div className="flex gap-2.5" style={{ padding: "0 16px 16px" }}>
        <button onClick={onClose} className="cursor-pointer flex items-center justify-center gap-1.5"
          style={{ flex: 1, border: `1.5px solid ${C.high}45`, background: "#fff", color: C.high, borderRadius: 13, padding: "13px 0", fontSize: 14.5, fontWeight: 800, fontFamily: FONT }}>
          <X size={16} /> 취소
        </button>
        <button onClick={save} disabled={!hasAny} className="cursor-pointer flex items-center justify-center gap-1.5"
          style={{ flex: 1.4, border: "none", background: hasAny ? C.low : C.mintDeep, color: "#fff", borderRadius: 13, padding: "13px 0", fontSize: 15, fontWeight: 800, fontFamily: FONT }}>
          <Check size={17} strokeWidth={3} /> 저장
        </button>
      </div>
      {!hasAny && <div style={{ fontSize: 10.5, color: C.sub, textAlign: "center", padding: "0 16px 14px", marginTop: -8 }}>측정값이 하나 이상 있어야 저장할 수 있습니다.</div>}
    </Card>
  );
}
function MeasureRow({ s, targetOD, targetOS, onRemove }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{s.t}</span>
        <EyeBadge eye={s.eye} small />
        <span style={{ fontSize: 9.5, fontWeight: 700, color: s.src === "manual" ? C.gold : C.primary, background: s.src === "manual" ? C.goldSoft : C.mint, padding: "1px 6px", borderRadius: 99 }}>{s.src === "manual" ? "수동" : "자동"}</span>
        {s.ctx && <span style={{ fontSize: 10.5, color: C.sub }}>· {s.ctx}</span>}
      </div>
      <div className="flex items-center gap-3" style={{ fontVariantNumeric: "tabular-nums" }}>
        {s.od != null && <span style={{ fontSize: 13, color: s.od > targetOD ? C.high : C.od, fontWeight: 700 }}>OD {s.od.toFixed(1)}</span>}
        {s.os != null && <span style={{ fontSize: 13, color: s.os > targetOS ? C.high : C.os, fontWeight: 700 }}>OS {s.os.toFixed(1)}</span>}
        {onRemove && <Trash2 size={14} color={C.grey} className="cursor-pointer" onClick={() => onRemove(s.id)} />}
      </div>
    </div>
  );
}

/* ============================================================
   HOME
   ============================================================ */
function HomeScreen({ account, sessions, meds, targetOD, targetOS, go, medUp, medOver, rent, rentTo, bottles, level, adhWin, streak }) {
  const odS = sessions.filter((s) => s.od != null), osS = sessions.filter((s) => s.os != null);
  const lastOD = odS.length ? odS[odS.length - 1].od : null;
  const lastOS = osS.length ? osS[osS.length - 1].os : null;
  const week = useMemo(() => trendData("2주").slice(-7), []);
  const sched = meds.filter((m) => m.time !== "필요 시");
  const done = sched.filter((m) => m.taken).length;
  const pct = sched.length ? Math.round((done / sched.length) * 100) : 0;
  const alertN = medUp.length + medOver.length;
  /* 최근 30일 순응도 — 실제 점안 기록에서 계산 */
  const adh30 = useMemo(() => {
    const f = isoDate(new Date(new Date(TODAY_REF).setDate(TODAY_REF.getDate() - 30)));
    return overallAdherence(f, TODAY_STR, meds).pct;
  }, [meds]);

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <Eyebrow color={C.primary}>녹내장 통합관리</Eyebrow>
        <div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>{account.name}님, 안녕하세요</div>
        <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
          <JoinBadge join={account.join} />
          <span style={{ fontSize: 11.5, color: C.sub }}>목표 OD {targetOD} / OS {targetOS}</span>
        </div>
      </div>

      {account.mode === "guest" && (
        <Card style={{ padding: 12, background: C.goldSoft, border: `1px solid ${C.gold}40` }}>
          <div className="flex items-center gap-2.5">
            <Info size={16} color={C.gold} className="flex-shrink-0" />
            <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.45, flex: 1 }}>비회원 모드입니다. 기록이 이 기기에만 저장되고 의료진에게 전송되지 않습니다.</div>
          </div>
        </Card>
      )}

      {level && level.key !== "ok" && (
        <Card onClick={() => go("drops")} className="cursor-pointer" style={{ padding: 13, background: level.bg, border: `1px solid ${level.c}40` }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", color: level.c }}><level.icon size={18} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{level.title}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: level.c, padding: "1px 8px", borderRadius: 99 }}>{adhWin.pct}%</span>
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 1.45 }}>
                최근 {ADH_ESC_CFG_INIT.window}일 점안을 {adhWin.missed}회 거르셨습니다. {level.desc}
              </div>
            </div>
            <ChevronRight size={18} color={C.sub} />
          </div>
        </Card>
      )}

      {(alertN > 0 || rent || bottles.length > 0) && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {medOver.length > 0 && (
            <div onClick={() => go("drops")} className="cursor-pointer flex items-center gap-3" style={{ padding: "12px 14px", background: C.highSoft, borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: C.high }}><Droplets size={16} /></div>
              <div className="flex-1"><div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>점안 시간이 지났습니다</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{medOver[0].name} · {medOver[0].late}분 경과</div></div>
              <ChevronRight size={16} color={C.sub} />
            </div>
          )}
          {medUp.length > 0 && (
            <div onClick={() => go("drops")} className="cursor-pointer flex items-center gap-3" style={{ padding: "12px 14px", background: C.midSoft, borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: C.mid }}><Bell size={16} /></div>
              <div className="flex-1"><div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>곧 점안 시간입니다</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{medUp[0].name} · {medUp[0].diff}분 후 ({medUp[0].time})</div></div>
              <ChevronRight size={16} color={C.sub} />
            </div>
          )}
          {bottles.map((x) => (
            <div key={x.med.id} onClick={() => go("drops")} className="cursor-pointer flex items-center gap-3" style={{ padding: "12px 14px", background: x.b.bg, borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: x.b.c }}><Package size={16} /></div>
              <div className="flex-1"><div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{x.b.k === "expired" ? "점안제 폐기 필요" : x.b.k === "out" ? "점안제 소진" : "점안제 교체 예정"}</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{x.med.name} · {x.b.label}</div></div>
              <ChevronRight size={16} color={C.sub} />
            </div>
          ))}
          {rent && (
            <div onClick={() => go("settings")} className="cursor-pointer flex items-center gap-3" style={{ padding: "12px 14px", background: rent.bg }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: rent.c }}><rent.icon size={16} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5"><span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{rent.title}</span><span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", background: rent.c, padding: "1px 7px", borderRadius: 99 }}>{rent.dd >= 0 ? `D-${rent.dd}` : `+${-rent.dd}일`}</span></div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{rent.msg}</div>
              </div>
              <ChevronRight size={16} color={C.sub} />
            </div>
          )}
        </Card>
      )}

      <Card style={{ padding: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>최근 안압 · {sessions.length ? sessions[sessions.length - 1].t : "-"}</span>
          <DeviceChip icon={Bluetooth} label="CVT200 연결됨" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IOPGauge value={lastOD} target={targetOD} eye="OD" />
          <IOPGauge value={lastOS} target={targetOS} eye="OS" />
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginTop: 6, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          <Legend c={C.low} t="목표 이내" /><Legend c={C.mid} t="근접(+3)" /><Legend c={C.high} t="초과" />
        </div>
      </Card>

      <div className="flex gap-2.5">
        <button onClick={() => go("iop")} className="cursor-pointer flex items-center justify-center gap-2"
          style={{ flex: 1, border: "none", borderRadius: 16, padding: "14px 0", background: C.primary, color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: FONT }}><Gauge size={17} /> 안압 측정</button>
        <button onClick={() => go("drops")} className="cursor-pointer flex items-center justify-center gap-2"
          style={{ flex: 1, border: `1.5px solid ${C.primary}`, borderRadius: 16, padding: "13px 0", background: "#fff", color: C.primary, fontWeight: 800, fontSize: 14, fontFamily: FONT }}><Droplets size={17} /> 점안 기록</button>
      </div>

      {/* 오늘 점안 요약 */}
      <Card style={{ padding: 16 }} className="cursor-pointer" onClick={() => go("drops")}>
        <SectionTitle icon={Droplets} right={
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10.5, color: C.sub }}>최근 30일</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: adh30 >= ADH_TARGET ? C.low : C.high, background: adh30 >= ADH_TARGET ? C.lowSoft : C.highSoft, padding: "2px 9px", borderRadius: 99 }}>{adh30}%</span>
            <ChevronRight size={16} color={C.sub} />
          </div>
        }>오늘 점안</SectionTitle>
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <div style={{ flex: 1, height: 10, borderRadius: 99, background: C.mint, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.low : C.primary, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: pct === 100 ? C.low : C.primary, fontVariantNumeric: "tabular-nums" }}>{done}/{sched.length}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {sched.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, borderRadius: 99, background: m.taken ? C.lowSoft : "#EEF2F1", color: m.taken ? C.low : C.grey }}>{m.taken ? <Check size={11} strokeWidth={3.5} /> : <Circle size={9} />}</span>
              <span style={{ fontSize: 12, color: C.ink, fontWeight: 600, flex: 1 }}>{m.name}</span>
              <span style={{ fontSize: 11, color: m.taken ? C.low : C.sub }}>{m.taken ? `${m.at} 완료` : m.time}</span>
              {!m.taken && level && level.retry > 0 && <BellRing size={11} color={level.c} />}
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 16 }} className="cursor-pointer" onClick={() => go("iop")}>
        <SectionTitle icon={TrendingUp} right={<ChevronRight size={16} color={C.sub} />}>최근 7일 안압 추세</SectionTitle>
        <IopGraph type="chart" pts={week} height={140} targetOD={targetOD} targetOS={targetOS} />
        <GraphLegend type="chart" eyeFilter="both" />
      </Card>
    </div>
  );
}

/* ============================================================
   안압 (IOP)
   ============================================================ */
function IOPScreen({ sessions, setSessions, targetOD, targetOS, setTargetOD, setTargetOS, rent }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("today");
  const [gtype, setGtype] = useState("chart");
  const [eyeF, setEyeF] = useState("both");
  const [period, setPeriod] = useState("1개월");
  const [from, setFrom] = useState(RANGE_FROM_DEFAULT);
  const [to, setTo] = useState(RANGE_TO_DEFAULT);
  const [dOD, setDOD] = useState(targetOD); const [dOS, setDOS] = useState(targetOS);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDOD(targetOD); setDOS(targetOS); }, [targetOD, targetOS]);
  const dirty = dOD !== targetOD || dOS !== targetOS;
  const pts = period === "custom" ? trendDataRange(from, to) : trendData(period);
  const gmeta = GRAPH_TYPES.find((g) => g.id === gtype);
  const odS = sessions.filter((s) => s.od != null), osS = sessions.filter((s) => s.os != null);
  const odV = odS.map((s) => s.od), osV = osS.map((s) => s.os);
  const avg1 = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null);
  const baseOD = odV.length ? odV.reduce((a, b) => a + b, 0) / odV.length : 16;

  const save = (p) => {
    const [h, mm] = p.time.split(":").map(Number);
    setSessions((ss) => [...ss, { id: "s" + Date.now(), t: p.time, tv: (h || 0) + (mm || 0) / 60, od: p.od, os: p.os, date: p.date, src: p.src, eye: p.eye, ctx: p.ctx || "" }]);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div><Eyebrow color={C.primary}>실시간 측정 · CVT200</Eyebrow><div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>안압 (IOP)</div></div>
        <DeviceChip icon={Bluetooth} label="CVT200" />
      </div>

      {rent && rent.blocked && (
        <Card style={{ padding: 13, background: C.highSoft, border: `1px solid ${C.high}40` }}>
          <div className="flex items-center gap-2.5">
            <WifiOff size={17} color={C.high} className="flex-shrink-0" />
            <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.45 }}><b style={{ color: C.high }}>의료진 전송이 중단된 상태입니다.</b> 대여 기기 반납이 연체되어 측정값이 기기 안에만 저장됩니다.</div>
          </div>
        </Card>
      )}

      {!open ? (
        <Card style={{ padding: 15 }}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>지금 측정하기</div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2, lineHeight: 1.5 }}>CVT200이 좌·우를 자동으로 구분해 전송합니다. 한쪽만 측정해도 기록됩니다.</div>
            </div>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 cursor-pointer"
              style={{ border: "none", borderRadius: 14, padding: "12px 18px", background: C.primary, color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: FONT }}><Gauge size={17} /> 측정</button>
          </div>
        </Card>
      ) : <MeasurePanel onClose={() => setOpen(false)} onSave={save} targetOD={targetOD} targetOS={targetOS} baseOD={baseOD} />}

      <Card style={{ padding: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>최근 측정 · {sessions.length ? sessions[sessions.length - 1].t : "-"}</span>
          <span style={{ fontSize: 11, color: C.sub }}>오늘 {sessions.length}회</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IOPGauge value={odV.length ? odS[odS.length - 1].od : null} target={targetOD} eye="OD" />
          <IOPGauge value={osV.length ? osS[osS.length - 1].os : null} target={targetOS} eye="OS" />
        </div>
      </Card>

      {/* 목표 안압 */}
      <Card style={{ padding: 14 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <Gauge size={16} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>목표 안압</span><span style={{ fontSize: 10.5, color: C.sub }}>주치의와 상의한 값</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {[{ l: "우안 OD", v: dOD, set: setDOD, col: C.od }, { l: "좌안 OS", v: dOS, set: setDOS, col: C.os }].map((t) => (
            <div key={t.l} className="flex items-center gap-3" style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.col, width: 62, flexShrink: 0 }}>{t.l}</span>
              <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
                <button onClick={() => t.set(Math.max(8, t.v - 1))} className="cursor-pointer" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, width: 30, height: 30, fontSize: 17, fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>−</button>
                <input type="number" min={8} max={30} value={t.v} onChange={(e) => { const n = Number(e.target.value); if (!isNaN(n)) t.set(Math.min(30, Math.max(8, n))); }}
                  style={{ width: 48, textAlign: "center", border: "none", outline: "none", fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: FONT, background: "transparent" }} />
                <button onClick={() => t.set(Math.min(30, t.v + 1))} className="cursor-pointer" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, width: 30, height: 30, fontSize: 17, fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>＋</button>
                <span style={{ fontSize: 11, color: C.sub, width: 34, flexShrink: 0 }}>mmHg</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setTargetOD(dOD); setTargetOS(dOS); setSaved(true); setTimeout(() => setSaved(false), 2000); }} disabled={!dirty} className="cursor-pointer flex items-center justify-center gap-1.5"
          style={{ width: "100%", border: "none", borderRadius: 11, padding: "11px 0", marginTop: 10, fontSize: 14, fontWeight: 800, fontFamily: FONT, background: saved ? C.low : dirty ? C.primary : C.mintDeep, color: saved || dirty ? "#fff" : C.sub }}>
          {saved ? <><Check size={16} strokeWidth={3} /> 저장됨</> : dirty ? "목표 안압 저장" : "저장된 상태"}
        </button>
      </Card>

      <div className="flex" style={{ background: "#fff", borderRadius: 12, padding: 3, border: `1px solid ${C.line}` }}>
        {[{ id: "today", t: "오늘 실시간" }, { id: "trend", t: "기간 분석" }].map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className="cursor-pointer" style={{ flex: 1, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: mode === m.id ? C.mint : "transparent", color: mode === m.id ? C.primary : C.sub }}>{m.t}</button>
        ))}
      </div>

      {mode === "today" ? (
        <Card style={{ padding: 16 }}>
          <SectionTitle icon={Clock}>오늘 측정 ({sessions.length}회)</SectionTitle>
          <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 10 }}>
            <DayStat eye="우안 OD" avg={avg1(odV)} min={odV.length ? Math.min(...odV) : 0} max={odV.length ? Math.max(...odV) : 0} col={C.od} />
            <DayStat eye="좌안 OS" avg={avg1(osV)} min={osV.length ? Math.min(...osV) : 0} max={osV.length ? Math.max(...osV) : 0} col={C.os} />
          </div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <ReferenceArea y1={12} y2={targetOS + 1} fill={C.low} fillOpacity={0.08} />
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis type="number" dataKey="tv" domain={[6, 24]} ticks={[6, 10, 14, 18, 22]} tickFormatter={(v) => `${v}시`} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} />
                <YAxis type="number" domain={[12, 22]} tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} width={38} tickMargin={4} />
                <ReferenceLine y={targetOD} stroke={C.low} strokeDasharray="3 3" />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} formatter={(v, n) => [`${v} mmHg`, n === "od" ? "우안" : "좌안"]} labelFormatter={() => ""} />
                <Scatter name="od" data={odS} dataKey="od" fill={C.od} />
                <Scatter name="os" data={osS} dataKey="os" fill={C.os} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4" style={{ marginTop: 4 }}><Legend c={C.od} t="우안 OD" /><Legend c={C.os} t="좌안 OS" /><Legend c={C.low} t="목표선" soft /></div>
          <div className="flex flex-col" style={{ marginTop: 8 }}>
            {[...sessions].reverse().map((s) => <MeasureRow key={s.id} s={s} targetOD={targetOD} targetOS={targetOS} onRemove={(id) => setSessions((ss) => ss.filter((x) => x.id !== id))} />)}
          </div>
        </Card>
      ) : (
        <>
          <Card style={{ padding: 14 }}>
            <PeriodPicker period={period} from={from} to={to} onPreset={setPeriod} onFrom={(v) => { setFrom(v); setPeriod("custom"); }} onTo={(v) => { setTo(v); setPeriod("custom"); }} />
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Activity} right={<span style={{ fontSize: 11, color: C.sub }}>총 {pts.reduce((a, p) => a + p.cnt, 0)}회</span>}>그래프</SectionTitle>
            <GraphTypeSwitch value={gtype} onChange={setGtype} />
            <div className="flex items-center justify-between" style={{ margin: "10px 0 8px" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.primary }}>{gmeta.ko}</span>
              <EyeFilterSwitch value={eyeF} onChange={setEyeF} />
            </div>
            <IopGraph type={gtype} pts={pts} height={195} targetOD={targetOD} targetOS={targetOS} eyeFilter={eyeF} />
            <GraphLegend type={gtype} eyeFilter={eyeF} />
            <div style={{ fontSize: 11, color: C.sub, marginTop: 10, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>{gmeta.desc}</div>
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Droplets} right={<span style={{ fontSize: 11, color: C.high }}>누락 {pts.filter((p) => p.missed).length}일</span>}>점안 순응도 ↔ 안압</SectionTitle>
            <AdhIopChart data={pts} height={175} />
            <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginTop: 6 }}>
              <Legend c={C.od} t="우안" /><Legend c={C.os} t="좌안" /><Legend c={C.high} t="점안 누락일" /><Legend c={C.mintDeep} t="순응도(%)" />
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
              점안을 거른 날(붉은 점)에 안압이 함께 올라가는지 확인해 보세요. 통계적 인과 판정이 아닌 참고용 병렬 표시입니다.
            </div>
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionTitle icon={TrendingUp}>일중 변동폭</SectionTitle>
            <FlucChart data={pts} height={140} />
            <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 6 }}>
              <Legend c={C.primary} t="2 미만" /><Legend c={C.mid} t="2–5" /><Legend c={C.high} t="5 이상" />
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
              하루 중 최고와 최저 안압의 차이입니다. <b style={{ color: C.primary }}>2 mmHg 미만</b>이면 안정적이고, <b style={{ color: C.mid }}>2–5</b>는 관찰이 필요하며, <b style={{ color: C.high }}>5 이상</b>이 반복되면 평균 안압이 정상이어도 시신경에 부담이 될 수 있습니다.
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ============================================================
   ★ 점안 관리 (전면 개선)
   좌/우안 개별 체크 · 약병 수명·잔량 · 부작용 기록 · 순응도 분석
   ============================================================ */
function BottleBar({ m }) {
  const b = bottleState(m);
  const left = dropsLeft(m);
  const pct = m.dose === "다회용"
    ? (m.dropsTotal ? Math.max(0, Math.round((left / m.dropsTotal) * 100)) : 0)
    : (m.unitsLeft != null ? Math.min(100, m.unitsLeft * 4) : 0);
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>
          <Package size={11} /> {m.dose === "다회용" ? "잔량 · 개봉 후 사용기한" : "남은 개수"}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: b.c, background: b.bg, padding: "2px 8px", borderRadius: 99 }}>{b.label}</span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: C.mint, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: b.c, borderRadius: 99 }} />
      </div>
      {m.dose === "다회용" && (
        <div style={{ fontSize: 10, color: C.sub, marginTop: 3 }}>
          개봉일 {m.openedAt || "-"} · 약 {left != null ? left : "-"}방울 남음 (총 {m.dropsTotal}방울 기준)
        </div>
      )}
    </div>
  );
}
/* 좌/우안 개별 점안 체크 */
function EyeCheck({ m, onDrop }) {
  const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
  return (
    <div className="flex" style={{ gap: 6 }}>
      {eyes.map((e) => {
        const at = m.takenEye && m.takenEye[e];
        return (
          <button key={e} onClick={(ev) => { ev.stopPropagation(); onDrop(m.id, e); }} className="cursor-pointer flex items-center justify-center gap-1.5"
            style={{ flex: 1, border: `1.5px solid ${at ? C.low : C.line}`, background: at ? C.lowSoft : "#fff", color: at ? C.low : C.sub, borderRadius: 11, padding: "9px 0", fontSize: 12, fontWeight: 800, fontFamily: FONT }}>
            {at ? <Check size={13} strokeWidth={3.5} /> : <Droplet size={13} />}
            {e === "od" ? "우안" : "좌안"}{at ? ` ${at}` : ""}
          </button>
        );
      })}
    </div>
  );
}
function MedCard({ m, nowMin, onDrop, onOpen, boosted, level, dev, waiting }) {
  const auto = m.dropMode === "auto" && !!dev;
  const st = medStatus(m, nowMin);
  const g = drugClass(m.ingr);
  const b = bottleState(m);
  const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
  const doneN = eyes.filter((e) => m.takenEye && m.takenEye[e]).length;
  const allDone = doneN === eyes.length;
  return (
    <Card style={{ padding: 14, borderColor: allDone ? C.low + "40" : st && st.kind === "late" ? C.high + "40" : C.line }}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => onOpen(m.id)}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, borderRadius: 13, background: allDone ? C.lowSoft : g.c + "16", color: allDone ? C.low : g.c }}>
          {allDone ? <Check size={20} strokeWidth={3} /> : st && st.kind === "late" ? <Bell size={18} /> : <Droplets size={19} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5" style={{ flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{m.name}</span>
            <ClassBadge ingr={m.ingr} small />
            <DoseBadge dose={m.dose} small />
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{m.ingr} · {m.maker}</div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 4, flexWrap: "wrap" }}>
            <EyeBadge eye={m.eye} small />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>{m.time === "필요 시" ? "필요 시" : m.time}</span>
            <span style={{ fontSize: 10.5, color: C.sub }}>{m.freq}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: auto ? C.primary : C.gold, background: auto ? C.mint : C.goldSoft, padding: "1px 7px", borderRadius: 99 }}>{auto ? "자동 점안" : "수동 기록"}</span>
            <MonitorBadge dev={dev} small />
          </div>
          {st && st.kind !== "done" && <div style={{ fontSize: 11, fontWeight: 700, color: st.c, marginTop: 3 }}>{st.kind === "soon" ? "⏰ " : st.kind === "late" ? "🔔 " : ""}{st.label}</div>}
          {boosted && !allDone && (
            <div className="flex items-center gap-1" style={{ fontSize: 10.5, fontWeight: 700, color: C.mid, marginTop: 3 }}>
              <BellRing size={11} /> 이 시간대는 자주 놓쳐 알림이 강화되었습니다
            </div>
          )}
        </div>
        <ChevronRight size={16} color={C.grey} className="flex-shrink-0" />
      </div>

      {auto && waiting && !allDone && (
        <div className="flex items-center gap-2" style={{ marginTop: 10, padding: "9px 11px", borderRadius: 11, background: C.mint }}>
          <RefreshCw size={13} color={C.primary} className="animate-spin flex-shrink-0" />
          <span style={{ fontSize: 11, color: C.ink, lineHeight: 1.4, flex: 1 }}>
            <b style={{ color: C.primary }}>{dev.label}</b> 신호 대기 중 · 점안하면 좌·우가 자동 기록됩니다.
          </span>
        </div>
      )}
      {m.dropMode === "auto" && !dev && (
        <div className="flex items-center gap-2" style={{ marginTop: 10, padding: "9px 11px", borderRadius: 11, background: C.goldSoft }}>
          <AlertCircle size={13} color={C.gold} className="flex-shrink-0" />
          <span style={{ fontSize: 11, color: C.ink, lineHeight: 1.4, flex: 1 }}>모니터링 기기가 연결되지 않아 자동 기록이 되지 않습니다. 약을 눌러 기기를 연결하세요.</span>
        </div>
      )}
      <div style={{ marginTop: 11 }}>
        <EyeCheck m={m} onDrop={onDrop} />
        {auto && <div style={{ fontSize: 10, color: C.sub, textAlign: "center", marginTop: 5 }}>기기 오류 시 위 버튼으로 직접 기록할 수 있습니다.</div>}
      </div>
      {["expired", "soon", "low", "out"].includes(b.k) && (
        <div className="flex items-center gap-2" style={{ marginTop: 9, padding: "8px 10px", borderRadius: 10, background: b.bg }}>
          <Package size={13} color={b.c} className="flex-shrink-0" />
          <span style={{ fontSize: 11, color: C.ink, lineHeight: 1.4, flex: 1 }}>
            {b.k === "expired" ? "개봉 후 28일이 지났습니다. 새 병으로 교체하세요."
              : b.k === "soon" ? `개봉 후 사용기한이 ${b.left}일 남았습니다.`
              : b.k === "out" ? "남은 개수가 없습니다. 처방 리필이 필요합니다."
              : `남은 개수가 ${b.left}개입니다. 리필을 준비하세요.`}
          </span>
        </div>
      )}
    </Card>
  );
}
function MedDetail({ m, onBack, onOpenBottle, onLogSE, seLog, dev, onOpenPair, onSetMode }) {
  const g = drugClass(m.ingr);
  const b = bottleState(m);
  const mine = seLog.filter((e) => e.med === m.name);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onBack} style={{ color: C.primary }}><ChevronLeft size={20} /><span style={{ fontSize: 14, fontWeight: 700 }}>점안 목록</span></div>
      <Card style={{ padding: 16 }}>
        <div className="flex items-center gap-1.5" style={{ flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{m.name}</span>
          <ClassBadge ingr={m.ingr} /><DoseBadge dose={m.dose} />
        </div>
        <div style={{ fontSize: 12, color: C.sub }}>{m.ingr} · {m.maker}</div>
        <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 12 }}>
          {[
            { l: "용법", v: m.freq }, { l: "점안 부위", v: EYE_LABEL[m.eye] },
            { l: "처방 시작", v: m.rxFrom }, { l: "처방의", v: m.rxBy },
          ].map((r) => (
            <div key={r.l} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
              <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{r.l}</div>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, marginTop: 2 }}>{r.v}</div>
            </div>
          ))}
        </div>
        {m.info ? (
          <div style={{ marginTop: 12 }}><EyakInfo d={m.info} compact /></div>
        ) : (
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginTop: 12, background: C.bg, borderRadius: 11, padding: "10px 12px" }}>{drugDesc(m.ingr)}</div>
        )}
        {m.itemSeq && <div style={{ fontSize: 10, color: C.grey, marginTop: 7, fontFamily: "monospace" }}>품목기준코드 {m.itemSeq} · 식약처 e약은요</div>}
      </Card>

      {/* 점안 모니터링 기기 · 기록 방식 */}
      <Card style={{ padding: 16 }}>
        <SectionTitle icon={Bluetooth} right={<MonitorBadge dev={dev} />}>점안 모니터링 기기</SectionTitle>
        {dev ? (
          <>
            <div className="grid grid-cols-4" style={{ gap: 10 }}>
              {[{ l: "기기", v: dev.label }, { l: "시리얼", v: dev.serial, mono: true }, { l: "배터리", v: `${dev.battery}%`, c: dev.battery <= 20 ? C.high : C.ink }, { l: "펌웨어", v: dev.fw }].map((r) => (
                <div key={r.l}>
                  <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{r.l}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: r.c || C.ink, marginTop: 2, fontFamily: r.mono ? "monospace" : FONT }}>{r.v}</div>
                </div>
              ))}
            </div>
            <button onClick={onOpenPair} className="cursor-pointer flex items-center justify-center gap-1.5"
              style={{ width: "100%", border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 11, padding: "9px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT, marginTop: 12 }}>
              <RefreshCw size={13} /> 기기 변경 · 연결 해제
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.55, marginBottom: 11 }}>
              이 약에 연결된 모니터링 기기가 없습니다. 기기를 연결하면 점안할 때마다 좌·우와 시각이 자동으로 기록됩니다.
            </div>
            <button onClick={onOpenPair} className="cursor-pointer flex items-center justify-center gap-1.5"
              style={{ width: "100%", border: "none", background: C.primary, color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 800, fontFamily: FONT }}>
              <Bluetooth size={14} /> 블루투스 기기 연결
            </button>
          </>
        )}

        <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, marginBottom: 8 }}>점안 기록 방식</div>
          <div className="flex" style={{ gap: 7 }}>
            {[{ id: "auto", t: "자동", d: "기기 신호로 기록", icon: Bluetooth, c: C.primary },
              { id: "manual", t: "수동", d: "직접 체크", icon: Check, c: C.gold }].map((o) => {
              const on = m.dropMode === o.id;
              const blocked = o.id === "auto" && !dev;
              return (
                <div key={o.id} onClick={() => !blocked && onSetMode(o.id)} className={blocked ? "flex flex-col items-center" : "cursor-pointer flex flex-col items-center"}
                  style={{ flex: 1, border: `1.5px solid ${on ? o.c : C.line}`, background: on ? o.c + "12" : "#fff", borderRadius: 12, padding: "11px 6px", opacity: blocked ? 0.5 : 1 }}>
                  <o.icon size={16} color={on ? o.c : C.sub} />
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? o.c : C.ink, marginTop: 4 }}>{o.t}</div>
                  <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{blocked ? "기기 연결 필요" : o.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 16 }}>
        <SectionTitle icon={Package}>약병 관리</SectionTitle>
        <BottleBar m={m} />
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <button onClick={() => onOpenBottle(m.id)} className="cursor-pointer flex items-center justify-center gap-1.5"
            style={{ flex: 1, border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 11, padding: "9px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>
            <Package size={13} /> {m.dose === "다회용" ? "새 병 개봉" : "리필 등록"}
          </button>
          <button className="cursor-pointer flex items-center justify-center gap-1.5"
            style={{ flex: 1, border: "none", background: C.primary, color: "#fff", borderRadius: 11, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>
            <MessageSquare size={13} /> 처방 리필 요청
          </button>
        </div>
        {m.dose === "다회용" && (
          <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5 }}>
            다회용 점안제는 개봉 후 <b style={{ color: C.primary }}>28일</b>이 지나면 오염 위험이 있어 폐기가 권장됩니다. 개봉일을 등록하면 자동으로 알려 드립니다.
          </div>
        )}
      </Card>

      <Card style={{ padding: 16 }}>
        <SectionTitle icon={AlertCircle} right={<span style={{ fontSize: 11, color: C.sub }}>{mine.length}건 기록</span>}>부작용 · 이상반응</SectionTitle>
        <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5, marginBottom: 10 }}>
          이 계열({g.label})에서 흔한 반응: {g.se.join(", ")}
        </div>
        {mine.length > 0 && (
          <div className="flex flex-col" style={{ marginBottom: 10 }}>
            {mine.map((e) => (
              <div key={e.id} className="flex items-center gap-2" style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 11, color: C.sub, width: 78, flexShrink: 0 }}>{e.at.slice(5, 10)}</span>
                <EyeBadge eye={e.eye} small />
                <span style={{ fontSize: 12, color: C.ink, fontWeight: 600, flex: 1 }}>{e.items.join(", ")}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: e.severity === "중등도" ? C.mid : e.severity === "중증" ? C.high : C.sub }}>{e.severity}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => onLogSE(m)} className="cursor-pointer flex items-center justify-center gap-1.5"
          style={{ width: "100%", border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, borderRadius: 11, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><Plus size={14} /> 부작용 기록하기</button>
        <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5 }}>
          기록한 내용은 의료진 웹에 전달되어 약제 변경 판단에 참고됩니다. 호흡 곤란·심한 두근거림 등 전신 증상은 즉시 의료진에게 알리세요.
        </div>
      </Card>
    </div>
  );
}
function SEForm({ med, onCancel, onSubmit }) {
  const [eye, setEye] = useState("both");
  const [items, setItems] = useState([]);
  const [sev, setSev] = useState("경도");
  const [note, setNote] = useState("");
  const g = drugClass(med.ingr);
  const list = Array.from(new Set([...g.se, ...SIDE_EFFECTS]));
  const toggle = (t) => setItems((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]));
  return (
    <Card style={{ padding: 16, border: `1.5px solid ${C.mintDeep}` }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>부작용 기록 · {med.name}</span>
        <X size={20} color={C.sub} className="cursor-pointer" onClick={onCancel} />
      </div>
      <div className="flex flex-col gap-3">
        <Field label="증상이 나타난 눈">
          <div className="flex" style={{ gap: 5 }}>
            {[{ id: "od", t: "우안" }, { id: "os", t: "좌안" }, { id: "both", t: "양안" }].map((o) => (
              <button key={o.id} onClick={() => setEye(o.id)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${eye === o.id ? C.primary : C.line}`, background: eye === o.id ? C.mint : "#fff", color: eye === o.id ? C.primary : C.sub, borderRadius: 10, padding: "8px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>{o.t}</button>
            ))}
          </div>
        </Field>
        <Field label="증상 (복수 선택)">
          <div className="flex flex-wrap" style={{ gap: 5 }}>
            {list.map((t) => (
              <button key={t} onClick={() => toggle(t)} className="cursor-pointer"
                style={{ border: `1px solid ${items.includes(t) ? C.primary : C.line}`, background: items.includes(t) ? C.mint : "#fff", color: items.includes(t) ? C.primary : C.sub, borderRadius: 999, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="정도">
          <ChoiceRow value={sev} set={setSev} opts={["경도", "중등도", "중증"]} />
        </Field>
        <Field label="메모 (선택)"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="언제·얼마나 지속됐는지" style={inp} /></Field>
        {sev === "중증" && (
          <div className="flex items-center gap-2" style={{ background: C.highSoft, borderRadius: 10, padding: "9px 12px" }}>
            <AlertTriangle size={14} color={C.high} className="flex-shrink-0" />
            <span style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.4 }}>증상이 심하면 점안을 중단하고 <b style={{ color: C.high }}>즉시 의료진에게 연락</b>하세요.</span>
          </div>
        )}
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 12, padding: "12px 0", fontSize: 13.5, fontWeight: 700, fontFamily: FONT }}>취소</button>
          <button onClick={() => items.length && onSubmit({ eye, items, severity: sev, note })} disabled={!items.length} className="cursor-pointer"
            style={{ flex: 2, border: "none", background: items.length ? C.primary : C.mintDeep, color: "#fff", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 800, fontFamily: FONT }}>기록 저장</button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- e약은요 의약품 기본정보 ---------- */
function EyakInfo({ d, compact }) {
  const [open, setOpen] = useState(compact ? [] : ["efcyQesitm", "useMethodQesitm"]);
  const toggle = (k) => setOpen((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]));
  const rows = EYAK_FIELDS.filter((f) => d[f.k]);
  if (!rows.length) return null;
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
      <div className="flex items-center gap-1.5" style={{ padding: "9px 12px", background: C.mint }}>
        <FileText size={12} color={C.primary} />
        <span style={{ fontSize: 11.5, fontWeight: 800, color: C.primary }}>의약품 기본정보</span>
        <span style={{ fontSize: 9.5, color: C.sub, marginLeft: "auto" }}>식약처 e약은요</span>
      </div>
      {rows.map((f, i) => {
        const on = open.includes(f.k);
        return (
          <div key={f.k} style={{ borderTop: i > 0 ? `1px solid ${C.line}` : "none" }}>
            <div onClick={() => toggle(f.k)} className="cursor-pointer flex items-center gap-2" style={{ padding: "9px 12px", background: "#fff" }}>
              <f.icon size={12} color={C.sub} className="flex-shrink-0" />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, flex: 1 }}>{f.t}</span>
              {on ? <ChevronUp size={13} color={C.grey} /> : <ChevronDown size={13} color={C.grey} />}
            </div>
            {on && <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, padding: "0 12px 11px 30px" }}>{d[f.k]}</div>}
          </div>
        );
      })}
    </div>
  );
}

function AddMed({ onDone, devices, onPairDraft }) {
  const [tab, setTab] = useState("qr");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [scan, setScan] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [srcTag, setSrcTag] = useState(null);
  const [touched, setTouched] = useState(false);
  const [eye, setEye] = useState("both");
  const [prn, setPrn] = useState(false);
  const [times, setTimes] = useState(["21:00"]);
  const [cName, setCName] = useState(""); const [cIngr, setCIngr] = useState(""); const [cMaker, setCMaker] = useState(""); const [cDose, setCDose] = useState("다회용");
  const [opened, setOpened] = useState(isoDate(new Date()));
  const [units, setUnits] = useState("30");
  const [monitorId, setMonitorId] = useState(null);
  const [mode, setMode] = useState("auto");
  const [pairOpen, setPairOpen] = useState(false);
  const picked = devices.find((d) => d.id === monitorId) || null;
  const chosen = tab === "qr"
    ? (sel ? { name: sel.itemName, ingr: sel.ingr, maker: sel.entpName, dose: sel.dose, itemSeq: sel.itemSeq, info: sel } : null)
    : (cName ? { name: cName, ingr: cIngr, maker: cMaker, dose: cDose } : null);

  /* 검색어 입력 → e약은요 조회 (디바운스 400ms) */
  useEffect(() => {
    if (tab !== "qr") return;
    const k = q.trim();
    if (!k) { setResults([]); setSrcTag(null); setSearching(false); return; }
    setSearching(true); setTouched(true);
    const t = setTimeout(async () => {
      const r = await searchEyak(k);
      setResults(r.items); setSrcTag(r.source); setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [q, tab]);

  const pickDrug = (d) => {
    setSel(d);
    const night = (d.useMethodQesitm || "").includes("저녁") || (d.useMethodQesitm || "").includes("취침");
    const twice = (d.useMethodQesitm || "").includes("1일 2회");
    const thrice = (d.useMethodQesitm || "").includes("1일 3회");
    setTimes(night ? ["22:00"] : thrice ? ["08:00", "14:00", "20:00"] : twice ? ["08:00", "20:00"] : ["08:00"]);
  };
  const doScan = () => { setScan(true); setTimeout(() => { setScan(false); pickDrug(EYAK_DB[0]); }, 1200); };
  const add = () => {
    if (!chosen) return;
    const base = { name: chosen.name, ingr: chosen.ingr || "", maker: chosen.maker || "", itemSeq: chosen.itemSeq || null, info: chosen.info || null, dose: chosen.dose || "다회용", eye, freq: prn ? "필요 시" : `1일 ${times.length}회 · ${times.join("·")}`, src: monitorId ? "device" : "manual", dropMode: monitorId ? mode : "manual", takenEye: {}, taken: false, at: null, rxFrom: isoDate(new Date()), rxBy: "직접 등록", times: prn ? [] : times, openedAt: chosen.dose === "다회용" ? opened : null, dropsTotal: chosen.dose === "다회용" ? 100 : null, dropsUsed: 0, unitsLeft: chosen.dose === "일회용" ? Number(units) || 0 : null };
    const list = prn ? [{ ...base, id: "n" + Date.now(), time: "필요 시" }]
      : times.map((t, i) => ({ ...base, id: "n" + Date.now() + i, time: t, linkOf: i > 0 ? "n" + Date.now() : undefined }));
    onDone(list, monitorId);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onDone(null)} style={{ color: C.primary }}><ChevronLeft size={20} /><span style={{ fontSize: 14, fontWeight: 700 }}>점안 목록</span></div>
      <div><Eyebrow color={C.primary}>점안제 등록</Eyebrow><div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>약 추가</div></div>

      <div className="flex" style={{ background: "#fff", borderRadius: 12, padding: 3, border: `1px solid ${C.line}` }}>
        {[{ id: "qr", t: "QR·검색" }, { id: "manual", t: "직접 입력" }].map((m) => (
          <button key={m.id} onClick={() => setTab(m.id)} className="cursor-pointer" style={{ flex: 1, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: tab === m.id ? C.mint : "transparent", color: tab === m.id ? C.primary : C.sub }}>{m.t}</button>
        ))}
      </div>

      {tab === "qr" ? (
        <>
          <Card style={{ padding: 15 }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 13, background: C.mint, color: C.primary }}>{scan ? <ScanLine size={22} className="animate-spin" /> : <QrCode size={22} />}</div>
              <div className="flex-1"><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{scan ? "스캔 중…" : "약 상자 QR 스캔"}</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>표준코드를 읽어 e약은요 정보를 자동으로 불러옵니다.</div></div>
              <button onClick={doScan} className="cursor-pointer" style={{ border: "none", background: C.primary, color: "#fff", borderRadius: 11, padding: "9px 15px", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>스캔</button>
            </div>
          </Card>
          <div className="flex items-center gap-2" style={{ border: `1px solid ${q ? C.primary : C.line}`, borderRadius: 12, padding: "9px 12px", background: "#fff" }}>
            {searching ? <RefreshCw size={15} color={C.primary} className="animate-spin" /> : <Search size={15} color={C.sub} />}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제품명 · 성분 · 제약사 검색 (예: 라타노프로스트)"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: FONT, color: C.ink }} />
            {q && <X size={15} color={C.grey} className="cursor-pointer" onClick={() => { setQ(""); setSel(null); }} />}
          </div>

          {/* 연동 출처 안내 */}
          <div className="flex items-center gap-1.5" style={{ fontSize: 10.5, color: C.sub, marginTop: -4 }}>
            <FileText size={11} color={C.primary} />
            <span>식품의약품안전처 <b style={{ color: C.primary }}>의약품개요정보(e약은요)</b> 연동
              {srcTag === "local" && <span style={{ color: C.gold }}> · 오프라인 데이터</span>}
              {srcTag === "api" && <span style={{ color: C.low }}> · 실시간 조회</span>}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {searching && (
              <div className="flex items-center justify-center gap-2" style={{ padding: "22px 0", color: C.sub, fontSize: 12.5 }}>
                <RefreshCw size={14} className="animate-spin" /> 의약품 정보를 조회하고 있습니다…
              </div>
            )}
            {!searching && touched && q.trim() && results.length === 0 && (
              <div className="flex flex-col items-center" style={{ padding: "24px 0", color: C.sub }}>
                <Search size={20} color={C.mintDeep} />
                <div style={{ fontSize: 12.5, marginTop: 8 }}>검색 결과가 없습니다.</div>
                <div style={{ fontSize: 11, marginTop: 3, textAlign: "center", lineHeight: 1.5 }}>성분명으로 다시 찾아보거나<br /><b style={{ color: C.primary }}>직접 입력</b> 탭을 이용하세요.</div>
              </div>
            )}
            {!searching && !q.trim() && (
              <>
                <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, background: C.bg, borderRadius: 11, padding: "11px 12px" }}>
                  제품명이나 성분명을 입력하면 식약처 의약품개요정보에서 약을 찾아 <b style={{ color: C.primary }}>효능·사용법·주의사항·이상반응·보관법</b>을 함께 보여 드립니다.
                </div>

                {/* 검색 없이 바로 고르는 대표 안압약 */}
                <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
                  <ListChecks size={13} color={C.primary} />
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>자주 쓰는 녹내장 안압약</span>
                  <span style={{ fontSize: 10.5, color: C.sub }}>바로 선택</span>
                </div>

                {QUICK_GROUPS.map((g) => (
                  <div key={g.label}>
                    <div className="flex items-center gap-1.5" style={{ margin: "6px 0 6px" }}>
                      {g.accent && <span style={{ width: 3, height: 12, borderRadius: 2, background: C.gold }} />}
                      <span style={{ fontSize: 11, fontWeight: 800, color: g.accent ? C.gold : C.sub }}>{g.label}</span>
                      {g.accent && <span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", background: C.gold, padding: "1px 7px", borderRadius: 99 }}>자사</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      {g.seqs.map(eyakBySeq).filter(Boolean).map((d) => {
                        const on = sel && sel.itemSeq === d.itemSeq;
                        return (
                          <Card key={d.itemSeq} style={{ padding: 11, borderColor: on ? C.primary : g.accent ? C.gold + "50" : C.line, background: on ? C.mint : g.accent ? C.goldSoft + "50" : "#fff" }}>
                            <div onClick={() => pickDrug(d)} className="cursor-pointer flex items-center gap-2">
                              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, borderRadius: 9, background: on ? "#fff" : g.accent ? "#fff" : C.bg, color: drugClass(d.ingr).c }}>
                                <Droplets size={15} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5" style={{ flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{d.itemName}</span>
                                  {d.own && <span style={{ fontSize: 9, fontWeight: 800, color: C.gold, background: "#fff", padding: "1px 6px", borderRadius: 99, border: `1px solid ${C.gold}45` }}>대우제약</span>}
                                  <DoseBadge dose={d.dose} small />
                                </div>
                                <div style={{ fontSize: 10.5, color: C.sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {d.ingr}{d.own ? "" : ` · ${d.entpName}`}
                                </div>
                              </div>
                              {on ? <Check size={15} color={C.primary} strokeWidth={3} className="flex-shrink-0" /> : <ChevronRight size={14} color={C.grey} className="flex-shrink-0" />}
                            </div>
                            {on && (
                              <>
                                <div style={{ fontSize: 11, color: C.ink, marginTop: 8, lineHeight: 1.5 }}>{d.efcyQesitm}</div>
                                <div style={{ marginTop: 9 }}><EyakInfo d={d} compact /></div>
                                <div style={{ fontSize: 9.5, color: C.grey, marginTop: 6, fontFamily: "monospace" }}>품목기준코드 {d.itemSeq}</div>
                              </>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {!searching && results.map((d) => {
              const on = sel && sel.itemSeq === d.itemSeq;
              return (
                <Card key={d.itemSeq} style={{ padding: 12, borderColor: on ? C.primary : C.line, background: on ? C.mint : "#fff" }}>
                  <div onClick={() => pickDrug(d)} className="cursor-pointer">
                    <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{d.itemName}</span>
                      <ClassBadge ingr={d.ingr} small />
                      <DoseBadge dose={d.dose} small />
                      {on && <Check size={14} color={C.primary} strokeWidth={3} style={{ marginLeft: "auto" }} />}
                    </div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{d.ingr} · {d.entpName}</div>
                    <div style={{ fontSize: 11, color: C.ink, marginTop: 5, lineHeight: 1.5 }}>{d.efcyQesitm}</div>
                    <div style={{ fontSize: 10, color: C.grey, marginTop: 4, fontFamily: "monospace" }}>품목기준코드 {d.itemSeq}</div>
                  </div>
                  {on && <div style={{ marginTop: 10 }}><EyakInfo d={d} /></div>}
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card style={{ padding: 15 }}>
          <div className="flex flex-col gap-2.5">
            <Field label="제품명" req><input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="예: 잘타라노 점안액" style={inp} /></Field>
            <Field label="성분"><input value={cIngr} onChange={(e) => setCIngr(e.target.value)} placeholder="예: 라타노프로스트" style={inp} /></Field>
            <div className="flex gap-2.5">
              <Field label="제약회사"><input value={cMaker} onChange={(e) => setCMaker(e.target.value)} placeholder="제조사" style={inp} /></Field>
              <Field label="제형"><ChoiceRow value={cDose} set={setCDose} opts={["다회용", "일회용"]} /></Field>
            </div>
          </div>
        </Card>
      )}

      {chosen && (
        <Card style={{ padding: 15 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 11, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>용법 설정</span>
            <span style={{ fontSize: 11, color: C.sub }}>{chosen.name}</span>
            {chosen.itemSeq && <span style={{ fontSize: 9.5, fontWeight: 700, color: C.primary, background: C.mint, padding: "1px 7px", borderRadius: 99 }}>e약은요 연동</span>}
          </div>
          <div className="flex flex-col gap-3">
            <Field label="점안 부위">
              <div className="flex" style={{ gap: 5 }}>
                {[{ id: "od", t: "우안만" }, { id: "os", t: "좌안만" }, { id: "both", t: "양안" }].map((o) => (
                  <button key={o.id} onClick={() => setEye(o.id)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${eye === o.id ? C.primary : C.line}`, background: eye === o.id ? C.mint : "#fff", color: eye === o.id ? C.primary : C.sub, borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>{o.t}</button>
                ))}
              </div>
            </Field>
            <Field label="투약 방식"><ChoiceRow value={prn ? "필요 시" : "정해진 시간"} set={(v) => setPrn(v === "필요 시")} opts={["정해진 시간", "필요 시"]} /></Field>
            {!prn && (
              <Field label={`투약 시간 (1일 ${times.length}회)`}>
                <div className="flex flex-col gap-2">
                  {times.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={t} onChange={(e) => setTimes((ts) => ts.map((x, k) => (k === i ? e.target.value : x)))} style={{ ...inp, flex: 1 }} />
                      {times.length > 1 && <Trash2 size={16} color={C.grey} className="cursor-pointer" onClick={() => setTimes((ts) => ts.filter((_, k) => k !== i))} />}
                    </div>
                  ))}
                  {times.length < 4 && (
                    <button onClick={() => setTimes((ts) => [...ts, "20:00"])} className="cursor-pointer flex items-center justify-center gap-1.5"
                      style={{ border: `1.5px dashed ${C.line}`, background: "#fff", color: C.sub, borderRadius: 11, padding: "9px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}><Plus size={14} /> 시간 추가</button>
                  )}
                </div>
              </Field>
            )}
            {chosen.dose === "다회용"
              ? <Field label="개봉일 (개봉 후 28일 폐기 알림)"><input type="date" value={opened} max={isoDate(new Date())} onChange={(e) => setOpened(e.target.value)} style={inp} /></Field>
              : <Field label="남은 개수 (일회용 앰플)"><input type="number" min="0" value={units} onChange={(e) => setUnits(e.target.value)} style={inp} /></Field>}
            {/* 점안 모니터링 기기 매칭 */}
            <div style={{ border: `1px solid ${picked ? C.primary : C.line}`, borderRadius: 12, padding: "12px 13px", background: picked ? C.mint : C.bg }}>
              <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
                <Bluetooth size={13} color={C.primary} />
                <span style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>점안 모니터링 기기</span>
                <span style={{ fontSize: 10, color: C.sub }}>약 1개당 1대</span>
              </div>
              {picked ? (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: C.primary }}><Bluetooth size={16} /></div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{picked.label}</div>
                    <div style={{ fontSize: 10, color: C.sub, fontFamily: "monospace" }}>{picked.serial} · 배터리 {picked.battery}%</div>
                  </div>
                  <button onClick={() => setPairOpen(true)} className="cursor-pointer" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, padding: "6px 11px", fontSize: 11, fontWeight: 700, fontFamily: FONT }}>변경</button>
                </div>
              ) : (
                <button onClick={() => setPairOpen(true)} className="cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ width: "100%", border: `1.5px dashed ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 11, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>
                  <Bluetooth size={14} /> 블루투스 기기 연결하기
                </button>
              )}
            </div>

            <Field label="점안 기록 방식">
              <div className="flex" style={{ gap: 7 }}>
                {[{ id: "auto", t: "자동", d: "기기 신호로 기록", icon: Bluetooth, c: C.primary },
                  { id: "manual", t: "수동", d: "직접 체크", icon: Check, c: C.gold }].map((o) => {
                  const on = mode === o.id;
                  const blocked = o.id === "auto" && !picked;
                  return (
                    <div key={o.id} onClick={() => !blocked && setMode(o.id)} className={blocked ? "flex flex-col items-center" : "cursor-pointer flex flex-col items-center"}
                      style={{ flex: 1, border: `1.5px solid ${on ? o.c : C.line}`, background: on ? o.c + "12" : "#fff", borderRadius: 12, padding: "11px 6px", opacity: blocked ? 0.5 : 1 }}>
                      <o.icon size={16} color={on ? o.c : C.sub} />
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? o.c : C.ink, marginTop: 4 }}>{o.t}</div>
                      <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{blocked ? "기기 연결 필요" : o.d}</div>
                    </div>
                  );
                })}
              </div>
            </Field>

            <button onClick={add} className="cursor-pointer" style={{ border: "none", borderRadius: 13, padding: "13px 0", background: C.primary, color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: FONT }}>등록하기</button>
          </div>
        </Card>
      )}

      {pairOpen && (
        <BtPairModal med={{ id: "draft", name: chosen ? chosen.name : "새 점안제" }} devices={devices}
          onClose={() => setPairOpen(false)}
          onPair={(id) => { setMonitorId(id); setMode("auto"); }}
          onUnpair={() => { setMonitorId(null); setMode("manual"); }} />
      )}
    </div>
  );
}
function DropsScreen({ meds, setMeds, seLog, setSeLog, nowMin, medUp, medOver, push, level, adhWin, streak, slots, boostSlots, escOn, setEscOn, caregiver, setCaregiver }) {
  const [view, setView] = useState("today");
  const [detailId, setDetailId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [seFor, setSeFor] = useState(null);
  const [dropDevs, setDropDevs] = useState(DROP_DEVICES_INIT);
  const [pairFor, setPairFor] = useState(null);
  const autoFired = useRef(new Set());
  const [period, setPeriod] = useState("1개월");
  const [from, setFrom] = useState(RANGE_FROM_DEFAULT);
  const [to, setTo] = useState(RANGE_TO_DEFAULT);
  const pts = period === "custom" ? trendDataRange(from, to) : trendData(period);

  /* --- 실제 점안 기록(DOSE_LOG)에서 계산 --- */
  const rangeFrom = period === "custom" ? from : isoDate(new Date(new Date(TODAY_REF).setDate(TODAY_REF.getDate() - ({ "2주": 14, "1개월": 30, "3개월": 90, "6개월": 120, "1년": 120, "누적": 120 }[period] || 30))));
  const rangeTo = period === "custom" ? to : TODAY_STR;
  const adhAll = overallAdherence(rangeFrom, rangeTo, meds);
  const byMed = adherenceByMed(rangeFrom, rangeTo);
  const bySlot = adherenceBySlot(rangeFrom, rangeTo);
  const byEye = adherenceByEye(rangeFrom, rangeTo);
  const byDow = adherenceByDow(rangeFrom, rangeTo);
  const worstDow = byDow.filter((d) => d.pct != null).sort((a, b) => a.pct - b.pct)[0];
  const { causes } = rootCauses(rangeFrom, rangeTo, meds);
  const missPts = pts.filter((p) => p.missed), okPts = pts.filter((p) => !p.missed);
  const gap = missPts.length && okPts.length
    ? (missPts.reduce((a, p) => a + p.odAvg, 0) / missPts.length - okPts.reduce((a, p) => a + p.odAvg, 0) / okPts.length).toFixed(1) : 0;

  const drop = (id, e) => setMeds((ms) => ms.map((m) => {
    if (m.id !== id) return m;
    const te = { ...(m.takenEye || {}) };
    if (te[e]) delete te[e]; else te[e] = nowHM();
    const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
    const all = eyes.every((x) => te[x]);
    const used = (m.dropsUsed || 0) + (te[e] ? 1 : -1);
    return { ...m, takenEye: te, taken: all, at: all ? te[eyes[eyes.length - 1]] : null, dropsUsed: m.dose === "다회용" ? Math.max(0, used) : m.dropsUsed, unitsLeft: m.dose === "일회용" && m.unitsLeft != null ? Math.max(0, m.unitsLeft + (te[e] ? -1 : 1)) : m.unitsLeft };
  }));
  const openBottle = (id) => setMeds((ms) => ms.map((m) => (m.id === id ? (m.dose === "다회용" ? { ...m, openedAt: isoDate(new Date()), dropsUsed: 0 } : { ...m, unitsLeft: (m.unitsLeft || 0) + 30 }) : m)));
  const addSE = (med, data) => {
    setSeLog((l) => [{ id: "e" + Date.now(), at: `${isoDate(new Date())} ${nowHM()}`, med: med.name, ...data }, ...l]);
    setSeFor(null);
  };

  /* 기기 매칭 (약 1개 ↔ 기기 1대) */
  const pairDev = (m, devId) => setDropDevs((ds) => ds.map((d) =>
    d.id === devId ? { ...d, pairedTo: medKey(m), connected: true }
      : d.pairedTo === medKey(m) ? { ...d, pairedTo: null, connected: false } : d));
  const unpairDev = (m) => setDropDevs((ds) => ds.map((d) => (d.pairedTo === medKey(m) ? { ...d, pairedTo: null, connected: false } : d)));
  const setMode = (m, mode) => setMeds((ms) => ms.map((x) => (medKey(x) === medKey(m) ? { ...x, dropMode: mode } : x)));

  /* 자동 점안: 연결된 기기에서 점안 신호가 들어오면 좌·우가 자동 기록된다.
     실제 구현에서는 BLE notify 이벤트로 대체한다. */
  useEffect(() => {
    if (view !== "today") return;
    const timers = [];
    meds.filter((m) => m.dropMode === "auto" && m.time !== "필요 시" && !m.taken && monitorOf(dropDevs, m)).forEach((m, idx) => {
      const eyes = m.eye === "both" ? ["od", "os"] : [m.eye];
      eyes.forEach((e, i) => {
        const key = `${m.id}-${e}`;
        if (autoFired.current.has(key) || (m.takenEye && m.takenEye[e])) return;
        timers.push(setTimeout(() => {
          autoFired.current.add(key);
          setMeds((ms) => ms.map((x) => {
            if (x.id !== m.id) return x;
            const te = { ...(x.takenEye || {}), [e]: nowHM() };
            const all = eyes.every((y) => te[y]);
            return { ...x, takenEye: te, taken: all, at: all ? te[eyes[eyes.length - 1]] : null,
              dropsUsed: x.dose === "다회용" ? (x.dropsUsed || 0) + 1 : x.dropsUsed,
              unitsLeft: x.dose === "일회용" && x.unitsLeft != null ? Math.max(0, x.unitsLeft - 1) : x.unitsLeft };
          }));
        }, 5200 + idx * 3400 + i * 2200));
      });
    });
    return () => timers.forEach(clearTimeout);
  }, [view, meds, dropDevs]);

  const detail = detailId ? meds.find((m) => m.id === detailId) : null;
  if (adding) return <AddMed devices={dropDevs} onDone={(list, monitorId) => {
    if (list) {
      setMeds((ms) => [...ms, ...list]);
      if (monitorId) setDropDevs((ds) => ds.map((d) => (d.id === monitorId ? { ...d, pairedTo: list[0].id, connected: true } : d)));
    }
    setAdding(false);
  }} />;
  if (seFor) return <SEForm med={seFor} onCancel={() => setSeFor(null)} onSubmit={(d) => addSE(seFor, d)} />;
  if (detail) return (
    <>
      <MedDetail m={detail} onBack={() => setDetailId(null)} onOpenBottle={openBottle} onLogSE={(m) => setSeFor(m)} seLog={seLog}
        dev={monitorOf(dropDevs, detail)} onOpenPair={() => setPairFor(detail)} onSetMode={(mode) => setMode(detail, mode)} />
      {pairFor && <BtPairModal med={pairFor} devices={dropDevs} onClose={() => setPairFor(null)}
        onPair={(id) => { pairDev(pairFor, id); setMode(pairFor, "auto"); }}
        onUnpair={() => { unpairDev(pairFor); setMode(pairFor, "manual"); }} />}
    </>
  );

  const sched = [...meds].filter((m) => m.time !== "필요 시").sort((a, b) => a.time.localeCompare(b.time));
  const prn = meds.filter((m) => m.time === "필요 시");
  const eyesTotal = sched.reduce((a, m) => a + (m.eye === "both" ? 2 : 1), 0);
  const eyesDone = sched.reduce((a, m) => a + Object.keys(m.takenEye || {}).length, 0);
  const pct = eyesTotal ? Math.round((eyesDone / eyesTotal) * 100) : 0;
  const bottles = bottleAlerts(meds);
  const uniqMeds = Array.from(new Map(meds.map((m) => [medKey(m), m])).values());
  const medCnt = uniqMeds.length;
  const pairedCnt = uniqMeds.filter((m) => monitorOf(dropDevs, m)).length;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div><Eyebrow color={C.primary}>점안 관리</Eyebrow><div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>점안 (Drops)</div></div>
        <button onClick={() => setAdding(true)} className="cursor-pointer flex items-center gap-1.5"
          style={{ border: "none", borderRadius: 11, padding: "9px 14px", background: C.primary, color: "#fff", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><Plus size={14} /> 약 추가</button>
      </div>

      <div className="flex" style={{ background: "#fff", borderRadius: 12, padding: 3, border: `1px solid ${C.line}` }}>
        {[{ id: "today", t: "오늘 점안" }, { id: "stat", t: "순응도 분석" }, { id: "se", t: `부작용 (${seLog.length})` }].map((m) => (
          <button key={m.id} onClick={() => setView(m.id)} className="cursor-pointer" style={{ flex: 1, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT, background: view === m.id ? C.mint : "transparent", color: view === m.id ? C.primary : C.sub }}>{m.t}</button>
        ))}
      </div>

      {view === "today" && (
        <>
          <Card style={{ padding: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>오늘 진행률</span>
              <span style={{ fontSize: 11, color: C.sub }}>눈 단위 {eyesDone}/{eyesTotal}회</span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 12, borderRadius: 99, background: C.mint, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.low : C.primary, borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? C.low : C.primary, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
              좌·우안을 각각 체크합니다. 한쪽만 점안한 경우도 정확히 기록됩니다.
            </div>
          </Card>

          {/* 점안 모니터링 기기 연결 현황 */}
          <Card style={{ padding: 14 }}>
            <SectionTitle icon={Bluetooth} right={
              <span style={{ fontSize: 11, fontWeight: 800, color: pairedCnt === medCnt ? C.low : C.mid }}>{pairedCnt}/{medCnt} 연결</span>
            }>점안 모니터링 기기</SectionTitle>
            <div className="flex flex-col gap-2">
              {Array.from(new Map(sched.concat(prn).map((m) => [medKey(m), m])).values()).map((m) => {
                const d = monitorOf(dropDevs, m);
                return (
                  <div key={medKey(m)} className="flex items-center gap-2.5" style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 11px" }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, borderRadius: 9, background: d ? C.mint : "#F1F4F4", color: d ? C.primary : C.grey }}>
                      <Bluetooth size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: C.sub, marginTop: 1 }}>
                        {d ? `${d.serial} · 배터리 ${d.battery}%` : "연결된 기기 없음"}
                      </div>
                    </div>
                    <MonitorBadge dev={d} small />
                    <button onClick={() => setPairFor(m)} className="cursor-pointer flex-shrink-0"
                      style={{ border: `1px solid ${d ? C.line : C.primary}`, background: "#fff", color: d ? C.sub : C.primary, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 800, fontFamily: FONT }}>
                      {d ? "변경" : "연결"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5 }}>
              약 1개당 기기 1대를 연결합니다. 연결된 약은 점안 시 좌·우가 자동 기록되고, 미연결 약은 수동으로 체크합니다.
            </div>
          </Card>

          {/* 순응도 기반 알림 자동 강화 */}
          <Card style={{ padding: 0, overflow: "hidden", borderColor: level.key === "ok" ? C.line : level.c + "45" }}>
            <div className="flex items-center gap-3" style={{ padding: "13px 15px", background: level.bg }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", color: level.c }}><level.icon size={18} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{level.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: level.c, padding: "1px 8px", borderRadius: 99 }}>{adhWin.pct}%</span>
                </div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 1.45 }}>최근 {ADH_ESC_CFG_INIT.window}일 {adhWin.taken}/{adhWin.total}회{streak > 0 ? ` · 연속 미완료 ${streak}일` : ""}</div>
              </div>
              <button onClick={() => setEscOn(!escOn)} className="cursor-pointer flex-shrink-0"
                style={{ border: "none", borderRadius: 999, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, fontFamily: FONT, background: escOn ? "#fff" : C.mintDeep, color: escOn ? level.c : C.sub }}>
                {escOn ? "강화 켜짐" : "강화 꺼짐"}
              </button>
            </div>
            <div style={{ padding: "12px 15px" }}>
              <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.5, marginBottom: 10 }}>{escOn ? level.desc : "자동 강화를 껐습니다. 기본 알림만 발송됩니다."}</div>
              <div className="flex flex-col gap-1.5">
                {[
                  { on: escOn && level.pre > 0, t: `예정 ${level.pre || 30}분 전 사전 알림` },
                  { on: escOn && level.retry > 0, t: `시간 초과 시 ${level.retryEvery}분 간격 재알림 ${level.retry}회` },
                  { on: escOn && level.caregiver && caregiver, t: "보호자 알림 발송" },
                  { on: escOn && level.clinic, t: "담당 의료진 통보" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-2">
                    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 17, height: 17, borderRadius: 99, background: r.on ? C.lowSoft : "#EEF2F1", color: r.on ? C.low : C.grey }}>{r.on ? <Check size={11} strokeWidth={3.5} /> : <X size={10} strokeWidth={3} />}</span>
                    <span style={{ fontSize: 11.5, color: r.on ? C.ink : C.grey }}>{r.t}</span>
                  </div>
                ))}
              </div>
              {level.caregiver && escOn && (
                <div onClick={() => setCaregiver(!caregiver)} className="cursor-pointer flex items-center gap-2" style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${caregiver ? C.primary : C.line}`, background: caregiver ? C.primary : "#fff" }}>{caregiver && <Check size={12} color="#fff" strokeWidth={3.5} />}</span>
                  <span style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.4 }}>반복 지연 시 <b style={{ color: C.primary }}>보호자에게도 알림</b>을 보내는 데 동의합니다.</span>
                </div>
              )}
              {boostSlots.length > 0 && escOn && (
                <div style={{ fontSize: 10.5, color: C.sub, marginTop: 10, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
                  <b style={{ color: C.mid }}>{boostSlots.join(" · ")}</b> 시각은 순응도가 낮아 알림을 15분 더 일찍 보냅니다.
                </div>
              )}
            </div>
          </Card>

          {bottles.length > 0 && (
            <Card style={{ padding: 13, background: C.midSoft, border: `1px solid ${C.mid}40` }}>
              <div className="flex items-center gap-2.5">
                <Package size={17} color={C.mid} className="flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>약병 확인이 필요합니다 · {bottles.length}건</div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{bottles.map((x) => `${x.med.name}(${x.b.label})`).join(" · ")}</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-2.5">
            {sched.map((m) => <MedCard key={m.id} m={m} nowMin={nowMin} onDrop={drop} onOpen={setDetailId}
              boosted={boostSlots.includes(m.time)} level={level} dev={monitorOf(dropDevs, m)} waiting />)}
          </div>

          {prn.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.sub, marginTop: 4 }}>필요 시 점안</div>
              <div className="flex flex-col gap-2.5">
                {prn.map((m) => <MedCard key={m.id} m={m} nowMin={nowMin} onDrop={drop} onOpen={setDetailId} dev={monitorOf(dropDevs, m)} />)}
              </div>
            </>
          )}

          <PushToggleCard push={push} />

          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.55, background: C.mint, borderRadius: 12, padding: "10px 12px" }}>
            <b style={{ color: C.primary }}>점안 요령:</b> 두 가지 이상 점안제를 쓸 때는 <b>5분 이상 간격</b>을 두세요. 점안 후 눈을 감고 눈 안쪽(코 쪽)을 1~2분 눌러 주면 약이 전신으로 흡수되는 양이 줄어 부작용이 적어집니다.
          </div>
        </>
      )}

      {view === "stat" && (
        <>
          <Card style={{ padding: 14 }}>
            <PeriodPicker period={period} from={from} to={to} onPreset={setPeriod} onFrom={(v) => { setFrom(v); setPeriod("custom"); }} onTo={(v) => { setTo(v); setPeriod("custom"); }} />
          </Card>

          {/* 실제 점안 기록에서 계산한 지표 */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: "기간 평균 순응도", v: `${adhAll.pct}%`, c: adhAll.pct >= ADH_TARGET ? C.low : C.high, sub: `${adhAll.taken} / ${adhAll.total}회 · 목표 ${ADH_TARGET}%` },
              { l: "누락 횟수", v: `${adhAll.missed}회`, c: adhAll.missed ? C.high : C.low, sub: `연속 미완료 ${streak}일` },
              { l: "누락일 평균 안압", v: missPts.length ? (missPts.reduce((a, p) => a + p.odAvg, 0) / missPts.length).toFixed(1) : "-", c: C.high, sub: "우안 mmHg" },
              { l: "정상일 평균 안압", v: okPts.length ? (okPts.reduce((a, p) => a + p.odAvg, 0) / okPts.length).toFixed(1) : "-", c: C.low, sub: "우안 mmHg" },
            ].map((k) => (
              <Card key={k.l} style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>{k.l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.c, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 1 }}>{k.sub}</div>
              </Card>
            ))}
          </div>

          {missPts.length > 0 && okPts.length > 0 && (
            <Card style={{ padding: 13, background: C.highSoft, border: `1px solid ${C.high}35` }}>
              <div className="flex items-center gap-2.5">
                <TrendingUp size={17} color={C.high} className="flex-shrink-0" />
                <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.45 }}>
                  점안을 거른 날의 우안 안압이 정상일보다 평균 <b style={{ color: C.high }}>+{gap} mmHg</b> 높습니다.
                </div>
              </div>
            </Card>
          )}

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Droplets}>점안 순응도 ↔ 안압</SectionTitle>
            <AdhIopChart data={pts} height={185} />
            <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginTop: 6 }}>
              <Legend c={C.od} t="우안" /><Legend c={C.os} t="좌안" /><Legend c={C.high} t="누락일" /><Legend c={C.mintDeep} t="순응도" />
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Search} right={<span style={{ fontSize: 11, color: C.sub }}>영향도 순</span>}>놓치는 이유 찾기</SectionTitle>
            <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5, marginBottom: 11 }}>
              실제 점안 기록과 부작용·시간대·요일 정보를 대조해 자주 거르는 이유를 찾았습니다.
            </div>
            <CauseList causes={causes} compact />
            {causes.length > 0 && (
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 11, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
                불편함 때문에 거르고 계시다면 참지 마시고 <b style={{ color: C.primary }}>부작용 기록</b>을 남겨 주세요. 같은 계열에서 다른 제형으로 바꾸면 나아지는 경우가 많습니다.
              </div>
            )}
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Package} right={<span style={{ fontSize: 11, color: C.sub }}>기록 {adhAll.total}회 기준</span>}>약제별 순응도</SectionTitle>
            <div className="flex flex-col gap-2.5">
              {byMed.map((m) => {
                const src = meds.find((x) => x.name === m.key) || {};
                return (
                  <div key={m.key}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <div className="flex items-center gap-1.5"><ClassBadge ingr={src.ingr || m.sample.ingr} small /><span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{m.key}</span></div>
                      <div className="flex items-baseline gap-1.5">
                        <span style={{ fontSize: 10, color: C.sub }}>{m.taken}/{m.total}회</span>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: m.pct >= ADH_TARGET ? C.low : C.high }}>{m.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 7, borderRadius: 99, background: C.mint, overflow: "hidden" }}><div style={{ width: `${m.pct}%`, height: "100%", background: m.pct >= ADH_TARGET ? C.low : m.pct >= 70 ? C.mid : C.high, borderRadius: 99 }} /></div>
                  </div>
                );
              })}
            </div>
            {byMed.length > 1 && byMed[0].pct < ADH_TARGET && (
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 11, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
                <b style={{ color: C.high }}>{byMed[0].key}</b>의 순응도가 가장 낮습니다. 점안 시각을 생활 습관(양치·취침 준비 등)에 붙이면 잊는 횟수가 줄어듭니다.
              </div>
            )}
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Clock}>시간대별 순응도</SectionTitle>
            <div className="flex flex-col gap-2.5">
              {bySlot.map((sl) => (
                <div key={sl.key} className="flex items-center gap-3">
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, width: 46, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{sl.key}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: C.mint, overflow: "hidden" }}>
                    <div style={{ width: `${sl.pct}%`, height: "100%", background: sl.pct >= ADH_TARGET ? C.low : C.mid, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: sl.pct >= ADH_TARGET ? C.low : C.mid, width: 36, textAlign: "right" }}>{sl.pct}%</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 13 }}>
              {byEye.map((e) => (
                <div key={e.key} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
                  <div className="flex items-center gap-1.5"><EyeBadge eye={e.key} small /><span style={{ fontSize: 10.5, color: C.sub }}>{e.taken}/{e.total}회</span></div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: e.pct >= ADH_TARGET ? C.low : C.mid, marginTop: 2 }}>{e.pct}%</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={CalendarDays}>요일별 순응도</SectionTitle>
            <div className="flex items-end" style={{ gap: 6, height: 96 }}>
              {byDow.map((d) => (
                <div key={d.t} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: d.pct == null ? C.grey : d.pct >= ADH_TARGET ? C.low : C.mid, marginBottom: 3 }}>{d.pct == null ? "-" : `${d.pct}%`}</span>
                  <div style={{ width: "100%", height: `${d.pct ? Math.max(6, (d.pct / 100) * 60) : 6}px`, background: d.pct == null ? C.line : d.pct >= ADH_TARGET ? C.primary : C.mid, borderRadius: "4px 4px 0 0" }} />
                  <span style={{ fontSize: 10.5, color: d.t === "일" ? C.high : d.t === "토" ? C.primary : C.sub, fontWeight: 700, marginTop: 5 }}>{d.t}</span>
                </div>
              ))}
            </div>
            {worstDow && (
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 11, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
                <b style={{ color: C.primary }}>{worstDow.t}요일</b>의 순응도가 가장 낮습니다({worstDow.pct}%). 그날만 알림을 한 번 더 받도록 설정해 보세요.
              </div>
            )}
          </Card>
        </>
      )}

      {pairFor && view === "today" && (
        <BtPairModal med={pairFor} devices={dropDevs} onClose={() => setPairFor(null)}
          onPair={(id) => { pairDev(pairFor, id); setMode(pairFor, "auto"); }}
          onUnpair={() => { unpairDev(pairFor); setMode(pairFor, "manual"); }} />
      )}

      {view === "se" && (
        <>
          <Card style={{ padding: 16 }}>
            <SectionTitle icon={AlertCircle} right={<span style={{ fontSize: 11, color: C.sub }}>{seLog.length}건</span>}>부작용 기록</SectionTitle>
            {seLog.length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.sub, padding: "24px 0", textAlign: "center", lineHeight: 1.6 }}>기록된 부작용이 없습니다.<br />불편한 증상이 있으면 약을 눌러 기록해 주세요.</div>
            ) : (
              <div className="flex flex-col">
                {seLog.map((e) => (
                  <div key={e.id} style={{ padding: "11px 0", borderBottom: `1px solid ${C.line}` }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{e.med}</span>
                      <EyeBadge eye={e.eye} small />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: e.severity === "중증" ? C.high : e.severity === "중등도" ? C.mid : C.sub, background: e.severity === "중증" ? C.highSoft : e.severity === "중등도" ? C.midSoft : "#EEF2F1", padding: "2px 8px", borderRadius: 99 }}>{e.severity}</span>
                      <span style={{ fontSize: 10.5, color: C.sub, marginLeft: "auto" }}>{e.at.slice(5)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.ink }}>{e.items.join(", ")}</div>
                    {e.note && <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{e.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.55, background: C.goldSoft, borderRadius: 12, padding: "10px 12px" }}>
            <b style={{ color: C.gold }}>참고:</b> 점안제 부작용은 점안 중단의 가장 흔한 원인입니다. 불편함을 참지 마시고 기록해 주세요. 같은 계열 안에서도 보존제가 없는 제품으로 바꾸면 나아지는 경우가 많습니다.
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   건강 (워치 연동)
   ============================================================ */
const WATCH_METRICS = [
  { cat: "활동", icon: Footprints, note: "오늘 누적 · 최근 7일 평균 병기", items: [
    { k: "걸음 수", v: "6,420", u: "걸음", avg7: "7,100", plat: "both", link: "Q9" },
    { k: "이동 거리", v: "4.8", u: "km", avg7: "5.2", plat: "both" },
    { k: "오른 층수", v: "9", u: "층", avg7: "11", plat: "both" },
    { k: "활동 칼로리", v: "412", u: "kcal", avg7: "455", plat: "both" },
    { k: "운동 시간(중강도↑)", v: "26", u: "분", avg7: "31", plat: "both", link: "Q9" },
    { k: "서 있는 시간", v: "9", u: "시간", avg7: "10", plat: "apple" },
    { k: "VO₂max (심폐체력)", v: "31.2", u: "mL/kg·min", measuredAt: "6/29 측정", plat: "both" },
  ]},
  { cat: "심장", icon: HeartPulse, note: "심박은 실시간 · HRV/안정심박은 7일 평균", items: [
    { k: "현재 심박수", v: "72", u: "bpm", sub: "실시간", plat: "both" },
    { k: "안정 시 심박수", v: "61", u: "bpm", avg7: "62", plat: "both" },
    { k: "심박 범위(오늘)", v: "54–118", u: "bpm", plat: "both" },
    { k: "심박변이도 (HRV)", v: "38", u: "ms", avg7: "36", plat: "both" },
    { k: "불규칙 맥박 알림 (IRN)", v: "감지", u: "", measuredAt: "6/30 감지", plat: "both", alert: true, link: "Q11" },
    { k: "심전도 (ECG) 기록", v: "미기록", u: "", measuredAt: "최근 기록 없음", stale: true, plat: "both" },
    { k: "고·저심박 알림", v: "없음", u: "", sub: "최근 30일", plat: "both" },
  ]},
  { cat: "수면", icon: Moon, note: "지난밤 · 최근 7일 평균 병기", items: [
    { k: "총 수면 시간", v: "6시간 40분", u: "", avg7: "6시간 55분", plat: "both", link: "Q10" },
    { k: "깊은 수면", v: "58", u: "분", avg7: "1시간 04분", plat: "both" },
    { k: "렘(REM) 수면", v: "1시간 12분", u: "", avg7: "1시간 18분", plat: "both" },
    { k: "얕은 수면", v: "4시간 05분", u: "", avg7: "4시간 08분", plat: "both" },
    { k: "깬 시간", v: "25", u: "분", avg7: "21분", plat: "both" },
    { k: "수면 중 혈중산소 (SpO₂)", v: "94–98", u: "%", avg7: "95–98%", plat: "both" },
    { k: "수면 중 호흡수", v: "14.2", u: "회/분", avg7: "14.0", plat: "both" },
    { k: "코골이 감지", v: "27분", u: "", avg7: "19분", plat: "galaxy", link: "Q2" },
    { k: "수면 점수", v: "71 · 보통", u: "", avg7: "74", plat: "both", link: "Q10" },
  ]},
  { cat: "신체·기타", icon: Activity, note: "스팟 측정 · 측정 시점 표기 (2주 경과 시 회색)", items: [
    { k: "혈중산소 (SpO₂, 주간)", v: "97", u: "%", measuredAt: "오늘 09:12 측정", plat: "both" },
    { k: "피부 온도 변화(야간)", v: "+0.3", u: "°C", measuredAt: "지난밤", plat: "both" },
    { k: "스트레스 지수", v: "42 · 보통", u: "", measuredAt: "오늘 08:40 측정", plat: "galaxy" },
    { k: "체성분 (BIA)", v: "골격근 24.1kg · 체지방 28%", u: "", measuredAt: "6/28 측정", plat: "galaxy" },
    { k: "혈압(커프 보정)", v: "128/84", u: "mmHg", measuredAt: "7/2 07:55 측정", plat: "galaxy", link: "Q3·Q4" },
    { k: "마음챙김·호흡 세션", v: "5", u: "분", sub: "오늘", plat: "both" },
    { k: "낙상 감지", v: "정상", u: "", sub: "최근 30일 이벤트 없음", plat: "both" },
    { k: "소음 노출", v: "68", u: "dB", measuredAt: "6/15 측정", stale: true, plat: "apple" },
  ]},
];
function PlatBadge({ plat }) {
  const map = { both: { t: "Apple·Galaxy", c: C.sub, bg: "#F0F4F3" }, apple: { t: "Apple 전용", c: "#555", bg: "#EEEEEE" }, galaxy: { t: "Galaxy 전용", c: "#1259A8", bg: "#E7F0FA" } };
  const m = map[plat] || map.both;
  return <span style={{ fontSize: 9, fontWeight: 700, color: m.c, background: m.bg, padding: "1px 6px", borderRadius: 99, whiteSpace: "nowrap" }}>{m.t}</span>;
}
function HealthScreen() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div><Eyebrow color={C.primary}>워치 연동 · 건강</Eyebrow><div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>건강 데이터</div></div>
        <DeviceChip icon={Watch} label={WATCH.device} />
      </div>
      <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginTop: -6 }}>
        Apple Watch(HealthKit)·Galaxy Watch(Samsung Health)에서 수집 가능한 지표를 모두 표시합니다. <span style={{ color: C.gold, fontWeight: 700 }}>Q 배지</span>가 붙은 항목은 문진 자동값으로 우선 반영돼요.
      </div>

      {WATCH.irn && (
        <Card style={{ padding: 13, background: C.highSoft, border: "1px solid #F1CFC6" }}>
          <div className="flex items-start gap-2.5"><AlertTriangle size={16} color={C.high} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "#8A3A2A", lineHeight: 1.5 }}><b>불규칙 맥박 알림(IRN)</b> {WATCH.irnDate} 감지 → <b>문진 Q11</b> 자동 병기. 선별 신호이며 확진이 아니므로 심장내과 <b>심전도(ECG)</b> 확인을 권장합니다.</div>
          </div>
        </Card>
      )}

      {WATCH_METRICS.map((g) => (
        <Card key={g.cat} style={{ padding: 15 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 2, flexWrap: "wrap" }}>
            <g.icon size={16} color={C.primary} strokeWidth={2.2} />
            <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{g.cat}</span>
            <span style={{ fontSize: 10.5, color: C.sub }}>{g.items.length}개 지표</span>
          </div>
          {g.note && <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginBottom: 6 }}>{g.note}</div>}
          <div className="flex flex-col">
            {g.items.map((it, i) => (
              <div key={it.k} className="flex items-center gap-2" style={{ padding: "8px 0", borderBottom: i < g.items.length - 1 ? `1px solid ${C.line}` : "none", opacity: it.stale ? 0.55 : 1 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5" style={{ flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{it.k}</span>
                    <PlatBadge plat={it.plat} />
                    {it.link && <span style={{ fontSize: 9, color: C.gold, background: C.goldSoft, padding: "1px 6px", borderRadius: 99, fontWeight: 800 }}>{it.link} 반영</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: it.alert ? C.high : it.stale ? C.grey : C.primary, fontVariantNumeric: "tabular-nums" }}>{it.v}</span>
                    {it.u && <span style={{ fontSize: 10.5, color: C.sub, marginLeft: 3 }}>{it.u}</span>}
                  </div>
                  {it.avg7 && <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>7일 평균 <b style={{ color: C.ink }}>{it.avg7}</b></div>}
                  {it.measuredAt && <div style={{ fontSize: 9.5, color: it.stale ? C.grey : C.sub, marginTop: 1 }}>{it.measuredAt}{it.stale ? " · 재측정 권장" : ""}</div>}
                  {it.sub && !it.avg7 && !it.measuredAt && <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{it.sub}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.55, padding: "0 2px" }}>
        일부 지표는 기기 모델·국가·OS 버전에 따라 제공 여부가 다를 수 있습니다. 혈압(Galaxy)은 커프 보정이 필요하며, ECG·IRN은 선별 목적으로 확진 진단이 아닙니다.
      </div>
    </div>
  );
}

/* ============================================================
   전자 문진 12항목
   ============================================================ */
function answerText(s, a) {
  if (s.type === "packyear") { if (!a || (!a.cig && !a.yr)) return null; return `${a.cig || "-"}개비/일 · ${a.yr || "-"}년`; }
  if (s.type === "multi") { if (!Array.isArray(a) || !a.length) return null; return a.map((i) => s.opts[i] && s.opts[i].t).filter(Boolean).join(", "); }
  if (a == null) return null; return (s.opts[a] && s.opts[a].t) || null;
}
function SurveySummary({ answers, onBack }) {
  const doneCount = Q.filter((q) => q.subs.filter((s) => !s.showIf || s.showIf(answers)).every((s) => answers[s.id] != null && (s.type !== "multi" || answers[s.id].length > 0))).length;
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onBack} style={{ color: C.primary }}><ChevronLeft size={20} /><span style={{ fontSize: 14, fontWeight: 700 }}>문진 목록</span></div>
      <div>
        <Eyebrow color={C.primary}>문진 결과 요약</Eyebrow>
        <div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>12개 항목 응답</div>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>완료 {doneCount} / 12 · 위험도 평가는 의료진 웹에서 제공됩니다.</div>
      </div>
      {Q.map((q) => {
        const subs = q.subs.filter((s) => !s.showIf || s.showIf(answers));
        return (
          <Card key={q.id} style={{ padding: 14 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, borderRadius: 9, background: C.mint, color: C.primary }}><q.icon size={16} /></div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{q.id}</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{q.title}</span>
              <div style={{ marginLeft: "auto" }}><FreqBadge f={q.freq} /></div>
            </div>
            <div className="flex flex-col gap-2">
              {subs.map((s) => {
                const txt = answerText(s, answers[s.id]);
                return (
                  <div key={s.id} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 7 }}>
                    <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.4 }}>{s.q}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: txt ? C.ink : C.grey, marginTop: 2 }}>{txt || "미응답"}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
      <button onClick={onBack} className="cursor-pointer" style={{ border: "none", borderRadius: 14, padding: "13px 0", background: C.primary, color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: FONT }}>목록으로</button>
    </div>
  );
}
function SurveyScreen() {
  const [open, setOpen] = useState(null);
  const [summary, setSummary] = useState(false);
  const [answers, setAnswers] = useState({}); // {subId: value(single=idx / multi=[idx] / packyear={cig,yr})}

  const isDone = (q) => q.subs.filter((s) => !s.showIf || s.showIf(answers)).every((s) => answers[s.id] != null && (s.type !== "multi" || answers[s.id].length > 0));
  const qRisk = (q) => {
    let worst = 0; const rank = { 저: 1, 중: 2, 고: 3 };
    q.subs.forEach((s) => { if (!s.opts) return; const a = answers[s.id]; if (a == null) return; const idxs = Array.isArray(a) ? a : [a]; idxs.forEach((i) => { const r = s.opts[i] && s.opts[i].r; if (rank[r] > worst) worst = rank[r]; }); });
    return worst ? Object.keys(rank).find((k) => rank[k] === worst) : null;
  };
  const doneCount = Q.filter(isDone).length;

  if (open) {
    const q = Q.find((x) => x.id === open);
    return <QuestionDetail q={q} answers={answers} setAnswers={setAnswers} back={() => setOpen(null)} />;
  }
  if (summary) return <SurveySummary answers={answers} onBack={() => setSummary(false)} />;

  const grouped = FREQ_ORDER.map((f) => ({ f, items: Q.filter((q) => q.freq === f) })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <Eyebrow color={C.primary}>전자 문진</Eyebrow>
        <div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>생활습관 문진 · 12항목</div>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>기기가 자동으로 못 담는 행동·자세·복약 맥락을 모아 의료진에게 전달합니다.</div>
      </div>

      <Card style={{ padding: 14 }}>
        <div className="flex items-center justify-between"><span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>완료</span><span style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>{doneCount} / 12</span></div>
        <div style={{ height: 7, background: C.mint, borderRadius: 99, marginTop: 8, overflow: "hidden" }}><div style={{ width: `${(doneCount / 12) * 100}%`, height: "100%", background: C.primary, borderRadius: 99, transition: "width .3s" }} /></div>
        <button onClick={() => setSummary(true)} className="cursor-pointer flex items-center justify-center gap-2" style={{ width: "100%", marginTop: 12, border: `1.5px solid ${C.mintDeep}`, background: C.mint, color: C.primary, borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 800, fontFamily: FONT }}><ListChecks size={16} /> 12개 항목 결과 요약 보기</button>
      </Card>

      {grouped.map((g) => (
        <div key={g.f}>
          <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}><FreqBadge f={g.f} /><span style={{ fontSize: 11.5, color: C.sub }}>{g.items.length}개 항목</span></div>
          <div className="flex flex-col gap-2.5">
            {g.items.map((q) => {
              const done = isDone(q);
              return (
                <Card key={q.id} style={{ padding: 14 }} className="cursor-pointer" onClick={() => setOpen(q.id)}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: done ? C.lowSoft : C.mint, color: done ? C.low : C.primary }}>
                      {done ? <Check size={19} strokeWidth={3} /> : <q.icon size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{q.id}</span>
                        {done && <span style={{ fontSize: 10, color: C.low, fontWeight: 700 }}>완료</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 2 }}>{q.title}</div>
                    </div>
                    <ChevronRight size={18} color={C.sub} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionDetail({ q, answers, setAnswers, back }) {
  const setSingle = (sid, i) => setAnswers((a) => ({ ...a, [sid]: i }));
  const toggleMulti = (sid, i, exclusiveLast, lastIdx) => setAnswers((a) => {
    let cur = Array.isArray(a[sid]) ? [...a[sid]] : [];
    if (exclusiveLast && i === lastIdx) return { ...a, [sid]: cur.includes(i) ? [] : [i] };
    cur = cur.filter((x) => x !== lastIdx);
    cur = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
    return { ...a, [sid]: cur };
  });
  const setPY = (sid, key, val) => setAnswers((a) => ({ ...a, [sid]: { ...(a[sid] || {}), [key]: val } }));

  const visibleSubs = q.subs.filter((s) => !s.showIf || s.showIf(answers));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 cursor-pointer" onClick={back} style={{ color: C.primary }}><ChevronLeft size={20} /><span style={{ fontSize: 14, fontWeight: 700 }}>문진 목록</span></div>

      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>{q.id}</span><FreqBadge f={q.freq} />
          {q.watchLink && <span style={{ fontSize: 10.5, color: C.gold, background: C.goldSoft, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>{q.watchLink}</span>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{q.title}</div>
      </div>

      {visibleSubs.map((s) => (
        <div key={s.id} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, background: C.mint, padding: "2px 7px", borderRadius: 6 }}>{s.id}</span>
            {s.type === "multi" && <span style={{ fontSize: 10.5, color: C.sub }}>복수 선택</span>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.45 }}>{s.q}</div>

          {s.type === "packyear" ? (
            <PackYear v={answers[s.id]} set={(k, val) => setPY(s.id, k, val)} />
          ) : (
            <div className="flex flex-col gap-2">
              {s.opts.map((o, i) => {
                const multi = s.type === "multi";
                const arr = Array.isArray(answers[s.id]) ? answers[s.id] : [];
                const on = multi ? arr.includes(i) : answers[s.id] === i;
                return (
                  <div key={i} onClick={() => multi ? toggleMulti(s.id, i, true, s.opts.length - 1) : setSingle(s.id, i)} className="cursor-pointer"
                    style={{ padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${on ? C.primary : C.line}`, background: on ? C.mint : "#fff" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {multi && <span className="flex items-center justify-center flex-shrink-0" style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? C.primary : C.mintDeep}`, background: on ? C.primary : "#fff" }}>{on && <Check size={13} color="#fff" strokeWidth={3.5} />}</span>}
                        <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 600, color: C.ink, lineHeight: 1.4 }}>{o.t}</span>
                      </div>
                      {!multi && on && <Check size={17} color={C.primary} strokeWidth={3} className="flex-shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5, padding: "4px 2px 0", borderTop: `1px solid ${C.line}` }}>
        <b style={{ color: C.primary }}>의료진 웹 전송:</b> {q.save}<br />
        위험도 평가와 맞춤 안내는 의료진 웹에서 제공됩니다.
      </div>

      <div className="flex gap-2.5" style={{ marginTop: 4 }}>
        <button onClick={back} className="cursor-pointer" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 13, padding: "13px 0", fontSize: 14, fontWeight: 700, fontFamily: FONT, width: 110 }}>이전</button>
        <button onClick={back} className="cursor-pointer" style={{ flex: 1, border: "none", background: C.primary, color: "#fff", borderRadius: 13, padding: "13px 0", fontSize: 15, fontWeight: 800, fontFamily: FONT }}>저장</button>
      </div>
    </div>
  );
}
function Feedback({ r, text }) {
  const m = RISK[r] || RISK["-"];
  return (
    <Card style={{ padding: 13, background: m.soft, border: `1px solid ${m.c}30` }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 5 }}><Sparkles size={14} color={m.c} /><span style={{ fontSize: 11.5, fontWeight: 800, color: m.c }}>맞춤 안내</span><RiskPill r={r} small /></div>
      <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>{text}</div>
    </Card>
  );
}
function PackYear({ v, set }) {
  const cig = v?.cig ?? "", yr = v?.yr ?? "";
  const py = cig && yr ? +((cig / 20) * yr).toFixed(1) : null;
  const msg = py == null ? null : py < 10 ? ["저", "현재까지 흡연량은 비교적 낮은 편이나, 금연이 시야 보호에 도움이 됩니다."] : py < 20 ? ["중", "중등도 누적 흡연량입니다. 금연이 시야 진행 위험을 낮추는 데 도움이 됩니다."] : ["고", "20 pack-year 이상 누적 흡연은 녹내장 시야 진행 속도와 관련됩니다. 금연을 강력히 권장합니다."];
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <div className="flex-1"><div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700, marginBottom: 5 }}>일평균 (개비/일)</div><input type="number" value={cig} onChange={(e) => set("cig", e.target.value)} placeholder="20" style={inp} /></div>
        <div className="flex-1"><div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700, marginBottom: 5 }}>흡연 기간 (년)</div><input type="number" value={yr} onChange={(e) => set("yr", e.target.value)} placeholder="15" style={inp} /></div>
      </div>
      {py != null && (
        <Card style={{ padding: 12, background: RISK[msg[0]].soft, border: `1px solid ${RISK[msg[0]].c}30` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>Pack-year 자동 계산: {py}</span><RiskPill r={msg[0]} small /></div>
          <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{msg[1]}</div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   설정
   ============================================================ */
function SettingsScreen({ account, onLogout, meds, push, rent, rentTo, setRentTo, onBack }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onBack} style={{ color: C.primary }}><ChevronLeft size={20} /><span style={{ fontSize: 14, fontWeight: 700 }}>홈으로</span></div>
      <div><Eyebrow color={C.primary}>설정</Eyebrow><div style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 2 }}>계정 · 기기 · 알림</div></div>

      <Card style={{ padding: 14 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, borderRadius: 13, background: C.mint, color: C.primary }}><User size={20} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><span style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{account.name}</span><JoinBadge join={account.join} /></div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>ID {account.id}</div>
          </div>
          <button onClick={onLogout} className="cursor-pointer flex items-center gap-1.5 flex-shrink-0" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>
            <LogOut size={13} /> {account.mode === "guest" ? "종료" : "로그아웃"}
          </button>
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: account.serial ? C.lowSoft : C.mint, color: account.serial ? C.low : C.primary }}><Bluetooth size={18} /></div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>CVT200 안압계</div>
            {account.serial ? (
              <>
                <div className="flex items-center gap-1.5" style={{ marginTop: 3 }}>
                  <OwnerBadge owner={account.owner || "기관"} small />
                  <span style={{ fontSize: 10.5, color: C.sub, fontFamily: "monospace" }}>{account.serial}</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.low, marginTop: 3, fontWeight: 600 }}>연결됨 · 배터리 82% · FW 1.4.2</div>
              </>
            ) : <div style={{ fontSize: 11, color: C.gold, marginTop: 1, fontWeight: 600 }}>시리얼 번호 미등록</div>}
          </div>
          <button className="cursor-pointer flex-shrink-0" style={{ border: `1.5px solid ${account.serial ? C.line : C.primary}`, background: "#fff", color: account.serial ? C.sub : C.primary, borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{account.serial ? "관리" : "등록"}</button>
        </div>

        {account.serial && (account.owner || "기관") === "기관" && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div className="flex items-center gap-1.5"><Timer size={14} color={rent ? rent.c : C.primary} /><span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>반납 예정일</span></div>
              {rent
                ? <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: rent.c, padding: "3px 10px", borderRadius: 99 }}>{rent.dd >= 0 ? `D-${rent.dd}` : `연체 ${-rent.dd}일`}</span>
                : <span style={{ fontSize: 10.5, fontWeight: 700, color: C.low, background: C.lowSoft, padding: "3px 10px", borderRadius: 99 }}>여유 있음</span>}
            </div>
            <input type="date" value={rentTo} onChange={(e) => setRentTo(e.target.value)} style={inp} />
            {rent && <div style={{ fontSize: 10.5, color: rent.c, marginTop: 7, lineHeight: 1.45, fontWeight: 600 }}>{rent.msg}</div>}
            <div className="flex gap-2" style={{ marginTop: 9 }}>
              <button className="cursor-pointer flex items-center justify-center gap-1.5" style={{ flex: 1, border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 11, padding: "9px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><CalendarDays size={13} /> 기간 연장 요청</button>
              <button className="cursor-pointer flex items-center justify-center gap-1.5" style={{ flex: 1, border: "none", background: C.primary, color: "#fff", borderRadius: 11, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><Undo2 size={13} /> 반납 예약</button>
            </div>
          </div>
        )}
      </Card>

      <PushToggleCard push={push} />

      <Card style={{ padding: 14 }}>
        <SectionTitle icon={Package}>등록된 점안제 ({meds.length})</SectionTitle>
        <div className="flex flex-col gap-2">
          {Array.from(new Map(meds.map((m) => [m.name, m])).values()).map((m) => {
            const b = bottleState(m);
            return (
              <div key={m.name} className="flex items-center gap-2" style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                <ClassBadge ingr={m.ingr} small />
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, flex: 1 }}>{m.name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: b.c, background: b.bg, padding: "2px 8px", borderRadius: 99 }}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: account.mode === "guest" ? "#EEF2F1" : C.mint, color: account.mode === "guest" ? C.sub : C.primary }}><ShieldCheck size={18} /></div>
          <div className="flex-1"><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>의료진 데이터 공유</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{account.mode === "guest" ? "비회원은 전송할 수 없습니다" : "씨엔브이 안과 · 이재훈 원장"}</div></div>
          <span style={{ fontSize: 11, fontWeight: 800, color: account.mode === "guest" ? C.sub : C.low, background: account.mode === "guest" ? "#EEF2F1" : C.lowSoft, padding: "5px 11px", borderRadius: 999 }}>{account.mode === "guest" ? "불가" : "동의함"}</span>
        </div>
      </Card>

      <div style={{ fontSize: 10.5, color: C.sub, textAlign: "center", lineHeight: 1.6, padding: "4px 0 8px" }}>
        안압케어 v3.0 · C&V Tech<br />본 앱은 기록·관리 도구이며 진단·치료를 대체하지 않습니다.
      </div>
    </div>
  );
}

/* ============================================================
   PHONE SHELL
   ============================================================ */
const TABS = [
  { id: "home", label: "홈", icon: Home },
  { id: "iop", label: "안압", icon: Eye },
  { id: "drops", label: "점안", icon: Droplets },
  { id: "survey", label: "문진", icon: ClipboardList },
  { id: "health", label: "건강", icon: Watch },
];

/* ---------- 환자 앱 알림 패널 ---------- */
function buildNotices({ medUp, medOver, bottles, rent, level, adhWin, streak }) {
  const out = [];
  (medOver || []).forEach((m) => out.push({
    id: `late-${m.id}`, icon: Droplets, c: C.high, bg: C.highSoft, tab: "drops",
    title: "점안 시간이 지났습니다", body: `${m.name} · ${m.time} 예정 (${m.late}분 경과)`,
    tag: "점안", when: m.time,
  }));
  (medUp || []).forEach((m) => out.push({
    id: `soon-${m.id}`, icon: Bell, c: C.mid, bg: C.midSoft, tab: "drops",
    title: "곧 점안 시간입니다", body: `${m.name} · ${m.diff}분 후 (${m.time})`,
    tag: "점안", when: m.time,
  }));
  (bottles || []).forEach((x) => out.push({
    id: `bot-${x.med.id}`, icon: Package, c: x.b.c, bg: x.b.bg, tab: "drops",
    title: x.b.k === "expired" ? "점안제 폐기가 필요합니다" : x.b.k === "out" ? "점안제가 소진되었습니다" : "점안제 교체가 다가옵니다",
    body: `${x.med.name} · ${x.b.label}`, tag: "약병",
  }));
  if (rent) out.push({
    id: `rent-${rent.key}`, icon: rent.icon, c: rent.c, bg: rent.bg, tab: "settings",
    title: rent.title, body: rent.msg, tag: "기기",
  });
  if (level && level.key !== "ok") out.push({
    id: `adh-${level.key}`, icon: level.icon, c: level.c, bg: level.bg, tab: "drops",
    title: level.title,
    body: `최근 ${ADH_ESC_CFG_INIT.window}일 순응도 ${adhWin.pct}% · ${adhWin.missed}회 누락${streak > 0 ? ` · 연속 미완료 ${streak}일` : ""}`,
    tag: "순응도",
  });
  return out;
}
function NoticePanel({ notices, onClose, onGo }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 45 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,42,49,.35)" }} />
      <div style={{ position: "absolute", top: 74, left: 14, right: 14, maxHeight: 560, overflowY: "auto",
                    background: "#fff", borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: "0 22px 50px -14px rgba(8,52,62,.45)" }}>
        <div className="flex items-center justify-between" style={{ padding: "13px 16px", borderBottom: `1px solid ${C.line}`, background: C.bg, position: "sticky", top: 0 }}>
          <div className="flex items-center gap-1.5">
            <Bell size={15} color={C.primary} />
            <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>알림</span>
            <span style={{ fontSize: 11.5, color: C.sub }}>{notices.length}건</span>
          </div>
          <X size={19} color={C.sub} className="cursor-pointer" onClick={onClose} />
        </div>

        {notices.length === 0 ? (
          <div className="flex flex-col items-center" style={{ padding: "44px 20px", color: C.sub }}>
            <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 999, background: C.lowSoft, color: C.low, marginBottom: 12 }}><Check size={24} strokeWidth={3} /></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>새 알림이 없습니다</div>
            <div style={{ fontSize: 12, marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>점안·측정·기기 상태가 모두 정상입니다.</div>
          </div>
        ) : notices.map((n, i) => (
          <div key={n.id} onClick={() => { onGo(n.tab); onClose(); }} className="cursor-pointer flex items-start gap-3"
            style={{ padding: "13px 16px", borderBottom: i < notices.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 11, background: n.bg, color: n.c }}>
              <n.icon size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 9.5, fontWeight: 800, color: n.c, background: n.bg, padding: "1px 7px", borderRadius: 99 }}>{n.tag}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{n.title}</span>
              </div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3, lineHeight: 1.45 }}>{n.body}</div>
            </div>
            <ChevronRight size={16} color={C.grey} className="flex-shrink-0" style={{ marginTop: 9 }} />
          </div>
        ))}

        {notices.length > 0 && (
          <div style={{ padding: "11px 16px", background: C.bg, fontSize: 10.5, color: C.sub, lineHeight: 1.5 }}>
            알림을 누르면 해당 화면으로 이동합니다. 푸시 알림은 <b style={{ color: C.primary }}>설정</b>에서 켜고 끌 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function PatientApp() {
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("home");
  const [sessions, setSessions] = useState(SESSIONS_INIT);
  const [meds, setMeds] = useState(MEDS_INIT);
  const [seLog, setSeLog] = useState(SE_LOG_INIT);
  const [targetOD, setTargetOD] = useState(15);
  const [targetOS, setTargetOS] = useState(16);
  const [rentTo, setRentTo] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return isoDate(d); });
  const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
  useEffect(() => { const id = setInterval(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); }, 60000); return () => clearInterval(id); }, []);

  const [escOn, setEscOn] = useState(true);
  const [caregiver, setCaregiver] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  /* 순응도 기반 알림 강화 단계 — 최근 14일 실제 점안 기록으로 판정 */
  const escFrom = isoDate(new Date(new Date(TODAY_REF).setDate(TODAY_REF.getDate() - ADH_ESC_CFG_INIT.window)));
  const adhWin = overallAdherence(escFrom, TODAY_STR, meds);
  const streak = missStreak();
  const level = adhLevel(adhWin.pct, streak, { ...ADH_ESC_CFG_INIT, enabled: escOn, caregiver });
  const slots = slotEscalation(escFrom, TODAY_STR);
  const boostSlots = slots.filter((x) => x.boost).map((x) => x.key);
  const { upcoming: medUp, overdue: medOver } = medAlerts(meds, nowMin, level, boostSlots);
  const bottles = bottleAlerts(meds);
  const isRental = !!account && (account.owner || "기관") === "기관" && !!account.serial;
  const rent = isRental ? rentAlert(rentTo, isoDate(new Date())) : null;
  const push = usePush(medUp, medOver, rent, bottles, { ...level, caregiver: level.caregiver && caregiver }, escOn);
  const notices = buildNotices({ medUp, medOver, bottles, rent, level, adhWin, streak });
  const alertCount = notices.length;

  return (
    <div style={{ width: 380, maxWidth: "100%", height: 800, background: C.bg, borderRadius: 40, border: "10px solid #10262B", overflow: "hidden", position: "relative", boxShadow: "0 30px 70px -30px rgba(8,52,62,.5)" }}>
      <div className="flex items-center justify-between" style={{ padding: "13px 24px 6px", fontSize: 12.5, fontWeight: 700, color: C.ink }}>
        <span>{minToHM(nowMin)}</span>
        <div className="flex items-center gap-1.5" style={{ color: C.primary }}><Bluetooth size={13} /><Watch size={13} /><span style={{ fontSize: 11 }}>●●●</span></div>
      </div>

      {!account ? (
        <div style={{ height: 722, overflowY: "auto", padding: "6px 18px 20px" }}>
          <AuthScreen onAuth={(a) => { setAccount(a); setTab("home"); }} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between" style={{ padding: "2px 22px 10px" }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 9, background: C.primary }}><Eye size={17} color="#fff" /></div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1 }}>안압케어</div>
                <div style={{ fontSize: 9.5, color: C.sub, letterSpacing: "0.05em" }}>CVT200 · 녹내장 통합관리</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="cursor-pointer" style={{ position: "relative" }} onClick={() => setNoticeOpen(true)}>
                <Bell size={19} color={alertCount ? C.high : C.sub} />
                {alertCount > 0 && <span className="flex items-center justify-center" style={{ position: "absolute", top: -5, right: -6, minWidth: 15, height: 15, padding: "0 3px", borderRadius: 99, background: C.high, color: "#fff", fontSize: 9.5, fontWeight: 800 }}>{alertCount}</span>}
              </div>
              <Settings size={19} color={tab === "settings" ? C.primary : C.sub} className="cursor-pointer" onClick={() => setTab("settings")} />
            </div>
          </div>
          <div style={{ height: 656, overflowY: "auto", padding: "6px 18px 20px" }}>
            {tab === "home" && <HomeScreen account={account} sessions={sessions} meds={meds} targetOD={targetOD} targetOS={targetOS} go={setTab} medUp={medUp} medOver={medOver} rent={rent} rentTo={rentTo} bottles={bottles} level={level} adhWin={adhWin} streak={streak} />}
            {tab === "iop" && <IOPScreen sessions={sessions} setSessions={setSessions} targetOD={targetOD} targetOS={targetOS} setTargetOD={setTargetOD} setTargetOS={setTargetOS} rent={rent} />}
            {tab === "drops" && <DropsScreen meds={meds} setMeds={setMeds} seLog={seLog} setSeLog={setSeLog} nowMin={nowMin} medUp={medUp} medOver={medOver} push={push}
              level={level} adhWin={adhWin} streak={streak} slots={slots} boostSlots={boostSlots} escOn={escOn} setEscOn={setEscOn} caregiver={caregiver} setCaregiver={setCaregiver} />}
            {tab === "survey" && <SurveyScreen />}
            {tab === "health" && <HealthScreen />}
            {tab === "settings" && <SettingsScreen account={account} onLogout={() => setAccount(null)} meds={meds} push={push} rent={rent} rentTo={rentTo} setRentTo={setRentTo} onBack={() => setTab("home")} />}
          </div>
          <div className="flex items-center justify-around" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 66, background: "rgba(255,255,255,.94)", borderTop: `1px solid ${C.line}`, backdropFilter: "blur(8px)" }}>
            {TABS.map((t) => {
              const on = tab === t.id; const dot = t.id === "drops" && alertCount > 0;
              return (
                <div key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 cursor-pointer" style={{ flex: 1, paddingTop: 4, position: "relative" }}>
                  <t.icon size={21} color={on ? C.primary : C.sub} strokeWidth={on ? 2.5 : 2} />
                  <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? C.primary : C.sub }}>{t.label}</span>
                  {dot && <span style={{ position: "absolute", top: 2, right: "50%", marginRight: -16, width: 7, height: 7, borderRadius: 99, background: C.high }} />}
                </div>
              );
            })}
          </div>
          {noticeOpen && <NoticePanel notices={notices} onClose={() => setNoticeOpen(false)} onGo={setTab} />}
        </>
      )}
    </div>
  );
}

/* ============================================================
   의료진 웹 — 로그인 · 프로필
   ============================================================ */
function ClinicianLogin({ users, onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false); const [keep, setKeep] = useState(true); const [err, setErr] = useState("");
  const demo = users.filter((u) => u.active);
  const submit = () => {
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) { setErr("등록되지 않은 이메일입니다. 기관 관리자에게 계정 생성을 요청하세요."); return; }
    if (!u.active) { setErr("비활성 계정입니다. 기관 관리자에게 문의하세요."); return; }
    if (!pw) { setErr("비밀번호를 입력하세요."); return; }
    onLogin(u);
  };
  return (
    <div className="flex" style={{ width: 900, maxWidth: "100%", background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, overflow: "hidden", boxShadow: "0 30px 70px -35px rgba(8,52,62,.35)" }}>
      <div className="flex flex-col justify-between" style={{ width: 340, background: C.primaryDeep, padding: "30px 28px", flexShrink: 0 }}>
        <div>
          <div className="flex items-center gap-2.5" style={{ marginBottom: 22 }}>
            <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.14)" }}><Stethoscope size={19} color="#fff" /></div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>안압케어 CLINIC</div>
              <div style={{ fontSize: 10, color: "#9FC4C6", letterSpacing: "0.06em" }}>C&V TECH · CVT200</div>
            </div>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.45, marginBottom: 10 }}>안압·점안·생활습관을<br />한 화면에서 봅니다</div>
          <div style={{ fontSize: 12, color: "#9FC4C6", lineHeight: 1.6 }}>기관 계정으로 로그인하면 담당 환자의 측정 기록, 점안 순응도, 문진 위험 플래그를 함께 확인할 수 있습니다.</div>
        </div>
        <div className="flex flex-col gap-2.5">
          {[{ icon: Users, t: "환자 고객 DB · 정렬 · 검색" }, { icon: Activity, t: "Chart · Scatter · Diurnal 분석" }, { icon: Droplets, t: "점안 순응도 ↔ 안압 연동" }, { icon: Shield, t: "역할별 권한 분리 관리" }].map((r) => (
            <div key={r.t} className="flex items-center gap-2" style={{ color: "#9FC4C6", fontSize: 11.5 }}><r.icon size={13} /> {r.t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: "34px 36px" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>로그인</div>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4, marginBottom: 20 }}>기관에서 발급받은 계정으로 접속하세요.</div>
        <div className="flex flex-col gap-3">
          <Field label="이메일"><input value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="name@clinic.co.kr" style={inp} /></Field>
          <Field label="비밀번호">
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="비밀번호" style={{ ...inp, paddingRight: 40 }} />
              <span className="cursor-pointer" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: 11, color: C.sub }}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</span>
            </div>
          </Field>
          {err && <div className="flex items-center gap-2" style={{ background: C.highSoft, borderRadius: 10, padding: "9px 12px", fontSize: 11.5, color: C.high, fontWeight: 700 }}><AlertTriangle size={14} /> {err}</div>}
          <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: C.sub }}><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> 로그인 상태 유지</label>
            <span className="cursor-pointer" style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>비밀번호 재설정</span>
          </div>
          <button onClick={submit} className="cursor-pointer flex items-center justify-center gap-2" style={{ border: "none", borderRadius: 12, padding: "13px 0", background: C.primary, color: "#fff", fontSize: 14.5, fontWeight: 800, fontFamily: FONT, marginTop: 6 }}><LogIn size={17} /> 로그인</button>
        </div>
        <div className="flex items-center gap-2" style={{ margin: "22px 0 12px" }}>
          <div style={{ flex: 1, height: 1, background: C.line }} />
          <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>데모 계정으로 바로 보기</span>
          <div style={{ flex: 1, height: 1, background: C.line }} />
        </div>
        <div className="flex flex-col gap-2">
          {demo.map((u) => (
            <div key={u.id} onClick={() => onLogin(u)} className="cursor-pointer flex items-center gap-2.5" style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: 99, background: ROLES[u.role].c, color: "#fff", fontSize: 11, fontWeight: 800 }}>{u.name.slice(0, 1)}</span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{u.name}</div>
                <div style={{ fontSize: 10.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
              </div>
              <RoleBadge role={u.role} small />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ProfileModal({ me, onClose, onSave }) {
  const [f, setF] = useState({ name: me.name, phone: me.phone, org: me.org, email: me.email });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  return (
    <Modal title="내 프로필" onClose={onClose}>
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 99, background: ROLES[me.role].c, color: "#fff", fontSize: 19, fontWeight: 800 }}>{me.name.slice(0, 1)}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{me.name}</div>
          <div className="flex items-center gap-2" style={{ marginTop: 3 }}><RoleBadge role={me.role} small /><span style={{ fontSize: 11, color: C.sub }}>최근 로그인 {me.last}</span></div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="이름"><input value={f.name} onChange={(e) => set("name", e.target.value)} style={inpSm} /></Field>
        <Field label="이메일 (로그인 ID)"><input value={f.email} disabled style={{ ...inpSm, background: C.bg, color: C.sub }} /></Field>
        <div className="flex gap-2.5">
          <Field label="연락처"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} style={inpSm} /></Field>
          <Field label="기관"><input value={f.org} onChange={(e) => set("org", e.target.value)} style={inpSm} /></Field>
        </div>
        <Field label="역할"><div style={{ ...inpSm, background: C.bg, color: C.sub }}>{ROLES[me.role].label} — {ROLES[me.role].desc}</div></Field>
        <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5 }}>이메일과 역할은 기관 관리자만 변경할 수 있습니다.</div>
        <div className="flex gap-2.5" style={{ marginTop: 2 }}>
          <button onClick={onClose} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
          <button onClick={() => onSave(f)} className="cursor-pointer" style={{ flex: 2, border: "none", background: C.primary, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>저장</button>
        </div>
      </div>
    </Modal>
  );
}
function PasswordModal({ onClose }) {
  const [cur, setCur] = useState(""); const [n1, setN1] = useState(""); const [n2, setN2] = useState(""); const [done, setDone] = useState(false);
  const rules = [
    { t: "8자 이상", ok: n1.length >= 8 }, { t: "영문 포함", ok: /[A-Za-z]/.test(n1) },
    { t: "숫자 포함", ok: /\d/.test(n1) }, { t: "새 비밀번호 일치", ok: !!n1 && n1 === n2 },
  ];
  const ok = cur && rules.every((r) => r.ok);
  return (
    <Modal title="비밀번호 변경" onClose={onClose}>
      {done ? (
        <div className="flex flex-col items-center" style={{ padding: "18px 0 8px" }}>
          <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 999, background: C.lowSoft, color: C.low, marginBottom: 12 }}><Check size={26} strokeWidth={3} /></div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>비밀번호가 변경되었습니다</div>
          <button onClick={onClose} className="cursor-pointer" style={{ width: "100%", border: "none", background: C.primary, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT, marginTop: 18 }}>확인</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="현재 비밀번호" req><input type="password" value={cur} onChange={(e) => setCur(e.target.value)} style={inpSm} /></Field>
          <Field label="새 비밀번호" req><input type="password" value={n1} onChange={(e) => setN1(e.target.value)} style={inpSm} /></Field>
          <Field label="새 비밀번호 확인" req><input type="password" value={n2} onChange={(e) => setN2(e.target.value)} style={inpSm} /></Field>
          <div className="grid grid-cols-2" style={{ gap: 6 }}>
            {rules.map((r) => (
              <div key={r.t} className="flex items-center gap-1.5" style={{ fontSize: 11, color: r.ok ? C.low : C.sub }}>
                <span className="flex items-center justify-center" style={{ width: 15, height: 15, borderRadius: 99, background: r.ok ? C.lowSoft : "#EEF2F1", color: r.ok ? C.low : C.grey }}>{r.ok ? <Check size={10} strokeWidth={3.5} /> : <X size={10} strokeWidth={3} />}</span>{r.t}
              </div>
            ))}
          </div>
          <div className="flex gap-2.5" style={{ marginTop: 2 }}>
            <button onClick={onClose} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
            <button onClick={() => ok && setDone(true)} disabled={!ok} className="cursor-pointer" style={{ flex: 2, border: "none", background: ok ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>변경</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
function NotifCenter({ alerts, read, setRead, sent, onSend, onExtend, onReturn, onOpenPatient, onBatch }) {
  const [open, setOpen] = useState(false);
  const unread = alerts.filter((x) => !read.includes(x.dev.serial)).length;
  const markAll = () => setRead(alerts.map((x) => x.dev.serial));
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, background: open ? "rgba(255,255,255,.14)" : "transparent", position: "relative" }}>
        <Bell size={17} color={unread ? "#fff" : "#9FC4C6"} />
        {unread > 0 && <span className="flex items-center justify-center" style={{ position: "absolute", top: 3, right: 2, minWidth: 15, height: 15, padding: "0 3px", borderRadius: 99, background: C.high, color: "#fff", fontSize: 9, fontWeight: 800 }}>{unread}</span>}
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380, maxHeight: 460, overflowY: "auto", background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: "0 18px 40px -12px rgba(8,52,62,.35)", zIndex: 31 }}>
            <div className="flex items-center justify-between" style={{ padding: "12px 15px", borderBottom: `1px solid ${C.line}`, background: C.bg, position: "sticky", top: 0 }}>
              <div className="flex items-center gap-1.5"><Bell size={14} color={C.primary} /><span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>대여 기기 반납 알림</span><span style={{ fontSize: 11, color: C.sub }}>{alerts.length}건</span></div>
              <div className="flex items-center gap-2">
                {onBatch && alerts.length > 0 && <span onClick={() => { onBatch(); markAll(); }} className="cursor-pointer flex items-center gap-1" style={{ fontSize: 11, color: C.primary, fontWeight: 800 }}><Play size={11} /> 일괄 발송</span>}
                {unread > 0 && <span onClick={markAll} className="cursor-pointer flex items-center gap-1" style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}><CheckCheck size={12} /> 모두 읽음</span>}
              </div>
            </div>
            {alerts.length === 0 && <div className="flex flex-col items-center" style={{ padding: "36px 20px", color: C.sub }}><Check size={22} color={C.low} /><div style={{ fontSize: 12.5, marginTop: 8 }}>반납 예정 알림이 없습니다.</div></div>}
            {alerts.map((x) => {
              const isRead = read.includes(x.dev.serial);
              const log = sent[x.dev.serial] || [];
              return (
                <div key={x.dev.serial} style={{ padding: "12px 15px", borderBottom: `1px solid ${C.line}`, background: isRead ? "#fff" : x.a.bg + "50" }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                    <AlertChip a={x.a} small />
                    <span onClick={() => { onOpenPatient(x.pt); setOpen(false); }} className="cursor-pointer" style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{x.pt ? x.pt.name : "-"}</span>
                    <span style={{ fontSize: 10.5, color: C.sub }}>{x.dev.name}</span>
                    {!isRead && <span style={{ width: 6, height: 6, borderRadius: 99, background: C.high, marginLeft: "auto" }} />}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.45, marginBottom: 7 }}>{x.a.msg}</div>
                  <div style={{ fontSize: 10.5, color: C.sub, marginBottom: 8 }}>반납 예정 <b style={{ color: x.a.c }}>{x.dev.rentTo}</b>{log.length > 0 && <> · <span style={{ color: C.low, fontWeight: 700 }}>발송 {log.length}회</span></>}</div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { onSend(x.dev.serial, x.a); setRead((r) => (r.includes(x.dev.serial) ? r : [...r, x.dev.serial])); }} className="cursor-pointer flex items-center gap-1" style={{ border: "none", background: x.a.c, color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 800, fontFamily: FONT }}><MessageSquare size={11} /> 알림 발송</button>
                    <button onClick={() => onExtend(x.dev.serial, 7)} className="cursor-pointer flex items-center gap-1" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT }}><CalendarDays size={11} /> 7일 연장</button>
                    <button onClick={() => onReturn(x.dev.serial)} className="cursor-pointer flex items-center gap-1" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.primary, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT }}><Undo2 size={11} /> 반납 처리</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   의료진 웹 — 환자(고객 DB) · 상세
   ============================================================ */
function PatientsPage({ role, patients, setPatients, onOpen, devices, setDevices, alerts = [] }) {
  const [q, setQ] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [sort, setSort] = useState({ k: "notify", dir: "asc" });
  const [devFilt, setDevFilt] = useState("all");
  const [add, setAdd] = useState(false);
  const perm = CAN[role];
  const devOf = (pid) => devices.find((d) => d.assignedTo === pid);

  const rows = useMemo(() => {
    const rank = { 고: 0, 중: 1, 저: 2, "-": 3 };
    let r = patients.filter((p) => {
      if (!(showInactive || p.active)) return false;
      const d = devOf(p.id);
      if (devFilt === "rental" && !(d && d.owner === "기관")) return false;
      if (devFilt === "owned" && !(d && d.owner === "개인")) return false;
      if (devFilt === "none" && d) return false;
      if (devFilt === "due" && !(d && ["due", "overdue"].includes(deviceState(d).k))) return false;
      if (devFilt === "lowadh" && !(p.adh != null && p.adh < 80)) return false;
      return !q || [p.name, p.id, p.email, p.phone, p.loginId, p.serial].join(" ").toLowerCase().includes(q.toLowerCase());
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const devRank = (p) => ({ overdue: 0, due: 1, rent: 2, owned: 3, none: 9 }[deviceState(devOf(p.id)).k] ?? 8);
    return [...r].sort((a, b) => {
      if (sort.k === "notify") return (rank[a.notify] - rank[b.notify]) * dir;
      if (sort.k === "device") return (devRank(a) - devRank(b)) * dir;
      if (sort.k === "adh") return ((a.adh ?? -1) - (b.adh ?? -1)) * dir;
      if (sort.k === "cnt" || sort.k === "lastOD") return (a[sort.k] - b[sort.k]) * dir;
      return String(a[sort.k]).localeCompare(String(b[sort.k]), "ko") * dir;
    });
  }, [patients, q, showInactive, sort, devFilt, devices]);

  const due = alerts.filter((x) => x.a.dd >= 0);
  const late = alerts.filter((x) => x.a.dd < 0 && !x.a.blocked);
  const blocked = alerts.filter((x) => x.a.blocked);
  const COLS = "1fr 0.8fr 0.45fr 1fr 0.85fr 0.9fr 0.75fr 1.05fr 1.05fr 0.5fr";

  return (
    <div style={{ padding: "16px 20px" }}>
      {alerts.length > 0 && (
        <div className="flex items-center gap-3" style={{ marginBottom: 12, padding: "11px 14px", borderRadius: 12, background: blocked.length ? C.highSoft : late.length ? C.highSoft + "80" : C.midSoft, border: `1px solid ${blocked.length || late.length ? C.high : C.mid}35` }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 11, background: "#fff", color: blocked.length ? C.high : C.mid }}>{blocked.length ? <WifiOff size={17} /> : <BellRing size={17} />}</div>
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>대여 기기 반납 알림 {alerts.length}건{blocked.length > 0 && <span style={{ color: C.high }}> · 데이터 수신 중단 {blocked.length}명</span>}</div>
            <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>반납 임박 {due.length}명 · 연체 {late.length}명 — 우측 상단 알림에서 일괄 처리할 수 있습니다.</div>
          </div>
          <div className="flex items-center gap-1.5">
            {alerts.slice(0, 3).map((x) => (
              <span key={x.dev.serial} onClick={() => onOpen(x.pt)} className="cursor-pointer" style={{ fontSize: 11, fontWeight: 700, color: x.a.c, background: "#fff", borderRadius: 999, padding: "5px 11px", border: `1px solid ${x.a.c}30` }}>
                {x.pt ? x.pt.name : "-"} {x.a.dd >= 0 ? `D-${x.a.dd}` : `+${-x.a.dd}일`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between" style={{ marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 260, flexWrap: "wrap" }}>
          <div className="flex items-center gap-2" style={{ width: 250, border: `1px solid ${C.line}`, borderRadius: 10, padding: "7px 11px", background: "#fff" }}>
            <Search size={14} color={C.sub} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · ID · 연락처 · 기기 검색" style={{ flex: 1, border: "none", outline: "none", fontSize: 12.5, fontFamily: FONT, color: C.ink }} />
            {q && <X size={14} color={C.grey} className="cursor-pointer" onClick={() => setQ("")} />}
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12, color: C.sub }}>
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> 비활성 표시
          </label>
          <div className="flex" style={{ gap: 4 }}>
            {[{ id: "all", t: "전체" }, { id: "rental", t: "병원 대여" }, { id: "owned", t: "개인 소유" }, { id: "due", t: "반납 임박·연체" }, { id: "lowadh", t: "순응도 80% 미만" }, { id: "none", t: "미배정" }].map((f) => (
              <button key={f.id} onClick={() => setDevFilt(f.id)} className="cursor-pointer"
                style={{ border: `1px solid ${devFilt === f.id ? C.primary : C.line}`, background: devFilt === f.id ? C.primary : "#fff", color: devFilt === f.id ? "#fff" : C.sub, borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}>{f.t}</button>
            ))}
          </div>
        </div>
        {perm.addPatient && (
          <button onClick={() => setAdd(true)} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", borderRadius: 10, padding: "9px 15px", background: C.primary, color: "#fff", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><UserPlus size={14} /> 신규 환자 등록</button>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: COLS, fontSize: 10.5, padding: "0 6px 8px", borderBottom: `1px solid ${C.line}`, gap: 6 }}>
        <SortHead label="이름" k="name" sort={sort} setSort={setSort} />
        <SortHead label="환자 ID" k="id" sort={sort} setSort={setSort} />
        <SortHead label="성별" k="gender" sort={sort} setSort={setSort} />
        <SortHead label="연락처" k="phone" sort={sort} setSort={setSort} />
        <SortHead label="가입 경로" k="join" sort={sort} setSort={setSort} />
        <SortHead label="기기 구분" k="device" sort={sort} setSort={setSort} />
        <SortHead label="순응도" k="adh" sort={sort} setSort={setSort} />
        <SortHead label="시리얼 · 기간" k="serial" sort={sort} setSort={setSort} />
        <SortHead label="기기 상태" k="device" sort={sort} setSort={setSort} />
        <SortHead label="알림" k="notify" sort={sort} setSort={setSort} />
      </div>

      {rows.map((p, i) => { const dv = devOf(p.id); const dst = deviceState(dv); return (
        <div key={p.id} onClick={() => onOpen(p)} className="grid items-center cursor-pointer"
          style={{ gridTemplateColumns: COLS, gap: 6, padding: "10px 6px", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : "none", background: dst.k === "overdue" ? C.highSoft + "70" : p.notify === "고" ? C.highSoft + "40" : "transparent", opacity: p.active ? 1 : 0.55 }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
            {!p.certified && <Flag size={11} color={C.gold} />}
          </div>
          <span style={{ fontSize: 11.5, color: C.sub, fontFamily: "monospace" }}>{p.id}</span>
          <span style={{ fontSize: 12, color: C.ink }}>{p.gender}</span>
          <span style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.phone}</span>
          <span><JoinBadge join={p.join} /></span>
          <span>{dv ? <OwnerBadge owner={dv.owner} small /> : <span style={{ fontSize: 10.5, color: C.grey }}>미배정</span>}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: p.adh == null ? C.grey : p.adh >= 80 ? C.low : C.high }}>{p.adh == null ? "-" : `${p.adh}%`}</span>
          <span style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.35 }}>
            {dv ? <><span style={{ fontFamily: "monospace" }}>{dv.serial}</span><br />{dv.owner === "기관" ? `${dv.rentFrom.slice(5)} ~ ${dv.rentTo.slice(5)}` : `연동 ${dv.linkedAt.slice(5)}`}</> : "—"}
          </span>
          <span><DevStateChip st={dst} small /></span>
          <span className="flex items-center justify-end gap-1.5">
            {p.notify !== "-" && <RiskPill r={p.notify} small />}
            <ChevronRight size={14} color={C.grey} />
          </span>
        </div>
      ); })}
      {rows.length === 0 && <div style={{ padding: "36px 0", textAlign: "center", fontSize: 12.5, color: C.sub }}>조건에 맞는 환자가 없습니다.</div>}

      <div className="flex items-center justify-between" style={{ marginTop: 12, fontSize: 11.5, color: C.sub }}>
        <span>
          총 {rows.length}명 · 병원 대여 {rows.filter((r) => { const d = devOf(r.id); return d && d.owner === "기관"; }).length}명 ·
          개인 소유 {rows.filter((r) => { const d = devOf(r.id); return d && d.owner === "개인"; }).length}명 ·
          <b style={{ color: C.high }}> 순응도 미달 {rows.filter((r) => r.adh != null && r.adh < 80).length}명</b> ·
          미인증 {rows.filter((r) => !r.certified).length}명
        </span>
        {perm.download && <button className="cursor-pointer flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, padding: "6px 11px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}><Download size={12} /> 기관 데이터 다운로드</button>}
      </div>

      {add && (
        <Modal title="신규 환자 등록" onClose={() => setAdd(false)} wide>
          <AddPatientForm devices={devices} onCancel={() => setAdd(false)}
            onSubmit={(p, dev) => {
              setPatients((ps) => [p, ...ps]);
              if (dev) setDevices((ds) => ds.some((d) => d.serial === dev.serial) ? ds.map((d) => (d.serial === dev.serial ? { ...d, ...dev } : d)) : [...ds, dev]);
              setAdd(false);
            }} />
        </Modal>
      )}
    </div>
  );
}
function AddPatientForm({ onCancel, onSubmit, devices = [] }) {
  const [f, setF] = useState({ name: "", gender: "남", birth: "", phone: "", email: "", loginId: "", pw: "", dx: "", targetOD: 15, targetOS: 15, join: "개별", serial: "" });
  const [devMode, setDevMode] = useState("rental");
  const [rentFrom, setRentFrom] = useState(TODAY_STR);
  const [rentTo, setRentTo] = useState("2026-08-03");
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const free = devices.filter((d) => d.owner === "기관" && d.use === "home" && d.active && !d.assignedTo);
  const serialOK = /^CVT2H?-[0-9A-Z]{6,10}$/.test(f.serial.trim());
  const taken = devices.some((d) => d.serial === f.serial.trim() && d.assignedTo);
  const devOK = devMode === "later" || (devMode === "rental" && !!f.serial) || (devMode === "owned" && serialOK && !taken);
  const ok = f.name && f.phone && f.loginId && devOK;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5">
        <Field label="이름" req><input value={f.name} onChange={(e) => set("name", e.target.value)} style={inpSm} /></Field>
        <Field label="성별" req>
          <div className="flex" style={{ gap: 5 }}>
            {["남", "여"].map((g) => <button key={g} onClick={() => set("gender", g)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${f.gender === g ? C.primary : C.line}`, background: f.gender === g ? C.mint : "#fff", color: f.gender === g ? C.primary : C.sub, borderRadius: 9, padding: "8px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>{g}</button>)}
          </div>
        </Field>
        <Field label="생년월일"><input type="date" value={f.birth} onChange={(e) => set("birth", e.target.value)} style={inpSm} /></Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="연락처" req><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" style={inpSm} /></Field>
        <Field label="이메일"><input value={f.email} onChange={(e) => set("email", e.target.value)} style={inpSm} /></Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="로그인 ID" req><input value={f.loginId} onChange={(e) => set("loginId", e.target.value)} style={inpSm} /></Field>
        <Field label="임시 비밀번호"><input value={f.pw} onChange={(e) => set("pw", e.target.value)} placeholder="자동 생성 가능" style={inpSm} /></Field>
        <Field label="가입 경로">
          <select value={f.join} onChange={(e) => set("join", e.target.value)} style={inpSm}>
            <option value="개별">개별 등록</option>
            {SNS.flatMap((g) => g.items).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            <option value="비회원">비회원</option>
          </select>
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="진단명"><input value={f.dx} onChange={(e) => set("dx", e.target.value)} placeholder="예: 정상안압녹내장 (NTG)" style={inpSm} /></Field>
        <Field label="목표 OD"><input type="number" value={f.targetOD} onChange={(e) => set("targetOD", +e.target.value)} style={inpSm} /></Field>
        <Field label="목표 OS"><input type="number" value={f.targetOS} onChange={(e) => set("targetOS", +e.target.value)} style={inpSm} /></Field>
      </div>

      <div style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 13px", background: C.bg }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 9 }}>
          <Monitor size={13} color={C.primary} /><span style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>안압계 기기</span><span style={{ fontSize: 10, color: C.sub }}>대여 · 개인 소유 중 선택</span>
        </div>
        <div className="flex" style={{ gap: 7, marginBottom: 11 }}>
          {[{ id: "rental", t: "병원 대여", d: `보유 ${free.length}대 가능`, icon: Building2, c: C.primary },
            { id: "owned", t: "개인 소유", d: "환자 보유 기기 연동", icon: User, c: C.aqua },
            { id: "later", t: "나중에", d: "추후 배정", icon: Clock, c: C.sub }].map((m) => {
            const on = devMode === m.id;
            return (
              <div key={m.id} onClick={() => { setDevMode(m.id); set("serial", ""); }} className="cursor-pointer flex flex-col items-center"
                style={{ flex: 1, border: `1.5px solid ${on ? m.c : C.line}`, background: on ? m.c + "12" : "#fff", borderRadius: 11, padding: "10px 6px" }}>
                <m.icon size={16} color={on ? m.c : C.sub} />
                <div style={{ fontSize: 12, fontWeight: 800, color: on ? m.c : C.ink, marginTop: 4 }}>{m.t}</div>
                <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{m.d}</div>
              </div>
            );
          })}
        </div>
        {devMode === "rental" && (
          <div className="flex flex-col gap-2.5">
            <Field label="대여할 기기" req>
              <select value={f.serial} onChange={(e) => set("serial", e.target.value)} style={inpSm}>
                <option value="">보유 장치에서 선택하세요</option>
                {free.map((d) => <option key={d.serial} value={d.serial}>{d.name} · {d.serial} · 배터리 {d.battery}%</option>)}
              </select>
            </Field>
            <div className="flex gap-2.5">
              <Field label="대여 시작"><input type="date" value={rentFrom} onChange={(e) => setRentFrom(e.target.value)} style={inpSm} /></Field>
              <Field label="반납 예정일"><input type="date" value={rentTo} min={rentFrom} onChange={(e) => setRentTo(e.target.value)} style={inpSm} /></Field>
            </div>
          </div>
        )}
        {devMode === "owned" && (
          <div className="flex flex-col gap-2.5">
            <Field label="시리얼 번호" req><input value={f.serial} onChange={(e) => set("serial", e.target.value.toUpperCase())} placeholder="CVT2H-0000AA00" style={{ ...inpSm, fontFamily: "monospace" }} /></Field>
            <div style={{ fontSize: 10.5, lineHeight: 1.45, color: !f.serial ? C.sub : taken ? C.high : serialOK ? C.low : C.high }}>
              {!f.serial ? "환자가 구입한 기기의 시리얼 번호를 입력하세요." : taken ? "이미 다른 환자에게 배정된 시리얼입니다." : serialOK ? "✓ 연동 가능합니다." : "형식이 올바르지 않습니다. 예: CVT2H-2033AA11"}
            </div>
          </div>
        )}
        {devMode === "later" && <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.45 }}>기기 없이 먼저 등록합니다. 환자 상세 → <b>기기</b> 탭에서 언제든 배정할 수 있습니다.</div>}
      </div>

      <div className="flex gap-2.5" style={{ marginTop: 2 }}>
        <button onClick={onCancel} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
        <button onClick={() => {
          if (!ok) return;
          const pid = "P-" + Math.floor(Math.random() * 900 + 1100);
          const serial = f.serial.trim();
          const np = { ...f, serial: serial || "—", id: pid, lastAt: "-", lastOD: 0, cnt: 0, adh: null, notify: "-", active: true, period: devMode === "rental" ? `${rentFrom} ~ ${rentTo}` : "-", certified: false, dx: f.dx || "미지정" };
          let dev = null;
          if (devMode === "rental") dev = { serial, assignedTo: pid, rentFrom, rentTo };
          if (devMode === "owned") dev = { serial, name: `${f.name} 개인 기기`, type: "CVT200 HOME", owner: "개인", use: "home", org: "씨엔브이 안과", assignedTo: pid, rentFrom: null, rentTo: null, linkedAt: TODAY_STR, battery: 100, fw: "1.4.2", active: true };
          onSubmit(np, dev);
        }} disabled={!ok} className="cursor-pointer" style={{ flex: 2, border: "none", background: ok ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>등록</button>
      </div>
    </div>
  );
}


/* ---------- 목표 안압 변경 ---------- */
function TargetModal({ p, onClose, onSave }) {
  const [od, setOd] = useState(p.targetOD);
  const [os, setOs] = useState(p.targetOS);
  const [note, setNote] = useState("");
  const dirty = od !== p.targetOD || os !== p.targetOS;
  return (
    <Modal title="목표 안압 변경" onClose={onClose}>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: C.mint, color: C.primary }}><Gauge size={19} /></div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: C.sub }}>{p.dx} · 현재 OD {p.targetOD} / OS {p.targetOS} mmHg</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {[{ l: "우안 OD", v: od, set: setOd, c: C.od }, { l: "좌안 OS", v: os, set: setOs, c: C.os }].map((t) => (
          <div key={t.l} className="flex items-center gap-3" style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 13px" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: t.c, width: 62, flexShrink: 0 }}>{t.l}</span>
            <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
              <button onClick={() => t.set(Math.max(8, t.v - 1))} className="cursor-pointer" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, width: 30, height: 30, fontSize: 17, fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>−</button>
              <input type="number" min={8} max={30} value={t.v} onChange={(e) => { const n = Number(e.target.value); if (!isNaN(n)) t.set(Math.min(30, Math.max(8, n))); }}
                style={{ width: 52, textAlign: "center", border: "none", outline: "none", fontSize: 19, fontWeight: 800, color: C.ink, fontFamily: FONT, background: "transparent" }} />
              <button onClick={() => t.set(Math.min(30, t.v + 1))} className="cursor-pointer" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 8, width: 30, height: 30, fontSize: 17, fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>＋</button>
              <span style={{ fontSize: 11, color: C.sub, width: 34, flexShrink: 0 }}>mmHg</span>
            </div>
          </div>
        ))}
        <Field label="변경 사유 (선택)"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 시야검사 진행 소견으로 하향 조정" style={inpSm} /></Field>
        <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5 }}>
          저장하면 환자 앱의 게이지·추세 목표선·초과 알림에 즉시 반영되고, 변경 이력이 기록됩니다.
        </div>
        <div className="flex gap-2.5" style={{ marginTop: 2 }}>
          <button onClick={onClose} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
          <button onClick={() => dirty && onSave({ targetOD: od, targetOS: os, note })} disabled={!dirty} className="cursor-pointer"
            style={{ flex: 2, border: "none", background: dirty ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>변경 저장</button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- 진료 보고서 생성 ---------- */
/* ---------- 보고서 데이터 구성 · HTML/TEXT 렌더 ---------- */
const REPORT_SECTIONS = [
  { id: "iop", t: "안압 측정 요약 · 그래프", on: true },
  { id: "adh", t: "점안 순응도 · 원인 분석", on: true },
  { id: "ae", t: "부작용 보고", on: true },
  { id: "survey", t: "전자 문진 12항목", on: false },
  { id: "wear", t: "워치 활동·수면 데이터", on: false },
  { id: "device", t: "기기 대여·반납 이력", on: false },
];
function buildReportData(p, from, to, sec, gtype) {
  const pts = trendDataRange(from, to);
  const mean = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : 0);
  const blocks = [];

  if (sec.includes("iop")) {
    const odAvg = mean(pts.map((x) => x.odAvg)), osAvg = mean(pts.map((x) => x.osAvg));
    const peak = Math.max(...pts.map((x) => x.odMax));
    const overDays = pts.filter((x) => x.odAvg > p.targetOD).length;
    const flucAvg = mean(pts.map((x) => x.fluc));
    blocks.push({ h: "1. 안압 측정 요약", kv: [
      ["측정 기간", `${from} ~ ${to}`],
      ["총 측정 횟수", `${pts.reduce((a, x) => a + x.cnt, 0)}회`],
      ["우안(OD) 평균", `${odAvg} mmHg (목표 ${p.targetOD})`],
      ["좌안(OS) 평균", `${osAvg} mmHg (목표 ${p.targetOS})`],
      ["기간 최고 안압", `${peak.toFixed(1)} mmHg`],
      ["목표 초과일", `${overDays}일 / ${pts.length}일 (${Math.round((overDays / pts.length) * 100)}%)`],
      ["평균 일중 변동폭", `${flucAvg} mmHg (5 이상 주의)`],
      ["그래프 형식", (GRAPH_TYPES.find((g) => g.id === gtype) || {}).ko],
    ]});
    blocks.push({ h: "1-1. 일자별 안압 추이", table: {
      head: ["일자", "우안 평균", "우안 최소~최대", "좌안 평균", "측정 횟수", "점안 순응도"],
      rows: pts.map((x) => [x.d, x.odAvg, `${x.odMin} ~ ${x.odMax}`, x.osAvg, `${x.cnt}회`, `${x.adh}%`]),
    }});
    blocks.push({ h: "1-2. 최근 측정 이력", table: {
      head: ["측정 시각", "기기", "측정 눈", "IOP(OD)", "품질", "IOP(OS)", "품질", "기록"],
      rows: MEAS_ROWS.map((r) => [r.at, r.dev, r.eye, r.od == null ? "–" : r.od.toFixed(1), r.qod, r.os == null ? "–" : r.os.toFixed(1), r.qos, r.src]),
    }});
  }

  if (sec.includes("adh")) {
    const all = overallAdherence(from, to);
    const byMed = adherenceByMed(from, to);
    const bySlot = adherenceBySlot(from, to);
    const { causes } = rootCauses(from, to, MEDS_INIT);
    blocks.push({ h: "2. 점안 순응도", kv: [
      ["기간 평균 순응도", `${all.pct}% (${all.taken}/${all.total}회)`],
      ["누락 횟수", `${all.missed}회`],
      ["목표 기준", `${ADH_TARGET}% 이상`],
    ]});
    blocks.push({ h: "2-1. 약제별 순응도", table: {
      head: ["약제", "예정", "실행", "순응도"],
      rows: byMed.map((m) => [m.key, `${m.total}회`, `${m.taken}회`, `${m.pct}%`]),
    }});
    blocks.push({ h: "2-2. 투약 시각별 순응도", table: {
      head: ["투약 시각", "예정", "실행", "순응도"],
      rows: bySlot.map((m) => [m.key, `${m.total}회`, `${m.taken}회`, `${m.pct}%`]),
    }});
    blocks.push({ h: "2-3. 처방 점안제", table: {
      head: ["제품 · 성분", "제약회사", "제형", "부위", "용법", "기록 방식", "약병 상태"],
      rows: RX_ROWS.map((r) => [`${r.name} (${r.ingr})`, r.maker, r.dose, r.eye, r.sched, `${r.src}${r.monitor ? " · " + r.monitor : ""}`, r.bottle]),
    }});
    if (causes.length) blocks.push({ h: "2-4. 순응도 저하 추정 원인", list:
      causes.slice(0, 5).map((c, i) => `${i + 1}. [${c.cat}] ${c.title} (영향도 −${c.impact}%p)\n    근거: ${c.detail}\n    권고: ${c.action}`),
      note: "인과 판정이 아니라 기록 대조를 통한 연관성 제시입니다.",
    });
  }

  if (sec.includes("ae")) {
    blocks.push({ h: "3. 부작용 보고", table: {
      head: ["보고 일시", "약제", "부위", "증상", "정도", "비고"],
      rows: SE_LOG_INIT.map((e) => [e.at, e.med, EYE_LABEL[e.eye], e.items.join(", "), e.severity, e.note || "-"]),
    }});
  }

  if (sec.includes("survey")) {
    blocks.push({ h: "4. 전자 문진 12항목", table: {
      head: ["번호", "항목", "응답", "위험도"],
      rows: SURVEY_ROWS.map((r) => [r.id, r.t, r.v, (RISK[r.r] || {}).label || "-"]),
    }});
  }

  if (sec.includes("wear")) {
    blocks.push({ h: "5. 워치 활동 · 수면", table: {
      head: ["지표", "값", "참고"],
      rows: [["걸음 수", "6,420 걸음", "7일 평균 7,100"], ["수면 시간", "6시간 40분", "자주 깸 · 질 보통"],
             ["안정 시 심박", "72 bpm", "정상 범위"], ["불규칙 맥박(IRN)", "감지", "6/30 · 미확진"]],
    }});
  }

  if (sec.includes("device")) {
    blocks.push({ h: "6. 기기 대여 · 반납 이력", table: {
      head: ["항목", "내용"],
      rows: [["기기 시리얼", p.serial || "-"], ["소유 구분", "병원 대여"], ["사용 기간", p.period || "-"],
             ["현재 상태", deviceState(DEVICES_INIT.find((d) => d.serial === p.serial)).label]],
    }});
  }

  return {
    title: "녹내장 관리 진료 보고서",
    org: "씨엔브이 안과 · 안압케어 CLINIC",
    patient: [["환자명", p.name], ["환자 ID", p.id], ["성별 · 생년월일", `${p.gender} · ${p.birth || "-"}`],
              ["진단명", p.dx], ["목표 안압", `OD ${p.targetOD} / OS ${p.targetOS} mmHg`], ["대상 기간", `${from} ~ ${to}`]],
    issuedAt: `${isoDate(new Date())} ${nowHM()}`,
    blocks,
  };
}
function reportHtml(d) {
  const esc = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const kv = (rows) => `<table class="kv">${rows.map((r) => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>`;
  const tbl = (t) => `<table class="d"><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>`
    + `<tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const body = d.blocks.map((b) => `<section><h2>${esc(b.h)}</h2>`
    + (b.kv ? kv(b.kv) : "")
    + (b.table ? tbl(b.table) : "")
    + (b.list ? `<ol class="cs">${b.list.map((x) => `<li>${esc(x).replace(/\n/g, "<br>")}</li>`).join("")}</ol>` : "")
    + (b.note ? `<p class="note">${esc(b.note)}</p>` : "") + `</section>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${esc(d.title)} - ${esc(d.patient[0][1])}</title>
<style>
*{box-sizing:border-box}
body{font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;color:#0A2A31;margin:0;padding:28px 30px;background:#fff;font-size:12px;line-height:1.6}
header{border-bottom:2px solid #0E5563;padding-bottom:12px;margin-bottom:16px}
h1{font-size:19px;margin:0 0 4px;color:#0E5563}
.org{font-size:11px;color:#5E7A7C}
.issued{font-size:10px;color:#8AA0A1;margin-top:6px}
h2{font-size:13px;margin:20px 0 8px;color:#0A2A31;border-left:4px solid #3EA6A6;padding-left:8px}
table{width:100%;border-collapse:collapse;margin-bottom:6px}
.kv th{width:130px;text-align:left;background:#F3F7F6;color:#5E7A7C;font-weight:700;padding:6px 10px;border:1px solid #E2EAE9;font-size:11px}
.kv td{padding:6px 10px;border:1px solid #E2EAE9;font-size:11.5px}
.d th{background:#0E5563;color:#fff;font-size:10.5px;padding:6px 8px;border:1px solid #0E5563;text-align:left}
.d td{padding:5px 8px;border:1px solid #E2EAE9;font-size:11px}
.d tbody tr:nth-child(even){background:#F8FBFA}
.cs{padding-left:18px;font-size:11.5px}
.cs li{margin-bottom:8px}
.note{font-size:10.5px;color:#5E7A7C;background:#F3F7F6;padding:8px 10px;border-radius:6px;margin-top:4px}
footer{margin-top:26px;padding-top:12px;border-top:1px solid #E2EAE9;font-size:10px;color:#8AA0A1;line-height:1.7}
@media print{body{padding:0}section{page-break-inside:avoid}}
</style></head><body>
<header><h1>${esc(d.title)}</h1><div class="org">${esc(d.org)}</div><div class="issued">발행 ${esc(d.issuedAt)}</div></header>
<section><h2>환자 정보</h2>${kv(d.patient)}</section>
${body}
<footer>본 보고서는 기록된 측정·점안 데이터를 정리한 자료이며 진단·처방 판단을 포함하지 않습니다.<br>
임상적 판단은 의료진의 소견과 함께 이루어져야 합니다. · C&amp;V Tech 안압케어</footer>
</body></html>`;
}
function reportText(d) {
  const line = "=".repeat(56);
  const kv = (rows) => rows.map((r) => `  ${String(r[0]).padEnd(16, " ")}: ${r[1]}`).join("\n");
  const tbl = (t) => [t.head.join(" | "), "-".repeat(56), ...t.rows.map((r) => r.join(" | "))].join("\n");
  const body = d.blocks.map((b) => [`\n[${b.h}]`, b.kv ? kv(b.kv) : "", b.table ? tbl(b.table) : "",
    b.list ? b.list.join("\n") : "", b.note ? `  * ${b.note}` : ""].filter(Boolean).join("\n")).join("\n");
  return [line, `  ${d.title}`, `  ${d.org}`, `  발행 ${d.issuedAt}`, line,
    "\n[환자 정보]", kv(d.patient), body, "\n" + line,
    "본 보고서는 기록된 측정·점안 데이터를 정리한 자료이며 진단·처방 판단을 포함하지 않습니다.", line].join("\n");
}
function downloadBlob(text, filename, mime) {
  try {
    const blob = new Blob(["\uFEFF" + text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (e) { return false; }
}

function ReportModal({ p, from, to, onClose }) {
  const [sec, setSec] = useState(REPORT_SECTIONS.filter((x) => x.on).map((x) => x.id));
  const [gtype, setGtype] = useState("chart");
  const [stage, setStage] = useState("form");        // form | making | done
  const [fmt, setFmt] = useState("pdf");
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState("");
  const frame = useRef(null);
  const toggle = (id) => setSec((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const make = () => { setStage("making"); setTimeout(() => setStage("done"), 1400); };

  const data = useMemo(() => (stage === "done" ? buildReportData(p, from, to, sec, gtype) : null), [stage, p, from, to, sec, gtype]);
  const html = data ? reportHtml(data) : "";
  const base = `안압케어_진료보고서_${p.name}_${from}_${to}`;
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2600); };

  const doPrint = () => {
    try { frame.current.contentWindow.focus(); frame.current.contentWindow.print(); }
    catch (e) { flash("이 환경에서는 인쇄 창을 열 수 없습니다. HTML로 내려받아 브라우저에서 인쇄하세요."); }
  };
  const doDownload = () => {
    if (fmt === "html") {
      flash(downloadBlob(html, `${base}.html`, "text/html;charset=utf-8") ? "HTML 파일을 내려받았습니다." : "다운로드가 차단되었습니다. 미리보기에서 내용을 복사하세요.");
    } else if (fmt === "txt") {
      flash(downloadBlob(reportText(data), `${base}.txt`, "text/plain;charset=utf-8") ? "텍스트 파일을 내려받았습니다." : "다운로드가 차단되었습니다.");
    } else {
      if (!preview) setPreview(true);
      setTimeout(doPrint, 400);
      flash("인쇄 창에서 대상을 'PDF로 저장'으로 선택하세요.");
    }
  };

  const FMTS = [
    { id: "pdf", t: "PDF", d: "인쇄 → PDF로 저장", icon: FileText },
    { id: "html", t: "HTML", d: "웹 문서 파일", icon: Globe },
    { id: "txt", t: "TEXT", d: "텍스트 파일", icon: ListChecks },
  ];

  return (
    <Modal title="진료 보고서 생성" onClose={onClose} wide>
      {stage === "done" ? (
        <div className="flex flex-col" style={{ paddingTop: 4 }}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 999, background: C.lowSoft, color: C.low, marginBottom: 11 }}><FileText size={25} /></div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: C.ink }}>보고서가 생성되었습니다</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 5, textAlign: "center", lineHeight: 1.55 }}>
              {p.name} · {from} ~ {to}<br />선택 항목 {sec.length}개 · {(GRAPH_TYPES.find((g) => g.id === gtype) || {}).ko}
            </div>
          </div>

          {/* 미리보기 */}
          {preview && (
            <div style={{ marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "8px 12px", background: C.bg, borderBottom: `1px solid ${C.line}` }}>
                <span className="flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 800, color: C.primary }}><Eye size={12} /> HTML 미리보기</span>
                <div className="flex items-center gap-2">
                  <span onClick={doPrint} className="cursor-pointer flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: C.sub }}><FileText size={11} /> 인쇄</span>
                  <span onClick={() => setPreview(false)} className="cursor-pointer" style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>닫기</span>
                </div>
              </div>
              <iframe ref={frame} title="report-preview" srcDoc={html} style={{ width: "100%", height: 360, border: "none", background: "#fff" }} />
            </div>
          )}

          {/* 다운로드 형식 */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, marginBottom: 7 }}>다운로드 형식</div>
            <div className="flex" style={{ gap: 7 }}>
              {FMTS.map((f) => {
                const on = fmt === f.id;
                return (
                  <div key={f.id} onClick={() => setFmt(f.id)} className="cursor-pointer flex flex-col items-center"
                    style={{ flex: 1, border: `1.5px solid ${on ? C.primary : C.line}`, background: on ? C.mint : "#fff", borderRadius: 12, padding: "11px 6px" }}>
                    <f.icon size={16} color={on ? C.primary : C.sub} />
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? C.primary : C.ink, marginTop: 4 }}>{f.t}</div>
                    <div style={{ fontSize: 9.5, color: C.sub, marginTop: 1 }}>{f.d}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {msg && (
            <div className="flex items-center gap-2" style={{ marginTop: 11, background: C.mint, borderRadius: 10, padding: "9px 12px", fontSize: 11.5, color: C.ink, fontWeight: 600 }}>
              <Info size={13} color={C.primary} className="flex-shrink-0" /> {msg}
            </div>
          )}

          <div className="flex gap-2.5" style={{ marginTop: 14 }}>
            <button onClick={() => setPreview((v) => !v)} className="cursor-pointer flex items-center justify-center gap-1.5"
              style={{ flex: 1, border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 800, fontFamily: FONT }}>
              <Eye size={14} /> {preview ? "미리보기 닫기" : "미리보기"}
            </button>
            <button onClick={doDownload} className="cursor-pointer flex items-center justify-center gap-1.5"
              style={{ flex: 2, border: "none", background: C.primary, color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>
              <Download size={14} /> {FMTS.find((f) => f.id === fmt).t}로 다운로드
            </button>
          </div>
          <div style={{ fontSize: 10, color: C.sub, marginTop: 9, lineHeight: 1.5, textAlign: "center" }}>
            파일명 {base}.{fmt === "txt" ? "txt" : fmt} · 운영 환경에서는 서버가 PDF를 생성해 15분간 유효한 링크를 제공합니다.
          </div>
        </div>
      ) : stage === "making" ? (
        <div className="flex flex-col items-center" style={{ padding: "40px 0" }}>
          <RefreshCw size={30} color={C.primary} className="animate-spin" />
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginTop: 14 }}>보고서를 만들고 있습니다…</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 4 }}>측정·점안 데이터를 집계하는 중</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5" style={{ padding: "10px 12px", borderRadius: 11, background: C.bg }}>
            <User size={16} color={C.primary} className="flex-shrink-0" />
            <div className="flex-1">
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{p.name} <span style={{ fontSize: 11, color: C.sub, fontWeight: 500 }}>{p.id} · {p.dx}</span></div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>대상 기간 {from} ~ {to}</div>
            </div>
          </div>
          <Field label="포함할 항목">
            <div className="grid grid-cols-2" style={{ gap: 7 }}>
              {REPORT_SECTIONS.map((x) => {
                const on = sec.includes(x.id);
                return (
                  <div key={x.id} onClick={() => toggle(x.id)} className="cursor-pointer flex items-center gap-2"
                    style={{ border: `1.5px solid ${on ? C.primary : C.line}`, background: on ? C.mint : "#fff", borderRadius: 10, padding: "9px 11px" }}>
                    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${on ? C.primary : C.line}`, background: on ? C.primary : "#fff" }}>{on && <Check size={11} color="#fff" strokeWidth={3.5} />}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>{x.t}</span>
                  </div>
                );
              })}
            </div>
          </Field>
          <Field label="안압 그래프 형식"><GraphTypeSwitch value={gtype} onChange={setGtype} compact /></Field>
          <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
            보고서에는 진단·처방 판단이 포함되지 않으며, 기록된 측정·점안 데이터를 정리해 제공합니다.
          </div>
          <div className="flex gap-2.5" style={{ marginTop: 2 }}>
            <button onClick={onClose} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
            <button onClick={make} disabled={!sec.length} className="cursor-pointer flex items-center justify-center gap-1.5"
              style={{ flex: 2, border: "none", background: sec.length ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}><FileText size={14} /> 보고서 생성</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------- 장치 등록 ---------- */
function AddDeviceForm({ devices, onCancel, onSubmit }) {
  const [f, setF] = useState({ name: "", serial: "", model: "CVT200", owner: "org", usage: "home", battery: 100, firmware: "1.4.2" });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const serialOK = /^CVT2H?-[0-9A-Z]{6,10}$/.test(f.serial.trim());
  const dup = devices.some((d) => d.serial === f.serial.trim());
  const ok = f.name.trim() && serialOK && !dup;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5">
        <Field label="장치명" req><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="예: 홈 대여기 #5" style={inpSm} /></Field>
        <Field label="모델">
          <select value={f.model} onChange={(e) => set("model", e.target.value)} style={inpSm}>
            <option value="CVT200">CVT200</option>
            <option value="CVT200 HOME">CVT200 HOME</option>
          </select>
        </Field>
      </div>
      <Field label="시리얼 번호" req>
        <input value={f.serial} onChange={(e) => set("serial", e.target.value.toUpperCase())} placeholder="CVT2H-0000AA00"
          style={{ ...inpSm, fontFamily: "monospace", letterSpacing: "0.04em", borderColor: f.serial ? (ok ? C.low : C.high) : C.line }} />
        <div style={{ fontSize: 10.5, marginTop: 5, lineHeight: 1.45, color: !f.serial ? C.sub : dup ? C.high : serialOK ? C.low : C.high }}>
          {!f.serial ? "기기 뒷면 라벨의 시리얼 번호를 입력하세요."
            : dup ? "이미 등록된 시리얼 번호입니다."
            : serialOK ? "✓ 등록 가능한 형식입니다." : "형식이 올바르지 않습니다. 예: CVT2H-2033AA11"}
        </div>
      </Field>
      <div className="flex gap-2.5">
        <Field label="소유 구분" req>
          <div className="flex" style={{ gap: 5 }}>
            {[{ id: "org", t: "기관 자산" }, { id: "patient", t: "환자 개인" }].map((o) => (
              <button key={o.id} onClick={() => set("owner", o.id)} className="cursor-pointer"
                style={{ flex: 1, border: `1.5px solid ${f.owner === o.id ? C.primary : C.line}`, background: f.owner === o.id ? C.mint : "#fff", color: f.owner === o.id ? C.primary : C.sub, borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{o.t}</button>
            ))}
          </div>
        </Field>
        <Field label="용도" req>
          <div className="flex" style={{ gap: 5 }}>
            {[{ id: "clinic", t: "원내용" }, { id: "home", t: "가정 대여용" }].map((o) => (
              <button key={o.id} onClick={() => set("usage", o.id)} className="cursor-pointer"
                style={{ flex: 1, border: `1.5px solid ${f.usage === o.id ? C.primary : C.line}`, background: f.usage === o.id ? C.mint : "#fff", color: f.usage === o.id ? C.primary : C.sub, borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{o.t}</button>
            ))}
          </div>
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="배터리 (%)"><input type="number" min={0} max={100} value={f.battery} onChange={(e) => set("battery", Math.max(0, Math.min(100, +e.target.value)))} style={inpSm} /></Field>
        <Field label="펌웨어"><input value={f.firmware} onChange={(e) => set("firmware", e.target.value)} style={inpSm} /></Field>
      </div>
      <div style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.5, background: C.bg, borderRadius: 9, padding: "9px 11px" }}>
        기관 자산 · 가정 대여용으로 등록하면 곧바로 <b style={{ color: C.low }}>대여 가능</b> 상태가 되어 환자에게 배정할 수 있습니다.
      </div>
      <div className="flex gap-2.5" style={{ marginTop: 2 }}>
        <button onClick={onCancel} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
        <button onClick={() => ok && onSubmit({
          serial: f.serial.trim(), name: f.name.trim(), type: f.model, model: f.model,
          owner: f.owner === "org" ? "기관" : "개인", use: f.usage, org: "씨엔브이 안과",
          assignedTo: null, rentFrom: null, rentTo: null, linkedAt: null,
          battery: f.battery, fw: f.firmware, active: true,
        })} disabled={!ok} className="cursor-pointer"
          style={{ flex: 2, border: "none", background: ok ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>장치 등록</button>
      </div>
    </div>
  );
}

/* ---------- 환자 상세 ---------- */
const MEAS_ROWS = [
  { at: "2026-07-03 18:30", dev: "CVT200 HOME", eye: "양안", od: 16.1, os: 15.0, qod: "우수", qos: "우수", src: "수동" },
  { at: "2026-07-03 12:10", dev: "CVT200 HOME", eye: "우안", od: 17.2, os: null, qod: "양호", qos: "-", src: "자동" },
  { at: "2026-07-03 07:40", dev: "CVT200 HOME", eye: "양안", od: 16.4, os: 15.2, qod: "우수", qos: "양호", src: "자동" },
  { at: "2026-07-02 21:40", dev: "CVT200 HOME", eye: "양안", od: 15.7, os: 14.8, qod: "우수", qos: "우수", src: "자동" },
  { at: "2026-07-02 13:05", dev: "1진료실 CVT200", eye: "양안", od: 16.9, os: 15.5, qod: "우수", qos: "재측정", src: "자동" },
  { at: "2026-07-01 07:35", dev: "CVT200 HOME", eye: "양안", od: 18.3, os: 16.6, qod: "양호", qos: "우수", src: "자동" },
];
const RX_ROWS = [
  { name: "잘타라노 점안액", ingr: "라타노프로스트", maker: "대우제약", dose: "일회용", eye: "양안", sched: "1일 1회 · 취침 전", src: "자동", monitor: "기기1", prn: false, bottle: "4개 남음", bc: C.low },
  { name: "콤비간 점안액", ingr: "브리모니딘+티몰롤", maker: "한국애브비", dose: "다회용", eye: "양안", sched: "1일 2회 · 08·20시", src: "자동", monitor: "기기2", prn: false, bottle: "폐기 D-3", bc: C.mid },
  { name: "리안점안액", ingr: "히알루론산 0.15%", maker: "삼일제약", dose: "일회용", eye: "양안", sched: "필요 시", src: "수동", monitor: null, prn: true, bottle: "22개 남음", bc: C.low },
];
const SURVEY_ROWS = [
  { id: "Q1", t: "수면 자세", v: "옆으로 누움 / 베개 겹침", r: "중", g: "옆으로 자면 아래쪽 눈의 안압이 높아질 수 있습니다. 침대 머리를 20~30° 올리도록 안내하세요." },
  { id: "Q2", t: "수면무호흡", v: "진단 없음 · 증상 1", r: "-", g: "선별 증상 1개. 증상이 늘면 수면 클리닉 상담을 고려하세요." },
  { id: "Q3", t: "혈압약 시점", v: "취침 전 복용", r: "고", g: "취침 전 복용은 야간 저혈압으로 시신경 관류를 낮출 수 있습니다. 복용 시점 조정을 내과와 상의하도록 권고하세요." },
  { id: "Q4", t: "동반질환", v: "제2형 당뇨 HbA1c 7~8% · 고혈압 1단계", r: "중", g: "혈당·혈압 조절 강화 권고. 야간 혈압 패턴을 함께 확인하세요." },
  { id: "Q5", t: "안압 유발 행동", v: "고중량 발살바 · 눈 비빔", r: "고", g: "발살바 동반 운동과 눈 비빔은 안압을 급상승시킵니다. 호흡법 교정을 안내하세요." },
  { id: "Q6", t: "흡연", v: "과거 흡연 · 12 pack-year · 금연 3년", r: "중", g: "금연 3년 유지 중. 지속 금연을 격려하세요." },
  { id: "Q7", t: "카페인", v: "1~2잔", r: "저", g: "적정 범위입니다." },
  { id: "Q8", t: "식이", v: "잎채소 주 3~5회", r: "저", g: "충분한 섭취. 가능하면 매일로 늘리도록 안내하세요." },
  { id: "Q9", t: "유산소 운동", v: "주 1~2회 · 저강도", r: "중", g: "중강도 주 3회·회당 30분 목표로 점진적 증가를 권고하세요." },
  { id: "Q10", t: "수면 시간·질", v: "6시간 미만 · 자주 깸", r: "중", g: "약 7시간 규칙적 수면을 권고하세요." },
  { id: "Q11", t: "부정맥·AF", v: "진단 없음 + 워치 IRN(미확진)", r: "중", g: "심장내과 심전도(ECG) 확인을 권고하세요." },
  { id: "Q12", t: "음주", v: "주 2~3회 · 2~3잔", r: "중", g: "빈도·양 절주를 권고하세요." },
];
function PatientDetail({ p, role, onBack, devices, setDevices, sent, onSend, onUpdatePatient, toast }) {
  const [tab, setTab] = useState("iop");
  const [gtype, setGtype] = useState("chart");
  const [eyeF, setEyeF] = useState("both");
  const [period, setPeriod] = useState("1개월");
  const [from, setFrom] = useState(RANGE_FROM_DEFAULT);
  const [to, setTo] = useState(RANGE_TO_DEFAULT);
  const [excluded, setExcluded] = useState({});
  const [modal, setModal] = useState(null);        // "target" | "report"
  const perm = CAN[role];
  const pts = period === "custom" ? trendDataRange(from, to) : trendData(period);
  const gmeta = GRAPH_TYPES.find((g) => g.id === gtype);
  const myDev = devices.find((d) => d.assignedTo === p.id);
  const devSt = deviceState(myDev);
  const QCOL = { 우수: C.low, 양호: C.primary, 재측정: C.high, "-": C.grey };
  /* 점안 순응도 — 실제 점안 기록에서 계산 */
  const rFrom = period === "custom" ? from : isoDate(new Date(new Date(TODAY_REF).setDate(TODAY_REF.getDate() - ({ "2주": 14, "1개월": 30, "3개월": 90, "6개월": 120, "1년": 120, "누적": 120 }[period] || 30))));
  const rTo = period === "custom" ? to : TODAY_STR;
  const adhAll = overallAdherence(rFrom, rTo);
  const adhMed = adherenceByMed(rFrom, rTo);
  const adhSlot = adherenceBySlot(rFrom, rTo);
  const adhEye = adherenceByEye(rFrom, rTo);
  const adhOf = (name) => { const f = adhMed.find((x) => x.key === name); return f || null; };
  const { causes: adhCauses } = rootCauses(rFrom, rTo, MEDS_INIT);
  const TABS_D = [{ id: "iop", t: "안압" }, { id: "drops", t: "점안" }, { id: "survey", t: "문진·건강" }, { id: "device", t: "기기" }, { id: "profile", t: "프로필" }];

  return (
    <div style={{ padding: "16px 20px" }}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={onBack} style={{ color: C.primary, marginBottom: 12 }}><ChevronLeft size={18} /><span style={{ fontSize: 13, fontWeight: 700 }}>환자 명단</span></div>
      <div className="flex items-center justify-between" style={{ paddingBottom: 14, borderBottom: `1px solid ${C.line}`, marginBottom: 14 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: C.mint }}><User size={22} color={C.primary} /></div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{p.name}</span>
              <span style={{ fontSize: 12.5, color: C.sub }}>{p.gender} · {p.dx}</span>
              <JoinBadge join={p.join} />
              {!p.certified && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.gold, background: C.goldSoft, padding: "2px 8px", borderRadius: 99 }}>미인증</span>}
            </div>
            <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
              <span style={{ fontSize: 11.5, color: C.sub }}>{p.id} · 목표 OD {p.targetOD} / OS {p.targetOS} mmHg</span>
              {myDev && <OwnerBadge owner={myDev.owner} small />}
              <DevStateChip st={devSt} small />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {perm.editTarget && <button onClick={() => setModal("target")} className="cursor-pointer" style={{ border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 9, padding: "7px 12px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>목표 안압 변경</button>}
          <button onClick={() => setModal("report")} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", background: C.primary, color: "#fff", borderRadius: 9, padding: "8px 13px", fontSize: 12, fontWeight: 800, fontFamily: FONT }}><FileText size={13} /> 보고서</button>
        </div>
      </div>

      <div className="flex" style={{ gap: 4, marginBottom: 14 }}>
        {TABS_D.map((m) => (
          <button key={m.id} onClick={() => setTab(m.id)} className="cursor-pointer"
            style={{ border: `1px solid ${tab === m.id ? C.primary : C.line}`, background: tab === m.id ? C.primary : "#fff", color: tab === m.id ? "#fff" : C.sub, borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{m.t}</button>
        ))}
      </div>

      {tab === "iop" && (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
            <PeriodPicker period={period} from={from} to={to} onPreset={setPeriod} onFrom={(v) => { setFrom(v); setPeriod("custom"); }} onTo={(v) => { setTo(v); setPeriod("custom"); }} />
            <div className="flex items-center gap-2">
              <EyeFilterSwitch value={eyeF} onChange={setEyeF} />
              <div style={{ width: 300 }}><GraphTypeSwitch value={gtype} onChange={setGtype} compact /></div>
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: C.primary }}>{gmeta.label} · {gmeta.ko}</span>
            <span style={{ fontSize: 11, color: C.sub }}>{gmeta.desc}</span>
          </div>
          <IopGraph type={gtype} pts={pts} height={195} targetOD={p.targetOD} targetOS={p.targetOS} eyeFilter={eyeF} />
          <GraphLegend type={gtype} eyeFilter={eyeF} />

          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: "18px 0 8px" }}>측정 이력</div>
          <div className="grid" style={{ gridTemplateColumns: "1.5fr 1.4fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr", fontSize: 10.5, color: C.sub, fontWeight: 700, padding: "0 4px 8px", borderBottom: `1px solid ${C.line}`, gap: 4 }}>
            <span>측정 시각</span><span>기기</span><span>측정 눈</span><span>IOP (OD)</span><span>품질 OD</span><span>IOP (OS)</span><span>품질 OS</span><span>기록</span><span style={{ textAlign: "right" }}>제외</span>
          </div>
          {MEAS_ROWS.map((r, i) => {
            const ex = !!excluded[i];
            return (
              <div key={i} className="grid items-center" style={{ gridTemplateColumns: "1.5fr 1.4fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr", gap: 4, padding: "9px 4px", borderBottom: i < MEAS_ROWS.length - 1 ? `1px solid ${C.line}` : "none", opacity: ex ? 0.45 : 1, background: !ex && r.od != null && r.od > p.targetOD ? C.highSoft + "55" : "transparent" }}>
                <span style={{ fontSize: 12, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{r.at.slice(5)}</span>
                <span style={{ fontSize: 11.5, color: C.sub }}>{r.dev}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>{r.eye}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: r.od == null ? C.grey : r.od > p.targetOD ? C.high : C.od }}>{r.od == null ? "–" : r.od.toFixed(1)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: QCOL[r.qod] }}>{r.qod}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: r.os == null ? C.grey : r.os > p.targetOS ? C.high : C.os }}>{r.os == null ? "–" : r.os.toFixed(1)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: QCOL[r.qos] }}>{r.qos}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: r.src === "수동" ? C.gold : C.primary }}>{r.src}</span>
                <span style={{ textAlign: "right" }}>{perm.exclude ? <input type="checkbox" checked={ex} onChange={(e) => setExcluded((o) => ({ ...o, [i]: e.target.checked }))} className="cursor-pointer" /> : <Lock size={12} color={C.grey} />}</span>
              </div>
            );
          })}
        </>
      )}

      {tab === "drops" && (
        <>
          <div className="grid grid-cols-4" style={{ gap: 10, marginBottom: 14 }}>
            {[
              { l: "기간 평균 순응도", v: `${adhAll.pct}%`, c: adhAll.pct < ADH_TARGET ? C.high : C.low, sub: `${adhAll.taken}/${adhAll.total}회` },
              { l: "누락 횟수", v: `${adhAll.missed}회`, c: C.high, sub: `누락일 ${pts.filter((x) => x.missed).length}일` },
              { l: "누락일 평균 OD", v: pts.filter((x) => x.missed).length ? (pts.filter((x) => x.missed).reduce((a, x) => a + x.odAvg, 0) / pts.filter((x) => x.missed).length).toFixed(1) : "-", c: C.high, sub: "mmHg" },
              { l: "정상일 평균 OD", v: pts.filter((x) => !x.missed).length ? (pts.filter((x) => !x.missed).reduce((a, x) => a + x.odAvg, 0) / pts.filter((x) => !x.missed).length).toFixed(1) : "-", c: C.low, sub: "mmHg" },
            ].map((k) => (
              <div key={k.l} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px" }}>
                <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{k.l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 2 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 1 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <Droplets size={16} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>점안 순응도 ↔ 안압</span>
            <span style={{ fontSize: 11, color: C.sub }}>누락 구간의 안압 변동</span>
          </div>
          <AdhIopChart data={pts} height={185} />
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 6, marginBottom: 16 }}>
            <Legend c={C.od} t="우안 OD" /><Legend c={C.os} t="좌안 OS" /><Legend c={C.high} t="점안 누락일" /><Legend c={C.mintDeep} t="순응도(%)" />
          </div>

          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-2"><Package size={16} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>처방 점안제</span></div>
            {perm.rx && <button className="cursor-pointer flex items-center gap-1.5" style={{ border: `1.5px solid ${C.primary}`, background: "#fff", color: C.primary, borderRadius: 9, padding: "6px 12px", fontSize: 11.5, fontWeight: 800, fontFamily: FONT }}><Plus size={12} /> 처방 추가</button>}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "2.2fr 1.1fr 0.7fr 0.7fr 1.4fr 1.1fr 0.8fr", fontSize: 10.5, color: C.sub, fontWeight: 700, padding: "0 4px 8px", borderBottom: `1px solid ${C.line}`, gap: 5 }}>
            <span>제품 · 성분</span><span>제약회사</span><span>제형</span><span>부위</span><span>용법 · 기록방식 · 기기</span><span>약병 상태</span><span style={{ textAlign: "right" }}>순응도</span>
          </div>
          {RX_ROWS.map((m, i) => (
            <div key={i} className="grid items-center" style={{ gridTemplateColumns: "2.2fr 1.1fr 0.7fr 0.7fr 1.4fr 1.1fr 0.8fr", gap: 5, padding: "11px 4px", borderBottom: i < RX_ROWS.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <div>
                <div className="flex items-center gap-1.5"><span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{m.name}</span><ClassBadge ingr={m.ingr} small /></div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{m.ingr}</div>
              </div>
              <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 600 }}>{m.maker}</span>
              <span><DoseBadge dose={m.dose} small /></span>
              <span style={{ fontSize: 11.5, color: C.primary, fontWeight: 700 }}>{m.eye}</span>
              <div>
                <div style={{ fontSize: 12, color: C.ink }}>{m.sched}</div>
                <div className="flex items-center gap-1" style={{ marginTop: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: m.src === "자동" ? C.primary : C.gold, background: m.src === "자동" ? C.mint : C.goldSoft, padding: "1px 6px", borderRadius: 99 }}>{m.src}</span>
                  {m.monitor && <span className="inline-flex items-center gap-1" style={{ fontSize: 9.5, fontWeight: 700, color: C.sub }}><Bluetooth size={9} /> {m.monitor}</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: m.bc }}>{m.bottle}</span>
              <div style={{ textAlign: "right" }}>
                {m.prn ? <span style={{ fontSize: 11.5, color: C.sub }}>필요 시</span> : (() => {
                  const a = adhOf(m.name);
                  if (!a) return <span style={{ fontSize: 11.5, color: C.sub }}>기록 없음</span>;
                  return <><span style={{ fontSize: 14, fontWeight: 800, color: a.pct >= ADH_TARGET ? C.low : C.high }}>{a.pct}%</span><div style={{ fontSize: 9.5, color: C.sub }}>{a.taken}/{a.total}회</div></>;
                })()}
              </div>
            </div>
          ))}

          {/* 순응도 저하 원인 분석 */}
          <div style={{ marginTop: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <div className="flex items-center gap-2">
                <Search size={16} color={C.primary} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>순응도 저하 원인 분석</span>
                <span style={{ fontSize: 11, color: C.sub }}>기록 {adhAll.total}회 대조 · 영향도 순</span>
              </div>
              {adhCauses.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 800, color: C.high, background: C.highSoft, padding: "4px 11px", borderRadius: 99 }}>추정 원인 {adhCauses.length}건</span>
              )}
            </div>
            <CauseList causes={adhCauses} />
            {adhCauses.length > 0 && (
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 11, lineHeight: 1.55, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
                <b style={{ color: C.primary }}>해석 안내:</b> 인과관계 판정이 아니라 점안 기록·부작용 기록·시각·요일을 대조한 <b>연관성 제시</b>입니다.
                표본이 적은 구간은 변동이 클 수 있으므로 진료 시 환자 설명과 함께 확인하세요.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2" style={{ gap: 16, marginTop: 18 }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Clock size={15} color={C.primary} /><span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>투약 시각별 순응도</span></div>
              <div className="flex flex-col gap-2">
                {adhSlot.map((sl) => (
                  <div key={sl.key} className="flex items-center gap-3">
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.ink, width: 42, flexShrink: 0 }}>{sl.key}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: C.mint, overflow: "hidden" }}><div style={{ width: `${sl.pct}%`, height: "100%", background: sl.pct >= ADH_TARGET ? C.low : C.mid, borderRadius: 99 }} /></div>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: sl.pct >= ADH_TARGET ? C.low : C.mid, width: 34, textAlign: "right" }}>{sl.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5 }}>
                {adhSlot.length > 0 && (() => { const w = [...adhSlot].sort((a, b) => a.pct - b.pct)[0]; return <>가장 낮은 시각은 <b style={{ color: C.high }}>{w.key}</b>({w.pct}%)입니다. 해당 시각 약제의 용법 조정을 검토해 보세요.</>; })()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Eye size={15} color={C.primary} /><span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>좌·우안 순응도</span></div>
              <div className="grid grid-cols-2" style={{ gap: 10 }}>
                {adhEye.map((e) => (
                  <div key={e.key} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 13px" }}>
                    <div className="flex items-center gap-1.5"><EyeBadge eye={e.key} small /><span style={{ fontSize: 10.5, color: C.sub }}>{e.taken}/{e.total}회</span></div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: e.pct >= ADH_TARGET ? C.low : C.mid, marginTop: 3 }}>{e.pct}%</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 9, lineHeight: 1.5 }}>
                한쪽 눈만 빠뜨리는 패턴이 반복되면 점안 자세나 손의 편의성 문제일 수 있습니다.
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: "18px 0 8px" }}>보고된 부작용</div>
          <div className="flex flex-col gap-2">
            {SE_LOG_INIT.map((e) => (
              <div key={e.id} className="flex items-center gap-3" style={{ padding: "10px 13px", borderRadius: 11, background: C.bg }}>
                <AlertCircle size={15} color={C.mid} className="flex-shrink-0" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{e.med}</span>
                <EyeBadge eye={e.eye} small />
                <span style={{ fontSize: 12, color: C.sub, flex: 1 }}>{e.items.join(", ")}{e.note ? ` · ${e.note}` : ""}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{e.severity}</span>
                <span style={{ fontSize: 11, color: C.sub }}>{e.at.slice(5, 10)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "survey" && (
        <div className="grid grid-cols-3" style={{ gap: 16 }}>
          <div className="col-span-2">
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <ListChecks size={15} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>전자 문진 12항목</span>
            </div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>환자 앱 응답 → 자동 저장 · <span style={{ color: C.primary, fontWeight: 700 }}>위험도에 마우스를 올리면 맞춤 안내</span></div>
            {SURVEY_ROWS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2" style={{ padding: "8px 0", borderBottom: i < SURVEY_ROWS.length - 1 ? `1px solid ${C.line}` : "none" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.sub, width: 26, flexShrink: 0 }}>{s.id}</span>
                <div className="flex-1 min-w-0"><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{s.t}</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{s.v}</div></div>
                <RiskPillHover r={s.r} tip={s.g} />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Watch size={15} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>워치 헬스</span></div>
            <div className="flex flex-col gap-2">
              {[
                { l: "걸음 수", v: "6,420", u: "걸음", s: "7일 평균 7,100", i: Footprints },
                { l: "수면 시간", v: "6시간 40분", u: "", s: "자주 깸 · 질 보통", i: Bed, c: C.mid },
                { l: "안정 시 심박", v: "72", u: "bpm", s: "정상 범위", i: HeartPulse },
                { l: "불규칙 맥박(IRN)", v: "감지", u: "", s: "6/30 · 미확진", i: Activity, c: C.high },
              ].map((r) => (
                <div key={r.l} className="flex items-center gap-2.5" style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px" }}>
                  <r.i size={15} color={r.c || C.primary} className="flex-shrink-0" />
                  <div className="flex-1"><div style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>{r.l}</div><div style={{ fontSize: 13, fontWeight: 800, color: r.c || C.ink }}>{r.v} <span style={{ fontSize: 10, color: C.sub, fontWeight: 600 }}>{r.u}</span></div></div>
                  <span style={{ fontSize: 10, color: C.sub, textAlign: "right" }}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "device" && <DeviceTab p={p} role={role} devices={devices} setDevices={setDevices} myDev={myDev} devSt={devSt} sent={sent} onSend={onSend} />}

      {modal === "target" && (
        <TargetModal p={p} onClose={() => setModal(null)}
          onSave={(v) => { onUpdatePatient && onUpdatePatient(p.id, { targetOD: v.targetOD, targetOS: v.targetOS });
            toast && toast(`${p.name}님 목표 안압을 OD ${v.targetOD} / OS ${v.targetOS} mmHg로 변경했습니다.`); setModal(null); }} />
      )}
      {modal === "report" && <ReportModal p={p} from={rFrom} to={rTo} onClose={() => setModal(null)} />}

      {tab === "profile" && (
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          {[
            { l: "이름", v: p.name }, { l: "환자 ID", v: p.id },
            { l: "성별", v: p.gender }, { l: "생년월일", v: p.birth },
            { l: "연락처", v: p.phone, icon: Phone }, { l: "이메일", v: p.email, icon: Mail },
            { l: "로그인 ID", v: p.loginId, icon: KeyRound }, { l: "비밀번호", v: "PW", pw: true },
            { l: "가입 경로", v: p.join, badge: true }, { l: "진단명", v: p.dx },
            { l: "기기 시리얼", v: p.serial || "—", icon: Bluetooth, mono: true },
            { l: "목표 안압", v: `OD ${p.targetOD} / OS ${p.targetOS} mmHg` },
          ].map((r) => (
            <div key={r.l} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 13px" }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 3 }}>{r.icon && <r.icon size={11} />}{r.l}</div>
              {r.pw ? <PwCell value="Cvt!2026#tmp" /> : r.badge ? <JoinBadge join={p.join} /> : <div style={{ fontSize: 13, color: C.ink, fontWeight: 700, fontFamily: r.mono ? "monospace" : FONT }}>{r.v}</div>}
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-2" style={{ marginTop: 2 }}>
            <button className="cursor-pointer flex items-center gap-1.5" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}><KeyRound size={13} /> 비밀번호 재설정 메일</button>
            <button className="cursor-pointer" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>정보 편집</button>
            <button className="cursor-pointer" style={{ border: `1.5px solid ${C.high}40`, background: "#fff", color: C.high, borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>{p.active ? "비활성화" : "활성화"}</button>
            <button className="cursor-pointer" style={{ border: "none", background: p.certified ? C.mintDeep : C.primary, color: p.certified ? C.primary : "#fff", borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>{p.certified ? "인증 해제" : "환자 인증"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 환자 상세 · 기기 관리 탭 ---------- */
function DeviceTab({ p, role, devices, setDevices, myDev, devSt, sent = {}, onSend }) {
  const [mode, setMode] = useState(null);
  const [pick, setPick] = useState("");
  const [rentFrom, setRentFrom] = useState(TODAY_STR);
  const [rentTo, setRentTo] = useState("2026-08-03");
  const [newSerial, setNewSerial] = useState("");
  const [msg, setMsg] = useState("");
  const perm = CAN[role].devices;
  const free = devices.filter((d) => d.owner === "기관" && d.use === "home" && d.active && !d.assignedTo);
  const serialOK = /^CVT2H?-[0-9A-Z]{6,10}$/.test(newSerial.trim());
  const taken = devices.find((d) => d.serial === newSerial.trim() && d.assignedTo && d.assignedTo !== p.id);
  const alert = myDev && myDev.owner === "기관" ? rentAlert(myDev.rentTo, TODAY_STR) : null;
  const sentList = (myDev && sent[myDev.serial]) || [];
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2600); };

  const assign = () => {
    if (!pick) return;
    setDevices((ds) => ds.map((d) => (d.serial === pick ? { ...d, assignedTo: p.id, rentFrom, rentTo } : d)));
    setMode(null); setPick(""); flash("기기가 대여 배정되었습니다.");
  };
  const extend = () => { setDevices((ds) => ds.map((d) => (d.serial === myDev.serial ? { ...d, rentTo } : d))); setMode(null); flash("반납 예정일이 변경되었습니다."); };
  const doReturn = () => { setDevices((ds) => ds.map((d) => (d.serial === myDev.serial ? { ...d, assignedTo: null, rentFrom: null, rentTo: null } : d))); flash("반납 처리되었습니다. 데이터 수신이 정상화됩니다."); };
  const unlink = () => { setDevices((ds) => ds.map((d) => (d.serial === myDev.serial ? { ...d, assignedTo: null, linkedAt: null } : d))); flash("개인 기기 연동이 해제되었습니다."); };
  const link = () => {
    if (!serialOK || taken) return;
    const exists = devices.some((d) => d.serial === newSerial.trim());
    if (exists) setDevices((ds) => ds.map((d) => (d.serial === newSerial.trim() ? { ...d, owner: "개인", assignedTo: p.id, linkedAt: TODAY_STR, rentFrom: null, rentTo: null } : d)));
    else setDevices((ds) => [...ds, { serial: newSerial.trim(), name: `${p.name} 개인 기기`, type: "CVT200 HOME", owner: "개인", use: "home", org: "씨엔브이 안과", assignedTo: p.id, rentFrom: null, rentTo: null, linkedAt: TODAY_STR, battery: 100, fw: "1.4.2", active: true }]);
    setMode(null); setNewSerial(""); flash("개인 소유 기기가 연동되었습니다.");
  };

  return (
    <div className="flex flex-col gap-3">
      {msg && <div className="flex items-center gap-2" style={{ background: C.lowSoft, color: C.low, borderRadius: 10, padding: "10px 13px", fontSize: 12, fontWeight: 700 }}><PackageCheck size={15} /> {msg}</div>}

      {alert && (
        <Card style={{ padding: 0, overflow: "hidden", borderColor: alert.c + "50" }}>
          <div className="flex items-center gap-3" style={{ background: alert.bg, padding: "13px 16px" }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", color: alert.c }}><alert.icon size={18} /></div>
            <div className="flex-1"><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{alert.title}</div><div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{alert.msg}</div></div>
            <span style={{ fontSize: 11, fontWeight: 800, color: alert.c, background: "#fff", padding: "5px 12px", borderRadius: 999 }}>{alert.dd >= 0 ? `D-${alert.dd}` : `+${-alert.dd}일`}</span>
          </div>
          {alert.blocked && (
            <div className="flex items-center gap-2.5" style={{ padding: "11px 16px", borderTop: `1px solid ${C.line}`, background: "#fff" }}>
              <WifiOff size={15} color={C.high} className="flex-shrink-0" />
              <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.45, flex: 1 }}>연체 {SYNC_GRACE}일 초과로 <b style={{ color: C.high }}>측정 데이터 수신이 중단</b>되었습니다. 반납 또는 기간 연장 시 즉시 재개됩니다.</div>
            </div>
          )}
          {perm && (
            <div className="flex items-center gap-2" style={{ padding: "11px 16px", borderTop: `1px solid ${C.line}` }}>
              <button onClick={() => onSend && onSend(myDev.serial, alert)} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", background: alert.c, color: "#fff", borderRadius: 9, padding: "8px 13px", fontSize: 12, fontWeight: 800, fontFamily: FONT }}><MessageSquare size={13} /> 반납 알림 발송</button>
              <span style={{ fontSize: 10.5, color: C.sub }}>자동 발송 채널 {alert.ch}{sentList.length > 0 && <> · 발송 이력 {sentList.length}회</>}</span>
            </div>
          )}
        </Card>
      )}

      {myDev ? (
        <Card style={{ padding: 16, borderColor: devSt.k === "overdue" ? C.high + "60" : C.line }}>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 46, height: 46, borderRadius: 14, background: myDev.owner === "개인" ? "#E2F1F0" : C.mint, color: myDev.owner === "개인" ? C.aqua : C.primary }}><Monitor size={22} /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{myDev.name}</span>
                <OwnerBadge owner={myDev.owner} /><DevStateChip st={devSt} />
              </div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3, fontFamily: "monospace" }}>{myDev.serial}</div>
              <div className="grid grid-cols-4" style={{ gap: 10, marginTop: 12 }}>
                {(myDev.owner === "기관"
                  ? [{ l: "대여 시작", v: myDev.rentFrom || "—" }, { l: "반납 예정", v: myDev.rentTo || "—", c: devSt.k === "overdue" ? C.high : devSt.k === "due" ? C.mid : C.ink }, { l: "배터리", v: `${myDev.battery}%`, c: myDev.battery <= 20 ? C.high : C.ink }, { l: "펌웨어", v: myDev.fw }]
                  : [{ l: "연동일", v: myDev.linkedAt || "—" }, { l: "소유자", v: p.name }, { l: "배터리", v: `${myDev.battery}%`, c: myDev.battery <= 20 ? C.high : C.ink }, { l: "펌웨어", v: myDev.fw }]
                ).map((r) => (
                  <div key={r.l}>
                    <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{r.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: r.c || C.ink, marginTop: 2 }}>{r.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {perm && (
            <div className="flex items-center gap-2" style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.line}` }}>
              {myDev.owner === "기관" ? (
                <>
                  <button onClick={() => { setRentTo(myDev.rentTo); setMode(mode === "extend" ? null : "extend"); }} className="cursor-pointer flex items-center gap-1.5" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "8px 13px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}><CalendarDays size={13} /> 대여 기간 연장</button>
                  <button onClick={doReturn} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", background: C.primary, color: "#fff", borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><Undo2 size={13} /> 반납 처리</button>
                </>
              ) : (
                <>
                  <button onClick={unlink} className="cursor-pointer flex items-center gap-1.5" style={{ border: `1.5px solid ${C.high}40`, background: "#fff", color: C.high, borderRadius: 10, padding: "8px 13px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}><Unlink size={13} /> 연동 해제</button>
                  <span style={{ fontSize: 10.5, color: C.sub, marginLeft: "auto" }}>환자 개인 자산이므로 반납 절차가 없습니다.</span>
                </>
              )}
            </div>
          )}
          {mode === "extend" && (
            <div className="flex items-end gap-2.5" style={{ marginTop: 12, padding: "12px 13px", borderRadius: 12, background: C.bg }}>
              <Field label="새 반납 예정일"><input type="date" value={rentTo} min={TODAY_STR} onChange={(e) => setRentTo(e.target.value)} style={inpSm} /></Field>
              <button onClick={extend} className="cursor-pointer" style={{ border: "none", background: C.primary, color: "#fff", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>변경</button>
              <button onClick={() => setMode(null)} className="cursor-pointer" style={{ border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>취소</button>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ padding: 20 }}>
          <div className="flex flex-col items-center" style={{ color: C.sub }}>
            <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 999, background: C.bg, color: C.grey, marginBottom: 10 }}><Monitor size={22} /></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>배정된 기기가 없습니다</div>
            <div style={{ fontSize: 12, marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>병원 기기를 대여해 주거나, 환자가 직접 구입한 기기를 연동하세요.</div>
          </div>
        </Card>
      )}

      {perm && !myDev && (
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <Card style={{ padding: 16, borderColor: mode === "assign" ? C.primary : C.line }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}><Building2 size={16} color={C.primary} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>병원 기기 대여</span></div>
            <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5, marginBottom: 10 }}>기간을 정해 빌려주며 반납 예정일 관리 대상이 됩니다. 대여 가능 <b style={{ color: free.length ? C.low : C.high }}>{free.length}대</b></div>
            {mode === "assign" ? (
              <div className="flex flex-col gap-2.5">
                <Field label="대여할 기기">
                  <select value={pick} onChange={(e) => setPick(e.target.value)} style={inpSm}>
                    <option value="">선택하세요</option>
                    {free.map((d) => <option key={d.serial} value={d.serial}>{d.name} · {d.serial}</option>)}
                  </select>
                </Field>
                <div className="flex gap-2.5">
                  <Field label="대여 시작"><input type="date" value={rentFrom} onChange={(e) => setRentFrom(e.target.value)} style={inpSm} /></Field>
                  <Field label="반납 예정"><input type="date" value={rentTo} min={rentFrom} onChange={(e) => setRentTo(e.target.value)} style={inpSm} /></Field>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMode(null)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>취소</button>
                  <button onClick={assign} disabled={!pick} className="cursor-pointer" style={{ flex: 2, border: "none", background: pick ? C.primary : C.mintDeep, color: "#fff", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>대여 배정</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setMode("assign")} disabled={!free.length} className="cursor-pointer" style={{ width: "100%", border: "none", background: free.length ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>{free.length ? "대여 배정하기" : "대여 가능 기기 없음"}</button>
            )}
          </Card>
          <Card style={{ padding: 16, borderColor: mode === "link" ? C.aqua : C.line }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}><Link2 size={16} color={C.aqua} /><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>개인 소유 기기 연동</span></div>
            <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5, marginBottom: 10 }}>환자가 직접 구입한 기기를 연결합니다. 반납 관리 없이 데이터만 연동됩니다.</div>
            {mode === "link" ? (
              <div className="flex flex-col gap-2.5">
                <Field label="시리얼 번호"><input value={newSerial} onChange={(e) => setNewSerial(e.target.value.toUpperCase())} placeholder="CVT2H-0000AA00" style={{ ...inpSm, fontFamily: "monospace" }} /></Field>
                <div style={{ fontSize: 10.5, lineHeight: 1.45, color: !newSerial ? C.sub : taken ? C.high : !serialOK ? C.high : C.low }}>
                  {!newSerial ? "환자가 보유한 기기의 시리얼 번호를 입력하세요." : taken ? "다른 환자에게 이미 배정된 기기입니다." : !serialOK ? "형식이 올바르지 않습니다." : "✓ 연동 가능합니다."}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMode(null)} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700, fontFamily: FONT }}>취소</button>
                  <button onClick={link} disabled={!serialOK || !!taken} className="cursor-pointer" style={{ flex: 2, border: "none", background: serialOK && !taken ? C.aqua : C.mintDeep, color: "#fff", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>연동하기</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setMode("link")} className="cursor-pointer" style={{ width: "100%", border: `1.5px solid ${C.aqua}`, background: "#fff", color: C.aqua, borderRadius: 10, padding: "10px 0", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}>시리얼로 연동하기</button>
            )}
          </Card>
        </div>
      )}
      {!perm && <div style={{ fontSize: 11, color: C.sub }}>기기 배정·반납 처리는 의사·관리자·교육 담당자 권한입니다.</div>}
    </div>
  );
}

/* ---------- 장치 목록 ---------- */
function DevicesPage({ role, devices, setDevices, patients, toast }) {
  const [q, setQ] = useState("");
  const [filt, setFilt] = useState("all");
  const [sort, setSort] = useState({ k: "name", dir: "asc" });
  const [add, setAdd] = useState(false);
  const pName = (id) => (patients.find((x) => x.id === id) || {}).name || "-";
  const kpi = useMemo(() => {
    const home = devices.filter((d) => d.use === "home" && d.active);
    return {
      total: devices.filter((d) => d.active).length,
      free: home.filter((d) => d.owner === "기관" && !d.assignedTo).length,
      rent: home.filter((d) => d.owner === "기관" && d.assignedTo).length,
      overdue: home.filter((d) => deviceState(d).k === "overdue").length,
      owned: home.filter((d) => d.owner === "개인").length,
    };
  }, [devices]);
  const rows = useMemo(() => {
    let r = devices.filter((d) => {
      if (filt === "rental" && !(d.owner === "기관" && d.use === "home")) return false;
      if (filt === "owned" && d.owner !== "개인") return false;
      if (filt === "clinic" && d.use !== "clinic") return false;
      return !q || [d.name, d.serial, d.org, pName(d.assignedTo)].join(" ").toLowerCase().includes(q.toLowerCase());
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => {
      if (sort.k === "assignedTo") return pName(a.assignedTo).localeCompare(pName(b.assignedTo), "ko") * dir;
      if (sort.k === "state") return String(deviceState(a).label).localeCompare(String(deviceState(b).label), "ko") * dir;
      if (sort.k === "battery") return (a.battery - b.battery) * dir;
      return String(a[sort.k]).localeCompare(String(b[sort.k]), "ko") * dir;
    });
  }, [devices, q, filt, sort, patients]);
  const ret = (serial) => setDevices((ds) => ds.map((d) => (d.serial === serial ? { ...d, assignedTo: null, rentFrom: null, rentTo: null } : d)));
  const COLS = "1.5fr 0.95fr 1.35fr 0.95fr 1.3fr 1.15fr 0.85fr";

  return (
    <div style={{ padding: "16px 20px" }}>
      <div className="grid grid-cols-5" style={{ gap: 8, marginBottom: 14 }}>
        {[{ l: "활성 장치", v: kpi.total, c: C.ink }, { l: "대여 가능", v: kpi.free, c: C.low }, { l: "대여 중", v: kpi.rent, c: C.primary }, { l: "반납 연체", v: kpi.overdue, c: C.high }, { l: "개인 소유 연동", v: kpi.owned, c: C.aqua }].map((k) => (
          <div key={k.l} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{k.l}</div>
            <div className="flex items-baseline gap-1"><span style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</span><span style={{ fontSize: 10, color: C.sub }}>대</span></div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2" style={{ width: 250, border: `1px solid ${C.line}`, borderRadius: 10, padding: "7px 11px", background: "#fff" }}>
            <Search size={14} color={C.sub} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="장치명 · 시리얼 · 환자 검색" style={{ flex: 1, border: "none", outline: "none", fontSize: 12.5, fontFamily: FONT, color: C.ink }} />
          </div>
          <div className="flex" style={{ gap: 4 }}>
            {[{ id: "all", t: "전체" }, { id: "rental", t: "병원 대여용" }, { id: "owned", t: "개인 소유" }, { id: "clinic", t: "원내용" }].map((f) => (
              <button key={f.id} onClick={() => setFilt(f.id)} className="cursor-pointer" style={{ border: `1px solid ${filt === f.id ? C.primary : C.line}`, background: filt === f.id ? C.primary : "#fff", color: filt === f.id ? "#fff" : C.sub, borderRadius: 999, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>{f.t}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setAdd(true)} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", borderRadius: 10, padding: "9px 15px", background: C.primary, color: "#fff", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><Plus size={14} /> 장치 등록</button>
      </div>

      {add && (
        <Modal title="장치 등록" onClose={() => setAdd(false)} wide>
          <AddDeviceForm devices={devices} onCancel={() => setAdd(false)}
            onSubmit={(d) => { setDevices((ds) => [...ds, d]); setAdd(false); toast && toast(`${d.name} 장치를 등록했습니다.`); }} />
        </Modal>
      )}
      <div className="grid" style={{ gridTemplateColumns: COLS, fontSize: 10.5, padding: "0 6px 8px", borderBottom: `1px solid ${C.line}`, gap: 6 }}>
        <SortHead label="장치명" k="name" sort={sort} setSort={setSort} />
        <SortHead label="소유 구분" k="owner" sort={sort} setSort={setSort} />
        <SortHead label="시리얼 번호" k="serial" sort={sort} setSort={setSort} />
        <SortHead label="사용 환자" k="assignedTo" sort={sort} setSort={setSort} />
        <SortHead label="대여 기간 · 연동일" k="rentTo" sort={sort} setSort={setSort} />
        <SortHead label="상태" k="state" sort={sort} setSort={setSort} />
        <SortHead label="배터리" k="battery" sort={sort} setSort={setSort} align="right" />
      </div>
      {rows.map((d, i) => {
        const st = deviceState(d);
        const canReturn = d.owner === "기관" && d.use === "home" && d.assignedTo && CAN[role].devices;
        return (
          <div key={d.serial} className="grid items-center" style={{ gridTemplateColumns: COLS, gap: 6, padding: "10px 6px", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : "none", opacity: d.active ? 1 : 0.5, background: st.k === "overdue" ? C.highSoft + "60" : "transparent" }}>
            <span className="flex items-center gap-1.5 min-w-0" style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>
              <Monitor size={13} color={d.owner === "개인" ? C.aqua : C.primary} className="flex-shrink-0" />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
            </span>
            <span><OwnerBadge owner={d.owner} small /></span>
            <span style={{ fontSize: 11, color: C.sub, fontFamily: "monospace" }}>{d.serial}</span>
            <span style={{ fontSize: 12, color: d.assignedTo ? C.ink : C.grey, fontWeight: d.assignedTo ? 700 : 400 }}>{d.assignedTo ? pName(d.assignedTo) : "—"}</span>
            <span style={{ fontSize: 10.5, color: C.sub }}>{d.owner === "개인" ? `연동 ${d.linkedAt}` : d.rentFrom ? `${d.rentFrom.slice(5)} ~ ${d.rentTo.slice(5)}` : "—"}</span>
            <span className="flex items-center gap-1.5"><DevStateChip st={st} small />{canReturn && <Undo2 size={13} color={C.grey} className="cursor-pointer" onClick={() => ret(d.serial)} />}</span>
            <span className="flex items-center justify-end gap-1" style={{ fontSize: 11, color: d.battery <= 20 ? C.high : C.sub, fontWeight: d.battery <= 20 ? 700 : 400 }}>
              {d.battery <= 20 && d.active && <BatteryLow size={12} />}{d.battery}% · {d.fw}
            </span>
          </div>
        );
      })}
      <div style={{ fontSize: 10.5, color: C.sub, marginTop: 12, lineHeight: 1.55, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
        <b style={{ color: C.primary }}>소유 구분:</b> <b>병원 대여</b>는 기관 자산을 기간을 정해 빌려주는 형태로 반납 관리가 필요합니다. <b>개인 소유</b>는 환자가 직접 구입한 기기를 연동한 형태로 반납 개념 없이 연동 해제만 가능합니다.
      </div>
    </div>
  );
}

/* ---------- 알림 자동화 (스케줄러 · 감사 로그) ---------- */
function NotifyPage({ role, cfg, setCfg, log, alerts, lastRun, lastResult, onRunBatch, escCfg, setEscCfg, patients, onSendAdh, onOpenPatient }) {
  const [sub, setSub] = useState("sched");
  const canEdit = CAN[role].notifyEdit, canRun = CAN[role].runBatch;
  const [q, setQ] = useState(""); const [fRes, setFRes] = useState("all"); const [fLevel, setFLevel] = useState("all");
  const [sort, setSort] = useState({ k: "at", dir: "desc" });
  const [csv, setCsv] = useState(null);
  const setCh = (lv, ch, v) => setCfg((c) => ({ ...c, ch: { ...c.ch, [lv]: { ...c.ch[lv], [ch]: v } } }));
  /* 순응도 강화 대상 — 환자별 순응도로 단계 판정 */
  const adhTargets = useMemo(() => (patients || [])
    .filter((p) => p.active && p.adh != null)
    .map((p) => ({ p, lv: adhLevel(p.adh, p.id === "P-1042" ? missStreak() : 0, escCfg) }))
    .filter((x) => x.lv.key !== "ok")
    .sort((a, b) => a.p.adh - b.p.adh), [patients, escCfg]);
  const nextRun = useMemo(() => {
    const [h, m] = cfg.runAt.split(":").map(Number);
    const now = new Date(); const n = new Date(now); n.setHours(h, m, 0, 0);
    if (n <= now) n.setDate(n.getDate() + 1);
    const mins = Math.round((n - now) / 60000);
    return { at: `${isoDate(n)} ${cfg.runAt}`, in: mins < 60 ? `${mins}분 후` : `${Math.floor(mins / 60)}시간 ${mins % 60}분 후` };
  }, [cfg.runAt]);
  const rows = useMemo(() => {
    let r = log.filter((x) => (fRes === "all" || x.result === fRes) && (fLevel === "all" || x.level === fLevel) && (!q || [x.name, x.serial, x.actor, x.detail].join(" ").toLowerCase().includes(q.toLowerCase())));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => String(a[sort.k]).localeCompare(String(b[sort.k]), "ko") * dir);
  }, [log, q, fRes, fLevel, sort]);
  const stat = useMemo(() => ({
    total: log.length, ok: log.filter((x) => x.result === "성공").length,
    part: log.filter((x) => x.result === "부분 실패").length, fail: log.filter((x) => x.result === "실패").length,
    auto: log.filter((x) => x.mode === "자동").length,
  }), [log]);
  const exportCsv = () => {
    const head = ["로그ID", "발송일시", "환자", "환자ID", "기기", "단계", "채널", "방식", "결과", "처리자", "비고"];
    const body = rows.map((r) => [r.id, r.at, r.name, r.pid, r.serial, (LEVEL_ALL[r.level] || {}).title, r.chs.map((c) => (CHANNELS.find((x) => x.id === c) || {}).label).join("|"), r.mode, r.result, r.actor, r.detail]);
    const text = "\uFEFF" + [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    try {
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `iop-notify-log-${TODAY_STR}.csv`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setCsv(text); }
  };
  const COLS = "0.7fr 1.3fr 1fr 1.25fr 1.25fr 1.2fr 0.7fr 0.8fr 0.85fr";

  return (
    <div style={{ padding: "16px 20px" }}>
      <div className="flex" style={{ gap: 4, marginBottom: 14 }}>
        {[{ id: "sched", t: "기기 반납 알림" }, { id: "adh", t: `점안 순응도 강화 (${adhTargets.length})` }, { id: "log", t: `발송 감사 로그 (${log.length})` }].map((m) => (
          <button key={m.id} onClick={() => setSub(m.id)} className="cursor-pointer" style={{ border: `1px solid ${sub === m.id ? C.primary : C.line}`, background: sub === m.id ? C.primary : "#fff", color: sub === m.id ? "#fff" : C.sub, borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{m.t}</button>
        ))}
      </div>

      {sub === "sched" && (
        <div className="flex flex-col gap-3">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center gap-3" style={{ padding: "14px 17px", background: cfg.enabled ? C.mint : "#EEF2F1", borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", color: cfg.enabled ? C.primary : C.sub }}><ServerCog size={19} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>반납 알림 배치 스케줄러</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: cfg.enabled ? C.low : C.sub, background: cfg.enabled ? C.lowSoft : "#fff", padding: "3px 10px", borderRadius: 99 }}>{cfg.enabled ? "실행 중" : "중지됨"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>매일 {cfg.runAt} 실행 · 다음 실행 {nextRun.at} ({nextRun.in}) · 마지막 실행 {lastRun || "기록 없음"}</div>
              </div>
              {canEdit && <button onClick={() => setCfg((c) => ({ ...c, enabled: !c.enabled }))} className="cursor-pointer" style={{ border: "none", borderRadius: 999, padding: "8px 15px", fontSize: 12, fontWeight: 800, fontFamily: FONT, background: cfg.enabled ? C.mintDeep : C.primary, color: cfg.enabled ? C.primary : "#fff" }}>{cfg.enabled ? "중지" : "시작"}</button>}
            </div>
            <div className="grid grid-cols-4" style={{ gap: 0 }}>
              {[{ l: "오늘 발송 대상", v: alerts.length, c: alerts.length ? C.primary : C.sub }, { l: "연체 대상", v: alerts.filter((x) => x.a.dd < 0).length, c: C.high }, { l: "수신 중단", v: alerts.filter((x) => x.a.blocked).length, c: C.high }, { l: "재시도 한도", v: cfg.retry, c: C.sub }].map((k, i) => (
                <div key={k.l} style={{ padding: "13px 17px", borderRight: i < 3 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{k.l}</div>
                  <div className="flex items-baseline gap-1"><span style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</span><span style={{ fontSize: 10, color: C.sub }}>건</span></div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2" style={{ padding: "12px 17px", borderTop: `1px solid ${C.line}` }}>
              <button onClick={() => { onRunBatch(); setSub("sched"); }} disabled={!canRun || !alerts.length} className="cursor-pointer flex items-center gap-1.5"
                style={{ border: "none", borderRadius: 10, padding: "9px 15px", fontSize: 12.5, fontWeight: 800, fontFamily: FONT, background: canRun && alerts.length ? C.primary : C.mintDeep, color: canRun && alerts.length ? "#fff" : C.sub }}>
                <Play size={13} /> 지금 배치 실행
              </button>
              <span style={{ fontSize: 10.5, color: C.sub }}>
                {!canRun ? "배치 수동 실행은 의사·관리자 권한입니다."
                  : !alerts.length ? "현재 발송 대상이 없습니다."
                  : `대상 ${alerts.length}건에 즉시 발송합니다.`}
              </span>
            </div>

            {lastResult && (
              <div className="flex items-center gap-3" style={{ padding: "12px 17px", borderTop: `1px solid ${C.line}`, background: C.lowSoft }}>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", color: C.low }}><PackageCheck size={16} /></div>
                <div className="flex-1">
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>배치 실행 완료 · {lastResult.sent}건 발송</div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                    {lastResult.at} · {lastResult.detail || "감사 로그에 기록되었습니다."}
                  </div>
                </div>
                <button onClick={() => setSub("log")} className="cursor-pointer flex items-center gap-1"
                  style={{ border: `1px solid ${C.low}45`, background: "#fff", color: C.low, borderRadius: 8, padding: "6px 11px", fontSize: 11, fontWeight: 800, fontFamily: FONT }}>
                  <History size={11} /> 로그 보기
                </button>
              </div>
            )}
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Timer}>기본 설정</SectionTitle>
            <div className="grid grid-cols-3" style={{ gap: 12 }}>
              <Field label="일일 발송 시각"><input type="time" value={cfg.runAt} disabled={!canEdit} onChange={(e) => setCfg((c) => ({ ...c, runAt: e.target.value }))} style={{ ...inpSm, background: canEdit ? "#fff" : C.bg }} /></Field>
              <Field label="수신 중단 유예 (일)"><input type="number" min={0} max={14} value={cfg.grace} disabled={!canEdit} onChange={(e) => setCfg((c) => ({ ...c, grace: Math.max(0, Math.min(14, +e.target.value)) }))} style={{ ...inpSm, background: canEdit ? "#fff" : C.bg }} /></Field>
              <Field label="실패 시 재시도 (회)"><input type="number" min={0} max={5} value={cfg.retry} disabled={!canEdit} onChange={(e) => setCfg((c) => ({ ...c, retry: Math.max(0, Math.min(5, +e.target.value)) }))} style={{ ...inpSm, background: canEdit ? "#fff" : C.bg }} /></Field>
            </div>
            <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
              {[{ k: "resendDaily", t: "연체 상태일 때 매일 재발송", d: "반납·연장 처리될 때까지 같은 시각에 반복 발송합니다." },
                { k: "quiet", t: "야간 발송 제한 (21:00 ~ 08:00)", d: "제한 시간대 발송은 다음 발송 시각으로 미룹니다." }].map((o) => (
                <div key={o.k} onClick={() => canEdit && setCfg((c) => ({ ...c, [o.k]: !c[o.k] }))} className={canEdit ? "cursor-pointer flex items-center gap-3" : "flex items-center gap-3"} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 13px", opacity: canEdit ? 1 : 0.7 }}>
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${cfg[o.k] ? C.primary : C.line}`, background: cfg[o.k] ? C.primary : "#fff" }}>{cfg[o.k] && <Check size={12} color="#fff" strokeWidth={3.5} />}</span>
                  <div className="flex-1"><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{o.t}</div><div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>{o.d}</div></div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={MessageSquare} right={<span style={{ fontSize: 11, color: C.sub }}>단계별 발송 채널</span>}>발송 채널 설정</SectionTitle>
            <div className="grid" style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1.4fr", background: C.bg, borderRadius: "9px 9px 0 0", padding: "9px 13px", fontSize: 11, fontWeight: 800, color: C.sub, gap: 6 }}>
              <span>알림 단계</span>
              {CHANNELS.map((c) => <span key={c.id} className="flex items-center justify-center gap-1" style={{ color: c.c }}><c.icon size={11} /> {c.label}</span>)}
              <span style={{ textAlign: "right" }}>연동 게이트웨이</span>
            </div>
            {Object.values(RENT_LEVEL).map((L) => (
              <div key={L.key} className="grid items-center" style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1.4fr", gap: 6, padding: "10px 13px", borderBottom: `1px solid ${C.line}` }}>
                <span className="flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}><L.icon size={13} color={L.c} /> {L.title}</span>
                {CHANNELS.map((c) => <span key={c.id} className="flex items-center justify-center"><input type="checkbox" checked={!!cfg.ch[L.key][c.id]} disabled={!canEdit} onChange={(e) => setCh(L.key, c.id, e.target.checked)} className={canEdit ? "cursor-pointer" : ""} /></span>)}
                <span style={{ textAlign: "right", fontSize: 10.5, color: C.sub }}>{chLabel(cfg, L.key)}</span>
              </div>
            ))}
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 10, lineHeight: 1.55, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
              <b style={{ color: C.primary }}>앱 푸시</b>는 FCM·APNs, <b style={{ color: C.gold }}>SMS</b>는 문자 발송사 API로 전송됩니다. <b style={{ color: C.high }}>유선 안내</b>는 담당자 콜 리스트를 생성합니다.
              {!canEdit && <> · 설정 변경은 <b>관리자</b> 권한입니다.</>}
            </div>
          </Card>
        </div>
      )}

      {sub === "adh" && (
        <div className="flex flex-col gap-3">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center gap-3" style={{ padding: "14px 17px", background: escCfg.enabled ? C.mint : "#EEF2F1", borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", color: escCfg.enabled ? C.primary : C.sub }}><Droplets size={19} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>점안 순응도 기반 알림 자동 강화</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: escCfg.enabled ? C.low : C.sub, background: escCfg.enabled ? C.lowSoft : "#fff", padding: "3px 10px", borderRadius: 99 }}>{escCfg.enabled ? "적용 중" : "중지됨"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>최근 {escCfg.window}일 순응도와 연속 누락으로 단계를 판정해 환자 앱 알림 강도를 자동 조절합니다.</div>
              </div>
              {canEdit && <button onClick={() => setEscCfg((c) => ({ ...c, enabled: !c.enabled }))} className="cursor-pointer" style={{ border: "none", borderRadius: 999, padding: "8px 15px", fontSize: 12, fontWeight: 800, fontFamily: FONT, background: escCfg.enabled ? C.mintDeep : C.primary, color: escCfg.enabled ? C.primary : "#fff" }}>{escCfg.enabled ? "중지" : "시작"}</button>}
            </div>
            <div className="grid grid-cols-4" style={{ gap: 0 }}>
              {[
                { l: "강화 대상 환자", v: adhTargets.length, c: adhTargets.length ? C.primary : C.sub },
                { l: "주의", v: adhTargets.filter((x) => x.lv.key === "watch").length, c: C.primary },
                { l: "경고", v: adhTargets.filter((x) => x.lv.key === "warn").length, c: C.mid },
                { l: "위험", v: adhTargets.filter((x) => x.lv.key === "crit").length, c: C.high },
              ].map((k, i) => (
                <div key={k.l} style={{ padding: "13px 17px", borderRight: i < 3 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{k.l}</div>
                  <div className="flex items-baseline gap-1"><span style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</span><span style={{ fontSize: 10, color: C.sub }}>명</span></div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Timer}>단계 판정 기준</SectionTitle>
            <div className="grid grid-cols-5" style={{ gap: 10 }}>
              {[
                { k: "window", l: "판정 기간(일)", min: 7, max: 90 },
                { k: "watch", l: "주의 기준(%)", min: 0, max: 100 },
                { k: "warn", l: "경고 기준(%)", min: 0, max: 100 },
                { k: "crit", l: "위험 기준(%)", min: 0, max: 100 },
                { k: "streakCrit", l: "연속 누락(일)", min: 1, max: 14 },
              ].map((f) => (
                <Field key={f.k} label={f.l}>
                  <input type="number" min={f.min} max={f.max} value={escCfg[f.k]} disabled={!canEdit}
                    onChange={(e) => setEscCfg((c) => ({ ...c, [f.k]: Math.max(f.min, Math.min(f.max, +e.target.value)) }))}
                    style={{ ...inpSm, background: canEdit ? "#fff" : C.bg }} />
                </Field>
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 10, lineHeight: 1.5 }}>
              순응도가 <b>{escCfg.watch}%</b> 미만이면 주의, <b>{escCfg.warn}%</b> 미만이면 경고, <b>{escCfg.crit}%</b> 미만이거나 연속 <b>{escCfg.streakCrit}일</b> 미완료면 위험으로 판정합니다.
              {!canEdit && <> · 기준 변경은 <b>관리자</b> 권한입니다.</>}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={BellRing}>단계별 알림 강도</SectionTitle>
            <div className="grid" style={{ gridTemplateColumns: "1.5fr 0.9fr 1.1fr 0.9fr 0.9fr", background: C.bg, borderRadius: "9px 9px 0 0", padding: "9px 13px", fontSize: 11, fontWeight: 800, color: C.sub, gap: 6 }}>
              <span>단계</span><span style={{ textAlign: "center" }}>사전 알림</span><span style={{ textAlign: "center" }}>재알림</span><span style={{ textAlign: "center" }}>보호자</span><span style={{ textAlign: "center" }}>의료진 통보</span>
            </div>
            {Object.values(ADH_LEVEL).map((L) => (
              <div key={L.key} className="grid items-center" style={{ gridTemplateColumns: "1.5fr 0.9fr 1.1fr 0.9fr 0.9fr", gap: 6, padding: "10px 13px", borderBottom: `1px solid ${C.line}` }}>
                <span className="flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}><L.icon size={13} color={L.c} /> {L.title}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: L.pre ? C.ink : C.grey, fontWeight: L.pre ? 700 : 400 }}>{L.pre ? `${L.pre}분 전` : "—"}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: L.retry ? C.ink : C.grey, fontWeight: L.retry ? 700 : 400 }}>{L.retry ? `${L.retryEvery}분 × ${L.retry}회` : "—"}</span>
                <span style={{ textAlign: "center" }}>{L.caregiver ? <Check size={14} color={L.c} strokeWidth={3} /> : <span style={{ color: C.line }}>—</span>}</span>
                <span style={{ textAlign: "center" }}>{L.clinic ? <Check size={14} color={L.c} strokeWidth={3} /> : <span style={{ color: C.line }}>—</span>}</span>
              </div>
            ))}
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 10, lineHeight: 1.55, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
              보호자 알림은 <b>환자 동의</b>가 있어야 발송됩니다. 위험 단계에서는 담당 의료진에게도 통보되어 다음 진료 시 확인할 수 있습니다.
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle icon={Users} right={<span style={{ fontSize: 11, color: C.sub }}>{adhTargets.length}명</span>}>강화 대상 환자</SectionTitle>
            {adhTargets.length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.sub, padding: "26px 0", textAlign: "center" }}>순응도 기준 미달 환자가 없습니다.</div>
            ) : (
              <>
                <div className="grid" style={{ gridTemplateColumns: "1.1fr 0.8fr 0.8fr 1.6fr 1.9fr 1fr", fontSize: 10.5, color: C.sub, fontWeight: 700, padding: "0 4px 8px", borderBottom: `1px solid ${C.line}`, gap: 6 }}>
                  <span>환자</span><span>순응도</span><span>단계</span><span>적용 알림</span><span>권고 조치</span><span style={{ textAlign: "right" }}>발송</span>
                </div>
                {adhTargets.map((x, i) => (
                  <div key={x.p.id} className="grid items-center" style={{ gridTemplateColumns: "1.1fr 0.8fr 0.8fr 1.6fr 1.9fr 1fr", gap: 6, padding: "10px 4px", borderBottom: i < adhTargets.length - 1 ? `1px solid ${C.line}` : "none", background: x.lv.key === "crit" ? C.highSoft + "55" : "transparent" }}>
                    <span onClick={() => onOpenPatient && onOpenPatient(x.p)} className="cursor-pointer" style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{x.p.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: x.p.adh < escCfg.crit ? C.high : C.mid }}>{x.p.adh}%</span>
                    <span><span style={{ fontSize: 10.5, fontWeight: 800, color: x.lv.c, background: x.lv.bg, padding: "2px 9px", borderRadius: 99 }}>{x.lv.short}</span></span>
                    <span style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.4 }}>
                      {x.lv.pre ? `사전 ${x.lv.pre}분` : "기본"}{x.lv.retry ? ` · 재알림 ${x.lv.retry}회` : ""}{x.lv.caregiver ? " · 보호자" : ""}
                    </span>
                    <span style={{ fontSize: 10.5, color: C.sub, lineHeight: 1.4 }}>
                      {x.lv.key === "crit" ? "용법 단순화(복합제) 또는 서방형 전환 검토" : x.lv.key === "warn" ? "부작용 확인 후 제형 변경 검토" : "점안 교육 재실시"}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <button onClick={() => onSendAdh && onSendAdh(x.p, x.lv)} className="cursor-pointer" style={{ border: "none", background: x.lv.c, color: "#fff", borderRadius: 8, padding: "6px 11px", fontSize: 11, fontWeight: 800, fontFamily: FONT }}>안내 발송</button>
                    </span>
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>
      )}

      {sub === "log" && (
        <>
          <div className="grid grid-cols-5" style={{ gap: 8, marginBottom: 12 }}>
            {[{ l: "총 발송", v: stat.total, c: C.ink }, { l: "성공", v: stat.ok, c: C.low }, { l: "부분 실패", v: stat.part, c: C.mid }, { l: "실패", v: stat.fail, c: C.high }, { l: "자동 발송", v: stat.auto, c: C.primary }].map((k) => (
              <div key={k.l} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{k.l}</div>
                <div className="flex items-baseline gap-1"><span style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</span><span style={{ fontSize: 10, color: C.sub }}>건</span></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between" style={{ marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2" style={{ width: 230, border: `1px solid ${C.line}`, borderRadius: 10, padding: "7px 11px", background: "#fff" }}>
                <Search size={14} color={C.sub} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="환자 · 기기 · 처리자 검색" style={{ flex: 1, border: "none", outline: "none", fontSize: 12.5, fontFamily: FONT, color: C.ink }} />
              </div>
              <select value={fLevel} onChange={(e) => setFLevel(e.target.value)} style={{ ...inpSm, width: 150 }}>
                <option value="all">전체 단계</option>
                {Object.values(LEVEL_ALL).map((L) => <option key={L.key} value={L.key}>{L.title}</option>)}
              </select>
              <select value={fRes} onChange={(e) => setFRes(e.target.value)} style={{ ...inpSm, width: 120 }}>
                <option value="all">전체 결과</option>
                {["성공", "부분 실패", "실패"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={exportCsv} className="cursor-pointer flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "8px 13px", fontSize: 12, fontWeight: 700, fontFamily: FONT }}><Download size={13} /> CSV 내보내기</button>
          </div>
          <div className="grid" style={{ gridTemplateColumns: COLS, fontSize: 10.5, padding: "0 6px 8px", borderBottom: `1px solid ${C.line}`, gap: 6 }}>
            <SortHead label="로그 ID" k="id" sort={sort} setSort={setSort} />
            <SortHead label="발송 일시" k="at" sort={sort} setSort={setSort} />
            <SortHead label="환자" k="name" sort={sort} setSort={setSort} />
            <SortHead label="기기" k="serial" sort={sort} setSort={setSort} />
            <SortHead label="단계" k="level" sort={sort} setSort={setSort} />
            <span style={{ color: C.sub, fontWeight: 700 }}>채널</span>
            <SortHead label="방식" k="mode" sort={sort} setSort={setSort} />
            <SortHead label="처리자" k="actor" sort={sort} setSort={setSort} />
            <SortHead label="결과" k="result" sort={sort} setSort={setSort} align="right" />
          </div>
          {rows.map((r, i) => {
            const L = LEVEL_ALL[r.level] || RENT_LEVEL.d3;
            return (
              <div key={r.id} className="grid items-center" style={{ gridTemplateColumns: COLS, gap: 6, padding: "10px 6px", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : "none", background: r.result === "실패" ? C.highSoft + "50" : "transparent" }}>
                <span style={{ fontSize: 11, color: C.sub, fontFamily: "monospace" }}>{r.id}</span>
                <span style={{ fontSize: 11.5, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{r.at}</span>
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontSize: 10.5, color: C.sub, fontFamily: "monospace" }}>{r.serial}</span>
                <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: L.c }}><L.icon size={11} /> {L.title}</span>
                <span className="flex items-center gap-1">{r.chs.map((cid) => { const c = CHANNELS.find((x) => x.id === cid); return c ? <c.icon key={cid} size={12} color={c.c} /> : null; })}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.mode === "자동" ? C.primary : C.gold }}>{r.mode}</span>
                <span style={{ fontSize: 11.5, color: C.sub }}>{r.actor}</span>
                <span style={{ textAlign: "right" }}><span style={{ fontSize: 10.5, fontWeight: 800, color: RESULT_C[r.result], background: RESULT_C[r.result] + "18", padding: "3px 9px", borderRadius: 99 }}>{r.result}</span></span>
              </div>
            );
          })}
          <div style={{ fontSize: 10.5, color: C.sub, marginTop: 12, lineHeight: 1.55, background: C.bg, borderRadius: 10, padding: "9px 11px" }}>
            <b style={{ color: C.primary }}>감사 로그:</b> 모든 발송은 자동·수동 구분과 처리자를 남기며 임의 수정·삭제할 수 없습니다. 보존 기간은 기관 정책(권장 3년)에 맞춰 설정하세요.
          </div>
        </>
      )}
      {csv && (
        <Modal title="CSV 내보내기" onClose={() => setCsv(null)} wide>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 9 }}>브라우저 다운로드가 차단되어 내용을 표시합니다. 전체 선택 후 복사해 사용하세요.</div>
          <textarea readOnly value={csv} style={{ width: "100%", height: 260, ...inpSm, fontFamily: "monospace", fontSize: 11, resize: "vertical" }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------- 사용자 · 권한 ---------- */
function UsersPage({ role, users, setUsers }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ k: "name", dir: "asc" });
  const [add, setAdd] = useState(false);
  if (!CAN[role].users) return <NoPermission role={role} />;
  const rows = useMemo(() => {
    let r = users.filter((u) => !q || [u.name, u.email, u.org].join(" ").toLowerCase().includes(q.toLowerCase()));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => String(a[sort.k]).localeCompare(String(b[sort.k]), "ko") * dir);
  }, [users, q, sort]);
  const COLS = "1.2fr 1.8fr 1.3fr 1.2fr 1fr 0.9fr 0.6fr";
  return (
    <div style={{ padding: "16px 20px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2" style={{ flex: 1, maxWidth: 300, border: `1px solid ${C.line}`, borderRadius: 10, padding: "7px 11px", background: "#fff" }}>
          <Search size={14} color={C.sub} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · 이메일 · 기관 검색" style={{ flex: 1, border: "none", outline: "none", fontSize: 12.5, fontFamily: FONT, color: C.ink }} />
        </div>
        <button onClick={() => setAdd(true)} className="cursor-pointer flex items-center gap-1.5" style={{ border: "none", borderRadius: 10, padding: "9px 15px", background: C.primary, color: "#fff", fontSize: 12.5, fontWeight: 800, fontFamily: FONT }}><UserPlus size={14} /> 신규 사용자 추가</button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: COLS, fontSize: 10.5, padding: "0 6px 8px", borderBottom: `1px solid ${C.line}`, gap: 6 }}>
        <SortHead label="이름" k="name" sort={sort} setSort={setSort} />
        <SortHead label="이메일" k="email" sort={sort} setSort={setSort} />
        <SortHead label="기관" k="org" sort={sort} setSort={setSort} />
        <SortHead label="연락처" k="phone" sort={sort} setSort={setSort} />
        <SortHead label="역할" k="role" sort={sort} setSort={setSort} />
        <SortHead label="최근 로그인" k="last" sort={sort} setSort={setSort} />
        <span style={{ textAlign: "right", color: C.sub, fontWeight: 700 }}>상태</span>
      </div>
      {rows.map((u, i) => (
        <div key={u.id} className="grid items-center" style={{ gridTemplateColumns: COLS, gap: 6, padding: "10px 6px", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : "none", opacity: u.active ? 1 : 0.5 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{u.name}</span>
          <span style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</span>
          <span style={{ fontSize: 12, color: C.ink }}>{u.org}</span>
          <span style={{ fontSize: 11.5, color: C.sub }}>{u.phone}</span>
          <span><RoleBadge role={u.role} small /></span>
          <span style={{ fontSize: 11.5, color: C.sub }}>{u.last}</span>
          <span style={{ textAlign: "right", fontSize: 11, fontWeight: 700, color: u.active ? C.low : C.sub }}>{u.active ? "활성" : "비활성"}</span>
        </div>
      ))}
      {add && <Modal title="신규 사용자 추가" onClose={() => setAdd(false)}><AddUserForm onCancel={() => setAdd(false)} onSubmit={(u) => { setUsers((us) => [...us, u]); setAdd(false); }} /></Modal>}
    </div>
  );
}
function AddUserForm({ onCancel, onSubmit }) {
  const [f, setF] = useState({ name: "", email: "", org: "씨엔브이 안과", phone: "", role: "physician", active: true });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const ok = f.name && f.email;
  return (
    <div className="flex flex-col gap-3">
      <Field label="이메일" req><input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="name@clinic.co.kr" style={inpSm} /></Field>
      <div className="flex gap-2.5">
        <Field label="이름" req><input value={f.name} onChange={(e) => set("name", e.target.value)} style={inpSm} /></Field>
        <Field label="연락처"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} style={inpSm} /></Field>
      </div>
      <Field label="기관"><input value={f.org} onChange={(e) => set("org", e.target.value)} style={inpSm} /></Field>
      <Field label="역할" req>
        <div className="flex flex-col gap-2">
          {Object.values(ROLES).map((r) => (
            <div key={r.id} onClick={() => set("role", r.id)} className="cursor-pointer flex items-center gap-2.5" style={{ border: `1.5px solid ${f.role === r.id ? r.c : C.line}`, background: f.role === r.id ? r.c + "0F" : "#fff", borderRadius: 11, padding: "10px 12px" }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, borderRadius: 99, border: `2px solid ${f.role === r.id ? r.c : C.line}` }}>{f.role === r.id && <span style={{ width: 8, height: 8, borderRadius: 99, background: r.c }} />}</span>
              <div className="flex-1"><div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{r.label}</div><div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{r.desc}</div></div>
            </div>
          ))}
        </div>
      </Field>
      <div className="flex gap-2.5" style={{ marginTop: 2 }}>
        <button onClick={onCancel} className="cursor-pointer" style={{ flex: 1, border: `1.5px solid ${C.line}`, background: "#fff", color: C.sub, borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>취소</button>
        <button onClick={() => ok && onSubmit({ ...f, id: "U-" + Math.floor(Math.random() * 90 + 10), last: "-" })} disabled={!ok} className="cursor-pointer" style={{ flex: 2, border: "none", background: ok ? C.primary : C.mintDeep, color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 800, fontFamily: FONT }}>추가</button>
      </div>
    </div>
  );
}
function PermissionPage({ role }) {
  const cols = ["환자", "의사", "교육 담당자", "관리자"];
  const colC = [C.sub, ROLES.physician.c, ROLES.trainer.c, ROLES.admin.c];
  return (
    <div style={{ padding: "16px 20px" }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}><Shield size={16} color={C.primary} /><span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>역할별 권한 매트릭스</span></div>
      <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 14 }}>현재 로그인 역할: <RoleBadge role={role} small /> · 역할은 관리자만 변경할 수 있습니다.</div>
      <div className="grid" style={{ gridTemplateColumns: "2.4fr 0.7fr 0.7fr 0.9fr 0.7fr", background: C.primary, color: "#fff", borderRadius: "10px 10px 0 0", padding: "10px 14px", fontSize: 11.5, fontWeight: 800, gap: 6 }}>
        <span>기능</span>{cols.map((c) => <span key={c} style={{ textAlign: "center" }}>{c}</span>)}
      </div>
      {PERMISSIONS.map((r, i) => (
        <div key={r.t} className="grid items-center" style={{ gridTemplateColumns: "2.4fr 0.7fr 0.7fr 0.9fr 0.7fr", gap: 6, padding: "9px 14px", borderBottom: `1px solid ${C.line}`, background: i % 2 ? C.bg : "#fff" }}>
          <span style={{ fontSize: 12.5, color: C.ink }}>{r.t}</span>
          {r.p.map((v, k) => <span key={k} style={{ textAlign: "center" }}>{v ? <Check size={15} color={colC[k]} strokeWidth={3} /> : <span style={{ color: C.line }}>—</span>}</span>)}
        </div>
      ))}
      <div className="grid grid-cols-3" style={{ gap: 12, marginTop: 16 }}>
        {Object.values(ROLES).map((r) => (
          <Card key={r.id} style={{ padding: 14, borderColor: r.c + "40" }}>
            <RoleBadge role={r.id} />
            <div style={{ fontSize: 12, color: C.sub, marginTop: 7, lineHeight: 1.5 }}>{r.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   의료진 웹 SHELL
   ============================================================ */
function ClinicianWeb() {
  const [session, setSession] = useState(null);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [nav, setNav] = useState("patients");
  /* 대표 환자(P-1042)의 순응도는 실제 점안 기록(DOSE_LOG)에서 계산해 넣는다 */
  const [patients, setPatients] = useState(() => {
    const from = isoDate(new Date(new Date(TODAY_REF).setDate(TODAY_REF.getDate() - 30)));
    const calc = overallAdherence(from, TODAY_STR).pct;
    return PATIENTS_DB.map((p) => (p.id === "P-1042" ? { ...p, adh: calc } : p));
  });
  const [users, setUsers] = useState(USERS_DB);
  const [devices, setDevices] = useState(DEVICES_INIT);
  const [readAlerts, setReadAlerts] = useState([]);
  const [sentLog, setSentLog] = useState({ "CVT2H-2041CC03": ["06-30 09:00", "07-01 09:00", "07-02 09:00"] });
  const [cfg, setCfg] = useState(NOTIFY_CFG_INIT);
  const [escCfg, setEscCfg] = useState(ADH_ESC_CFG_INIT);
  const [audit, setAudit] = useState(AUDIT_INIT);
  const [lastRun, setLastRun] = useState("2026-07-03 09:00");
  const [lastResult, setLastResult] = useState(null);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(null);

  if (!session) return <ClinicianLogin users={users} onLogin={(u) => { setSession(u); setNav("patients"); setOpen(null); }} />;

  const me = session;
  const role = me.role;
  const logout = () => { setSession(null); setMenu(false); setModal(null); };
  const alerts = rentAlertList(devices, patients);
  const adhTargetCnt = patients.filter((p) => p.active && p.adh != null && adhLevel(p.adh, 0, escCfg).key !== "ok").length;
  const flashToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2800); };
  const stampNow = () => { const n = new Date(); return `${isoDate(n)} ${_pad(n.getHours())}:${_pad(n.getMinutes())}`; };
  const writeLog = (dev, a, mode, actor) => {
    const chs = CHANNELS.filter((c) => cfg.ch[a.key] && cfg.ch[a.key][c.id]).map((c) => c.id);
    if (!chs.length) return null;
    const pt = patients.find((x) => x.id === dev.assignedTo);
    const entry = { id: "L-" + Math.floor(Math.random() * 900 + 100), at: stampNow(), pid: dev.assignedTo, name: pt ? pt.name : "-", serial: dev.serial, level: a.key, chs, mode, result: "성공", actor, detail: mode === "자동" ? "스케줄러 배치 발송" : "담당자 수동 발송" };
    setAudit((l) => [entry, ...l]);
    const n = new Date();
    setSentLog((l) => ({ ...l, [dev.serial]: [...(l[dev.serial] || []), `${_pad(n.getMonth() + 1)}-${_pad(n.getDate())} ${_pad(n.getHours())}:${_pad(n.getMinutes())}`] }));
    return entry;
  };
  const sendNotice = (serial, a) => {
    const dev = devices.find((d) => d.serial === serial); if (!dev) return;
    const e = writeLog(dev, a, "수동", me.name);
    const nm = (patients.find((x) => x.id === dev.assignedTo) || {}).name || "환자";
    flashToast(e ? `${nm}님에게 ${chLabel(cfg, a.key)} 알림을 발송했습니다 · ${a.title}` : `${a.title} 단계에 설정된 발송 채널이 없습니다.`);
  };
  /* 순응도 강화 안내 발송 → 감사 로그 기록 */
  const sendAdhNotice = (pt, lv) => {
    const dev = devices.find((d) => d.assignedTo === pt.id) || { serial: pt.serial || "—" };
    const chs = lv.key === "crit" ? ["push", "sms", "call"] : lv.key === "warn" ? ["push", "sms"] : ["push"];
    const n = new Date();
    setAudit((l) => [{
      id: "L-" + Math.floor(Math.random() * 900 + 100), at: `${isoDate(n)} ${_pad(n.getHours())}:${_pad(n.getMinutes())}`,
      pid: pt.id, name: pt.name, serial: dev.serial, level: lv.key, chs, mode: "수동", result: "성공", actor: me.name,
      detail: `점안 순응도 ${pt.adh}% · ${lv.title} 안내 발송`,
    }, ...l]);
    flashToast(`${pt.name}님에게 ${lv.short} 단계 점안 안내를 발송했습니다.`);
  };

  const runBatch = () => {
    let n = 0;
    const names = [];
    alerts.forEach((x) => {
      if (writeLog(x.dev, x.a, "자동", "스케줄러")) { n += 1; if (x.pt) names.push(`${x.pt.name}(${x.a.title})`); }
    });
    const at = stampNow();
    setLastRun(at); setReadAlerts([]);
    setLastResult({ sent: n, at, detail: n ? names.join(" · ") : "설정된 발송 채널이 없어 실제 발송은 없었습니다." });
    flashToast(n ? `배치 실행 완료 · ${n}건 발송, 감사 로그에 기록했습니다.` : "발송 대상이 없습니다.");
  };
  const extendRent = (serial, days) => {
    setDevices((ds) => ds.map((d) => { if (d.serial !== serial) return d; const nd = new Date(d.rentTo); nd.setDate(nd.getDate() + days); return { ...d, rentTo: isoDate(nd) }; }));
    setReadAlerts((r) => r.filter((x) => x !== serial));
    flashToast(`반납 예정일을 ${days}일 연장했습니다.`);
  };
  const updatePatient = (pid, patch) => {
    setPatients((ps) => ps.map((x) => (x.id === pid ? { ...x, ...patch } : x)));
    setOpen((o) => (o && o.id === pid ? { ...o, ...patch } : o));
  };
  const returnDev = (serial) => {
    setDevices((ds) => ds.map((d) => (d.serial === serial ? { ...d, assignedTo: null, rentFrom: null, rentTo: null } : d)));
    flashToast("반납 처리되었습니다. 측정 데이터 수신이 정상화됩니다.");
  };

  const NAVS = [
    { id: "patients", t: "환자 (고객 DB)", icon: Users },
    { id: "devices", t: "장치", icon: Monitor },
    { id: "notif", t: "알림 자동화", icon: BellRing },
    { id: "users", t: "사용자", icon: UserCog, adminOnly: true },
    { id: "perm", t: "권한", icon: Shield },
  ];

  return (
    <div style={{ width: 900, maxWidth: "100%", background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, overflow: "hidden", position: "relative", boxShadow: "0 30px 70px -35px rgba(8,52,62,.35)" }}>
      <div className="flex items-center justify-between" style={{ padding: "12px 20px", background: C.primaryDeep }}>
        <div className="flex items-center gap-2.5">
          <Stethoscope size={19} color="#fff" />
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>안압케어 CLINIC</span>
          <span style={{ fontSize: 11.5, color: "#9FC4C6" }}>안압 · 점안 · 문진 통합 모니터링</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11.5, color: "#9FC4C6" }}>{me.org}</span>
          <NotifCenter alerts={alerts} read={readAlerts} setRead={setReadAlerts} sent={sentLog}
            onSend={sendNotice} onExtend={extendRent} onReturn={returnDev} onBatch={CAN[role].runBatch ? runBatch : null}
            onOpenPatient={(pt) => { if (pt) { setNav("patients"); setOpen(pt); } }} />
          <div style={{ position: "relative" }}>
            <div onClick={() => setMenu(!menu)} className="cursor-pointer flex items-center gap-2" style={{ color: "#fff", background: menu ? "rgba(255,255,255,.14)" : "transparent", borderRadius: 8, padding: "5px 9px" }}>
              <span className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 99, background: ROLES[role].c, fontSize: 11, fontWeight: 800 }}>{me.name.slice(0, 1)}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{me.name}</span>
              <ChevronDown size={13} style={{ transform: menu ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </div>
            {menu && (
              <>
                <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 250, background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: "0 18px 40px -12px rgba(8,52,62,.35)", zIndex: 31, overflow: "hidden" }}>
                  <div style={{ padding: "14px 15px", borderBottom: `1px solid ${C.line}`, background: C.bg }}>
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 99, background: ROLES[role].c, color: "#fff", fontSize: 15, fontWeight: 800 }}>{me.name.slice(0, 1)}</span>
                      <div className="min-w-0">
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{me.name}</div>
                        <div style={{ fontSize: 10.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{me.email}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}><RoleBadge role={role} small /></div>
                  </div>
                  {[{ id: "profile", t: "프로필", d: "이름·연락처·기관 정보", icon: User }, { id: "password", t: "비밀번호 변경", d: "현재 비밀번호 확인 후 변경", icon: KeyRound }].map((m) => (
                    <div key={m.id} onClick={() => { setModal(m.id); setMenu(false); }} className="cursor-pointer flex items-center gap-2.5" style={{ padding: "11px 15px", borderBottom: `1px solid ${C.line}` }}>
                      <m.icon size={15} color={C.primary} className="flex-shrink-0" />
                      <div className="flex-1"><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{m.t}</div><div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>{m.d}</div></div>
                      <ChevronRight size={13} color={C.grey} />
                    </div>
                  ))}
                  <div onClick={logout} className="cursor-pointer flex items-center gap-2.5" style={{ padding: "11px 15px" }}>
                    <LogOut size={15} color={C.high} className="flex-shrink-0" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.high }}>로그아웃</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center" style={{ borderBottom: `1px solid ${C.line}`, background: C.bg, padding: "0 12px" }}>
        {NAVS.map((n) => {
          const locked = n.adminOnly && !CAN[role].users;
          const on = nav === n.id;
          return (
            <button key={n.id} onClick={() => { setNav(n.id); setOpen(null); }} className="cursor-pointer flex items-center gap-1.5"
              style={{ border: "none", background: "transparent", padding: "12px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: FONT, color: on ? C.primary : locked ? C.grey : C.sub, borderBottom: `2px solid ${on ? C.primary : "transparent"}` }}>
              <n.icon size={14} /> {n.t} {locked && <Lock size={11} />}
              {n.id === "devices" && devices.filter((d) => deviceState(d).k === "overdue").length > 0 && (
                <span className="flex items-center justify-center" style={{ minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: C.high, color: "#fff", fontSize: 9.5, fontWeight: 800 }}>{devices.filter((d) => deviceState(d).k === "overdue").length}</span>
              )}
              {n.id === "notif" && (alerts.length + adhTargetCnt) > 0 && (
                <span className="flex items-center justify-center" style={{ minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: C.mid, color: "#fff", fontSize: 9.5, fontWeight: 800 }}>{alerts.length + adhTargetCnt}</span>
              )}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", fontSize: 11.5, color: C.sub, paddingRight: 8 }}>동기화 · 방금 전</div>
      </div>

      {nav === "patients" && (open
        ? <PatientDetail p={open} role={role} onBack={() => setOpen(null)} devices={devices} setDevices={setDevices} sent={sentLog} onSend={sendNotice} onUpdatePatient={updatePatient} toast={flashToast} />
        : <PatientsPage role={role} patients={patients} setPatients={setPatients} onOpen={setOpen} devices={devices} setDevices={setDevices} alerts={alerts} />)}
      {nav === "devices" && <DevicesPage role={role} devices={devices} setDevices={setDevices} patients={patients} toast={flashToast} />}
      {nav === "notif" && <NotifyPage role={role} cfg={cfg} setCfg={setCfg} log={audit} alerts={alerts} lastRun={lastRun} lastResult={lastResult} onRunBatch={runBatch}
        escCfg={escCfg} setEscCfg={setEscCfg} patients={patients} onSendAdh={sendAdhNotice} onOpenPatient={(pt) => { setNav("patients"); setOpen(pt); }} />}
      {nav === "users" && <UsersPage role={role} users={users} setUsers={setUsers} />}
      {nav === "perm" && <PermissionPage role={role} />}

      <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.sub, lineHeight: 1.5 }}>
        <b style={{ color: C.primary }}>데이터 출처:</b> CVT200 실시간 다회 측정(좌·우안 개별) · 스마트 점안 디바이스/수기 · 갤럭시·애플워치 · 전자문진 12항목. 개인정보는 국가별 규정에 따라 분리 보관·암호화됩니다.
      </div>

      {modal === "profile" && <ProfileModal me={me} onClose={() => setModal(null)} onSave={(f) => { const next = { ...me, ...f }; setSession(next); setUsers((us) => us.map((u) => (u.id === me.id ? next : u))); setModal(null); }} />}
      {modal === "password" && <PasswordModal onClose={() => setModal(null)} />}
      {toast && (
        <div className="flex items-center gap-2" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 70, background: C.ink, color: "#fff", borderRadius: 12, padding: "11px 18px", fontSize: 12.5, fontWeight: 700, boxShadow: "0 12px 30px -8px rgba(8,52,62,.5)", zIndex: 50 }}>
          <PackageCheck size={15} color={C.mintDeep} /> {toast}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
export default function App() {
  const [view, setView] = useState("patient");
  return (
    <div style={{ fontFamily: FONT, background: "#E9F0EF", minHeight: "100vh", padding: "28px 16px 48px" }}>
      <style>{`.animate-spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div className="flex flex-col items-center" style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: C.primary, fontWeight: 800 }}>C&V TECH · CVT200 COMPANION</div>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: C.ink, margin: "5px 0 3px" }}>안압케어 — 녹내장 통합관리 v3</h1>
          <div style={{ fontSize: 13, color: C.sub, textAlign: "center", maxWidth: 640, lineHeight: 1.5 }}>
            좌·우안 선택 측정과 그래프 형식 선택, 계정·권한·고객 DB, 기기 대여·개인 소유 관리, 반납 알림 자동화를 통합앱에 반영하고 점안관리를 전면 개선했습니다.
          </div>
          <div className="flex items-center" style={{ marginTop: 16, background: "#fff", borderRadius: 999, padding: 4, border: `1px solid ${C.line}` }}>
            {[{ id: "patient", label: "환자 앱", icon: Smartphone }, { id: "clinician", label: "의료진 웹", icon: Stethoscope }].map((v) => {
              const on = view === v.id;
              return <button key={v.id} onClick={() => setView(v.id)} className="flex items-center gap-2 cursor-pointer" style={{ border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13.5, fontWeight: 700, fontFamily: FONT, background: on ? C.primary : "transparent", color: on ? "#fff" : C.sub }}><v.icon size={16} /> {v.label}</button>;
            })}
          </div>
        </div>
        <div className="flex justify-center">{view === "patient" ? <PatientApp /> : <ClinicianWeb />}</div>
        <div className="flex items-center justify-center gap-2 flex-wrap" style={{ marginTop: 26, fontSize: 12, color: C.sub }}>
          <Flow icon={Eye} t="안압 좌·우안 측정" /><Send size={13} color={C.mintDeep} />
          <Flow icon={Droplets} t="점안 · 약병 · 부작용" /><Send size={13} color={C.mintDeep} />
          <Flow icon={ClipboardList} t="전자 문진 12항목" /><Send size={13} color={C.mintDeep} />
          <Flow icon={Watch} t="워치 헬스" /><Send size={13} color={C.mintDeep} />
          <Flow icon={Stethoscope} t="의료진 웹" strong />
        </div>
      </div>
    </div>
  );
}
function Flow({ icon: Ic, t, strong }) {
  return <span className="inline-flex items-center gap-1.5" style={{ padding: "5px 11px", borderRadius: 999, background: strong ? C.primary : "#fff", color: strong ? "#fff" : C.ink, border: `1px solid ${strong ? C.primary : C.line}`, fontWeight: 600, fontSize: 12 }}><Ic size={13} /> {t}</span>;
}
