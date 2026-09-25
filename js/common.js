/* =========================================================
   common.js ： すべてのページで使う「動き」をまとめたファイル
   1. スマホ用メニューの開け閉め
   2. 画面上部のスクロール進み具合バー
   3. スクロールに合わせてふわっと表示
   4. マウスに付いてくる光（スポットライト）
   5. フッターの年を今年に自動更新
   ========================================================= */

// 「視差効果を減らす」設定の人かどうか（true なら動きを控えめにする）
// ※ ほかの JavaScript ファイル（main.js・shop.js）からも使う
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------------------------------------------------------
   1. スマホ用メニューの開け閉め
   --------------------------------------------------------- */

// HTML から、メニューボタンとメニュー本体を探して変数に入れる
const toggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// メニューを開く／閉じる処理をまとめた関数
function setMenuOpen(isOpen) {
  // is-open クラスを付けたり外したりする（CSS 側で表示が切り替わる）
  navMenu.classList.toggle('is-open', isOpen);
  // 読み上げソフト向けに「今開いているか」を伝える（CSS の×アイコンにも使用）
  toggleButton.setAttribute('aria-expanded', String(isOpen));
  toggleButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
}

// メニューボタンがあるページだけで動かす（無いページではエラーにならないよう何もしない）
if (toggleButton && navMenu) {
  // ボタンがクリックされたら、今の状態の反対にする
  toggleButton.addEventListener('click', function () {
    const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  // メニュー内のリンクを押したら、移動と同時にメニューを閉じる
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });
}


/* ---------------------------------------------------------
   2. 画面上部のスクロール進み具合バー
   --------------------------------------------------------- */
const progressBar = document.querySelector('.scroll-progress');

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;  // スクロールできる最大量
  // 0（一番上）〜 1（一番下）の値を CSS に渡す
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.setProperty('--progress', progress);
}

if (progressBar) {
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}


/* ---------------------------------------------------------
   3. スクロールに合わせてふわっと表示
   IntersectionObserver ＝「要素が画面に入ったか」を見張ってくれる仕組み
   --------------------------------------------------------- */
const fadeItems = document.querySelectorAll('.fade-in');

// 古いブラウザで IntersectionObserver が使えない場合は、最初から全部表示する
if (!('IntersectionObserver' in window)) {
  fadeItems.forEach(function (item) {
    item.classList.add('is-visible');
  });
} else {
  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // 要素が画面に入ったら
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); // CSS のアニメーションが始まる
        fadeObserver.unobserve(entry.target);     // 一度表示したら見張りをやめる
      }
    });
  }, {
    rootMargin: '0px 0px -10% 0px', // 画面の下から 10% 入ったところで反応させる
    threshold: 0.1                  // 要素が 10% 見えたら反応
  });

  fadeItems.forEach(function (item) {
    // 同じ場所に並んだ要素（カードや写真）は少しずつ遅らせて表示すると、流れるように見える
    const siblings = item.parentElement.querySelectorAll(':scope > .fade-in');
    if (siblings.length > 1) {
      const order = Array.prototype.indexOf.call(siblings, item);
      item.style.transitionDelay = (order % 4) * 0.12 + 's';
    }
    fadeObserver.observe(item);
  });
}


/* ---------------------------------------------------------
   4. マウスに付いてくる光（スポットライト）
   カードの中でのマウスの位置を、CSS の --mx / --my に渡す
   --------------------------------------------------------- */
document.querySelectorAll('.spotlight').forEach(function (card) {
  card.addEventListener('pointermove', function (event) {
    const rect = card.getBoundingClientRect();          // カードの位置と大きさ
    card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
  });
});


/* ---------------------------------------------------------
   5. フッターの年を今年に自動更新
   --------------------------------------------------------- */
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
