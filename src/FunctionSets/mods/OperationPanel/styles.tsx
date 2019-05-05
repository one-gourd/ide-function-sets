import styled from 'styled-components';
// import { desaturate } from 'polished';
import { IBaseStyledProps } from 'ide-lib-base-component';
import { IOperationPanelProps, EOperationType } from './index';

interface IStyledProps extends IOperationPanelProps, IBaseStyledProps {}

const colorMap: Record<EOperationType, string> = {
  ADD: '#00a854',
  DEL: '#f04134',
  EDIT: '#108ee9',
  VIEWALL: '#5a5a5a'
};

export const StyledPanelWrap = styled.div<IStyledProps>`
  border: 2px solid ${(props: IStyledProps) => colorMap[props.type]};
  transform: translate(
    ${(props: IStyledProps) => (props.visible ? '0' : '100%')},
    0
  );
  background-color: white;
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
`;

export const StyledPanelHeader = styled.div<IStyledProps>`
  background-color: ${(props: IStyledProps) => colorMap[props.type]};
  color: #fff;
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  padding-left: 6px;
`;
export const StyledPanelBody = styled.div<IStyledProps>`
  padding: 6px 12px 15px 12px;
`;
