# First steps · 開始使用 · 시작하기 · はじめに

[English](#english) · [繁體中文](#繁體中文) · [한국어](#한국어) · [日本語](#日本語)

## English

1. Choose the Windows x64, Mac Apple Silicon or Mac Intel package from [Releases](https://github.com/jerry47j-lang/quicksense/releases). These are unsigned/ad-hoc signed developer previews; OS installation protections may block them. Native visual/shortcut acceptance tests remain pending.
2. Open QuickSense. Click the character in the upper-right to enter your name; choose your companion under **我的小書房** (My study). The interface is currently Traditional Chinese.
3. Try **FYI**, **IYKYK** or **お疲れ様です**. The three result tabs explain meaning/register, grammar and a sample reply. For an ordinary English word such as *serendipity*, the packaged dictionary provides English definitions.
4. To look up something from work, copy it and press **Ctrl+Shift+Space** on Windows or **Cmd+Shift+Space** on Mac. This user action reads the clipboard and opens the small lookup window. There is no clipboard monitoring in the background.
5. Click **放進單字庫** to save a word/expression, then review it under **我的單字庫**. **學習小徑** offers eight ordered mini-lessons; correctly completing a lesson unlocks the next. **午休一下** opens the next lesson; **開會快查** hides the study artwork for a quieter lookup view.

Arbitrary sentence translation needs an optional configured online service. **偏好設定** holds its URL/access key and explicit online opt-in; the provider API key stays on the server. Changing the target dropdown alone does not translate the offline notes. See [deployment](TRANSLATION_SERVICE.md).

The 32.9 MiB figure refers to the uncompressed dictionary JSON. Installer sizes exclude shared system WebViews and separately installed speech voices. Offline data does not contain a multilingual translation model or a complete/current global slang archive. Back up your study data in **偏好設定** before moving devices; this preview has no account sync.

## 繁體中文

1. 從 [下載頁](https://github.com/jerry47j-lang/quicksense/releases) 選 Windows x64、Mac Apple Silicon 或 Mac Intel。這是開發預覽版，尚未完成正式簽章／Apple 公證，系統可能阻擋安裝；雙系統實機畫面與快捷鍵驗收仍待完成。
2. 開啟後，按右上角色輸入名字，再到「我的小書房」挑選夥伴。
3. 先試試 **FYI、IYKYK、お疲れ様です**。結果分為意思與語氣、文法拆解、參考回覆。一般英文單字如 *serendipity* 會查內建英文辭典，顯示英文辭義。
4. 工作時複製看不懂的文字，Windows 按 **Ctrl+Shift+Space**、Mac 按 **Cmd+Shift+Space** 叫出小窗。只有這個操作或貼上按鈕會讀取剪貼簿，程式不在背景監聽。
5. 按「放進單字庫」收藏，再到「我的單字庫」複習。「學習小徑」有八段課程，答對後解鎖下一課；「午休一下」進入下一段課程，「開會快查」隱藏小書房裝飾，讓查詢更集中。

任意整句翻譯需要先設定連線服務。在「偏好設定」填入服務網址與通行碼，閱讀資料傳送說明後啟用。AI 供應商金鑰只留在伺服器。只切換目標語言，不會重寫離線筆記；詳見 [部署說明](TRANSLATION_SERVICE.md)。

32.9 MiB 是未壓縮辭典 JSON 的大小；安裝檔大小不含系統共用 WebView 與另行安裝的語音。內建資料不是多國翻譯模型，也沒有收錄所有最新流行語。換電腦前可在「偏好設定」匯出備份；目前沒有帳號同步。

## 한국어

1. [다운로드](https://github.com/jerry47j-lang/quicksense/releases)에서 Windows x64, Mac Apple Silicon, Mac Intel에 맞는 파일을 고르세요. 정식 서명/Apple 공증이 완료되지 않은 개발 미리 보기이므로 OS가 설치를 차단할 수 있습니다. 실제 기기의 UI와 단축키 검증은 아직 남아 있습니다.
2. 오른쪽 위 캐릭터를 눌러 이름을 입력하고 **我的小書房**에서 동반 캐릭터를 고르세요. 현재 인터페이스는 번체 중국어입니다.
3. **FYI**, **IYKYK**, **お疲れ様です**를 검색해 보세요. 결과 탭은 뜻과 어감, 문법, 답장 예시를 보여 줍니다. *serendipity* 같은 일반 영어 단어는 내장 사전의 영어 뜻풀이를 제공합니다.
4. 업무 중 텍스트를 복사하고 Windows에서는 **Ctrl+Shift+Space**, Mac에서는 **Cmd+Shift+Space**를 누르세요. 이 동작이나 붙여넣기 버튼을 사용할 때만 클립보드를 읽으며, 백그라운드 감시는 하지 않습니다.
5. **放進單字庫**로 저장하고 **我的單字庫**에서 복습하세요. **學習小徑**의 8개 수업은 정답을 모두 맞히면 다음 단계가 열립니다. **午休一下**는 다음 수업으로, **開會快查**는 간결한 검색 화면으로 이동합니다.

임의 문장 번역에는 선택 사항인 온라인 서비스 설정이 필요합니다. **偏好設定**에서 서비스 URL과 접속 키를 설정하고 데이터 전송에 동의한 뒤 켜세요. 공급자 API 키는 서버에만 둡니다. 대상 언어만 바꿔도 오프라인 설명이 번역되지는 않습니다. [배포 안내](TRANSLATION_SERVICE.md)를 참고하세요.

32.9 MiB는 압축하지 않은 사전 JSON 크기이며, 설치 파일에는 공용 시스템 WebView나 별도 음성이 포함되지 않습니다. 모든 최신 지역 유행어나 다국어 번역 모델을 내장한 것은 아닙니다. 기기를 옮기기 전 **偏好設定**에서 백업을 내보내세요. 계정 동기화는 아직 없습니다.

## 日本語

1. [ダウンロード](https://github.com/jerry47j-lang/quicksense/releases)からWindows x64、Mac Apple Silicon、Mac Intelに合うファイルを選びます。正式な署名・Apple公証が未完了の開発プレビューのため、OSがインストールを拒否する場合があります。実機での画面とショートカットの検証も未完了です。
2. 右上のキャラクターを押して名前を入力し、**我的小書房**でパートナーを選びます。現在のインターフェースは繁体字中国語です。
3. **FYI、IYKYK、お疲れ様です**を試してみてください。結果タブには意味と語調、文法、返信例があります。*serendipity*のような一般英単語では、内蔵辞典の英語による語義説明が表示されます。
4. 仕事中に文字をコピーし、Windowsは**Ctrl+Shift+Space**、Macは**Cmd+Shift+Space**を押すと小窓が開きます。この操作や貼り付けボタンを使ったときだけクリップボードを読み、バックグラウンドで監視しません。
5. **放進單字庫**で保存し、**我的單字庫**で復習できます。**學習小徑**の8レッスンは全問正解すると次が開きます。**午休一下**は次のレッスンへ、**開會快查**は装飾を減らした検索画面へ進みます。

任意の文章の翻訳には、任意のオンラインサービス設定が必要です。**偏好設定**でサービスURLとアクセスキーを設定し、データ送信の説明を読んで有効にします。プロバイダーのAPIキーはサーバーにのみ保存します。翻訳先を切り替えるだけでは、オフライン解説は翻訳されません。[デプロイ案内](TRANSLATION_SERVICE.md)をご覧ください。

32.9 MiBは圧縮前の辞典JSONの大きさです。インストーラーには共有システムWebViewや追加の音声データは含まれません。最新の世界中の流行語や多言語翻訳モデルを網羅していません。端末を移す前に**偏好設定**でバックアップを保存してください。アカウント同期は未対応です。
