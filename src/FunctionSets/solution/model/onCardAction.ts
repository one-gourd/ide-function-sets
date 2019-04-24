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
export const handleCardAction = (env: IStoresEnv<IStoresModel>) => async (
  type: ECardActionType,
  fnItem: IFunctionListItem,
  newName?: string
) => {
  const { stores } = env;
  debugInteract(
    `[handleCardAction] 对函数 card (%o) 进行 ${type} 操作`,
    fnItem
  );

  switch (type) {
    case ECardActionType.DEL:
      //   切换到删除
      stores.model.setOperationType(EOperationType.DEL);
      stores.model.setFnName(fnItem.name);
      stores.model.setCodeContent(fnItem.body);
      stores.model.setPanelVisible(true);
      break;

    //  重命名
    case ECardActionType.RENAME:
      // 先查看一下是否重名
      if (stores.model.isExistWithName(newName)) {
        message.error(`函数名 ${newName} 已存在，请改用其他函数名`);
        return;
      }

      //   先查找对象，然后再更新
      const targetId = stores.model.getIdByName(fnItem.name);
      if (!targetId) {
        message.error(`原函数 ${fnItem.name} 不存在，无法完成修改`);
        return;
      }

      //   最终更新函数名
      stores.model.fns.get(targetId).setName(newName);
      break;

    default:
      break;
  }
};
