import { Card } from 'antd';
import styled from 'styled-components';
// import { desaturate } from 'polished';
import { IBaseStyledProps } from 'ide-lib-base-component';
import { IFunctionSetsProps } from './index';

interface IStyledProps extends IFunctionSetsProps, IBaseStyledProps {}

export const StyledContainer = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  position: relative;
  display: ${(props: IStyledProps) => (props.visible ? 'block' : 'none')};
  border-radius: 5px;
  background: ${(props: IStyledProps) => props.theme.main};
  width: 100%;
  padding: 10px;
`;

export const StyledCardWrap = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  overflow-y: scroll;
  .ant-card {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 10px;
    cursor: pointer;
  }
`;
