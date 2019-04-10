import { Instance } from 'mobx-state-tree';
import { initSuits } from 'ide-lib-engine';

export * from './FunctionSets/config';
export * from './FunctionSets/';

import { FunctionSetsCurrying } from './FunctionSets/';
import { configFunctionSets } from './FunctionSets/config';

// 抽离子组件配置项
const subStoresModelMap = {} as any;
const subFactoryMap = {} as any;
const subComponents = configFunctionSets.component.children as any;
const subComponentNames = Object.keys(subComponents);
subComponentNames.forEach((name: string) => {
  subStoresModelMap[name] = subComponents[name].storesModel;
  subFactoryMap[name] = subComponents[name].factory;
});

const {
  ComponentModel: FunctionSetsModel,
  NormalComponent: FunctionSets,
  ComponentHOC: FunctionSetsHOC,
  ComponentAddStore: FunctionSetsAddStore,
  ComponentFactory: FunctionSetsFactory
} = initSuits({
  ComponentCurrying: FunctionSetsCurrying,
  className: configFunctionSets.component.className,
  solution: configFunctionSets.component.solution,
  defaultProps: configFunctionSets.component.defaultProps,
  controlledKeys: configFunctionSets.model.controlledKeys,
  modelProps: configFunctionSets.model.props,
  modelExtends: configFunctionSets.model.extends,
  subComponents: configFunctionSets.component.children,
  subStoresModelMap: subStoresModelMap,
  subFactoryMap: subFactoryMap,
  idPrefix: configFunctionSets.store.idPrefix,
  routerConfig: configFunctionSets.router
});

export {
  FunctionSetsModel,
  FunctionSets,
  FunctionSetsHOC,
  FunctionSetsAddStore,
  FunctionSetsFactory
};

export interface IFunctionSetsModel
  extends Instance<typeof FunctionSetsModel> {}
