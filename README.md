# Minecraft Java Datapacks

Minecraft Java Edition 26.2 정식판을 대상으로 만든 순수 데이터팩 모음입니다. Fabric, Forge, Paper, Spigot, Bukkit 플러그인을 요구하지 않습니다.

- 데이터팩 형식: 107.1
- 선택 리소스팩 형식: 88.0
- 기준 서버: Mojang 공식 Java 26.2 서버
- 언어: 기본 한국어 또는 영어 fallback, 제품에 따라 선택형 한국어/영어 리소스팩 제공

## 프로젝트

| 프로젝트 | 최신판 | 용도 | 경로 |
|---|---|---|---|
| Realm Toybox | v0.9.0-rc1 | 추가 인챈트, 고등 마법부여, 포션 합성, 이동·건축·농사 도구를 포함한 통합 장난감 상자 | [`projects/realm-toybox`](projects/realm-toybox) |
| Realm Toybox Vanilla Compat | v0.9.0-compat4 | Toybox 기능을 유지하면서 바닐라 인챈트 상한과 요청한 중복 조합을 적용한 변형판 | [`projects/realm-toybox-vanilla-compat`](projects/realm-toybox-vanilla-compat) |
| Enchant Plus | v1.1.4 | 인챈트 중복, 날개 결속 흉갑, 네더의 별 모루 재련만 남긴 최소 구성 | [`projects/enchant-plus`](projects/enchant-plus) |
| Grappling Hook | v0.1.0-rc1 | 블록 고정점으로 자동 견인하는 독립 낚싯대형 갈고리 | [`projects/grappling-hook`](projects/grappling-hook) |

각 제품의 원래 데이터팩 폴더에 있는 `README_KO.md`, `TEST_REPORT.md`, `KNOWN_LIMITATIONS.md`가 실제 기능과 시험 범위의 기준입니다.

## 권장 조합

- 가장 작은 구성: **Enchant Plus + Grappling Hook**
- 통합 기능이 필요하면 **Realm Toybox** 또는 **Realm Toybox Vanilla Compat** 중 하나만 선택
- 기본 Toybox, Vanilla Compat, Enchant Plus는 내부 `toybox` 네임스페이스가 겹치므로 서로 동시에 설치하지 않습니다.
- Grappling Hook은 별도 `grapple` 네임스페이스라 Enchant Plus와 함께 사용할 수 있습니다.

## 폴더 구조

```text
projects/
  enchant-plus/
    Enchant_Plus/
    Enchant_Plus_Resources/
  grappling-hook/
    Grappling_Hook/
  realm-toybox/
    Realm_Toybox/
    Realm_Toybox_Resources/
  realm-toybox-vanilla-compat/
    Realm_Toybox_Vanilla_Compat/
    Realm_Toybox_Vanilla_Compat_Resources/
artifacts/
  latest/
    <project>/
      *.zip
      *.zip.sha256
```

`projects/`는 개발 소스와 검증·패키징 도구입니다. 각 제품 안에서는 기존 스크립트의 상대 경로가 유지되도록 원래 폴더명을 보존했습니다. `artifacts/latest/`는 바로 설치할 수 있는 최신 ZIP과 SHA-256입니다. 서버 JAR, 시험 월드, 로그와 중간 빌드는 저장소에 포함하지 않습니다.

## 설치

1. 월드를 백업합니다.
2. [`artifacts/latest`](artifacts/latest)에서 원하는 데이터팩 ZIP을 골라 압축 해제하지 않고 월드의 `datapacks` 폴더에 넣습니다.
3. 선택형 리소스팩은 클라이언트의 `resourcepacks` 폴더에 넣습니다.
4. `/reload` 후 `/datapack list enabled`로 확인합니다.
5. Realm에서는 데이터팩을 넣은 로컬 월드를 다시 업로드합니다.

## 검증 상태

최신 소스와 배포 ZIP은 정적 검증 및 Mojang 공식 26.2 서버의 로드, `/reload`, 저장, 종료, 재시작 시험을 거쳤습니다. 다만 실제 클라이언트 UI, 2인 동시 조작, 장시간 성능과 Realm 업로드는 제품별로 미실행 항목이 남아 있습니다. 실행하지 않은 시험은 통과로 기록하지 않았습니다.

Enchant Plus와 Vanilla Compat 검증기는 Mojang 26.2 서버에서 생성한 바닐라 데이터 리포트와 정의를 비교합니다. 해당 리포트는 저장소에 재배포하지 않으므로, 검증할 때 리포트의 상위 폴더를 `MINECRAFT_26_2_REPORTS` 환경변수로 지정합니다. 폴더 안에는 `generated/data/minecraft/enchantment`가 있어야 합니다.

## 라이선스

별도 오픈소스 라이선스는 아직 지정하지 않았습니다. 저장소 공개는 소스 열람을 위한 것이며, 재사용·재배포 조건은 추후 정리합니다.
