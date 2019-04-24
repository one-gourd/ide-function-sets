import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Button,
  message,
  Row,
  Col,
  Input,
  Icon,
  Modal,
  Popover,
  Tooltip
} from 'antd';
import { observer } from 'mobx-react-lite';
import { CodeEditor } from 'ide-code-editor';
import { TAnyFunction } from 'ide-lib-base-component';

import { StyledPanelWrap, StyledPanelHeader, StyledPanelBody } from './styles';

import { isValidFunctionName } from '../../../lib/util';
import { REPL } from '../../../lib/repl';

const confirm = Modal.confirm;

// TODO: 全屏功能
// TODO: 函数编辑，可以支持自定义组件功能

/**
 * 函数操作类型
 */
export enum EOperationType {
  ADD = 'ADD', // 新增
  DEL = 'DEL', // 删除
  EDIT = 'EDIT', // 编辑
  VIEWALL = 'VIEWALL' // 查看所有
}

export interface IOperationPanelProps {
  /**
   * 是否最大化
   */
  isMax?: boolean;

  /**
   * 最大化时的宽度，默认是屏幕宽度
   */
  maxWidth?: number;

  /**
   * 最大化时的高度，默认是屏幕高度
   */
  maxHeight?: number;

  /**
   * 容器高度
   */
  height?: number;

  /**
   * 容器宽度
   */
  width?: number;

  /**
   * 当前函数操作面板的类型
   */
  type: EOperationType;

  /**
   * 函数名
   */
  name?: string;

  /**
   * 函数内容
   */
  value?: string;

  /**
   * 是否可见
   */
  visible: boolean;

  /**
   * 点击确认提交（保存/删除）按钮时的回调
   */
  onSubmit?: (id: string, value: string, type: EOperationType) => void;

  /**
   * 点击取消按钮时的回调
   */
  onCancel?: (type: EOperationType) => void;
}

export const defaultProps: Partial<IOperationPanelProps> = {
  isMax: false,
  value: ''
};

/**
 * 确认删除函数的二次弹层
 *
 * @param {string} name - 函数名
 */
function showDeleteConfirm(name: string, onDelete: () => void) {
  confirm({
    title: '确认删除函数?',
    content: `确认删除函数 "${name}" 么？该操作不可恢复，请谨慎操作`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '我在想想',
    onOk() {
      onDelete && onDelete;
    }
  });
}

/**
 * 标题文案映射
 */
const titleTextMap: Record<EOperationType, string> = {
  ADD: '新增函数',
  EDIT: '编辑函数',
  DEL: '删除函数',
  VIEWALL: '查看所有函数'
};

// 渲染底部操作区域
const renderFooter = function(
  type: EOperationType,
  errContent: string,
  onClickSubmit: TAnyFunction,
  onClickCancel: TAnyFunction,
  handleVisibleChange: TAnyFunction
) {
  switch (type) {
    case EOperationType.DEL:
      return (
        <>
          <Tooltip placement="top" title="删除操作不可恢复，请谨慎操作">
            <Button type="danger" onClick={onClickSubmit}>
              确认删除
            </Button>
          </Tooltip>
          <Button onClick={onClickCancel} style={{ marginLeft: 10 }}>
            取消
          </Button>
        </>
      );

    case EOperationType.ADD:
    case EOperationType.EDIT:
      return (
        <>
          <Popover
            content={<pre dangerouslySetInnerHTML={{ __html: errContent }} />}
            title="存在语法错误:"
            trigger="click"
            visible={!!errContent}
            onVisibleChange={handleVisibleChange}
          >
            <Button type="primary" onClick={onClickSubmit}>
              保存
            </Button>
          </Popover>
          <Button onClick={onClickCancel} style={{ marginLeft: 10 }}>
            取消
          </Button>
        </>
      );
    case EOperationType.VIEWALL:
      return (
        <>
          <Button onClick={onClickCancel} style={{ marginLeft: 10 }}>
            取消
          </Button>
        </>
      );
    default:
      return null;
  }
};

