# 테스트 보고서

실행일: 2026-08-13 (Asia/Seoul)

## 결론

- Realm Toybox `v0.9.0-rc1`은 정적 검증, 검증기 음성 회귀 13건, 결정적 데이터팩·리소스팩 패키징을 통과했다.
- Mojang 공식 Java 26.2 서버에서 소스 디렉터리와 **최종 데이터팩 ZIP 자체**가 각각 신규 월드 부팅, 실제 `/reload`, 전체 스모크 0, 저장·정상 종료, 같은 월드 재시작을 통과했다.
- 수확 낫의 서버 스모크는 완숙 작물 5종 9칸, 미성숙 비수확, 5블록 제한 시선, 전리품 생성, 내구도 1, 마지막 내구도 파손과 시험장 정리를 확인했다.
- 실제 26.2 클라이언트 조작, 2인 동시성, 한국어 화면 전환과 Realm 업로드는 실행하지 않았으며 통과로 기록하지 않는다.

## 기준과 입력

- 대상: Minecraft Java Edition 26.2 정식판
- 데이터팩 형식: `107.1`
- 선택형 리소스팩 형식: `88.0`
- 공식 릴리스 안내: `https://feedback.minecraft.net/hc/en-us/articles/46690753273997-Minecraft-Java-Edition-26-2`
- 공식 서버 JAR SHA-1: `823e2250d24b3ddac457a60c92a6a941943fcd6a`
- 공식 서버 JAR SHA-256: `cdacdfb25898de5e4b4b0e5ddcc2722f77067e46605709c2d886c000ebb63ec5`
- JAR `version.json`: `id=26.2`, `stable=true`, `pack_version.data_major=107`, `data_minor=1`
- Toybox 데이터 버전: `900`
- 보존한 원본 `Realm_Toybox_v0.1_26.2.zip` SHA-256: `6915ae8c0f4f7673cdce81a2b38a624ca6924931f04d42c8d73c75d856200650`

## 정적 검증과 검증기 자체 시험

최종 `node tools/validate.mjs` 결과:

- 데이터팩 JSON/메타데이터 117개 엄격 파싱
- 함수·레시피·predicate·item modifier·태그 참조 확인
- 틱 호출 그래프 99개 추적, 무제한 전역 `@e` 없음
- 데이터팩 107.1, 리소스팩 88.0, UTF-8 BOM과 번역 키 대응 확인
- 바닐라 `exclusive_set` 전체 오버라이드, 빈 Toybox 배타 태그, 변경 없는 `breach` 오버라이드 없음
- v0.9 데이터 버전·objective·플레이어 마이그레이션·레시피 해금 확인
- 수확 낫의 사건 진입, 25단계 시선, 정확히 9칸, 완숙 5종, 전리품-제거 순서, 손 분기, 내구도·파손, 활성 사용자 한정 재무장 확인

`tools/test_validate.ps1`은 정상 소스와 고의 파손 fixture 13개를 실행했고 모두 예상대로 통과/거부됐다. 신규 fixture는 비소모성 사용 동작이 빠진 수확 낫 레시피를 `[SICKLE_ITEM]`으로 거부했다. `node --check tools/generate_v090.mjs`도 통과했다.

## 공식 서버 소스 시험

소스 디렉터리를 새 월드에 설치해 다음 흐름을 실행했다.

1. 공식 JAR SHA-1과 `stable=true`, 형식 107.1 확인
2. 신규 부팅과 데이터팩 자동 활성화
3. RCON으로 실제 `reload` 실행 후 레시피 1,598개·발전 과제 1,691개 로드 확인
4. `toybox:dev/server_smoke`와 세부 점수 조회
5. `smoke_fail=0`, 팩 활성 목록 확인
6. `save-all`, 정상 `stop`
7. 같은 월드 재시작 후 전체 스모크 반복

최종 소스 시험은 `official 26.2, source directory, boot, reload, smoke, stop, restart`로 통과했다. 모든 JVM은 `-Dtoybox.job=Realm_Toybox.server_test`, 고유 run ID와 프로젝트 식별자를 사용했다.

## 수확 낫 서버 스모크

소스와 최종 ZIP의 최초 부팅·재시작에서 모두 다음 값을 확인했다.

- `$smoke_sickle_fail=0`
- `$smoke_sickle_raycast=1`, 실제 적중 단계 `$smoke_sickle_ray_step=14`
- `$smoke_sickle_ray_count=1`
- `$smoke_sickle_plants=9`, `$smoke_sickle_grid_count=9`, `$smoke_sickle_grid=1`
- `$smoke_sickle_damage=1`, 실제 `minecraft:damage=1`
- `$smoke_sickle_break=1`
- 미성숙 밀 age 6은 남고 수확 개수 0

