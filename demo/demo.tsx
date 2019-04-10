import * as React from 'react';
import { render } from 'react-dom';
import { Collapse } from 'antd';
import { FunctionSets, FunctionSetsFactory, IFunctionSetsProps } from '../src/';
import ReplTests from './repl.test';

// 单元测试
ReplTests.init();

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

const props: IFunctionSetsProps = {
  visible: true
};

render(
  <Collapse defaultActiveKey={['1']}>
    <Panel header="普通组件" key="0">
      <FunctionSets {...props} onClick={onClick} />
    </Panel>
    <Panel header="包含 store 功能" key="1">
      <FunctionSetsWithStore onClick={onClickWithStore} />
    </Panel>
  </Collapse>,
  document.getElementById('example') as HTMLElement
);

client.post('/model', {
  model: {
    visible: true,
    text: `text${Math.random()}`.slice(0, 8)
  }
});
