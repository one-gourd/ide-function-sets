import styled from 'styled-components';
// import { desaturate } from 'polished';
import { IBaseStyledProps } from 'ide-lib-base-component';
import { IFunctionSetsProps } from './index';

interface IStyledProps extends IFunctionSetsProps, IBaseStyledProps {}

export const StyledContainer = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {}  // 优先级会高一些，行内样式
})<IStyledProps>`
  display: ${(props: IStyledProps) => (props.visible ? 'block' : 'none')};
  border-radius: 5px;
  background: ${(props: IStyledProps) => props.theme.main};
  width: 100%;
  padding: 10px 20px;
`;

