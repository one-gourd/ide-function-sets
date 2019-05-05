import { IStoresEnv, IActionContext } from 'ide-lib-base-component';
import { IStoresModel } from 'ide-lib-engine';

import { EOperationType } from '../../mods/OperationPanel/index';
import { TPL_FN, PANEL_FROM_SELF } from '../../constants';

/**
 * 不同操作产生不同的效果
 * @param env - IStoresEnv
 */
export const handleButtonAction = (env: IStoresEnv<IStoresModel>) => async (
  type: EOperationType
) => {
  const { stores } = env;
  stores.model.setOperationType(type);
  switch (type) {
    //   新增函数
    case EOperationType.ADD:
      //   切换成编辑
      stores.model.setFnName('');
      stores.model.setFlagOperationFrom(PANEL_FROM_SELF); // 抹除外部来源操作标记
      stores.model.setCodeContent(TPL_FN);
      stores.model.setPanelVisible(true);
      break;

    //   查看所有
    case EOperationType.VIEWALL:
      stores.model.setCodeContent(stores.model.allFunctionsToString);
      stores.model.setPanelVisible(true);
      break;

    default:
      break;
  }
};
