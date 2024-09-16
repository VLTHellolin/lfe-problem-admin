import {
  type Review,
  type ModuleExports,
  type ReviewHistory,
  db,
} from '../lib';

// Since 1.3.0, localForage is used instead of localStorage.
// This is a function that transfers data.
const transferData = async function () {
  const oldDataStr = localStorage.getItem('problem-admin-history');
  if (oldDataStr === null) return;
  const oldData = JSON.parse(oldDataStr) as ReviewHistory;
  if (oldData.transferred) return;

  oldData.transferred = true;
  localStorage.setItem('problem-admin-history', JSON.stringify(oldData));

  db.storage.setItem('history', oldData.data);
  db.reconstruct();
  await db.ready;
};

let historyShowState = false;
let historyChangedState = false;

const updateViewHandler = function () {
  // Render total review count and this week review count.
  $('#problem-admin-history-total').text(
    `${db.history.length} / ${db.acceptedCount} / ${db.refusedCount}`
  );
  $('#problem-admin-history-week').text(
    `${db.weekAcceptedCount + db.weekRefusedCount} / ${db.weekAcceptedCount} / ${db.weekRefusedCount}`
  );

  // Render each review detail, up to 50.
  let listHTML = '<ul>';
  let counter = 0;
  for (let i = db.history.length - 1; i >= 0; --i) {
    const current = db.history[i];
    listHTML += `<li>
    <a href="https://www.luogu.com.cn/article/${current.id}/edit">U${current.author} 作为 ${current.pid} 的题解</a>，${current.accepted ? '通过' : '打回'}，${current.time}
    </li>`;
    ++counter;
    if (counter === 50) break;
  }
  listHTML += '</ul>';
  $('#problem-admin-list').html(listHTML);
};

const updateHandler = function (e: Event) {
  const detail = (e as CustomEvent).detail;
  const article = detail.getArticle();

  $(
    '#app .main-container .main .l-card:last-child .review-header:last-child button'
  ).one('click', () => {
    const accepted = detail.getReviewResult().accept;
    const newItem: Review = {
      id: article.lid,
      author: article.author.uid,
      pid: article.solutionFor.pid,
      accepted,
      time: new Date().toLocaleString('zh-CN'),
    };
    db.put(newItem);

    // If the history view is not opened, it's not necessary to update the list.
    if (historyShowState) {
      updateViewHandler();
      historyChangedState = false;
    } else {
      historyChangedState = true;
    }
  });
};

const historyHandler = function () {
  historyShowState = !historyShowState;
  if (historyChangedState) updateViewHandler();
  historyChangedState = false;
  $('#problem-admin-history').toggle();
};

const clearHandler = function () {
  if (
    window.confirm('确实要清除历史记录吗？\n所有数据将无法恢复！') &&
    window.confirm('第二次确认，确实要清除历史记录吗？')
  ) {
    db.storage.dropInstance();
    window.alert('操作完成。');
    window.location.reload();
  }
};

// Load function.
const load = async function () {
  await db.ready;
  await transferData();

  const btnHTML = `<div data-v-2360723b>
<button data-v-f21de448 data-v-7b38dc8c type="button"
  id="problem-admin-history-btn" class="solid lform-size-middle">历史记录</button>\
<button data-v-f21de448 data-v-7b38dc8c type="button" style="--lcolor-rgb: var(--lcolor--error);"
  id="problem-admin-clear-btn" class="solid lform-size-middle">清除记录</button>
</div>
<style>
body {
  overflow-y: hidden;
}
.top-bar > .left button {
  padding: .3125em 1em !important;
  margin-right: 1em !important;
}
</style>`;
  $('#app > .top-bar > .left').append(btnHTML);
  const infoHTML = `
<div data-v-e01570a1 data-v-7b38dc8c id="problem-admin-history" class="l-card" style="display: none;">
  <h3 data-v-7b38dc8c class="lfe-h3">历史记录</h3>
  <div data-v-7b38dc8c>
    总审核数量 / 通过 / 拒绝：<span id="problem-admin-history-total">null</span>
    <br/>
    本周审核数量 / 通过 / 拒绝：<span id="problem-admin-history-week">null</spaan>
  </div>
  <div data-v-7b38dc8c>
    只显示最近五十条记录，其他的可以通过 IndexedDB 查看。越新审核的越靠前。
    <br/>
    <div data-v-7b38dc8c id="problem-admin-list">
      null
    </div>
  </div>
</div>`;
  $('#app .main-container .container .article-review').prepend(infoHTML);
  // Add event listeners.
  $('#problem-admin-history-btn').on('click', historyHandler);
  $('#problem-admin-clear-btn').on('click', clearHandler);
  updateViewHandler();
  window.addEventListener('luogu:admin:article-review', updateHandler);
};

export default {
  name: 'Article Review Panel',
  load,
  condition: () =>
    window.location.href.includes('www.luogu.com.cn/sadmin/article/review'),
} as ModuleExports;
