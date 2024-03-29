# よく使うコマンドリスト
* electron
  - npm start
* flutter
  - flutter run -d chrome

# システム設計情報
## 開発方針
FlutterでUIを作成:

まず、Flutterを使用してUI部分を開発します。Flutterでデスクトップ向けのアプリケーションを作成する際には、flutter createコマンドに--platformsオプションを使用して、デスクトップアプリケーション用のプロジェクトを作成します。
Flutter Webとしてビルド:

FlutterプロジェクトをWebアプリケーションとしてビルドします。これにより、Flutterで作成したUIをWeb技術として出力することができます。flutter build webコマンドを使用してビルドを行います。
Electronアプリケーションの作成:

Electronを使用して、基本的なアプリケーション構造を作成します。このステップでは、Electronのmain.js（またはindex.js）で、Electronアプリケーションのメインウィンドウを作成し、そのウィンドウで表示するWebページとしてFlutterでビルドしたWebアプリケーションのindex.htmlを指定します。
ElectronとFlutter Webの統合:

Electronアプリケーションのルートディレクトリに、FlutterでビルドしたWebアプリケーションのファイル群を配置します。そして、Electronのメインプロセスで、このWebアプリケーションをロードするように設定します。
アプリケーションのテストとビルド:

Electronアプリケーションを起動し、Flutterで作成したUIが期待通りに動作するかをテストします。問題がなければ、Electronのパッケージングツールを使用して、最終的なデスクトップアプリケーションをビルドします。

## MVP要件
mvpを決めましょう。

シリアル通信できる。
　選択できるポートをプルダウンして、選択したポートのデータを監視できる。

監視している温度データを表示できる。
　リアルタイムで表示できる。

ロギングできる。
　リアルタイムでロギングでき、焙煎プロファイルとして保存できる。

グラフ表示できる。
　監視している温度をリアルタイムでグラフに表示する。

グラフ描画の種類
　ローストカーブ
　ror
　保存したプロファイルデータを重ねて描画

操作ボタン
　グラフ作成開始と終了する
　焙煎に必要な工程をマーキングする

## 将来追加要件
アラート機能:

特定の温度閾値に到達した際に通知を行うアラート機能。これにより、焙煎プロセス中の重要なポイントを逃さずに、適切なタイミングで操作を行うことができます。
プロファイルの比較:

保存した焙煎プロファイル間での比較機能。異なる焙煎セッションの結果を視覚的に比較することで、焙煎法の改善点を特定できます。
ユーザー設定の保存と読み込み:

ユーザーがアプリケーション設定（例：アラート設定、表示設定など）を保存し、次回起動時にこれらの設定を自動的に読み込む機能。
複数センサーからのデータ取得:

複数の熱電対センサーからのデータを同時に監視し、表示する機能。これにより、焙煎機の異なる部位の温度変化を同時に追跡できます。
エクスポート/インポート機能:

焙煎プロファイルやログデータをCSVやJSON形式でエクスポートし、他のツールでの分析やバックアップに利用できるようにします。また、既存のデータをインポートしてアプリケーション内で表示・分析できる機能も有用です。
ヘルプとチュートリアル:

アプリケーションの使用方法や焙煎プロセスの基本を説明するヘルプセクションやチュートリアル。ユーザーがアプリケーションをより効果的に使用できるようにします。

## アーキテクチャ
1. クライアント-サーバーモデル
クライアントサイド: Flutterを使用してデスクトップアプリケーションのUIを開発します。Flutterの強力なUI機能を活用し、リアルタイムでの温度データ表示、グラフ描画、ユーザー操作に対応します。
サーバーサイド: シリアル通信とデータ処理のために、Electronを利用したローカルサーバーを設定します。ElectronはNode.jsを基盤としており、シリアルポートとの通信に適したライブラリ（例：node-serialport）を利用できます。
2. データフロー
Electronアプリケーションがシリアルポートから温度データをリアルタイムで受信し、必要に応じてデータの前処理を行います。
処理されたデータはWebSocketを通じてFlutterクライアントに送信され、UIに表示されます。
3. モジュール化
アプリケーションは、以下の主要モジュールで構成されます：
シリアル通信モジュール: Electron側で実装し、シリアルポートの管理、データの読み取りを担当します。
データ処理モジュール: 受信データの解析、加工を行い、表示用に整形します。
UIモジュール: Flutterで実装し、リアルタイムデータ表示、グラフ描画、ユーザー入力を管理します。
データストレージモジュール: ロギングされたデータの保存と焙煎プロファイルの管理を行います。
4. データストレージ
ローカルストレージ（例：IndexedDB、ローカルファイルシステム）を使用して、焙煎データとプロファイルを保存します。
5. 外部依存関係とAPI
node-serialport: Electron側でシリアル通信を扱うために使用します。
WebSocket: ElectronとFlutter間のリアルタイムデータ通信に使用します。
Charts Flutter: リアルタイムグラフ描画に使用するFlutterのライブラリ。
6. セキュリティとエラーハンドリング
エラーハンドリングを徹底し、不正なデータや通信エラーが発生した場合には適切なユーザーフィードバックを提供します。
データの整合性とセキュリティを保つための措置を講じます。
7. テスト戦略
単体テスト、統合テストを実施し、特にシリアル通信とデータ処理の正確性を重点的にテストします。
FlutterでのUIテストとElectronでのエンドツーエンドテストを行います。
このアーキテクチャは、シリアル通信を介したリアルタイムデータの監視と表示、データのロギングとグラフ表示の機能を提供し、ユーザーが直感的に操作できるインターフェースを備えています。開発プロセスでは、モジュールごとに機能を開発し、頻繁にテストを行うことで、問題を早期に発見し、対処することが重要です。

