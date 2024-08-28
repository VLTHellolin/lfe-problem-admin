import { type TagsSection, type ModuleExports } from '../lib/types';
import { updateProblem } from '../lib/update';

const problemDifficulties = [
  '暂无评定',
  '入门',
  '普及-',
  '普及/提高-',
  '普及+/提高',
  '提高+/省选-',
  '省选/NOI-',
  'NOI/NOI+/CTSC',
];
const mapToOldDifficulty = (diff: number) => [0, 2, 3, 5, 6, 8, 10, 11][diff];
const tagsData = JSON.parse(GM_getResourceText('tagsData'));
const problemTags: TagsSection[] = tagsData.tags;
const problemTagIds = tagsData.ids;

// Show dropdown.
const dropdownHandler = function () {
  const el = $('#problem-admin-drop');
  el.toggleClass('shown').css('opacity', 1 - parseInt(el.css('opacity')));
};

// Change solution.
const solutionHandler = function () {
  let state = false;
  _feInstance.$swal('题解通道操作', '');

  const selectEl = $('.swal2-container .swal2-content > .swal2-checkbox');
  selectEl.css('display', 'block');
  selectEl.children('.swal2-label').text('选中为开，不选为关');
  selectEl.children('input').on('change', (e) => {
    state = e.target.checked;
  });

  const actionsEl = $('.swal2-container .swal2-actions');
  actionsEl.children('.swal2-cancel').css('display', 'block');
  actionsEl.children('.swal2-confirm').one('click', () => {
    updateProblem({ acceptSolution: state });
  });
};

// Change difficulty.
const difficultyHandler = function () {
  let state: number = _feInjection.currentData.problem.difficulty;
  const diffHTML = problemDifficulties
    .map(
      (e, i) =>
        `<option value="${mapToOldDifficulty(i)}" ${
          state === i ? 'selected' : ''
        }>${e}</option>`
    )
    .join('');

  _feInstance.$swal('题目难度操作', '');

  const selectEl = $('.swal2-container .swal2-content > .swal2-select');
  selectEl.css('display', 'block').html(diffHTML);
  selectEl.on('change', function () {
    state = $(this).val() as number;
  });

  const actionsEl = $('.swal2-container .swal2-actions');
  actionsEl.children('.swal2-cancel').css('display', 'block');
  actionsEl.children('.swal2-confirm').one('click', () => {
    updateProblem({ difficulty: state });
  });
};

// Change tags.
const tagsHandler = function () {
  const state: number[] = Array.from(_feInjection.currentData.problem.tags);
  let tagsHTML = `<br/><details class="sections"> <summary>点击展开标签</summary> <br/>
<div class="section">
  <div data-v-abfce16a data-v-f9624136 class="search-box">
    <div data-v-d09bbffc data-v-abfce16a class="with-popup" data-v-f9624136>
      <div data-v-66fcc50b data-v-d09bbffc class="refined-input input-wrap frame">
        <input data-v-66fcc50b type="text" placeholder="搜索标签" class="lfe-form-sz-small" id="problem-admin-tags-filter">
      </div>
    </div>
  </div>
</div>`;

  for (const section of problemTags) {
    tagsHTML += `<div class="section"> <div class="title">${section.name}</div> <div class="tags">`;
    tagsHTML += section.item
      .map(
        (e) =>
          `<span data-v-71731098 data-v-32a8fe5a data-v-abfce16a class="lfe-caption tag problem-admin-tag ${
            state.includes(e.id) ? 'selected' : ''
          }" data-v-f9624136 id="problem-admin-tag-${
            e.id
          }"><span data-v-32a8fe5a data-v-71731098>${e.name}</span></span>`
      )
      .join('');
    tagsHTML += '</div></div>';
  }
  tagsHTML += '</details>';

  _feInstance.$swal('题目标签操作', '');
  $('.swal2-container .swal2-popup').addClass('swal2-tags-view');

  const selectEl = $('.swal2-container .swal2-content');
  selectEl.append(tagsHTML);

  for (const i of problemTagIds) {
    $(`#problem-admin-tag-${i}`).on('click', function () {
      $(this).toggleClass('selected');
      const num = state.indexOf(i);
      if (num == -1) {
        state.push(i);
      } else {
        state.splice(num, 1);
      }
    });
  }

  // When filter string is changed.
  $('#problem-admin-tags-filter').on('keyup', function () {
    // Reload tags view.
    const filter = $(this).val() as string;
    for (const i of problemTagIds) {
      const el = $(`#problem-admin-tag-${i}`);
      if (el.text().includes(filter)) {
        el.show();
      } else {
        el.hide();
      }
    }
  });

  const actionsEl = $('.swal2-container .swal2-actions');
  actionsEl.children('.swal2-cancel').css('display', 'block');
  actionsEl.children('.swal2-confirm').one('click', () => {
    state.sort();
    updateProblem({ tags: state });
  });
};

