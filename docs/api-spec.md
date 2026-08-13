# 안압케어 API 명세

REST / JSON / v1 / 2026-08

기본 경로: `https://api.anapcare.co.kr/v1`
인증: `Authorization: Bearer <access_token>`
함께 보는 문서: [`backend-architecture.md`](backend-architecture.md), [`db-schema.md`](db-schema.md)

---

## 0. 공통 규약

**응답 형식**

```json
{ "data": { }, "meta": { "page": 1, "size": 50, "total": 128 } }
```

**오류 형식**

```json
{ "error": { "code": "RENTAL_OVERDUE", "message": "대여 기간이 초과되었습니다.",
             "detail": { "device_serial": "CVT2H-2041CC03", "overdue_days": 3 } } }
```

| 코드 | HTTP | 의미 |
|---|---|---|
| `UNAUTHENTICATED` | 401 | 토큰 없음·만료 |
| `FORBIDDEN_ROLE` | 403 | 역할 권한 부족 |
| `PATIENT_NOT_CERTIFIED` | 403 | 미인증 환자의 데이터 연동 시도 |
| `RENTAL_OVERDUE` | 202 | 측정 업로드 거부(수신 중단) |
| `DEVICE_ALREADY_ASSIGNED` | 409 | 다른 환자에게 배정된 기기 |
| `DUPLICATE_MEASUREMENT` | 200 | 멱등키 중복 — 기존 건 반환 |

**페이지네이션** `?page=1&size=50`
**정렬** `?sort=adherence,desc` (화면의 컬럼 정렬과 1:1 대응)
**기간** `?from=2026-06-03&to=2026-07-03`

---

## 1. 인증

### 환자

```http
POST /auth/patient/login
{ "login_id": "sylee62", "password": "••••••••" }
→ { "access_token": "...", "refresh_token": "...", "expires_in": 900,
    "account": { "id": "A-3312", "name": "이순영", "join_type": "local" } }
```

```http
POST /auth/patient/oauth
{ "provider": "kakao", "code": "...", "redirect_uri": "..." }
```

지원 provider: `kakao` `naver` `google` `apple` `facebook` `wechat` `weibo` `qq`

```http
POST /auth/patient/signup
{ "name": "홍길동", "gender": "M", "birth": "1962-01-02",
  "phone": "010-0000-0000", "email": "...", "login_id": "...", "password": "...",
  "device_serial": "CVT2H-2033AA11", "device_owner": "org",
  "consents": { "data_share": true } }
```

`device_serial`은 선택입니다. `device_owner`가 `org`면 대여 기기로, `patient`면 개인 소유로 연동을 시도합니다.

```http
POST /me/migrate            # 비회원 로컬 기록을 계정으로 이관
{ "measurements": [...], "dose_events": [...] }
```

### 직원

```http
POST /auth/staff/login
{ "email": "jhlee@cnvtech.co.kr", "password": "..." }
→ { "access_token": "...", "user": { "public_id": "U-02", "name": "이재훈",
                                     "role": "physician", "org": "씨엔브이 안과" } }

POST /auth/refresh          { "refresh_token": "..." }
POST /auth/logout
POST /me/password           { "current": "...", "new": "..." }
PATCH /me                   { "name": "...", "phone": "...", "org": "..." }
```

직원 계정 자가 가입 경로는 없습니다. 관리자가 `POST /users`로 생성합니다.

---

## 2. 직원 계정 — 관리자 전용

```http
GET    /users?q=&role=&sort=name,asc
POST   /users        { "email": "...", "name": "...", "phone": "...",
                       "role": "physician", "is_active": true }
PATCH  /users/{id}   { "role": "trainer", "is_active": false }
```

`admin` 외 역할은 403 `FORBIDDEN_ROLE`을 반환합니다.

---

## 3. 환자 (고객 DB)

