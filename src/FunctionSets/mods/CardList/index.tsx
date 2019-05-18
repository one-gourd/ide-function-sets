import React, { useCallback, useReducer, useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Input,
  message,
  Menu,
  Dropdown,
  Tooltip,
  Icon,
  Card
} from 'antd';
import { observer } from 'mobx-react-lite';
import { CodeEditor } from 'ide-code-editor';

import {StyledCardWrap} from './styles';

import { IFunctionListItem, IFunctionSetsProps } from '../../index';
import { isValidFunctionName } from '../../../lib/util';
import { debugMini } from '../../../lib/debug';

export interface ICardListProps {
  /**
   * 容器高度
   */
  height?: number;

  /**
   * 函数对象映射表
   */
  fnList?: IFunctionSetsProps['fnList'];

  /**
   * 双击卡片的功能
   */
  onDbFnCard?: IFunctionSetsProps['onDbFnCard'];

  /**
   * 函数卡片的操作
   */
  onCardAction?: IFunctionSetsProps['onCardAction'];
}

// 枚举值：函数 card 操作类型
export enum ECardActionType {
  RENAME = 'rename', // 重命名
  DEL = 'del' // 删除函数
}

// 函数 card 上的 “更多” 组件
// TODO: 将 card 提取成单个组件
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
        <Tooltip placement="top" title="删除操作不可恢复，请谨慎操作">
          <Button
            onClick={onClickItem(ECardActionType.DEL, fnItem)}
            style={{ width: '100%' }}
            type="danger"
          >
            删除
          </Button>
        </Tooltip>
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

interface IReducerState {
  modalVisible: boolean;
  currentFnItem: IFunctionListItem;
  newName: string;
}

enum EReducerType {
  // 重命名操作
  RENAME = 'rename'
}

const stateReducer = (
  state: IReducerState,
  [type, payload]: [EReducerType, Partial<IReducerState>]
) => {
  debugMini(`[状态 reduce] type: ${type}, payload: %o`, payload);
  switch (type) {
    // 函数操作面板
    case EReducerType.RENAME:
      return {
        ...state,
        ...payload
      };
  }

  return state;
};

export const CardList: React.FunctionComponent<ICardListProps> = observer(
  props => {
    const { height, fnList, onDbFnCard, onCardAction } = props;

    const [state, dispatch] = useReducer(stateReducer, {
      modalVisible: false,
      currentFnItem: {
        name: '',
        body: ''
      },
      newName: ''
    });

    // 点击函数 card 上的更多操作
    const onClickCardAction = useCallback(
      (type: ECardActionType, fnItem: IFunctionListItem) => () => {
        // 如果是重命名的操作，需要特殊处理
        if (type === ECardActionType.RENAME) {
          dispatch([
            EReducerType.RENAME,
            { modalVisible: true, currentFnItem: fnItem, newName: '' }
          ]);
        } else {
          onCardAction && onCardAction(type, fnItem);
        }
      },
      [onCardAction]
    );

    // 双击函数卡片，弹出编辑框
    const onDbCard = useCallback(
      (fn: IFunctionListItem, fIndex: number) => () => {
        onDbFnCard && onDbFnCard(fn, fIndex);
      },
      [onDbFnCard]
    );

    const handleNewNameChange = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch([EReducerType.RENAME, { newName: e.target.value }]);
      },
      []
    );

    const handleRename = useCallback(
      (
        fnItem: IFunctionListItem,
        newName: string,
        isCancel?: boolean
      ) => () => {
        if (isCancel) {
          dispatch([EReducerType.RENAME, { modalVisible: false }]);
          return;
        }

        // 进行初步合法性校验
        // 非空
        if (!newName) {
          message.error('函数名不能为空');
          return;
        }

        if (!isValidFunctionName(newName)) {
          message.error(`字符串 ${newName} 不是合法函数名，请修改`);
          return;
        }

        // 进行一些最基本的校验
        dispatch([EReducerType.RENAME, { modalVisible: false }]);

        // 真正调用方法
        onCardAction && onCardAction(ECardActionType.RENAME, fnItem, newName);
      },
      []
    );

    return (
      <StyledCardWrap
        style={{ height: `calc(${height}px - 60px)` }}
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

        <Modal
          title="函数重命名"
          visible={state.modalVisible}
          onOk={handleRename(state.currentFnItem, state.newName)}
          onCancel={handleRename(state.currentFnItem, state.newName, true)}
        >
          <Input
            style={{ marginBottom: '10px' }}
            addonBefore="原函数名:"
            value={state.currentFnItem.name}
            readOnly
          />

          <Input
            onChange={handleNewNameChange}
            addonBefore="新函数名:"
            placeholder="请输入新函数名"
          />
        </Modal>
      </StyledCardWrap>
    );
  }
);
