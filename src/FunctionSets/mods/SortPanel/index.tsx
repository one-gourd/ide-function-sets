import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { Icon } from 'antd';
import { observer } from 'mobx-react-lite';

import { StyledSortPanelWrap, StyledSortItemWrap } from './styles';
import { debugMini } from '../../../lib/debug';

export enum ESortBy {
  REFNUM = 'REFNUM', // 引用次数
  NAME = 'NAME', // 函数名
  MODIFYTIME = 'MODIFYTIME', // 修改时间
  LINENUM = 'LINENUM', // 代码行数
  NULL = 'NULL' // 默认排序
}

export enum ESortOrder {
  NULL = 'NULL', // 默认顺序
  ASC = 'ASC', // 升序
  DESC = 'DESC' // 降序
}

export interface ISortPanelProps {
  /**
   * 排序类型（排序一句）
   */
  sortBy?: ESortBy;

  /**
   * 排序顺序
   */
  sortOrder?: ESortOrder;

  /**
   * 当排序更新的时候
   */
  onSort?: (state: IReducerState) => void;
}

export interface IReducerState {
  by: ESortBy;
  order: ESortOrder;
}

enum EReducerType {
  // 更新排序方式
  SORTBY = 'sortBy',
  // 排序方式
  SORTORDER = 'sortOrder'
}

const stateReducer = (
  state: IReducerState,
  [type, payload]: [EReducerType, Partial<IReducerState>]
) => {
  debugMini(`[状态 reduce] type: ${type}, payload: %o`, payload);
  switch (type) {
    // 更改排序方法，重置为 asc
    case EReducerType.SORTBY:
      return {
        ...state,
        ...{ order: ESortOrder.ASC, by: payload.by }
      };

    // 更改排序顺序
    case EReducerType.SORTORDER:
      return {
        ...state,
        ...{ order: payload.order }
      };
  }

  return state;
};

/**
 * 根据排序类型返回不同的图标
 */
const iconStyle = { color: '#24ab68', marginLeft: '5px' };
const getIconItemByOrder = (sortOrder: ESortOrder) => {
  switch (sortOrder) {
    case ESortOrder.ASC:
      return <Icon style={iconStyle} type="arrow-up" />;
    case ESortOrder.DESC:
      return <Icon style={iconStyle} type="arrow-down" />;
    default:
      return null;
  }
};

export interface ISortItemProps {
  name: string;
  order?: ESortOrder;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
const SortItem: React.FunctionComponent<ISortItemProps> = props => {
  const { name, order = ESortOrder.NULL, onClick } = props;
  return (
    <StyledSortItemWrap onClick={onClick}>
      {name}
      {getIconItemByOrder(order)}
    </StyledSortItemWrap>
  );
};

const getNextOrder = function(currentOrder: ESortOrder) {
  switch (currentOrder) {
    case ESortOrder.NULL:
      return ESortOrder.ASC;
    case ESortOrder.ASC:
      return ESortOrder.DESC;
    case ESortOrder.DESC:
      return ESortOrder.NULL;
    default:
      return ESortOrder.NULL;
  }
};

export const SortPanel: React.FunctionComponent<ISortPanelProps> = observer(
  props => {
    const {
      sortBy = ESortBy.NULL,
      sortOrder = ESortOrder.NULL,
      onSort
    } = props;

    const [state, dispatch] = useReducer(stateReducer, {
      by: sortBy,
      order: sortOrder
    });

    const onClickItem = useCallback(
      (by: ESortBy) => () => {
        if (state.by !== by) {
          dispatch([EReducerType.SORTBY, { by }]);
          onSort && onSort({ by: by, order: ESortOrder.ASC });
        } else {
          const nextOrder = getNextOrder(state.order);
          dispatch([EReducerType.SORTORDER, { order: nextOrder }]);
          onSort && onSort({ by: by, order: nextOrder });
        }
      },
      [state.by, state.order, onSort]
    );

    return (
      <StyledSortPanelWrap className="sort-panel-wrap">
        <SortItem
          name="函数名"
          order={state.by === ESortBy.NAME ? state.order : ESortOrder.NULL}
          onClick={onClickItem(ESortBy.NAME)}
        />
        <SortItem
          name="引用次数"
          order={state.by === ESortBy.REFNUM ? state.order : ESortOrder.NULL}
          onClick={onClickItem(ESortBy.REFNUM)}
        />
        <SortItem
          name="代码行数"
          order={state.by === ESortBy.LINENUM ? state.order : ESortOrder.NULL}
          onClick={onClickItem(ESortBy.LINENUM)}
        />
      </StyledSortPanelWrap>
    );
  }
);