```http
GET /patients?q=이순영&device=rental&adherence_lt=80&include_inactive=false
              &sort=adherence,asc&page=1&size=50
```

**필터** — `device`: `rental` `owned` `none` `due`(반납 임박·연체) / `adherence_lt` / `certified` / `include_inactive`
**정렬 키** — `name` `public_id` `gender` `phone` `join_type` `device_status` `adherence` `last_measured_at` `notify_level`

```json
{ "data": [{
  "public_id": "P-1042", "name": "이순영", "gender": "M", "birth": "1962-01-02",
  "phone": "010-3355-7712", "email": "sylee@naver.com",
  "login_id": "sylee62", "join_type": "kakao",
  "diagnosis": "정상안압녹내장 (NTG)",
  "target": { "od": 15, "os": 16 },
  "device": { "serial": "CVT2H-2033AA11", "owner": "org",
              "status": "due_today", "rent_to": "2026-07-03" },
  "adherence_30d": 82,
  "last_measured_at": "2026-07-03T18:30:00+09:00",
  "notify_level": "high", "is_certified": true, "is_active": true
}]}
```

```http
POST   /patients                 # 신규 등록 (기기 배정 동시 처리)
{ "name": "...", "gender": "F", "birth": "...", "phone": "...", "email": "...",
  "login_id": "...", "temp_password": "...", "join_type": "local",
  "diagnosis": "...", "target": { "od": 15, "os": 15 },
  "device": { "mode": "rental", "serial": "CVT2H-2049FF62",
              "rent_from": "2026-07-03", "rent_to": "2026-08-03" } }
```

`device.mode`는 `rental` · `owned` · `none` 중 하나입니다.

```http
GET    /patients/{id}
PATCH  /patients/{id}
POST   /patients/{id}/certify        # 환자 인증 (의사·교육 담당자)
POST   /patients/{id}/deactivate
POST   /patients/{id}/password-reset # 재설정 메일 발송
PUT    /patients/{id}/target         # 목표 안압 — 의사·관리자만
{ "od": 14, "os": 15, "effective_from": "2026-07-03" }
```

비밀번호는 어떤 응답에도 포함되지 않습니다. 의료진 화면의 마스킹 표시는 UI 장식이며 서버는 해시만 보관합니다.

---

## 4. 기기

```http
GET  /devices?owner=org&usage=home&status=free&q=
POST /devices                    { "serial": "...", "name": "...", "usage": "home" }

POST /devices/{serial}/assign    # 병원 대여 배정
{ "patient_id": "P-1042", "rent_from": "2026-07-03", "rent_to": "2026-08-03" }

POST /devices/{serial}/return    # 반납 처리 → 수신 중단 즉시 해제
POST /devices/{serial}/extend    { "rent_to": "2026-08-10" }
POST /devices/{serial}/link      { "patient_id": "P-1043" }   # 개인 소유 연동
POST /devices/{serial}/unlink
```

이미 배정된 기기에 `assign`을 호출하면 409 `DEVICE_ALREADY_ASSIGNED`를 반환합니다.

---

## 5. 안압 측정

### 5.1 업로드 (Ingest)

```http
POST /ingest/measurements
X-Device-Serial: CVT2H-2033AA11
X-Device-Key: <기기 발급 키>

{ "items": [
  { "uid": "2033AA11-000482", "measured_at": "2026-07-03T07:40:12+09:00",
    "eye": "OD", "value": 16.4, "quality": "excellent", "source": "auto",
    "context": "기상 직후" },
  { "uid": "2033AA11-000483", "measured_at": "2026-07-03T07:40:55+09:00",
    "eye": "OS", "value": 15.2, "quality": "good", "source": "auto" }
]}
```

- `uid`는 기기가 생성하는 멱등키입니다. 재전송해도 중복 저장되지 않습니다.
- 좌·우안이 **각각 한 건**입니다. 한쪽만 측정한 경우 한 건만 보냅니다.

