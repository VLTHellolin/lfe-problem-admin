import fs from 'fs';
import https from 'https';

https.get('https://www.luogu.com.cn/_lfe/tags', (resp) => {
  let data = '';
  resp.on('data', (e) => {
    data += e;
  });
  resp.on('end', () => {
    parse(JSON.parse(data));
  });
});

const parse = function (data) {
  let ori = data.tags;

  let res = [
    {
      name: '时间',
      item: [],
    },
    {
      name: '区域',
      item: [],
    },
    {
      name: '特殊题目',
      item: [],
    },
  ];
  let idTable = [];

  for (let i of ori) {
    if (i.parent === null && (i.type === 2 || i.type === 3)) {
      res.push({
        id: i.id,
        name: i.name,
        item: [{ id: i.id, name: i.name }],
      });
      idTable.push(i.id);
    }
  }

  for (let i of ori) {
    if (i.parent === null && (i.type === 2 || i.type === 3)) {
      continue;
    }

    if (i.type === 2 || i.type === 3) {
      let num = res.findIndex((e) => e.id !== undefined && e.id === i.parent);
      if (num != -1) {
        res[num].item.push({ id: i.id, name: i.name });
      }
      idTable.push(i.id);
    } else if (i.type !== 6) {
      // eslint-disable-next-line no-sparse-arrays
      res[[, 1, , , 0, 2][i.type]].item.push({ id: i.id, name: i.name });
      idTable.push(i.id);
    }
  }

  fs.writeFileSync(
    './src/data/tags.json',
    JSON.stringify({ tags: res, ids: idTable })
  );
};
