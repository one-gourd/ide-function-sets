import Router from 'ette-router';
import {
  updateStylesMiddleware,
  updateThemeMiddleware,
  buildNormalResponse
} from 'ide-lib-base-component';

import { IContext } from './helper';
import { EOperationType } from '../mods/OperationPanel/index';
import { TPL_FN, PANEL_FROM_SELF } from '../constants';

export const router = new Router();
// 更新单项属性
router.put('updateModel', '/model', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;

  //   stores.setSchema(createSchemaModel(schema));
  const originValue = stores.model[name];
  const isSuccess = stores.model.updateAttribute(name, value);

  buildNormalResponse(
    ctx,
    200,
    { success: isSuccess, origin: originValue },
    `属性 ${name} 的值从 ${originValue} -> ${value} 的变更: ${isSuccess}`
  );
});

// 更新函数面板状态
router.put('updateFn', '/fn-panel', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { type, name, from } = request.data;

  let isSuccess = false;
  let message = `unknown type: ${type}`;

  // 根据 name 查找是否存在函数
  const targetId = stores.model.getIdByName(name);
  const isExist = !!targetId;
  const operationType = (type && type.toUpperCase()) || '';
  stores.model.setOperationType(operationType);

  // 标记不同的展示来源
  stores.model.setFlagOperationFrom(from || PANEL_FROM_SELF);
  switch (operationType) {
    // 唤起  “新增” 面板
    case EOperationType.ADD:
      stores.model.setFnName(name || '');
      stores.model.setCodeContent(TPL_FN);
      stores.model.setPanelVisible(true);

      isSuccess = true;
      message = `唤起 ${operationType} 面板成功`;
      break;
    // 唤起  “编辑” 面板
    case EOperationType.EDIT:
    case EOperationType.DEL:
      if (isExist) {
        stores.model.setFnName(name);
        stores.model.setCodeContent(stores.model.fns.get(targetId).body);
        stores.model.setPanelVisible(true);
        isSuccess = true;
        message = `唤起 ${operationType} 面板成功`;
      } else {
        isSuccess = false;
        message = `唤起 ${operationType} 面板失败，不存在名为 ${name} 的函数`;
      }
      break;
  }

  buildNormalResponse(ctx, 200, { success: isSuccess }, message);
});

// 更新 css 属性
router.put(
  'updateStyles',
  '/model/styles/:target',
  updateStylesMiddleware('model')
);

// 更新 theme 属性
router.put(
  'updateTheme',
  '/model/theme/:target',
  updateThemeMiddleware('model')
);
