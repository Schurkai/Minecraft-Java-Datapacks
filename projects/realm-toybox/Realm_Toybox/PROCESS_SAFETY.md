# 작업 프로세스 안전 규칙

## 식별

- 공식 서버 JVM 명령줄에는 `-Dtoybox.job=Realm_Toybox.server_test`, `-Dtoybox.run=<고유 ID>`, `-Dtoybox.project=Realm_Toybox`가 들어간다.
- Node 검증기와 생성기는 각각 `process.title`을 `Realm_Toybox.validate`, `Realm_Toybox.generate_v040`, `Realm_Toybox.generate_v050`, `Realm_Toybox.generate_v060`, `Realm_Toybox.generate_v070`, `Realm_Toybox.generate_v080`으로 설정한다. 작업 관리자 세부 정보의 명령줄 또는 프로세스 제목으로 프로젝트와 목적을 식별한다.
- 짧은 패키징 PowerShell은 스크립트 경로 `Realm_Toybox\tools\package.ps1` 또는 `Realm_Toybox_Resources\package.ps1`가 명령줄에 남는다. 이름만 보고 다른 `powershell`, `node`, `java` 프로세스를 종료하지 않는다.
- Oracle `javapath` 같은 런처가 다른 JVM을 만들 수 있으므로 `java.home`을 먼저 조회해 실제 `bin\java.exe`를 실행하고 그 PID를 기록한다.
- `.realm-toybox-server-test.pid.json`에 실제 PID, run ID, 시작 시각, 목적, 전체 명령, 팩 경로, 로그 경로를 기록한다.
- `.realm-toybox-server-test.lock`을 배타적으로 열어 동시 실행이 서로를 stale 작업으로 오인하지 않게 한다.

## 수명과 로그

- 기본은 포그라운드 실행이며 부팅마다 `MaxBootSeconds` watchdog을 둔다.
- stdout은 줄 단위 비동기, stderr는 별도 비동기 task로 동시에 비워 파이프 교착을 막는다.
- 테스트 로그는 성공 뒤 한 번에 쓰지 않고 `.test_server/toybox-test.log`에 즉시 flush한다.
- 명령은 stdin이 아니라 테스트 월드의 로컬 RCON(25576)으로 보내 PowerShell 5.1 BOM 문제를 피한다. 비밀번호는 임시 테스트 월드에만 존재한다.
- 정상 `stop`을 먼저 요청하고 제한시간 뒤에도 남은 경우 **기록한 PID 하나만** 강제 종료한다. 이름이 `java`, `python`, `node`라는 이유로 일괄 종료하지 않는다.

## stale 작업과 종료 확인

- 독점 잠금을 얻은 경우에만 이전 PID JSON을 stale 후보로 본다.
- CIM 명령줄 또는 `jcmd VM.system_properties`에서 같은 job/run ID를 확인한 JVM만 정리한다.
- JVM 종료가 확인된 뒤에만 PID JSON을 삭제한다. 정리 실패 시 PID JSON과 로그를 남긴다.
- 성공·실패 모두 잠금을 해제하고 25575/25576 리스너와 기록 PID를 확인한다.
