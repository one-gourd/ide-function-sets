import React, { useCallback } from 'react';
import { Button, Row, Col, Input, Card, Icon, Popover } from 'antd';
import { IBaseTheme, IBaseComponentProps } from 'ide-lib-base-component';
import { TComponentCurrying } from 'ide-lib-engine';

import { CodeEditor } from 'ide-code-editor';

import { StyledContainer, StyledCardWrap } from './styles';
import { ISubProps } from './subs';

import { OperationPanel, EOperationType } from './mods/OperationPanel';

const Search = Input.Search;

// TODO: 可以查看所有函数的编辑器（readonly）

export interface IFunctionSetsEvent {
  /**
   * 点击回调函数
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// export interface IFunctionSetsStyles extends IBaseStyles {
//   container?: React.CSSProperties;
// }

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
   * 函数对象映射表
   */
  fnList?: IFunctionListItem[];
}

export const DEFAULT_PROPS: IFunctionSetsProps = {
  visible: true,
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

export const FunctionSetsCurrying: TComponentCurrying<
  IFunctionSetsProps,
  ISubProps
> = subComponents => props => {
  const { headerBar, visible, text, styles, onClick, fnList } = props;

  const { HeaderBar } = subComponents as Record<
    string,
    React.FunctionComponent<typeof props>
  >;

  const onClickButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick && onClick(e);
    },
    [onClick]
  );

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

  return (
    <StyledContainer
      style={styles.container}
      visible={visible}
      // ref={this.root}
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
          <Button icon="plus-square-o">新增</Button>
          <Button icon="eye-o">查看所有</Button>
        </Col>
      </Row>

      <OperationPanel
        width={styles.container.width as number - 100}
        height={styles.container.height as number}
        type={EOperationType.ADD}
      />
      {/* <Button onClick={onClickButton}>{text || '点我试试'}</Button>
      <HeaderBar {...headerBar} /> */}
    </StyledContainer>
  );
};