개발 중 처음 사용한 NBT 검사 경로 `HandItems[0]`은 26.2 갑옷 거치대 장비 직렬화와 맞지 않아 내구도 0이라는 거짓 실패를 냈다. 실제 엔티티 NBT의 `equipment.mainhand.components."minecraft:damage"`에서 손상 10→11→12를 확인한 뒤 최종 검사를 올바른 경로로 바꿨다. 최종 전체 시험은 처음부터 다시 실행해 통과했다.

## 기존 기능 회귀

소스와 최종 ZIP의 두 부팅에서 다음 집계가 모두 0이었다.

- 고등 마법부여 `$smoke_adv_fail=0`
- 포션 합성 `$smoke_alchemy_fail=0`
- 클라이언트 시험 리그 `$smoke_client_kit_fail=0`
- 줄자·분필 `$smoke_building_fail=0`
- 점프 발판 `$smoke_pad_fail=0`
- 수프 냄비 `$smoke_soup_fail=0`
- 측량·분필 나침반 `$smoke_survey_fail=0`
- 수확 낫 `$smoke_sickle_fail=0`
- 전체 `$smoke_fail=0`

## 결정적 패키징

데이터팩과 리소스팩을 각각 두 번 연속 생성했고 같은 종류의 두 SHA-256이 일치했다.

### 데이터팩

- 파일: `release/Realm_Toybox_v0.9.0-rc1-java-26.2.zip`
- 크기: 320,446 bytes
- SHA-256: `87cd99abe8d756dbf843e75de0d1623db90f27bf1b559f47627a43a4363e63ca`
- ZIP 엔트리: 536개, `data/` 엔트리 513개
- 역슬래시 경로 0개, 루트 `pack.mcmeta` 1개, `TEST_REPORT.md` 0개

### 선택형 언어 리소스팩

- 파일: `release/Realm_Toybox_Resources_v0.9.0-rc1-java-26.2.zip`
- 크기: 9,881 bytes
- SHA-256: `d80a937c498d63257c8379e39ec1a700f6275a1c894755d393b51a45108c3a5f`
- ZIP 엔트리: 3개, `assets/` 엔트리 2개
- 역슬래시 경로 0개, 루트 `pack.mcmeta` 1개

두 `.sha256` sidecar는 실제 파일 해시와 일치한다. 이 보고서는 패키저가 데이터팩 ZIP에서 제외하므로 최종 시험 뒤 보고서 갱신이 시험한 릴리스 바이트를 바꾸지 않는다.

## 최종 릴리스 ZIP 공식 서버 시험

최종 데이터팩 ZIP을 `world/datapacks/Realm_Toybox.zip`으로 설치했다.

- 최초 부팅 PID `17700`, 같은 월드 재시작 PID `40996`
- 신규 부팅, 실제 `/reload`, 전체 스모크, `save-all`, 정상 종료, 재시작 통과
- 두 부팅 모두 레시피 1,598개, 발전 과제 1,691개, `$smoke_fail=0`, `$smoke_sickle_fail=0`
- 팩 활성 목록에 `file/Realm_Toybox.zip (world)` 확인
- 데이터팩·JSON·명령 hard error 0건

## 실행하지 않은 항목

- 수확 낫의 실제 `using_item` 진입, 주·보조 손 우선순위, 사용 자세, 키 유지 반복 감각
- 행운 0/III 드롭 분포, 내구성·수선·모루 수리, 2인 동시 수확
- 분필 나침반 바늘, 줄자·도약·점프 발판·갈고리·폭렬·균열 사격의 실제 화면과 조작감
- 고등 마법부여와 포션 합성의 실제 UI·음용·투척
- 수프 냄비 섭취·그릇 반환과 2인 마지막 회분
- 한국어/영어 클라이언트 전환, 30분 반복·1/4/10인 프로파일
- 실제 Realm 업로드, 실험 기능 경고, 재접속과 Realm 재시작

수동 절차는 `BUILDING_TEST.md`, `CLIENT_TEST.md`, `SOUP_TEST.md`, `SICKLE_TEST.md`에 있고 알려진 제한은 `KNOWN_LIMITATIONS.md`에 기록했다.

## 종료 정리

- `.test_server` 시험 월드: 제거됨
- 25575/25576 리스너: 0개
- Toybox PID/잠금 제어 파일: 0개
- 릴리스 `.tmp-*`/`.bak-*`: 0개
- 원본 v0.1 ZIP: 보존, 최초 SHA-256과 일치
