import { debugError } from './debug';
import { isExist, invariant } from 'ide-lib-utils';
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

    this.ast = this.code ? parseScript(this.code, this.astConfig) : void 0;
  }

  // 利用 babel 进行代码转换，比如从 JSX 转换成 JS 代码
  // 更多方法参考：https://babeljs.io/docs/en/babel-core
  static babelCompile(code: string) {
    invariant(isExist(Babel), '[babelCompile] Babel 对象不存在');
    try {
      return Babel.transform(code, CONFIG_BABEL).code;
    } catch (err) {
      debugError('Babel 编译出错: %o', err);
      return code;
    }
  }

  // 检查代码是否合法
  static validateCode(code: string) {
    invariant(isExist(Babel), '[validCode] Babel 对象不存在');
    try {
      const result = Babel.transform(code, CONFIG_BABEL).code;
      return {
        isValid: true,
        message: '代码合法',
        code: result
      };
    } catch (err) {
      debugError('Babel 编译出错: %o', err);
      return {
        isValid: false,
        message: err,
        code: code
      }
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
        try {
          if (node.type == 'MemberExpression' && node.property.value == name) {
            // 注意有可能某个函数被另外一个函数使用，这里需要判断右节点是否存在
            if (parent.right && parent.right.range) {
              info.loc = parent.loc;
              info.range = parent.range;
              info.content = this.code.slice(info.range[0], info.range[1]);
              let rightRange = parent.right.range; // 函数体的范围
              info.fnBody = this.code.slice(rightRange[0], rightRange[1]);
            }
          }
        } catch (err) {
          console.error('[repl] traverse error:, ', err);
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
