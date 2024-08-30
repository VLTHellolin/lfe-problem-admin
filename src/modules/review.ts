import {
  type Review,
  type ModuleExports,
  type ReasonsList,
  getHistory,
  removeHistory,
  setHistory,
} from '../lib';

const storage = getHistory();
let historyShowState = false;
let historyChangedState = false;

// Get reasons list from luogu clipboard.
const reasonsClipboard = await $.ajax(storage.reasons, {
  method: 'GET',
  data: { _contentOnly: 1 },
});
const reasonsList = JSON.parse(
  (reasonsClipboard.currentData.paste.data as string).replaceAll(
    /```( )?(json)?/g,
    ''
  )
) as ReasonsList;

const getAdminName = function () {
  return JSON.parse($('#lentille-context').text()).user.name;
};

// Render the total and weekly count in the history view.
const renderHistoryCount = function () {
  let weekAccept = 0,
    weekDecline = 0;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
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
  const state: { full: string; value: string; sel: boolean }[] = [];
  let additionalState = '';

  // Load more reasons panel.
  // The typical reason buttons are rendered before the free editing area.
  // The free editing area contains additional inputs for each reason buttons
  // and the preview of result.
  const reasonsEl = $('#app .main-container .main .l-card:last-child');
  if (reasonsEl.length === 0) {
    return;
  }
  // Remove the original reason buttons of luogu.
  reasonsEl.children('p').remove();
  reasonsEl.children('br').remove();
  reasonsEl.children('textarea').remove();
  reasonsEl.children('.review-header:first-child').remove();
  // The submit button element.
  // const submitEl = reasonsEl.children('.review-header button:last-child');
  const submitEl = reasonsEl.children('.review-header');
  const freeEditingArea = $('<div data-v-17227e28></div>');
  submitEl.children('div:first-child').remove();
  submitEl.before(freeEditingArea);

  // When click on a button, or change the value of an input.
  const changingReasonsHandler = function () {
    // Reasons list.
    const result: string[] = [];
    for (const item of state) {
      if (!item.sel) {
        continue;
      }
      // If additional reasons are provided, render them, otherwise ignore them.
      result.push(item.full + (item.value === '' ? '' : `（${item.value}）`));
    }
    if (additionalState !== '') {
      result.push(additionalState);
    }

    if (result.length !== 0) {
      // At least one reasons are loaded.
      // Set review result to false.
      if (storage.showAdminName) {
        result.push(
          `审核管理员；${getAdminName()}，对审核结果有异议请私信交流。`
        );
      }
      const reason = result.join('；');
      detail.setReviewResult(false, reason);
      freeEditingPreview.val(reason);
    } else {
      // Set review result to true.
      detail.setReviewResult(true);
      freeEditingPreview.val('');
    }
  };

  freeEditingArea.append('<br/>');
  // Render the typical reason buttons.
  for (const list of reasonsList) {
    // The title of each sections.
    freeEditingArea.before(`<p>${list.title}</p>`);
    for (const reason of list.list) {
      state.push({
        full: reason.full,
        // Additional reasons provided.
        value: '',
        // If this reason is selected.
        sel: false,
      });

      const reasonEl = $(
        `<button data-v-f21de448 data-v-17227e28 type="button" class="problem-admin-reasons" title="${reason.full}">${reason.short}</button>`
      );
      freeEditingArea.before(reasonEl, '&nbsp;');
      const freeEditingButtonEl = $(
        `<button data-v-f21de448 data-v-17227e28 type="button" class="problem-admin-reasons" title="${reason.full}" style="display: none;">${reason.short}</button>`
      );
      const freeEditingInputEl = $(
        '<input class="problem-admin-reasons-input" placeholder="追加原因" style="display: none;"/>'
      );
      const freeEditingBr = $('<br style="display: none;"/>');
      freeEditingArea.append(
        freeEditingButtonEl,
        freeEditingInputEl,
        freeEditingBr
      );

      const currentIndex = state.length - 1;
      const reasonButtonHandler = function () {
        // (De-)Select a reason.
        freeEditingButtonEl.toggle();
        freeEditingInputEl.toggle();
        freeEditingBr.toggle();
        state[currentIndex].sel = !state[currentIndex].sel;
        changingReasonsHandler();
      };
      const reasonInputHandler = function () {
        const currentReason = freeEditingInputEl.val() as string;
        state[currentIndex].value = currentReason;
        changingReasonsHandler();
      };

      reasonEl.on('click', reasonButtonHandler);
      freeEditingButtonEl.on('click', reasonButtonHandler);
      freeEditingInputEl.on('keyup', reasonInputHandler);
    }
  }
  freeEditingArea.append('<br/>');

  // Control if the admin name is displayed in the result.
  const adminNameEl = $(
    `<input type="checkbox" ${storage.showAdminName ? 'checked' : ''}/>`
  );
  freeEditingArea.before(
    '<br/><br/>',
    adminNameEl,
    '<span>&nbsp;显示审核管理员</span>'
  );
  adminNameEl.on('change', () => {
    storage.showAdminName = !storage.showAdminName;
    setHistory(storage);
    changingReasonsHandler();
  });

  // Other additional reasons provided.
  const freeEditingTextarea = $(
    '<textarea data-v-33028704 data-v-17227e28 placeholder="其他理由"/>'
  );
  freeEditingArea.append(freeEditingTextarea, '<br/>');
  freeEditingTextarea.on('keyup', () => {
    additionalState = freeEditingTextarea.val() as string;
    changingReasonsHandler();
  });

  // The preview of the result.
  const freeEditingPreview = $(
    '<textarea data-v-33028704 data-v-17227e28 placeholder="预览理由" disabled/>'
  );
  freeEditingArea.append(freeEditingPreview);

  submitEl.one('click', () => {
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
    } else {
      historyChangedState = true;
    }
  });
};

const settingsHandler = function () {
  const newLink = window.prompt(
    '配置放置打回理由的云剪贴板（是否公开均可，注意更改剪贴板内容后需要刷新生效）：',
    storage.reasons
  );

  if (newLink === null || newLink === '') {
    return;
  }
  storage.reasons = newLink;
  setHistory(storage);
  window.alert('操作完成。');
  window.location.reload();
};

const historyHandler = function () {
  historyShowState = !historyShowState;
  if (historyChangedState) {
    updateViewHandler();
  }
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
<button data-v-f21de448 data-v-17227e28 type="button"
  id="problem-admin-settings-btn" class="solid lform-size-middle">打回理由设置</button>
&nbsp;
<button data-v-f21de448 data-v-17227e28 type="button"
  id="problem-admin-history-btn" class="solid lform-size-middle">历史记录</button>
&nbsp;
<button data-v-f21de448 data-v-17227e28 type="button" style="--lcolor-rgb: var(--lcolor--error);"
  id="problem-admin-clear-btn" class="solid lform-size-middle">清除记录</button>
</div>
<style>
.top-bar > .left button {
  padding: .3125em 1em !important;
}
</style>`;
  $('#app > .top-bar > .left').append(btnHTML);
  const infoHTML = `
<div data-v-e01570a1 data-v-17227e28 id="problem-admin-history" class="l-card" style="display: none;">
  <h3 data-v-17227e28 class="lfe-h3">历史记录</h3>
  <div data-v-17227e28>
    总审核数量 / 通过 / 拒绝：<span id="problem-admin-history-total">null</span>
    <br/>
    本周审核数量 / 通过 / 拒绝：<span id="problem-admin-history-week">null</spaan>
  </div>
  <div data-v-17227e28>
    只显示最近五十条记录，其他的可以通过本地存储查看。越新审核的越靠前。
    <br/>
    <div data-v-17227e28 id="problem-admin-list">
      null
    </div>
  </div>
</div>
<style>
.problem-admin-reasons-input {
  display: inline-block;
	width: 80%;
	box-sizing: border-box;
	-webkit-box-sizing: border-box;
	margin: 0;
	padding: 8px 0;
	overflow: hidden;
	color: rgba(0, 0, 0, .87);
	font-size: 16px;
	font-family: inherit;
	line-height: 20px;
	background: 0 0;
	border: none;
	border-bottom: 1px solid rgba(0, 0, 0, .42);
	border-radius: 0;
	outline: 0;
	transition: all .2s;
}
.problem-admin-reasons {
  font-size: .875em;
  padding: .325em .9em;
  margin-right: .1em;
  margin-bottom: .25em;
}
</style>`;
  $('#app .main-container .container .article-review').prepend(infoHTML);
  // Add event listeners.
  $('#problem-admin-settings-btn').on('click', settingsHandler);
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