## モジュール構成
エンティティモジュール:

目的: アプリケーションのビジネスルールとエンティティ（例: 温度データモデル）を定義します。
内容: 温度データ、焙煎プロファイルなどのエンティティクラス。
依存関係: このモジュールは他のモジュールに依存しません。
ユースケースモジュール:

目的: アプリケーションの具体的なビジネスロジックを実装します。
内容: シリアルポートからデータを読み取り、データの解析・処理、データの保存と取得などの操作を行うユースケース。
依存関係: エンティティモジュールに依存します。
インターフェイスアダプターモジュール:

目的: 外部システム（例: シリアルポート、データベース、ウェブAPI）とのデータ交換を行うアダプターを提供します。
内容: シリアルポート通信アダプター、データベースアダプター。
依存関係: ユースケースモジュールに依存します。
フレームワーク & ドライバーモジュール:

目的: アプリケーションのインフラストラクチャ関連の実装を提供します。
内容: Flutter UIフレームワーク、Electronアプリケーションフレームワーク、データストレージシステム。
依存関係: インターフェイスアダプターモジュールに依存します。
詳細設計
エンティティモジュール:

TemperatureData: 温度値とタイムスタンプを保持するクラス。
RoastProfile: 焙煎セッションの各ポイントを記録するクラス。
ユースケースモジュール:

ReadSerialData: シリアルポートから温度データをリアルタイムで読み取るユースケース。
AnalyzeTemperatureData: 温度データを解析し、ROR（Rate of Rise）などの指標を計算するユースケース。
SaveRoastProfile: 焙煎プロファイルをデータストレージに保存するユースケース。
RetrieveRoastProfiles: 保存された焙煎プロファイルを取得するユースケース。
インターフェイスアダプターモジュール:

SerialPortAdapter: シリアルポートとの通信を抽象化するアダプター。
DatabaseAdapter: データベースとの通信を抽象化するアダプター。
フレームワーク & ドライバーモジュール:

FlutterとElectronを利用して、UIとアプリケーションのメインロジックを実装します。特に、Flutterでのリアルタイムデータ表示とグラフ描画機能、Electronでのシリアル通信とデータストレージ管理が含まれます。

## コンポーネント図
@startuml

package "エンティティモジュール" {
    [TemperatureData] as TD
    [RoastProfile] as RP
}

package "ユースケースモジュール" {
    [ReadSerialData] as RSD
    [AnalyzeTemperatureData] as ATD
    [SaveRoastProfile] as SRP
    [RetrieveRoastProfiles] as RRP
}

package "インターフェイスアダプターモジュール" {
    [SerialPortAdapter] as SPA
    [DatabaseAdapter] as DBA
}

package "フレームワーク & ドライバーモジュール" {
    [Flutter UI Framework] as FUI
    [Electron Application Framework] as EAF
    [Data Storage System] as DSS
}

TD -[hidden]- RP
RSD -[hidden]- ATD
SPA -[hidden]- DBA
FUI -[hidden]- EAF

' エンティティモジュールとユースケースモジュールの関係
RSD ..> TD : "データ使用"
ATD ..> TD : "データ使用"
SRP ..> RP : "データ使用"
RRP ..> RP : "データ使用"

' ユースケースモジュールとインターフェイスアダプターモジュールの関係
RSD ..> SPA : "<<利用>>"
SRP ..> DBA : "<<利用>>"
RRP ..> DBA : "<<利用>>"

' インターフェイスアダプターモジュールとフレームワーク & ドライバーモジュールの関係
SPA ..> EAF : "<<利用>>"
DBA ..> DSS : "<<利用>>"

' フレームワーク & ドライバーモジュールとUIの関係
FUI ..> EAF : "<<利用>>"
EAF ..> FUI : "<<データ表示>>"

@enduml