**수신 중단 응답**

```json
{ "data": { "stored": 0, "rejected": 2 },
  "error": { "code": "RENTAL_OVERDUE",
             "message": "대여 반납이 연체되어 데이터가 저장되지 않았습니다.",
             "detail": { "overdue_days": 3, "resume": "반납 또는 기간 연장 후 재전송하세요." } } }
```

HTTP 상태는 `202`입니다. **앱은 로컬 보관을 유지**하고 상태가 풀리면 재전송합니다.

### 5.2 조회

```http
GET /patients/{id}/measurements?from=&to=&eye=OD&exclude_excluded=true
GET /patients/{id}/measurements/series?from=&to=&type=chart|scatter|diurnal&eye=both
```

`type`이 화면의 그래프 형식과 대응합니다.

| type | 응답 |
|---|---|
| `chart` | 날짜별 `{ date, od_avg, od_min, od_max, os_avg, os_min, os_max, count, adherence, missed }` |
| `scatter` | 개별 측정 `{ measured_at, eye, value }` |
| `diurnal` | 시각(0–23)별 `{ hour, od_avg, os_avg, od_band, n }` |

```http
PATCH /measurements/{id}     { "is_excluded": true }   # 의사·관리자만
```

---

## 6. 처방 · 점안

```http
GET  /patients/{id}/prescriptions
POST /patients/{id}/prescriptions        # 의사·관리자만
{ "drug_id": 12, "eye": "both", "times": ["08:00","20:00"],
  "is_prn": false, "start_date": "2026-07-03" }

PATCH  /prescriptions/{id}    { "end_date": "2026-08-01" }
POST   /prescriptions/{id}/bottles       # 새 병 개봉 / 리필
{ "opened_at": "2026-07-03", "drops_total": 100 }        # 다회용
{ "units_left": 30 }                                      # 일회용
```

### 점안 체크 — 좌·우안 개별

```http
GET  /patients/{id}/doses?date=2026-07-03
POST /doses
{ "prescription_id": 88, "scheduled_date": "2026-07-03",
  "scheduled_time": "08:00", "eye": "OD",
  "taken": true, "taken_at": "2026-07-03T08:04:00+09:00", "source": "device" }
```

`(prescription_id, scheduled_date, scheduled_time, eye)`가 유니크 키입니다. 같은 요청을 두 번 보내도 안전합니다. 체크 해제는 `taken: false`로 보냅니다.

---

## 7. 순응도

모든 수치는 `dose_event`에서 계산됩니다. 사전 계산된 상수는 사용하지 않습니다.

```http
GET /patients/{id}/adherence?from=2026-06-03&to=2026-07-03&group_by=med
```

`group_by`: `overall`(기본) · `day` · `med` · `slot` · `eye` · `dow`

```json
{ "data": {
  "overall": { "total": 720, "taken": 632, "missed": 88, "pct": 88 },
  "by_med": [
    { "key": "잘타라노 점안액", "total": 240, "taken": 204, "pct": 85 },
    { "key": "콤비간 점안액",   "total": 480, "taken": 428, "pct": 90 }
  ]
}}
```

### 원인 분석

```http
GET /patients/{id}/adherence/root-causes?from=&to=
```

```json
{ "data": { "overall_pct": 82, "causes": [
  { "key": "se-14", "category": "adverse_event", "impact_pp": 12,
    "title": "콤비간 점안액 부작용 보고 이후 순응도 하락",
    "detail": "2026-06-05 따가움·자극감(중등도) 기록 이후 80% → 68%",
    "evidence": { "before": { "pct": 80, "total": 56 },
                  "after":  { "pct": 68, "total": 116 }, "at": "2026-06-05" },
    "action": "보존제 무함유 제형이나 같은 계열 다른 성분으로 변경을 검토하세요." },
  { "key": "dow", "category": "weekday", "impact_pp": 10,
    "title": "토요일에 누락이 몰림", "detail": "토요일 72% · 전체 평균보다 10%p 낮음",
    "action": "해당 요일만 알림을 한 번 더 받도록 설정하세요." }
]}}
```

