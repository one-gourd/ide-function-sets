import { Instance } from 'mobx-state-tree';
import { initSuitsFromConfig } from 'ide-lib-engine';

export * from './FunctionSets/config';
export * from './FunctionSets/';
export * from './lib/repl';
export * from './lib/util';

import { FunctionSetsCurrying } from './FunctionSets/';
import { configFunctionSets } from './FunctionSets/config';

const {
  ComponentModel: FunctionSetsModel,
  StoresModel: FunctionSetsStoresModel,
  NormalComponent: FunctionSets,
  ComponentHOC: FunctionSetsHOC,
  ComponentAddStore: FunctionSetsAddStore,
  ComponentFactory: FunctionSetsFactory
} = initSuitsFromConfig(FunctionSetsCurrying,configFunctionSets);

export {
  FunctionSetsModel,
  FunctionSetsStoresModel,
  FunctionSets,
  FunctionSetsHOC,
  FunctionSetsAddStore,
  FunctionSetsFactory
};

export interface IFunctionSetsModel
  extends Instance<typeof FunctionSetsModel> {}
