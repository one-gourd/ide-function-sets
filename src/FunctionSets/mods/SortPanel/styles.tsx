import styled from 'styled-components';
// import { desaturate } from 'polished';
import { IBaseStyledProps } from 'ide-lib-base-component';
import { ISortPanelProps } from './index';

interface IStyledProps extends ISortPanelProps, IBaseStyledProps {}

export const StyledSortPanelWrap = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  overflow-y: scroll;
`;

export const StyledSortItemWrap = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  width: 100%;
  height: 40px;
  line-height: 40px;
  cursor: pointer;

  // 防止双击选中文字
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  -ms-user-select: none;
`;
