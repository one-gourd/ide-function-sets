import { types, cast, IAnyModelType } from 'mobx-state-tree';

import { invariant } from 'ide-lib-utils';

import { FuncModel, IFuncModel } from './func';

export * from './func';

export function modelExtends(model: IAnyModelType) {
  return model
    .views(self => {
      return {};
    })
    .actions(self => {
      return {
        // 新增或更新函数
        upsertFn: function(fn: IFuncModel) {
          invariant(!!fn.id, '设置 FuncModel 缺少 id');
          self.fns.set(fn.id, cast(fn));
        }
      };
    });
}
