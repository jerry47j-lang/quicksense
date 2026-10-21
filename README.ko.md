# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**빠르게 이해하고, 매일 조금씩 배우세요. Windows와 macOS용 작은 언어 공부방입니다.**

텍스트를 복사한 뒤 Windows에서는 **Ctrl+Shift+Space**, Mac에서는 **Cmd+Shift+Space**를 누르면 작은 검색 창이 열립니다. 이름과 픽셀 캐릭터를 고르고 실제로 만난 표현을 모아 학습할 수 있습니다.

## 기능

- Open English WordNet 2025 기반 오프라인 영어 사전: 127,311개 표제어, 182,055개 보존 의미, 약 32.9 MiB. 영어 뜻풀이이며 오프라인 다국어 번역 모델은 아닙니다.
- 여러 지역의 직장 표현, 약어, 일상어, 인터넷 표현을 담은 시작용 자료. 번체 중국어 설명, 어감, 지역, 독자적으로 작성한 예문과 참고 링크를 제공합니다.
- 뜻·어감, 문법 메모, 답장 예시. 부분 표현 검색과 전체 문장 번역을 명확히 구분합니다.
- 이름과 세 가지 픽셀 캐릭터, 단어 저장, 간격 복습, JSON 백업·병합 가져오기, A1–B1 직장 영어 수업 8개.
- 트레이/메뉴 막대와 빠른 검색 창. 사용자가 단축키나 붙여넣기 버튼을 사용할 때만 클립보드를 읽습니다.
- 선택 사항인 자체 호스팅 AI 서비스: 전체 문장 번역, 문법, 답장 제안, 인증 및 월간 예산 예약 제한.

## 현재 제한

주요 UI와 오프라인 학습 자료는 현재 번체 중국어입니다. 온라인 서비스는 12가지 원문/번역 언어 선택을 지원합니다. 표현 자료는 전 세계 최신 유행어 전체 목록이 아니며 사전은 2025 버전으로 고정되어 있습니다.

온라인 분석은 별도 서비스 설정이 필요합니다. 공급업체 API 키는 앱에 포함하지 않습니다. Windows와 Mac 빌드는 GitHub Actions에서 각각 수행하며 빌드 통과는 실제 기기 UI 검증을 뜻하지 않습니다. Mac 앱은 임시 서명만 적용하며 Apple 공증은 받지 않았습니다. OS 보안 경고를 우회하지 마세요.

## 개발 및 배포

Node.js 22.12+가 필요합니다. 네이티브 빌드에는 Rust 1.90+와 [Tauri 사전 준비](https://v2.tauri.app/start/prerequisites/)가 추가로 필요합니다.

```sh
npm ci
npm run check
npm run dev
npm run desktop
npm run desktop:build
```

`dev`는 브라우저 미리보기이며 `desktop`은 실제 데스크톱 셸을 실행합니다. 사전은 포함되어 있습니다. `npm run dictionary:build`로 공식 데이터를 다시 받아 변환할 수 있으며 원본 SHA-256은 manifest에 기록됩니다.

[서비스 설정 안내](docs/TRANSLATION_SERVICE.md)에 따라 D1 예산 DB와 서버 비밀 값 `OPENAI_API_KEY`, `SERVICE_ACCESS_KEY`를 설정하세요. 앱 환경설정에서 서비스 주소와 접근 키를 입력하고 전송 설명을 확인한 뒤 켭니다. 데스크톱 접근 키는 OS 자격 증명 저장소에, 브라우저 미리보기에서는 현재 세션에만 보관합니다.

## Codex 제작 과정과 기여

Jerry가 방향을 정하고 결과를 검토하며, 조사·디자인·구현·테스트·문서 전 과정에 Codex를 활용합니다. [개발 기록](docs/BUILD_LOG.md)과 [검증 상태](docs/VALIDATION.md)를 확인하세요.

표현을 추가할 때 언어/지역, 격식, 참고 출처, 독자적인 예문과 작성 날짜를 포함하세요. [문제 보고](https://github.com/jerry47j-lang/quicksense/issues/new/choose). 코드는 MIT, 사전은 CC BY 4.0과 원 Princeton WordNet 약관을 따릅니다. [출처 및 라이선스](THIRD_PARTY_NOTICES.md). 개인 학습 자료는 저장소에 커밋하지 않습니다.
