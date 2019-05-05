import * as React from 'react';
import { render } from 'react-dom';
import { Collapse } from 'antd';
import { FunctionSets, FunctionSetsFactory, IFunctionSetsProps } from '../src/';
import { REPL } from '../src/lib/repl';
import { converterFnJSON } from '../src/FunctionSets/model/func';
import ReplTests, { eventFns } from './repl.test';

// 单元测试
ReplTests.init();

// 解析 eventFns
const repl = new REPL(eventFns); // 对代码进行分析
const fnJSON = repl.extractAllFunction(); // 获取所有的函数对象

const fnsSnapshoot = converterFnJSON(fnJSON, 'fnBody');
// console.log(666, fnsSnapshoot);
const Panel = Collapse.Panel;

const {
  ComponentWithStore: FunctionSetsWithStore,
  client
} = FunctionSetsFactory();

function onClick(value) {
  console.log('当前点击：', value);
}
function onClickWithStore(value) {
  client.put(`/model`, {
    name: 'text',
    value: `gggg${Math.random()}`.slice(0, 8)
  });

  client.put('/alias/blockbar', {
    name: 'logo',
    value: 'https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png'
  });
}

// 当函数有更改的时候
function onFnListChange(type, fnItem, fnLists, actionContext) {
  console.log(`list change, type: ${type}, fnItem: %o`, fnItem);

  const { context } = actionContext;

  // 没有报错，才会自动关闭弹层
  return !context.hasError;
}

const props: IFunctionSetsProps = {
  visible: true,
  fnList: [
    {
      name: 'ttt',
      body:
        'const a = 2;\nconst a = 2\nconst a = 2\nconst a = 2\nconst a = 2\nconst a = 2'
    },
    {
      name: '222',
      body: 'function aa(){return <div></div>}'
    }
  ]
};

render(
  <Collapse defaultActiveKey={['1']}>
    <Panel header="普通组件" key="0">
      <FunctionSets {...props} onClick={onClick} />
    </Panel>
    <Panel header="包含 store 功能" key="1">
      <FunctionSetsWithStore
        onClick={onClickWithStore}
        onFnListChange={onFnListChange}
      />
    </Panel>
  </Collapse>,
  document.getElementById('example') as HTMLElement
);

client
  .post('/model', {
    model: {
      visible: true,
      text: `text${Math.random()}`.slice(0, 8),
      fns: fnsSnapshoot
    }
  })
  .then(res => {
    // 让面板可见, 目前支持 add / edit / type 功能
    client
      .put('/fn-panel', {
        type: 'edit',
        name: 'renderRow',
        from: 'customxxx'
      })
      .then(res => {
        console.log('res: ', res.body.message);
      });
  });

client.subscribe('/onSubmitChange', {
  onMessage: data => {
    console.log(777, data);
  }
});