## UIデザイン指針
UIコンポーネントのサイズとフォント:

頻繁に使用されるUIパーツ（例: 開始・停止ボタン、重要なステータス表示）は大きめに設計し、ユーザーが容易に認識・操作できるようにします。
テキストは読みやすい太字の大きめフォントを使用し、情報の視認性を高めます。
カラースキーム:

コーヒーに合う色合いを基調とした温かみのあるカラーパレットを選定します。例えば、深みのある茶色、クリーム色、暖色系のアクセントカラーを使用します。
UIの背景やコンポーネントは、ミニマリズムを意識した無地の同系色で統一します。
背景画像のカスタマイズ:

ユーザーがアプリケーションの背景画像をカスタマイズできる機能を提供します。これにより、個々のユーザーの好みに合わせた視覚的な体験を実現します。
インタラクションとアニメーション:

ボタンクリックや遷移などのインタラクションには、目に見えるゆっくりとしたアニメーションを適用します。これにより、ユーザーアクションへのフィードバックを直感的に伝えます。
フィードバックと通知:

操作結果やエラーメッセージは、チャット風のインターフェイスを通じて時系列で表示します。これにより、ユーザーは過去のアクションとシステムのフィードバックを容易に追跡できます。
全体的なデザインフィロソフィー:

ユーザーフレンドリーで直感的な操作を実現するため、UIデザイン全体にミニマリズムの原則を適用します。情報のオーバーロードを避け、ユーザーが必要な情報に素早くアクセスできるようにします。

## メイン画面デザイン
ヘッダー部分:

アプリケーションの名前と、現在の焙煎セッションのステータス（例:「待機中」「焙煎中」）を表示します。
操作系ボタン群:

「開始」「停止」「マーキング」など、焙煎に関連する主要な操作を行うボタンを配置します。これらのボタンは大きめにデザインし、明確なアイコンとラベルを使用して直感的に理解できるようにします。
時間と温度表示部分:

現在の焙煎時間と最新の温度データを大きなフォントで表示します。焙煎進行の重要な指標であるため、このセクションは目立つ位置に配置します。
グラフ表示部分:

焙煎中の温度変化をリアルタイムに表示するグラフ。ローストカーブとROR（Rate of Rise）を同時に表示し、焙煎の進行を視覚的に把握できるようにします。グラフはインタラクティブにし、過去の焙煎プロファイルとの比較が可能です。
エラー等を表示するリスト部分:

操作のフィードバックやエラーメッセージを時系列でリストアップします。このリストはチャット風のインターフェイスで、ユーザーが過去のアクションを追跡しやすいようにします。
背景とカラースキーム:

ユーザーがカスタマイズ可能な背景画像機能を提供し、デフォルトではコーヒー豆や焙煎機の落ち着いた画像を背景に設定します。カラースキームは温かみのある茶色系統で統一し、コーヒーに関連する色合いを基調とします。
アニメーションとインタラクション:

ボタンクリックや状態変化には、ユーザーが直感的に理解できるゆっくりとしたアニメーションを適用します。

1. ヘッダーモジュール:
機能: アプリ名と焙煎ステータス表示。
コンポーネント:
AppName: アプリケーション名を表示。
RoastStatus: 現在の焙煎ステータスを表示。
2. 操作系UIモジュール:
機能: 焙煎の開始、停止、マーキングなどの操作。
コンポーネント:
StartButton: 焙煎を開始するボタン。
StopButton: 焙煎を停止するボタン。
MarkButton: 焙煎プロセスの特定のポイントをマークするボタン。
3. データ表示モジュール:
機能: 時間と温度データの表示。
コンポーネント:
TimeDisplay: 現在の焙煎時間を表示。
TemperatureDisplay: 最新の温度データを表示。
4. グラフ表示モジュール:
機能: 焙煎中の温度変化をグラフで表示。
コンポーネント:
RoastCurveGraph: ローストカーブを表示するグラフ。
RateOfRiseGraph: 温度上昇率(ROR)を表示するグラフ。
ProfileComparison: 過去の焙煎プロファイルと比較する機能。
5. エラー・メッセージ表示モジュール:
機能: 操作フィードバックとエラーメッセージのリスト表示。
コンポーネント:
MessageList: 操作の結果やエラーメッセージを時系列で表示するリスト。
6. 背景・テーマ設定モジュール:
機能: ユーザーがアプリの背景とテーマをカスタマイズ。
コンポーネント:
BackgroundSettings: 背景画像を変更する設定。
ThemeSettings: アプリのカラーテーマをカスタマイズする設定。
7. アニメーション・インタラクションモジュール:
機能: ユーザーインタラクション時のアニメーション。
コンポーネント:
ButtonAnimation: ボタンクリック時のアニメーション。
TransitionAnimation: 画面遷移時のアニメーション。