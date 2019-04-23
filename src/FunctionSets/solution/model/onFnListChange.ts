import { message } from 'antd';
import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 当 list 列表项有更改的时候，进行响应
 * @param env - IStoresEnv
 */
export const handleFnOperation = (
  env: IStoresEnv<IStoresModel>,
  actionContext: IActionContext
) => async (
  type: EOperationType,
  fnItem: IFunctionListItem,
  currentFnList: IFunctionListItem[]
) => {
  const { stores, client } = env;
  const { context } = actionContext;
  // stores.model.setVisible(true); // 可见
  // 获取 id 和 value
  //   let fnList = [].concat(currentFnList);

  const targetFnId = stores.model.getIdByName(fnItem.name);
  const isExistId = !!targetFnId;

  context.hasError = false;
  // TODO: 新增或删除，使用动画效果
  switch (type) {
    case EOperationType.ADD:
      // 判断是否已经存在
      if (isExistId) {
        context.hasError = true;
        context.msg = `名为 ${fnItem.name} 的函数已经存在，请更改函数名`;
        message.error(context.msg);
        return;
      }

      //   不存在的情况下才新增
      stores.model.upsertFnItem(fnItem);

      break;

    case EOperationType.EDIT:
      // TODO: 支持函数 id 的修改

      if (!isExistId) {
        context.hasError = true;
        context.msg = `更新失败：名为 ${fnItem.name} 的函数不存在存在`;
        message.error(context.msg);
        return;
      }
      //  存在的情况下去更新
      // console.log(333, fnItem);
      stores.model.upsertFnItem(fnItem);

      break;

    case EOperationType.DEL:
      if (!isExistId) {
        context.hasError = true;
        context.msg = `删除失败：名为 ${fnItem.name} 的函数不存在存在`;

        message.error(context.msg);
        return;
      }
      stores.model.removeFnById(targetFnId);
      break;
    default:
      break;
  }
};

/**
 * 当操作没有问题的时候，自动关闭
 * @param env - IStoresEnv
 */
export const hidePanelWhenNoError = (
  env: IStoresEnv<IStoresModel>,
  actionContext: IActionContext
) => async (
  type: EOperationType,
  fnItem: IFunctionListItem,
  currentFnList: IFunctionListItem[]
) => {
  const { stores } = env;
  const { context } = actionContext;
  if (context && !context.hasError) {
    stores.model.setPanelVisible(false);
  }
};
