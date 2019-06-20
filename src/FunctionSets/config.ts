import { types, IAnyModelType } from 'mobx-state-tree';
import { BASE_CONTROLLED_KEYS } from 'ide-lib-base-component';

import { IStoresModel, IModuleConfig } from 'ide-lib-engine';

import { DEFAULT_PROPS, IFunctionSetsProps } from '.';
import { EOperationType } from './mods/OperationPanel/index';
import {
  handleFnOperation,
  hidePanelWhenNoError,
  showEditPanel,
  autoHidePanel,
  hidePanelWhenCancel,
  handleButtonAction,
  searchFnItem,
  handleCardAction
} from './solution';
import { FuncModel, modelExtends } from './model';
import { subComponents, ISubProps } from './subs';

import { ESortType, ESortOrder } from './mods/SortPanel';

import { router as GetRouter } from './router/get';
import { router as PostRouter } from './router/post';
import { router as PutRouter } from './router/put';
import { router as DelRouter } from './router/del';

// TODO: 支持自定义排序

// export enum ESortType {
//   REFNUM = 'REFNUM', // 引用次数
//   NAME = 'NAME', // 函数名
//   MODIFYTIME = 'MODIFYTIME', // 修改时间
//   LINENUM = 'LINENUM', // 代码行数
//   NULL = 'NULL' // 默认排序
// }

// export enum ESortOrder {
//   NULL = 'NULL', // 默认顺序
//   ASC = 'ASC', // 升序
//   DESC = 'DESC' // 降序
// }

export const configFunctionSets: IModuleConfig<
  IFunctionSetsProps,
  ISubProps
> = {
  component: {
    className: 'FunctionSets',
    solution: {
      onSearchChange: [searchFnItem],
      onFnListChange: [handleFnOperation, hidePanelWhenNoError],
      onDbFnCard: [showEditPanel],
      onClickPanel: [autoHidePanel],
      onCancelPanel: [hidePanelWhenCancel],
      onButtonAction: [handleButtonAction],
      onCardAction: [handleCardAction]
    },
    defaultProps: DEFAULT_PROPS,
    children: subComponents
  },
  router: {
    domain: 'function-sets',
    list: [GetRouter, PostRouter, PutRouter, DelRouter]
    // hoistRoutes: {
    //   alias: 'bar',
    //   routerNames: 'headerBar'
    // }, // 提升访问子路由功能，相当于是强约束化的 alias
    // aliases: {
    //   alias: 'blockbar',
    //   path: 'bar/headerbar'
    // } // 自定义的路由别名规则
  },
  store: {
    idPrefix: 'sfs'
  },
  model: {
    controlledKeys: [], // 后续再初始化
    props: {
      visible: types.optional(types.boolean, true),
      // 排序类型（即按什么排序）
      sortType: types.optional(
        types.enumeration<ESortType>('SortType', Object.values(ESortType)),
        ESortType.NULL
      ),

      // 排序的顺序，升级还是降序
      sortOrder: types.optional(
        types.enumeration<ESortOrder>('SortOrder', Object.values(ESortOrder)),
        ESortOrder.NULL
      ),

      // 函数映射表
      fns: types.map(FuncModel),

      // 当前编辑的函数名
      fnName: types.optional(types.string, ''),

      // 设置函数名过滤
      filterKey: types.optional(types.string, ''),

      // 当前编辑的函数内容
      codeContent: types.optional(types.string, ''),

      // 函数面板种类
      operationType: types.optional(types.string, EOperationType.ADD),

      // 用于标记操作面板展示的来源 - 方便区分不同的操作来源
      flagOperationFrom: types.optional(types.string, ''),

      // 函数操作面板是否可见
      panelVisible: types.optional(types.boolean, false)

      // language: types.optional(
      //   types.enumeration('Type', CODE_LANGUAGES),
      //   ECodeLanguage.JS
      // ),
      // children: types.array(types.late((): IAnyModelType => SchemaModel)) // 在 mst v3 中， `types.array` 默认值就是 `[]`
      // 在 mst v3 中， `types.map` 默认值就是 `{}`
    },
    extends: modelExtends
  }
};

// 枚举受 store 控制的 key，一般来自 config.model.props 中 key
// 当然也可以自己枚举，比如这里的 fnList 就是计算值
export const SELF_CONTROLLED_KEYS = [
  'visible',
  'fnList',
  'fnName',
  'codeContent',
  'operationType',
  'panelVisible'
];

export const CONTROLLED_KEYS = BASE_CONTROLLED_KEYS.concat(
  SELF_CONTROLLED_KEYS
);

// 初始化 controlledKeys
configFunctionSets.model.controlledKeys = CONTROLLED_KEYS;
