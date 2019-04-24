import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { ECardActionType, IFunctionListItem } from '../../index';
import { debugInteract } from '../../../lib/debug';
import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 处理函数 card 的事件
 * @param env - IStoresEnv
 */
export const handleCardAction = (env: IStoresEnv<IStoresModel>) => async (
  type: ECardActionType,
  fnItem: IFunctionListItem
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
    default:
      break;
  }
};
