import { types, cast, IAnyModelType } from 'mobx-state-tree';

import { invariant } from 'ide-lib-utils';

import { IFuncModelSnapshot, IFuncModel } from './func';

export * from './func';

export function modelExtends(model: IAnyModelType) {
  return model
    .views(self => {
      return {
        // 生成函数模板，用于 “查看全部” 代码（只读）
        // TODO: 接受排序参数
        get allFunctionsToString() {
          let str = '';

          self.fns.values().map((value: IFuncModel) => {
            str += value.definition + '\n';
          });

          return str;
        },

        // 生成函数对象 map，诸如 {"onClick": "function(ev){console.log(777);}"}
        // 方便查阅函数集合
        get fnJSON() {
          const result: { [key: string]: string } = {};
          self.fns.values().map((value: IFuncModel) => {
            result[value.name] = value.body;
          });
          return result;
        },

        // 获取函数名列表，用于函数名非重名校验
        // TODO: 接受排序参数
        get fnNameList() {
          const result: string[] = [];
          self.fns.values().map((value: IFuncModel) => {
            result.push(value.name);
          });
          return result;
        }
      };
    })
    .actions(self => {
      return {
        // 新增或更新函数
        upsertFn: function(fn: IFuncModelSnapshot) {
          invariant(!!fn.id, '设置 FuncModel 缺少 id');
          const origin = self.fns.get(fn.id);
          // 如果对应的 id 已经存在，则只更新对应的条目内容
          if (!!origin) {
            origin.updateFromObject(fn); // 不更新 id
          } else {
            // 不存在就新建
            self.fns.set(fn.id, cast(fn));
          }
        }
      };
    });
}
