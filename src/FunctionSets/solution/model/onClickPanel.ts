import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 双击卡片的时候，展示编辑功能
 * @param env - IStoresEnv
 */
export const autoHidePanel = (env: IStoresEnv<IStoresModel>) => async (
  e: MouseEvent,
  isOutSide: boolean,
  detail: { [key: string]: boolean }
) => {
  const { stores } = env;

  if (isOutSide) {
    stores.model.setPanelVisible(false);
  }
};
