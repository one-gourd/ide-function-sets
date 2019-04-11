import {
  cast,
  types,
  Instance,
  IAnyModelType,
  SnapshotOrInstance
} from 'mobx-state-tree';

import { quickInitModel } from 'ide-lib-engine';

import { invariant } from 'ide-lib-utils';
import { uuid } from '../../lib/util';

const FN_IDPREFIX = 'fn_';
/**
 * 单个函数模型，借此绑定该组件的多种函数
 */
export const FuncModel: IAnyModelType = quickInitModel('FuncModel', {
  id: types.refinement(
    types.identifier,
    (identifier: string) => identifier.indexOf(FN_IDPREFIX) === 0
  ), // 创建之后不要让用户层面轻易看到或更改，用于程序内部的关联关系;
  name: types.optional(types.string, ''), // 这个是函数 name，是可以被更改的
  body: types.optional(types.string, '') // 函数体
})
  .views(self => ({
    get definition() {
      // 获取函数定义
      return `window['${self.name}'] = ${self.body}`;
    }
  }))
  .actions(self => {
    return {
      // 只更新相关的属性，不更新 id
      updateFromObject(obj: IFuncModelSnapshot) {
        invariant(!!obj.name, 'name 属性不能为空');
        self.setName(obj.name);
        self.setBody(obj.body || '');
      }
    };
  });

export interface IFuncModel extends Instance<typeof FuncModel> {}
export interface IFuncModelSnapshot
  extends SnapshotOrInstance<typeof FuncModel> {}

/**
 * 辅助函数，将 fnObject（ {name: body} 对象） 转换成 fns 快照格式，方便丢给 mst 生成对象
 * 如果 body 为空，说明该函数被注释了（或者其他异常情况），则需要剔除该函数方法
 *
 * @param {{[key: string]: string}} fnJSON - 函数 {name: body} 对象
 * @param {string} [subKey=''] - 如果不为空，表示 body 元素是对象，需要使用 body[subKey] 获取函数体；否则 body 就是函数体，可直接使用
 * @returns { [key: string]: { [k2: string]: string } } - fns 模型所对应的 snapshot 格式
 */
export function converterFnJSON(
  fnJSON: { [key: string]: any },
  subKey: string = ''
) {
  const result: { [key: string]: { [k2: string]: string } } = {};
  for (const name in fnJSON) {
    if (fnJSON.hasOwnProperty(name)) {
      const fnBody = fnJSON[name];
      const fid = uuid(FN_IDPREFIX);
      // 如果 body 为空，则不能放进模板里
      const body = !!subKey ? fnBody[subKey] : fnBody;
      if (!!body) {
        result[fid] = {
          id: fid,
          name: name,
          body: !!subKey ? fnBody[subKey] : fnBody
        };
      }
    }
  }
  return result;
}
