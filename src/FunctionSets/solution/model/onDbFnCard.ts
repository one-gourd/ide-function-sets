import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IFunctionListItem } from '../../index';
import { EOperationType } from '../../mods/OperationPanel/index';

/**
 * 双击卡片的时候，展示编辑功能
 * @param env - IStoresEnv
 */
export const showEditPanel = (env: IStoresEnv<IStoresModel>) => async (
  fn: IFunctionListItem,
  fIndex: number
) => {
  const { stores } = env;

  //   切换成编辑
  stores.model.setOperationType(EOperationType.EDIT);
  stores.model.setFnName(fn.name);
  stores.model.setCodeContent(fn.body);
  stores.model.setPanelVisible(true);
};
