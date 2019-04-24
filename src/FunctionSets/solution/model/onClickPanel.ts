import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { EOperationType } from '../../mods/OperationPanel/index';
import { debugInteract } from '../../../lib/debug';

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
  debugInteract('探测是否点在蒙层外:', isOutSide, detail);
  if (isOutSide) {
    stores.model.setPanelVisible(false);
  }
};
