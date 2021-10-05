# ふたば ☆ ちゃんねるからコメントを取得

生まれたばかりの掲示板から投稿を取得してくるコメントプロバイダーです。
コメント表示には miraktest-dplayer か miraktest-zenza が必要です。

## How to use

1. `miraktest-futaba.plugin.js` を MirakTest のプラグインフォルダに入れてください。
   既に MirakTest を起動している場合はインストール後に再起動が必要です。
2. MirakTest の設定で「ふたば ☆ ちゃんねるからコメントを取得」を開き、板のアドレスを入れてください。(`~.htm` の形式です)
3. スレの検索条件を正規表現で指定してください。
4. 設定を保存すると、自動でスレ検索して取得し始めます

## How to build

1. `git clone https://github.com/rokoucha/miraktest-futaba.git`
2. `yarn install`
3. `yarn run build`

## License

See `LICENSE`
