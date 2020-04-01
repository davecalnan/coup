import React from "react";
import classNames from "classnames";

export type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ title, children, className }: CardProps) => (
  <div className={classNames("bg-white rounded shadow p-4", className)}>
    {title && (
      <h4 className="uppercase tracking-wide font-semibold mb-2">{title}</h4>
    )}
    {children}
  </div>
);
