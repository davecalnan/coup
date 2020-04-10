import classNames from "classnames";

export type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const Layout = ({ children, className }: LayoutProps) => (
  <div className={classNames("min-h-screen h-0 bg-gray-200", className)}>
    {children}
  </div>
);
