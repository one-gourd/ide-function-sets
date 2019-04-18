import { message } from 'antd';
import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { EOperationType } from '../../mods/OperationPanel/';

/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const handleFnOperation = (env: IStoresEnv<IStoresModel>) => async (
  type: EOperationType,
  fnItem: IFunctionListItem,
  currentFnList: IFunctionListItem[]
) => {
  const { stores, client } = env;
  // stores.model.setVisible(true); // 可见
  // 获取 id 和 value
  //   let fnList = [].concat(currentFnList);

  const targetFnId = stores.model.getIdByName(fnItem.name);
  const isExistId = !!targetFnId;
  // TODO: 新增或删除，使用动画效果
  switch (type) {
    case EOperationType.ADD:

      // 判断是否已经存在
      if (isExistId) {
        message.error(`名为 ${fnItem.name} 的函数已经存在，请更改函数名`);
        return;
      }

      //   不存在的情况下才新增
      stores.model.upsertFnItem(fnItem);

      break;

    case EOperationType.EDIT:
      // TODO: 支持函数 id 的修改

      if (!isExistId) {
        message.error(`更新失败：名为 ${fnItem.name} 的函数不存在存在`);
        return;
      }
      //  存在的情况下去更新
      stores.model.upsertFnItem(fnItem);

      break;

    case EOperationType.DEL:
      if (!isExistId) {
        message.error(`删除失败：名为 ${fnItem.name} 的函数不存在存在`);
        return;
      }
      stores.model.removeFnById(targetFnId);
      break;
    default:
      break;
  }
};
