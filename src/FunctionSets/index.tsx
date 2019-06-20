import React, { useCallback, useRef } from 'react';
import { Button, Row, Col, Input, Popover } from 'antd';
import {
  IBaseTheme,
  IBaseComponentProps,
  withClickOutside,
  useSizeArea
} from 'ide-lib-base-component';
import { TComponentCurrying } from 'ide-lib-engine';

import { StyledContainer } from './styles';
import { ISubProps } from './subs';

import { OperationPanel, EOperationType } from './mods/OperationPanel';
import { CardList, ECardActionType } from './mods/CardList';
import { SortPanel, IReducerState } from './mods/SortPanel';

export * from './model/func';

const Search = Input.Search;

const OperationPanelWithClickOutside = withClickOutside(OperationPanel);

// TODO: 可以查看所有函数的编辑器（readonly）

export interface IFunctionSetsEvent {
  /**
   * 点击回调函数
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /**
   * 当函数列表有更改的时候
   * 如果返回值是 boolean 的话，用来控制弹层是否自动消失
   */
  onFnListChange?: (
    type: EOperationType,
    fnItem: IFunctionListItem,
    currentFnList: IFunctionListItem[]
  ) => boolean;

  /**
   * 双击卡片的功能
   */
  onDbFnCard?: (fn: IFunctionListItem, fIndex: number) => void;

  /**
   * 点击 Panel 蒙层时的回调，用于探测是否点击在蒙层外
   */
  onClickPanel?: (
    e: MouseEvent,
    isOutSide: boolean,
    detail: { [key: string]: boolean }
  ) => void;

  /**
   * 点击 Panel 上 “取消” 按钮的回调
   */
  onCancelPanel?: (type: EOperationType) => void;

  /**
   * 处理界面上不同操作按钮
   */
  onButtonAction?: (type: EOperationType) => void;

  /**
   * 函数搜索功能
   */
  onSearchChange?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * 函数卡片的操作
   */
  onCardAction?: (
    type: ECardActionType,
    fnItem: IFunctionListItem,
    newName?: string
  ) => void;
}

export interface IFunctionSetsTheme extends IBaseTheme {
  main: string;
}

export interface IFunctionListItem {
  name: string;
  body: string;
}

export interface IFunctionSetsProps
  extends IFunctionSetsEvent,
    ISubProps,
    IBaseComponentProps {
  /**
   * 是否展现
   */
  visible?: boolean;

  /**
   * 当前被选中的函数名
   */
  fnName?: string;

  /**
   * 展现在面板里的函数内容
   */
  codeContent?: string;

  /**
   * 函数对象映射表
   */
  fnList?: IFunctionListItem[];

  /**
   * 是否展现函数操作面板
   */
  panelVisible?: boolean;

  /**
   * 是否展现函数操作面板
   */
  operationType?: EOperationType;
}

export const DEFAULT_PROPS: IFunctionSetsProps = {
  visible: true,
  panelVisible: false,
  operationType: EOperationType.ADD,
  theme: {
    main: '#ECECEC'
  },
  cHeight: 400,
  fnList: []
};

export const FunctionSetsCurrying: TComponentCurrying<
  IFunctionSetsProps,
  ISubProps
> = subComponents => props => {
  const {
    visible,
    styles,
    fnList,
    operationType,
    fnName,
    codeContent,
    panelVisible,
    onFnListChange,
    onDbFnCard,
    onClickPanel,
    onCancelPanel,
    onButtonAction,
    onSearchChange,
    onCardAction
  } = props;

  const refContainer = useRef(null);
  const containerArea = useSizeArea(refContainer);

  /* ----------------------------------------------------
    回调函数部分
----------------------------------------------------- */

  // "新增函数" 按钮回调
  const onClickBtn = useCallback(
    (type: EOperationType) => () => {
      onButtonAction && onButtonAction(type);
    },
    [onButtonAction]
  );

  // 操作面板上的 “确定” 按钮
  const onSubmitPanel = useCallback(
    (id: string, value: string, type: EOperationType) => {
      // 如果存在回调函数，则使用回调函数来控制弹层是否自动关闭
      if (onFnListChange) {
        onFnListChange(
          type,
          {
            name: id,
            body: value
          },
          fnList
        );
      }
    },
    [onFnListChange]
  );

  // 点击排序面板的时候
  const onSortList = useCallback((state: IReducerState) => {
    console.log(111, state);
  }, []);

  // =================================

  return (
    <StyledContainer
      style={Object.assign(styles.container || {}, {
        width: props.cWidth,
        height: props.cHeight
      })}
      visible={visible}
      ref={refContainer}
      className="ide-function-sets-container"
    >
      <Row className="function-sets-row">
        <CardList
          height={containerArea.size.height}
          fnList={fnList}
          onDbFnCard={onDbFnCard}
          onCardAction={onCardAction}
        />
      </Row>

      <Row style={{ marginTop: '10px' }} type="flex" justify="space-between">
        <Col span={14}>
          <Search
            placeholder="通过函数名过滤"
            style={{ width: '100%' }}
            onChange={onSearchChange}
          />
        </Col>
        <Col span={8}>
          <Button
            type="primary"
            onClick={onClickBtn(EOperationType.ADD)}
            icon="plus-square-o"
          >
            新增
          </Button>
          <Popover
            content={<SortPanel onSort={onSortList} />}
            title="点击排序，再点逆序"
            trigger="hover"
          >
            <Button icon="bars">排序</Button>
          </Popover>
          <Button onClick={onClickBtn(EOperationType.VIEWALL)} icon="eye-o">
            查看所有
          </Button>
        </Col>
      </Row>

      <OperationPanelWithClickOutside
        onClick={onClickPanel}
        visible={panelVisible}
        layerArea={containerArea}
        bgColor={'rgba(0,0,0, 0.2)'}
        contentProps={{
          width: (containerArea.size.width as number) - 100,
          height: containerArea.size.height,
          type: operationType,
          visible: panelVisible,
          name: fnName,
          value: codeContent,
          onSubmit: onSubmitPanel,
          onCancel: onCancelPanel
        }}
      />
    </StyledContainer>
  );
};
