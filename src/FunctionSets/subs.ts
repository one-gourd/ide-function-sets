import { ValueOf } from 'ide-lib-base-component';
import { IComponentConfig } from 'ide-lib-engine';

import {
  HeaderBar,
  Stores as HeaderBarStores,
  HeaderBarAddStore,
  IHeaderBarProps,
  DEFAULT_PROPS as DEFAULT_PROPS_HEADER_BAR,
  HeaderBarFactory
} from 'ide-header-bar';


export interface ISubProps {
  headerBar?: IHeaderBarProps;
}

// component: 子组件属性列表
export const subComponents: Record<
  keyof ISubProps,
  IComponentConfig<ValueOf<ISubProps>, any>
> = {
  headerBar: {
    className: 'HeaderBar',
    namedAs: 'headerBar',
    defaultProps: DEFAULT_PROPS_HEADER_BAR,
    normal: HeaderBar,
    addStore: HeaderBarAddStore,
    storesModel: HeaderBarStores,
    factory: HeaderBarFactory,
    routeScope: ['headerbar'] // 能通过父组件访问到的路径
  }
};
