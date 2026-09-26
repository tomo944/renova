/* =========================================================
   main.js ： トップページ（index.html）だけで使う「動き」
   ※ 全ページ共通の動きは common.js にあります（先に読み込む）
   1. スクロールに合わせた演出（光る文章・3つのシーン）
   2. 数字のカウントアップ
   3. 公式LINEの URL がまだ仮のときの案内
   ※ 画面下の「公式LINEで予約」ボタンは常に表示なので、JavaScript は使っていない
   ========================================================= */


/* ---------------------------------------------------------
   1. スクロールに合わせた演出
   --------------------------------------------------------- */
const revealSpans = document.querySelectorAll('.reveal-text span');

// メインビジュアルの3つのシーン
const scenesBox = document.querySelector('.scenes');
const scenes = document.querySelectorAll('.scene');
const sceneCounter = document.querySelector('.scene-counter');
const sceneCurrent = document.getElementById('scene-current');

function updateScenes() {
  const screenHeight = window.innerHeight;
  let activeIndex = 0;   // 今見ているシーンの番号（0 から数える）

  scenes.forEach(function (scene, index) {
    // ① 今見ているシーン：上端が画面の半分より上に来た、いちばん後ろのシーン
    if (scene.getBoundingClientRect().top <= screenHeight * 0.5) {
      activeIndex = index;
    }

    // ② 次のシーンに、どれだけかぶされているか（0 = まったく / 1 = 完全に）
    const nextScene = scenes[index + 1];
    let cover = 0;
    if (nextScene) {
      const nextTop = nextScene.getBoundingClientRect().top;   // 次のシーンの上端の位置
      cover = 1 - nextTop / screenHeight;
      cover = Math.min(Math.max(cover, 0), 1);                 // 0〜1 の範囲におさめる
    }
    scene.style.setProperty('--cover', cover.toFixed(3));      // CSS に渡す
  });

  // ③ 今見ているシーンにだけ is-active を付ける（CSS で文字がせり上がる）
  scenes.forEach(function (scene, index) {
    scene.classList.toggle('is-active', index === activeIndex);
  });

  // ④ 右下の「01 / 03」と進み具合の線
  sceneCurrent.textContent = String(activeIndex + 1).padStart(2, '0');   // 1 → "01"
  const rect = scenesBox.getBoundingClientRect();
  const scrollable = rect.height - screenHeight;                          // シーンの中でスクロールできる量
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  sceneCounter.style.setProperty('--p', progress);
  // シーンを見ている間だけ表示する
  sceneCounter.classList.toggle('is-shown', rect.bottom > screenHeight * 0.6);
}

function onScroll() {
  // ① 光る文章：文が画面の上から 65% の位置より上に来たら光らせる（戻ると暗くなる）
  revealSpans.forEach(function (span) {
    const top = span.getBoundingClientRect().top;   // 画面の上端から、その文までの距離
    span.classList.toggle('is-lit', top < window.innerHeight * 0.65);
  });

  // ② 3つのシーンの演出
  updateScenes();
}

// スクロールのたびに処理すると重くなるので、画面の書き換えのタイミング（requestAnimationFrame）に合わせる
let ticking = false;
window.addEventListener('scroll', function () {
  if (!ticking) {
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
onScroll(); // ページを開いた直後にも一度実行
window.addEventListener('resize', onScroll);   // 画面の大きさが変わったときも計算し直す


/* ---------------------------------------------------------
   2. 数字のカウントアップ
   data-count="6" のような要素が見えたら、0 から 6 まで数え上げる
   --------------------------------------------------------- */
const countItems = document.querySelectorAll('[data-count]');

function countUp(element) {
  const target = Number(element.dataset.count);   // 最終的な数字
  const duration = 1400;                          // かける時間（ミリ秒。1400 = 1.4秒）
  const startTime = performance.now();            // 始めた時刻

  function update(now) {
    // 0〜1 で「どこまで進んだか」を計算
    const t = Math.min((now - startTime) / duration, 1);
    // 最初は速く、最後はゆっくり止まるように変形する（イージング）
    const eased = 1 - Math.pow(1 - t, 3);
    // toLocaleString で「2000 → 2,000」のように3けたごとにカンマを付ける
    element.textContent = Math.round(target * eased).toLocaleString('ja-JP');
    if (t < 1) {
      requestAnimationFrame(update);   // まだ途中なら、次の画面更新でもう一度
    }
  }
  requestAnimationFrame(update);
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  countItems.forEach(function (item) {
    item.textContent = '0';         // 最初は 0 にしておく
    countObserver.observe(item);
  });
}


/* ---------------------------------------------------------
   3. 公式LINEの URL がまだ仮のときの案内
   href に「XXXXXXX」が残っている LINE ボタンは、押しても移動せず、
   画面下にお知らせを出す（本物の URL に差し替えると、この処理は自動的に効かなくなる）
   --------------------------------------------------------- */
const toast = document.getElementById('toast');
let toastTimer = null;

// 画面下に数秒だけメッセージを出す関数
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-shown');
  clearTimeout(toastTimer);                   // 前のタイマーが残っていたら止める
  toastTimer = setTimeout(function () {
    toast.classList.remove('is-shown');
  }, 3500);                                   // 3.5秒後に消す
}

document.querySelectorAll('.line-button').forEach(function (button) {
  button.addEventListener('click', function (event) {
    if (button.href.includes('XXXXXXX')) {
      event.preventDefault();                 // リンク先への移動を取りやめる
      showToast('公式LINEは準備中です。もうしばらくお待ちください。');
    }
  });
});
