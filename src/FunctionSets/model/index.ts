import { types, cast, IAnyModelType, destroy } from 'mobx-state-tree';

import { invariant, pick } from 'ide-lib-utils';

import { IFuncModelSnapshot, IFuncModel, converterFnSnapshot } from './func';
import { IFunctionListItem } from '../index';
import { debugModel } from '../../lib/debug';
import { escapeRegex } from '../../lib/util';

export * from './func';

export function modelExtends(model: IAnyModelType) {
  return model
    .views(self => {
      return {
        // 生成函数模板，用于 “查看全部” 代码（只读）
        // TODO: 接受排序参数
        get allFunctionsToString() {
          let str = '';

          Array.from(self.fns.values()).map((value: IFuncModel) => {
            str += value.definition + '\n\n';
          });

          return str;
        },

        // 生成函数对象 map，诸如 {"onClick": "function(ev){console.log(777);}"}
        // 方便查阅函数集合
        get fnJSON() {
          const result: { [key: string]: string } = {};
          Array.from(self.fns.values()).map((value: IFuncModel) => {
            result[value.name] = value.body;
          });
          return result;
        },

        // 获取函数 id 列表，支持 filterKey 过滤；
        // TODO: 高级过滤，模糊匹配
        get fnIdList() {
          const result: string[] = [];
          const regKey = new RegExp(escapeRegex(self.filterKey), 'g');
          Array.from(self.fns.values()).map((value: IFuncModel) => {
            // 不存在过滤字段，或者满足过滤字段
            if (!self.filterKey || regKey.test(value.name)) {
              result.push(value.id);
            }
          });
          return result;
        },

        // 获取函数 id 列表，全量
        get fnIdFullList() {
          const result: string[] = [];
          Array.from(self.fns.values()).map((value: IFuncModel) => {
            result.push(value.id);
          });
          return result;
        }
      };
    })
    .views(self => {
      return {
        // 获取函数名列表，用于函数名非重名校验
        // TODO: 接受排序参数
        get fnNameList(): string[] {
          return self.fnIdList.map((id: string) => {
            return self.fns.get(id).name;
          });
        },

        // 生成函数对象 list: [{name: 'hello', body: 'world'}]
        // 用于展示页面列表，支持 filterKey 进行列表过滤
        get fnList(): IFunctionListItem[] {
          return self.fnIdList.map((id: string) => {
            return pick(self.fns.get(id), ['name', 'body']);
          });
        },

        // 通过 name 检查 fn 是否存在列表中了
        isExistWithName(name: string) {
          return self.fnIdFullList.some((id: string) => {
            return self.fns.get(id).name === name;
          });
        },

        // 通过 name 返回 id
        getIdByName(name: string) {
          let fnId = '';
          self.fnIdFullList.some((id: string) => {
            if (self.fns.get(id).name === name) {
              fnId = id;
              return true;
            } else {
              return false;
            }
          });

          return fnId;
        }
      };
    })
    .actions(self => {
      return {
        // 该方法接受普通函数对象（无 id ）来新增或修改
        upsertFnItem: function(fn: IFunctionListItem) {
          const fnId = self.getIdByName(fn.name);

          // 通过 id 来判断是否已存在，如果有 id 说明存在
          if (!!fnId) {
            self.fns.get(fnId).setBody(fn.body);
          } else {
            const snapshot = converterFnSnapshot(fn);
            self.fns.set(snapshot.id, snapshot);
          }
        },

        // 该方法接受函数对象 Snapshot 对象（有 id ）来新增
        upsertSnapshot: function(fn: IFuncModelSnapshot) {
          invariant(!!fn.id, '[upsertSnapshot] 设置 FuncModel 缺少 id');
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
    })
    .actions(self => {
      return {
        removeFnById: function(id: string) {
          invariant(!!id, '[removeFnById] 缺少 id, 无法移除');
          destroy(self.fns.get(id));
        }
      };
    });
}
