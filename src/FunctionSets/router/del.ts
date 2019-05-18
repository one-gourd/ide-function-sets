import Router from 'ette-router';
import { buildNormalResponse } from 'ide-lib-base-component';

import { IContext } from './helper';

export const router = new Router();

// 移除操作
router.del('resetModel', '/model', function(ctx: IContext) {
  const { stores } = ctx;
  buildNormalResponse(ctx, 200, { node: stores.resetToEmpty() });
});

// 删除指定函数
router.del('removeFnItem', '/fn-item/:name', function(ctx: IContext) {
  const { stores } = ctx;
  const { name } = ctx.params;
  const targetFnId = stores.model.getIdByName(name);
  const isExistId = !!targetFnId;

  const message = isExistId
    ? '删除成功'
    : '删除失败：名为 ${fnItem.name} 的函数不存在存在';
  if (isExistId) {
    stores.model.removeFnById(targetFnId);
  }
  buildNormalResponse(ctx, 200, { isSuccess: isExistId }, message);
});
