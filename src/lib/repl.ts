import { debugError } from './debug';
import { isExist } from 'ide-lib-utils';
import { parseScript, ParseOptions, Program } from 'esprima';
// var esprima = require('esprima');
var estraverse = require('estraverse-fb');

// console.log('esprima: ', esprima);

declare const Babel: any;

const CONFIG_BABEL = {
  presets: ['es2015', 'stage-2', 'react']
};

export const REG_GLOBAL_FN = /window\[\'([\w_\-\$@]+)\'\]/gi;

export class REPL {
  astConfig: ParseOptions;
  code: string;
  ast?: Program;
  constructor(code: string, astConfig?: ParseOptions) {
    // http://readthedocs.io/en/4.0/syntactic-analysis.html
    this.astConfig = Object.assign(
      {},
      {
        jsx: true,
        loc: true,
        range: true
      },
      astConfig
    );

    this.code = code;

    // 解析获取语法树

    this.ast = this.code
      ? parseScript(this.code, this.astConfig)
      : void 0;
  }

  static babelCompile(code: string) {
    try {
      if (!isExist(Babel)) {
        debugError('Babel 还没初始化完成，不存在 Babel 对象');
        return code;
      }
      return Babel.transform(code, CONFIG_BABEL).code;
    } catch (err) {
      debugError('Babel 编译出错: %o', err);
      return code;
    }
  }

  // 遍历AST函数
  traverse(fns: any) {
    if (!this.code || !this.ast) {
      return;
    }
    estraverse.traverse(this.ast, fns);
    return this;
  }

  /* ----------------------------------------------------
        实用函数
    ----------------------------------------------------- */

  // 获取函数位置
  extractFunctionByName = (name: string) => {
    if (!name) return false;

    let info: any = {
      name: name,
      loc: false,
      range: false,
      content: '',
      fnBody: ''
    };

    this.traverse({
      enter: (node: any, parent: any) => {
        // 获取函数
        if (node.type == 'MemberExpression' && node.property.value == name) {
          info.loc = parent.loc;
          info.range = parent.range;
          info.content = this.code.slice(info.range[0], info.range[1]);
          let rightRange = parent.right.range; // 函数体的范围
          info.fnBody = this.code.slice(rightRange[0], rightRange[1]);
        }
      }
    });

    return info;
  };

  // 提取所有的函数声明，约定所有的自定义函数都是以 `__` 开始的
  extractAllCustomFnNames = () => {
    let names = [];
    let result;
    while ((result = REG_GLOBAL_FN.exec(this.code)) !== null) {
      names.push(result[1]); // 将第一个分组放入到结果集中
    }
    return names;
  };

  extractAllFunction = () => {
    let fns: { [key: string]: string } = {};
    this.extractAllCustomFnNames().forEach(name => {
      fns[name] = this.extractFunctionByName(name);
    });

    return fns;
  };
}
