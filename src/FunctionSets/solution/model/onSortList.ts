import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { IReducerState } from '../../mods/SortPanel/';

/**
 * 点击取消的时候，隐藏面板
 * @param env - IStoresEnv
 */
export const sortFnItem = (env: IStoresEnv<IStoresModel>) => async (
  state: IReducerState
) => {
  const { stores } = env;
  const { by, order } = state;
  stores.model.setSortBy(by);
  stores.model.setSortOrder(order);
  //   console.log(e.target.value);
};
