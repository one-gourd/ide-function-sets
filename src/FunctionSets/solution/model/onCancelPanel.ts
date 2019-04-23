import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 点击取消的时候，隐藏面板
 * @param env - IStoresEnv
 */
export const hidePanelWhenCancel = (env: IStoresEnv<IStoresModel>) => async (
  type: EOperationType
) => {
  const { stores } = env;
  stores.model.setPanelVisible(false);
};
