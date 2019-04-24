import React, { useCallback, useRef, useReducer, useEffect } from 'react';
import {
  Button,
  Row,
  Col,
  Input,
  Card,
  Popover,
  message,
  Menu,
  Dropdown,
  Icon
} from 'antd';
import {
  IBaseTheme,
  IBaseComponentProps,
  withClickOutside,
  useSizeArea
} from 'ide-lib-base-component';
import { TComponentCurrying } from 'ide-lib-engine';

import { CodeEditor } from 'ide-code-editor';

import { StyledContainer, StyledCardWrap } from './styles';
import { ISubProps } from './subs';
import { debugMini, debugInteract } from '../lib/debug';

import { OperationPanel, EOperationType } from './mods/OperationPanel';

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
  onCardAction?: (type: ECardActionType, fnItem: IFunctionListItem) => void;
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
  styles: {
    container: {
      height: 800,
      width: 1060
    }
  },
  fnList: []
};

// 枚举值：函数 card 操作类型
export enum ECardActionType {
  RENAME = 'rename', // 重命名
  DEL = 'del' // 删除函数
}

// 函数 card 上的 “更多” 组件
const renderCardMore = (
  onClickItem: (type: ECardActionType, fnItem: IFunctionListItem) => () => void,
  fnItem: IFunctionListItem
) => {
  const hoverContent = (
    <Menu>
      <Menu.Item key="rename">
        <a
          onClick={onClickItem(ECardActionType.RENAME, fnItem)}
          href="javascript:void(0)"
        >
          重命名
        </a>
      </Menu.Item>
      {/* <Menu.Item key="1">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.taobao.com/"
        >
          2nd menu item
        </a>
      </Menu.Item> */}
      <Menu.Divider />
      <Menu.Item key="del">
        <Button
          onClick={onClickItem(ECardActionType.DEL, fnItem)}
          style={{ width: '100%' }}
          type="danger"
        >
          删除
        </Button>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={hoverContent}>
      <a className="ant-dropdown-link" href="javascript:void(0);">
        更多操作 <Icon type="down" />
      </a>
    </Dropdown>
  );
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

  // 双击函数卡片，弹出编辑框
  const onDbCard = useCallback(
    (fn: IFunctionListItem, fIndex: number) => () => {
      onDbFnCard && onDbFnCard(fn, fIndex);
    },
    [onDbFnCard]
  );

  // 点击函数 card 上的更多操作
  const onClickCardAction = useCallback(
    (type: ECardActionType, fnItem: IFunctionListItem) => () => {
      onCardAction && onCardAction(type, fnItem);
    },
    [onCardAction]
  );

  // =================================

  // TODO: 添加排序图标 & 交互
  const sortContent = (
    <div>
      <p>
        <a>引用次数</a>
      </p>
      <p>
        <a>ID 字母</a>
      </p>
      <p>
        <a>修改时间</a>
      </p>
      <p>
        <a>代码行数</a>
      </p>
    </div>
  );
  // console.log(4555, codeContent);
  return (
    <StyledContainer
      style={styles.container}
      visible={visible}
      ref={refContainer}
      className="ide-function-sets-container"
    >
      <Row className="function-sets-row">
        <StyledCardWrap
          style={{ height: `calc(${styles.container.height}px - 60px)` }}
          className="cards-wrap"
        >
          {fnList.map((fn, fIndex) => {
            return (
              <Card
                bodyStyle={{
                  height: 150,
                  padding: 0
                }}
                onDoubleClick={onDbCard(fn, fIndex)}
                className="hvr-overline-from-center"
                key={fn.name}
                title={fn.name}
                extra={renderCardMore(onClickCardAction, fn)}
              >
                <CodeEditor
                  height={150}
                  width={'100%'}
                  value={fn.body}
                  options={{
                    readOnly: true,
                    minimap: {
                      enabled: false
                    }
                  }}
                />
              </Card>
            );
          })}
        </StyledCardWrap>
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
          <Popover
            content={sortContent}
            title="点击排序，再点逆序"
            trigger="hover"
          >
            <Button icon="bars">排序</Button>
          </Popover>
          <Button onClick={onClickBtn(EOperationType.ADD)} icon="plus-square-o">
            新增
          </Button>
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
          width: (styles.container.width as number) - 100,
          height: styles.container.height,
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
