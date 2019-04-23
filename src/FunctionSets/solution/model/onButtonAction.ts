import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 不同操作产生不同的效果
 * @param env - IStoresEnv
 */
export const handleButtonAction = (env: IStoresEnv<IStoresModel>) => async (
  type: EOperationType
) => {

  const { stores } = env;
  stores.model.setOperationType(EOperationType.ADD);
  switch (type) {
    //   新增函数
    case EOperationType.ADD:
      //   切换成编辑
      stores.model.setFnName('');
      stores.model.setPanelVisible(true);
      break;

    default:
      break;
  }
};
