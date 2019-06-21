import { REPL } from '../src/lib/repl';

import * as chai from 'chai';
const expect = chai.expect;
// 因为依赖 babel cdn url，在 jest 中无法配置，所以挪到浏览器中判断
// 请到 https://astexplorer.net/ 进行验证
export const eventFns = `;(function() {
    
      const { noop } = window.util;
  
  
      // window['__ttttest_click'] = function onClick({ value, e, id, $store }) {
      //   $store['pagination']['current'] = 1;
      //   $store['userList'].fetch().catch(noop);
      // };
    
      window['__queryBtn_click'] = function onClick({ value, e, id, $store }) {
        $store['pagination']['current'] = 1;
        $store['userList'].fetch().catch(noop);
      };
    
      window['__resetBtn_click'] = function onClick({ value, e, id, $store }) {
        $store['statusFilter'].value = undefined;
        $store['userName'].value = undefined;
      };
    
      window['__pagination_change'] = function onChange({ value, e, id, $store }) {
        $store[id]['current'] = value;
        $store['userList'].fetch().catch(noop);
      };
    
      window['__userNameChange'] = ({ value, e, id, $store }) => {
        $store[id].value = value;
      };
    
      window['__statusFilterChange'] = ({ value, e, id, $store }) => {
        $store[id].value = value;
      };
    
      window['arenderColumnStatus'] = (value, index, record) => {
        const moods = {
          '1': 'Excited',
          '2': 'Happy',
          '3': 'Quiet',
          '4': 'Exausted',
          '5': 'Sad',
          'default': 'Quiet'
        };
        return moods.hasOwnProperty(value) ? moods[value] : moods['default'];
      };

      window['renderRow'] = () => {
        return <Row span={4}><Col></Col></Row>
      };
  })`;

export default {
  init: function() {
    console.log('//==== 单元测试开始 ======');
    console.log('[REPL] - 函数编译器');

    this.testExtracFunctionByName();
    this.testArrowFn();
    this.testAllFns();
    this.testCompileJSX();
    console.log('//==== 单元测试结束 ======');
  },

  testExtracFunctionByName: function() {
    console.log('[extractFunctionByName] 能提取函数信息');

    let repl = new REPL(eventFns); // 对代码进行分析

    let info = repl.extractFunctionByName('__pagination_change');
    const { name, loc, range, content, fnBody } = info;

    expect(name).to.equal('__pagination_change');
    expect(loc).to.deep.equal({
      start: { line: 21, column: 6 },
      end: { line: 24, column: 7 }
    });
    expect(range).to.deep.equal([643, 815]);

    expect(fnBody).to.equal(`function onChange({ value, e, id, $store }) {
        $store[id]['current'] = value;
        $store['userList'].fetch().catch(noop);
      }`);
  },

  testArrowFn: () => {
    console.log('[extractFunctionByName] 能够提取箭头函数');
    let repl = new REPL(eventFns); // 对代码进行分析

    let info = repl.extractFunctionByName('__userNameChange');
    const { name, loc, range, content, fnBody } = info;

    expect(name).to.equal('__userNameChange');

    expect(loc).to.deep.equal({
      start: { line: 26, column: 6 },
      end: { line: 28, column: 7 }
    });
    expect(range).to.deep.equal([828, 930]);

    expect(fnBody).to.equal(`({ value, e, id, $store }) => {
        $store[id].value = value;
      }`);
  },

  testAllFns: () => {
    console.log('[extractAllCustomFnNames] 能够提取所有函数');
    let repl = new REPL(eventFns); // 对代码进行分析

    let fnNames = repl.extractAllCustomFnNames();

    let fns = repl.extractAllFunction();

    console.log('333', fns['__statusFilterChange']);

    expect(fnNames).to.deep.equal([
      '__ttttest_click',
      '__queryBtn_click',
      '__resetBtn_click',
      '__pagination_change',
      '__userNameChange',
      '__statusFilterChange',
      'arenderColumnStatus',
      'renderRow'
    ]);
  },

  testCompileJSX: () => {
    console.log('[babelCompile] 能编译 JSX 代码');
    let repl = new REPL(eventFns); // 对代码进行分析
    let info = repl.extractFunctionByName('renderRow');
    const { name, fnBody } = info;

    expect(name).to.equal('renderRow');
    expect(REPL.babelCompile(fnBody)).to.equal(`"use strict";

(function () {
        return React.createElement(
                Row,
                { span: 4 },
                React.createElement(Col, null)
        );
});`);
  }
};
