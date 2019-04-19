import React, { useCallback, useRef, useReducer, useEffect } from 'react';
import { Button, Row, Col, Input, Card, Icon, Popover, message } from 'antd';
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
import { debugMini } from '../lib/debug';

import { OperationPanel, EOperationType } from './mods/OperationPanel';

const Search = Input.Search;

const OperationPanelWithClickOutside = withClickOutside(OperationPanel);

const TPL_FN = `function handler(ev){

}`;

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
   * 文案
   */
  text?: string;


  /**
   * 当前被选中的函数名
   */
  fnName?: string;

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
  headerBar: {
    buttons: [
      {
        id: 'edit',
        title: '编辑',
        icon: 'edit'
      }
    ]
  },
  styles: {
    container: {
      height: 800,
      width: 1060
    }
  },
  fnList: []
};

interface IReducerState {
  operationType: EOperationType;
  panelVisible: boolean;
  fnList: IFunctionListItem[];
  fnName: string; // 要更改的函数名
}

enum EReducerType {
  // 有关操作面板的
  OPERATION_PANEL = 'operation_panel'
}

const stateReducer = (
  state: IReducerState,
  [type, payload]: [EReducerType, Partial<IReducerState>]
) => {
  debugMini(`[状态 reduce] type: ${type}, payload: %o`, payload);
  switch (type) {
    // 函数操作面板
    case EReducerType.OPERATION_PANEL:
      return {
        ...state,
        ...payload
      };
  }

  return state;
};

/**
 * 根据函数名获取函数体
 */
function getFnBodyByName(fnName: string, fnList: IFunctionListItem[]) {
  let targetBody = '';
  [].concat(fnList || []).some((fnItem: IFunctionListItem) => {
    if (fnItem.name === fnName) {
      targetBody = fnItem.body;
      return true;
    }
    return false;
  });

  return targetBody;
}

export const FunctionSetsCurrying: TComponentCurrying<
  IFunctionSetsProps,
  ISubProps
> = subComponents => props => {
  const {
    headerBar,
    visible,
    text,
    styles,
    fnList,
    operationType,
    onFnListChange,
    fnName,
    panelVisible
  } = props;

  const { HeaderBar } = subComponents as Record<
    string,
    React.FunctionComponent<typeof props>
  >;

  const refContainer = useRef(null);
  const containerArea = useSizeArea(refContainer);
  const [state, dispatch] = useReducer(stateReducer, {
    panelVisible: panelVisible,
    operationType: operationType,
    fnList: fnList,
    fnName: fnName
  });

  // 响应 props 属性的变更
  useEffect(() => {
    dispatch([EReducerType.OPERATION_PANEL, { panelVisible }]);
  }, [panelVisible]);

  useEffect(() => {
    dispatch([EReducerType.OPERATION_PANEL, { operationType }]);
  }, [operationType]);

  useEffect(() => {
    dispatch([EReducerType.OPERATION_PANEL, { fnName }]);
  }, [fnName]);


  /* ----------------------------------------------------
    回调函数部分
----------------------------------------------------- */

  const onClickPanelOutside = useCallback(
    (e: MouseEvent, isOutSide: boolean, detail: { [key: string]: boolean }) => {
      console.log('探测是否点在蒙层外:', isOutSide, detail);
      dispatch([EReducerType.OPERATION_PANEL, { panelVisible: false }]);
    },
    []
  );

  // "新增函数" 按钮回调
  const onClickBtnAdd = useCallback(() => {
    dispatch([
      EReducerType.OPERATION_PANEL,
      {
        operationType: EOperationType.ADD,
        panelVisible: true,
        fnName: ''
      }
    ]);
  }, []);

  // 操作面板上的 “确定” 按钮
  const onSubmitPanel = useCallback(
    (id: string, value: string, type: EOperationType) => {
      // 调整函数更改
      // dispatch([EReducerType.FN_LIST, { fnList: fnList }]);
      // 默认自动关闭弹层
      let autoHide = true;

      // 如果存在回调函数，则使用回调函数来控制弹层是否自动关闭
      if (onFnListChange) {
        autoHide = onFnListChange(
          type,
          {
            name: id,
            body: value
          },
          fnList
        );
      }

      if (autoHide) {
        dispatch([EReducerType.OPERATION_PANEL, { panelVisible: false }]);
      }
    },
    [onFnListChange]
  );

  const onCancelPanel = useCallback((type: EOperationType) => {
    // 关闭弹层
    dispatch([EReducerType.OPERATION_PANEL, { panelVisible: false }]);
  }, []);

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

  // 根据操作类型 & 函数名获取初始化的函数 body
  const fnBody =
    operationType === EOperationType.ADD ? TPL_FN : getFnBodyByName(state.fnName, fnList);

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
          {fnList.map((fn, kIndex) => {
            return (
              <Card
                bodyStyle={{
                  height: 150,
                  padding: 0
                }}
                className="hvr-overline-from-center"
                key={fn.name}
                title={fn.name}
                extra={<a href="#">More</a>}
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
            placeholder="输入函数名"
            style={{ width: '100%' }}
            onSearch={value => console.log(value)}
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
          <Button onClick={onClickBtnAdd} icon="plus-square-o">
            新增
          </Button>
          <Button icon="eye-o">查看所有</Button>
        </Col>
      </Row>

      <OperationPanelWithClickOutside
        onClick={onClickPanelOutside}
        visible={state.panelVisible}
        autoHide={false}
        layerArea={containerArea}
        bgColor={'rgba(0,0,0, 0.2)'}
        contentProps={{
          width: (styles.container.width as number) - 100,
          height: styles.container.height,
          type: state.operationType,
          visible: state.panelVisible,
          name: state.fnName,
          value: fnBody,
          onSubmit: onSubmitPanel,
          onCancel: onCancelPanel
        }}
      />
      {/* <Button onClick={onClickButton}>{text || '点我试试'}</Button>
      <HeaderBar {...headerBar} /> */}
    </StyledContainer>
  );
};
