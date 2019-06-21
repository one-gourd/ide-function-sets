import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

/**
 * 点击取消的时候，隐藏面板
 * @param env - IStoresEnv
 */
export const searchFnItem = (env: IStoresEnv<IStoresModel>) => async (
  e: React.FocusEvent<HTMLInputElement>
) => {
  const { stores } = env;
//   console.log(e.target.value);
  stores.model.setFilterKey(e.target.value);
};
