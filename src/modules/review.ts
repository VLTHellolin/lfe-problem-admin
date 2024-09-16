import {
  type Review,
  type ModuleExports,
  getHistory,
  removeHistory,
  setHistory,
} from '../lib';

const storage = getHistory();
let historyShowState = false;
let historyChangedState = false;

// Render the total and weekly count in the history view.
const renderHistoryCount = function () {
  let weekAccept = 0,
    weekDecline = 0;
  const weekStart = new Date();
  const weekDay = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
  weekStart.setHours(0, 0, 0, 0);
  for (let i = storage.data.length - 1; i >= 0; i -= 1) {
    const current = storage.data[i];
    if (new Date(current.time) < weekStart) {
      break;
    }
    if (current.accepted) {
      weekAccept += 1;
    } else {
      weekDecline += 1;
    }
  }

  $('#problem-admin-history-total').text(
    `${storage.accept + storage.decline} / ${storage.accept} / ${storage.decline}`
  );
  $('#problem-admin-history-week').text(
    `${weekAccept + weekDecline} / ${weekAccept} / ${weekDecline}`
  );
};

// Render a list of articles in the history view.
// Will show up to 50 recent articles.
const renderHistoryList = function () {
  let listHTML = '<ul>';
  let counter = 0;
  for (let i = storage.data.length - 1; i >= 0; i -= 1) {
    const current = storage.data[i];
    listHTML += `<li>
    <a href="https://www.luogu.com.cn/article/${current.id}/edit">U${current.author} 作为 ${current.pid} 的题解</a>，${current.accepted ? '通过' : '打回'}，${current.time}
    </li>`;
    counter += 1;
    if (counter === 50) {
      break;
    }
  }
  listHTML += '</ul>';
  $('#problem-admin-list').html(listHTML);
};

const updateViewHandler = function () {
  renderHistoryCount();
  renderHistoryList();
};

// Update info of a current viewing article.
const updateHandler = function (e: Event) {
  const detail = (e as CustomEvent).detail;
  const article = detail.getArticle();

  $(
    '#app .main-container .main .l-card:last-child .review-header:last-child button'
  ).one('click', () => {
    // Submit the review result.
    const accepted = detail.getReviewResult().accept;
    if (accepted) {
      storage.accept += 1;
    } else {
      storage.decline += 1;
    }

    // Add a reviewing history.
    const newItem: Review = {
      id: article.lid,
      author: article.author.uid,
      pid: article.solutionFor.pid,
      accepted,
      time: new Date().toLocaleString('zh-CN'),
    };
    storage.data.push(newItem);

    setHistory(storage);
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
  if (historyChangedState) {
    updateViewHandler();
  }
  historyChangedState = false;
  $('#problem-admin-history').toggle();
};

const clearHandler = function () {
  if (
    window.confirm('确实要清除历史记录吗？\n所有数据将无法恢复！') &&
    window.confirm('第二次确认，确实要清除历史记录吗？')
  ) {
    removeHistory();
    window.alert('操作完成。');
    window.location.reload();
  }
};

// Load function.
const load = function () {
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
    只显示最近五十条记录，其他的可以通过本地存储查看。越新审核的越靠前。
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