export const OperationPanel: React.FunctionComponent<
  IOperationPanelProps
> = observer(props => {
  const mergedProps = Object.assign({}, defaultProps, props);
  const {
    name,
    value,
    type,
    height,
    width,
    visible,
    onSubmit,
    onCancel
  } = mergedProps;

  // const codeBodyRef = useRef(value);

  const [inputName, setInputName] = useState(name);
  const [codeBody, setCodeBody] = useState(value);

  useEffect(() => {
    setInputName(name);
    setCodeBody(value);
  }, [value, name, visible]);

  const [errContent, setErrContent] = useState('');

  const onClickSubmit = useCallback(
    (
      type: EOperationType,
      onSubmit: TAnyFunction,
      inputName: string,
      codeBody: string
    ) => () => {
      // const fnBody = codeBodyRef.current;

      if (!inputName) {
        message.error('函数名不能为空');
        return;
      }

      // 判断函数名是否有效
      if (!isValidFunctionName(inputName)) {
        message.error(`函数名 ${inputName} 不合法，请检查`);
        return;
      }

      // 判断函数是否有错误
      const validationResult = REPL.validateCode(codeBody);
      if (!validationResult.isValid) {
        message.error(`函数 ${inputName} 保存失败`);
        setErrContent(validationResult.message);
        return;
      }

      setErrContent(''); // 置空错误信息

      onSubmit && onSubmit(inputName, codeBody, type);
      // 如果是删除操作，进行二次确认
      // if (type === EOperationType.DEL) {
      //   showDeleteConfirm(inputName, () => {
      //     onSubmit && onSubmit(inputName, codeBody, type);
      //     return;
      //   });
      // } else {
      // }
    },
    []
  );

  const onClickCancel = useCallback(() => {
    onCancel && onCancel(type);
  }, [type, onCancel]);

  const handleInputChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setInputName(e.target.value);
    },
    []
  );

  // 编辑器内容变更的时候
  const onCodeChange = useCallback((value: string) => {
    setCodeBody(value);
    // codeBodyRef.current = value;
  }, []);

  const handleVisibleChange = useCallback(visible => {
    if (!visible) {
      setErrContent('');
    }
  }, []);

  return (
    <StyledPanelWrap
      className="operation-panel-wrap"
      visible={visible}
      style={{ width: width, height: height }}
      type={type}
    >
      <StyledPanelHeader type={type}>
        <span>{titleTextMap[type]}</span>
      </StyledPanelHeader>

      <StyledPanelBody>
        {type !== EOperationType.VIEWALL ? (
          <Row type="flex" align="middle" style={{ marginBottom: 10 }}>
            <Col span={8}>
              <Input
                prefix={<Icon type="file-text" style={{ fontSize: 14 }} />}
                placeholder="函数名"
                disabled={type !== EOperationType.ADD}
                onChange={handleInputChange}
                value={inputName}
              />
            </Col>
            {/* {type === EOperationType.EDIT &&
              ((
                <Col span={8} style={{ marginLeft: 14 }}>
                  <Button type="primary" size="small">
                    编辑
                  </Button>
                </Col>
              ) ||
                null)} */}
          </Row>
        ) : null}

        <Row style={{ marginBottom: 20 }}>
          <Col span={24}>
            <CodeEditor
              options={{
                readOnly:
                  type === EOperationType.DEL || type === EOperationType.VIEWALL
              }}
              height={height! - 160}
              width={'100%'}
              value={codeBody}
              onChange={onCodeChange}
            />
          </Col>
        </Row>

        <Row type="flex" align="middle" justify="center">
          {renderFooter(
            type,
            errContent,
            onClickSubmit(type, onSubmit, inputName, codeBody),
            onClickCancel,
            handleVisibleChange
          )}
        </Row>
      </StyledPanelBody>
    </StyledPanelWrap>
  );
});
