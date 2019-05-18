import { message } from 'antd';
import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { debugInteract } from '../../../lib/debug';
import { EOperationType } from '../../mods/OperationPanel/index';
import { ECardActionType } from '../../mods/CardList/index';

/**
 * 处理函数 card 的事件
 * @param env - IStoresEnv
 */
export const handleCardAction = (
  env: IStoresEnv<IStoresModel>,
  actionContext: IActionContext
) => async (
  type: ECardActionType,
  fnItem: IFunctionListItem,
  newName?: string
) => {
  const { stores } = env;
  debugInteract(
    `[handleCardAction] 对函数 card (%o) 进行 ${type} 操作`,
    fnItem
  );

  const { context } = actionContext;

  //   先查找对象，然后再更新
  const targetFnId = stores.model.getIdByName(fnItem.name);
  const isExistId = !!targetFnId;

  context.hasError = false;

  switch (type) {
    // 简化删除操作，直接删除函数
    case ECardActionType.DEL:
      // stores.model.setOperationType(EOperationType.DEL);
      if (!isExistId) {
        context.hasError = true;
        context.msg = `删除失败：名为 ${fnItem.name} 的函数不存在存在`;

        message.error(context.msg);
      } else {
        stores.model.removeFnById(targetFnId);
      }
      break;

    //  重命名
    case ECardActionType.RENAME:
      // 先查看一下是否重名
      if (stores.model.isExistWithName(newName)) {
        context.msg = `函数名 ${newName} 已存在，请改用其他函数名`;
        message.error(context.msg);
        return;
      }

      if (!targetFnId) {
        context.msg = `原函数 ${fnItem.name} 不存在，无法完成修改`;

        message.error(context.msg);
        return;
      }

      //   最终更新函数名
      stores.model.fns.get(targetFnId).setName(newName);
      break;

    default:
      break;
  }
};