`category`: `adverse_event` `slot` `weekday` `eye` `drug` `bottle`
`impact_pp`는 전체 평균 대비 하락폭(%p)이며 **인과 판정이 아니라 연관성 제시**입니다.

---

## 8. 부작용 · 문진 · 워치

```http
POST /patients/{id}/adverse-events
{ "prescription_id": 88, "eye": "OD", "symptoms": ["결막 충혈"],
  "severity": "mild", "note": "점안 후 20분 정도 붉어짐" }

GET  /patients/{id}/adverse-events

GET  /survey/questions                     # 12항목 정의 (주기·유형 포함)
POST /patients/{id}/survey-responses
{ "responses": [ { "question_id": "Q1-1", "answer": 2 },
                 { "question_id": "Q6-2", "answer": { "cig": 20, "years": 15 } } ] }
GET  /patients/{id}/survey-responses?latest=true

POST /patients/{id}/wearable-metrics
{ "platform": "galaxy", "items": [ { "date": "2026-07-03", "metric": "steps", "value": 6420 } ] }
```

문진 답변은 `JSONB`로 받아 항목 개편 시 스키마 변경이 없도록 합니다.

---

## 9. 알림

```http
GET  /notify/config                        # 기관 설정 조회
PUT  /notify/config                        # 관리자만
{ "rent": { "enabled": true, "run_at": "09:00", "grace_days": 3,
            "resend_daily": true, "quiet_hours": true, "retry_limit": 2,
            "channels": { "d3": ["push"], "d1": ["push","sms"],
                          "d0": ["push","sms"], "overdue": ["push","sms","call"],
                          "blocked": ["push","sms","call"] } },
  "adherence": { "enabled": true, "window": 14,
                 "watch": 90, "warn": 80, "crit": 70, "streak": 3 } }

GET  /notify/rental-alerts                 # 반납 알림 대상
GET  /notify/adherence-targets             # 순응도 강화 대상
POST /notify/send
{ "patient_id": "P-1044", "category": "rental", "level": "overdue" }
POST /notify/batch/run                     # 수동 배치 실행 (의사·관리자)
GET  /notify/logs?from=&to=&level=&result=&mode=&q=&sort=sent_at,desc
GET  /notify/logs/export?format=csv        # 관리자만
```

발송은 모두 `notify_log`에 기록되며 수정·삭제할 수 없습니다.

---

## 10. 보고서 · 내보내기

```http
POST /patients/{id}/reports
{ "from": "2026-06-03", "to": "2026-07-03",
  "sections": ["iop","adherence","survey"], "graph_type": "diurnal" }
→ { "report_id": "R-8821", "status": "processing" }

GET  /reports/{report_id}                  # 완료 시 다운로드 URL 포함
GET  /orgs/export?from=&to=&format=csv     # 기관 데이터 — 관리자만
```

보고서 생성은 비동기입니다. 완료되면 서명된 임시 URL(15분 유효)을 반환합니다.

---

## 11. 레이트리밋

| 대상 | 제한 |
|---|---|
| 로그인 | IP 10회/분, 계정 5회/분 |
| Ingest | 기기당 60회/분, 1회 요청 최대 200건 |
| 일반 조회 | 사용자당 600회/분 |
| 내보내기 | 기관당 5회/시간 |

초과 시 `429`와 `Retry-After` 헤더를 반환합니다.

---

## 12. 버전 관리

경로에 버전을 둡니다(`/v1`). 하위 호환이 깨지는 변경은 `/v2`로 올리고, 최소 6개월간 병행 운영합니다. 필드 추가는 하위 호환으로 간주하므로 클라이언트는 **모르는 필드를 무시**하도록 구현해야 합니다.