// Load the main entrance and add event listeners.
const load = function () {
  if (
    // The page hasn't loaded yet.
    $('.header > .functional > .operation').length === 0 ||
    // The main entrance has loaded already.
    $('#problem-admin-btn').length
  ) {
    return;
  }

  const mainEntranceHTML = `<span data-v-1f03983a data-v-1fbfa3c2 data-v-2dfcfd35>
<span data-v-1f03983a>
  <button id="problem-admin-btn" data-v-cc52fb5c data-v-1fbfa3c2 type="button" class="button-in-anchor lfe-form-sz-middle problem-admin-secondary" data-v-1f03983>
    管理题目
  </button>
  <div id="problem-admin-drop" data-v-1f03983a class="dropdown">
    <div data-v-1fbfa3c2 data-v-1f03983a class="clone-card">
      <button id="problem-admin-sol" data-v-7ade990c data-v-1fbfa3c2 type="button" class="lfe-form-sz-middle problem-admin-primary" data-v-1f03903a>
        题解通道
      </button>
      <button id="problem-admin-diff" data-v-7ade990c data-v-1fbfa3c2 type="button" class="lfe-form-sz-middle problem-admin-primary" data-v-1f03903a>
        题目难度
      </button>
      <button id="problem-admin-tags" data-v-7ade990c data-v-1fbfa3c2 type="button" class="lfe-form-sz-middle problem-admin-primary" data-v-1f03903a>
        题目标签
      </button>
    </div>
  </div>
</span>
</span>
<style>
.problem-admin-primary {
  border-color: rgb(52, 152, 219) !important;
  background-color: rgb(52, 152, 219) !important;
}
.problem-admin-secondary {
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: rgb(255, 255, 255) !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
}
.problem-admin-tag {
  background: rgb(232, 232, 232);
  border: 1px solid rgb(191, 191, 191);
  margin-right: 1em;
  margin-bottom: 1em;
}
.problem-admin-tag.selected {
  border: rgb(52, 152, 219);
  background: rgb(52, 152, 219) !important;
  color: rgb(255, 255, 255) !important;
}
.swal2-tags-view {
  width: 800px !important;
  max-width: 100%;
}
.section {
  padding-bottom: 1.5em;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500 !important;
}
.section .title {
  margin: 1.5em 0;
}
</style>`;
  $('.header > .functional > .operation').append(mainEntranceHTML);
  // Handle events.
  $('#problem-admin-btn').on('click', dropdownHandler);
  $('#problem-admin-sol').on('click', solutionHandler);
  $('#problem-admin-diff').on('click', difficultyHandler);
  $('#problem-admin-tags').on('click', tagsHandler);
};

export default {
  name: 'Problem Admin Panel',
  load,
  condition: () =>
    window.location.href.includes('www.luogu.com.cn/problem') &&
    ['ProblemShow', 'ProblemSolution'].includes(_feInjection.currentTemplate),
  obCondition: (e: Element) => e.className === 'header',
} as ModuleExports;
