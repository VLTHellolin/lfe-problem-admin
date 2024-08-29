import {
  type Review,
  type ModuleExports,
  type ReasonsList,
} from '../lib/types';
import { getHistory, removeHistory, setHistory } from '../lib/storage';
import { updateProblem } from '../lib/update';

const Storage = getHistory();
const reasonsClipboard = await $.ajax(Storage.reasons, {
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

const settingsHandler = function () {
  const newLink = window.prompt(
    '配置放置打回理由的云剪贴板（是否公开均可，注意更改剪贴板内容后需要刷新生效）：',
    Storage.reasons
  );

  if (newLink === null || newLink === '') {
    return;
  }
  Storage.reasons = newLink;
  setHistory(Storage);
  window.alert('操作完成。');
  window.location.reload();
};

const historyHandler = function () {
  $('#problem-admin-history').toggle();
};

const clearHandler = function () {
  if (
    window.confirm('确实要清除历史记录吗？\n所有数据将无法恢复！') &&
    window.confirm('第二次确认，确实要清除历史记录吗？')
  ) {
    removeHistory();
    window.alert('操作完成。');
  }
};

const updateViewHandler = function () {
  let weekAccept = 0,
    weekDecline = 0;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  for (let i = Storage.data.length - 1; i >= 0; i -= 1) {
    const current = Storage.data[i];
    if (current.time < weekStart) {
      break;
    }
    if (current.accepted) {
      weekAccept += 1;
    } else {
      weekDecline += 1;
    }
  }

  $('#problem-admin-history-total').text(
    `${Storage.accept + Storage.decline} / ${Storage.accept} / ${Storage.decline}`
  );
  $('#problem-admin-history-week').text(
    `${weekAccept + weekDecline} / ${weekAccept} / ${weekDecline}`
  );

  let listHTML = '<ul>';
  let counter = 0;
  for (let i = Storage.data.length - 1; i >= 0; i -= 1) {
    const current = Storage.data[i];
    listHTML += `<li>
    <a href="https://www.luogu.com.cn/article/${current.id}/edit">U${current.author} 作为 ${current.pid} 的题解</a>，${current.accepted ? '通过' : '打回'}，${current.time.toLocaleString('zh-CN')}
    </li>`;
    counter += 1;
    if (counter === 50) {
      break;
    }
  }
  listHTML += '</ul>';
  $('#problem-admin-list').html(listHTML);
};
const updateHandler = function (e: Event) {
  const detail = (e as CustomEvent).detail;
  const article = detail.getArticle();
  const state: { full: string; value: string; sel: boolean }[] = [];
  let additionalState = '';

  const reasonsEl = $('#app .main-container .l-card:last-child');
  if (reasonsEl.length === 0) {
    return;
  }
  reasonsEl.children('p').remove();
  reasonsEl.children('br').remove();
  reasonsEl.children('textarea').remove();
  const submitEl = reasonsEl.children('button:last-child');
  const freeEditingArea = $('<div data-v-17227e28></div>');
  submitEl.before(freeEditingArea);

  const changingReasonsHandler = function () {
    const result: string[] = [];
    for (const item of state) {
      if (!item.sel) {
        continue;
      }
      result.push(item.full + (item.value === '' ? '' : `（${item.value}）`));
    }
    if (additionalState !== '') {
      result.push(additionalState);
    }

    if (result.length !== 0) {
      if (Storage.showAdminName) {
        result.push(
          `审核管理员；${getAdminName()}，对审核结果有异议请私信交流。`
        );
      }
      const reason = result.join('；');
      detail.setReviewResult(false, reason);
      freeEditingPreview.val(reason);
    } else {
      detail.setReviewResult(true);
      freeEditingPreview.val('');
    }
  };

  freeEditingArea.append('<br/>');
  for (const list of reasonsList) {
    freeEditingArea.before(`<p>${list.title}</p>`);
    for (const reason of list.list) {
      state.push({
        full: reason.full,
        value: '',
        sel: false,
      });

      const reasonEl = $(
        `<button data-v-f21de448 data-v-17227e28 type="button" class="problem-admin-reasons" title="${reason.full}">${reason.short}</button>`
      );
      freeEditingArea.before(reasonEl, '&nbsp;');
      const freeEditingButtonEl = $(
        `<button data-v-f21de448 data-v-17227e28 type="button" class="problem-admin-reasons" title="${reason.full}" style="display: none;">${reason.short}</button>&nbsp;`
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

  const adminNameEl = $(
    `<input type="checkbox" ${Storage.showAdminName ? 'checked' : ''}/>`
  );
  freeEditingArea.before(
    '<br/><br/>',
    adminNameEl,
    '<span>&nbsp;显示审核管理员</span>'
  );
  adminNameEl.on('change', () => {
    Storage.showAdminName = !Storage.showAdminName;
    setHistory(Storage);
    changingReasonsHandler();
  });

  const freeEditingTextarea = $(
    '<textarea data-v-33028704 data-v-17227e28 placeholder="其他理由"/>'
  );
  freeEditingArea.append(freeEditingTextarea, '<br/>');
  freeEditingTextarea.on('keyup', () => {
    additionalState = freeEditingTextarea.val() as string;
    changingReasonsHandler();
  });

  const freeEditingPreview = $(
    '<textarea data-v-33028704 data-v-17227e28 placeholder="预览理由" disabled/>'
  );
  freeEditingArea.append(freeEditingPreview);

  submitEl.one('click', () => {
    const accepted = detail.getReviewResult().accept;
    if (accepted) {
      Storage.accept += 1;
    } else {
      Storage.decline += 1;
    }

    const newItem: Review = {
      id: article.lid,
      author: article.author.uid,
      pid: article.solutionFor.pid,
      accepted,
      time: new Date(),
    };
    Storage.data.push(newItem);

    setHistory(Storage);
    updateViewHandler();
  });

  $(
    '#app .main-container .l-card.burger .body div:first-child blockquote'
  ).after(
    '<div data-v-4842157a><a data-v-bade3303 data-v-4842157a id="problem-admin-close">关闭本题题解通道</a></div>'
  );
  $('#problem-admin-close').on('click', () => {
    updateProblem(
      { acceptSolution: false },
      article.solutionFor.pid,
      () => window.alert('操作失败。'),
      () => window.alert('操作成功。')
    );
  });
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
}
</style>`;
  $('#app .main-container .breadcrumb').after(infoHTML);
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
