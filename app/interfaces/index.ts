import type { ReactElement, SVGProps } from 'react';
import { Edge, Size, Type, Variant } from "./common";


export interface ButtonProps {
  children?: React.ReactNode;
  size?: Size;
  variant?: Variant;
  text?: string;
  type?: Type;
  edge?: Edge;
  onClick?: () => void;
  icon?: ReactElement<SVGProps<SVGSVGElement>> | null;
  disabled?: boolean;
  loading?: boolean;
};

export interface LoadingProps {
  size?: Size;
  variant?: Variant;
};

