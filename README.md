# 승인보드 — 배포 가이드

승인 요청과 이해관계자 의견을 링크 하나로 모으는 무료 웹사이트입니다. **도메인 = Vercel, 창고(DB) = Supabase, 프런트/백엔드 = 이미 작성된 코드**.

## 시작하기 전에 — 압축 파일 사용법

1. `approvalboard.zip`을 다운로드해 압축을 풉니다.
2. `approvalboard` 폴더가 웹사이트 전체입니다. 구조는 그대로 두세요.
3. `config.js` 두 줄만 채우면 됩니다.

## 1단계 — Supabase 만들기 (5분)

1. [supabase.com](https://supabase.com) 무료 가입 → New Project (리전 Northeast Asia (Seoul) 추천)
2. SQL Editor에 `supabase-schema.sql` 전체를 붙여넣고 Run — `apb_boards`, `apb_feedback_items`, `apb_feedback_comments` 테이블이 만들어집니다.
3. Settings → **API Keys**에서 **Project URL**과 **anon** `public` 키(`eyJ...`로 시작하는 레거시 키)를 복사합니다. ⚠️ 새로 추가된 `sb_publishable_...` 키는 아직 호환성 문제가 있어 오류가 날 수 있으니 사용하지 마세요. 화면에 안 보이면 "Legacy keys" 표시가 있는 곳을 펼쳐보세요.

## 2단계 — config.js에 붙여넣기 (2분)

```js
window.SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

## 3단계 — Vercel 배포 (10분)

1. GitHub에 저장소를 만들고 `approvalboard` 폴더 전체를 업로드합니다.
2. [vercel.com](https://vercel.com)에서 그 저장소를 Import, Framework Preset은 **Other**로 두고 Deploy.
3. `https://프로젝트이름.vercel.app` 주소로 바로 접속해 테스트합니다.

## 4단계 — 확인

새 보드 만들기 → 승인 요청 등록 → 댓글 남기기 → 상태 클릭 → 마크다운 복사까지 한 번씩 테스트해보세요.

## 5단계 — 검색 노출 + 애드센스

Search Console·네이버 서치어드바이저 등록 후, `guide/` 2편 + `faq.html`을 바탕으로 애드센스를 신청할 수 있습니다.

## 6단계 — 커스텀 도메인(선택)

Vercel의 Settings → Domains에서 연결 가능합니다.

---

이 제품은 **프로젝트보드**(마일스톤+이슈+피드백+회의록 전체 번들)의 피드백/승인요청 기능만 독립적으로 뗀 버전입니다. 회의록이나 마일스톤·이슈 관리도 필요해지면 **액션보드**, **마일스톤보드**, **이슈보드**, 또는 전체가 통합된 **프로젝트보드**로 업그레이드할 수 있습니다.

## 제거(언인스톨)가 필요하다면

같은 폴더의 `uninstall-schema.sql`을 Supabase SQL Editor에 붙여넣고 Run 하면 이 모듈의 테이블만 삭제됩니다. 다른 모듈과 같은 프로젝트에 함께 설치했더라도 테이블명 접두사가 서로 달라 다른 모듈 데이터에는 영향이 없습니다. 프로젝트 자체를 더 이상 쓰지 않는다면 Supabase 대시보드에서 프로젝트를 통째로 삭제해도 됩니다.
