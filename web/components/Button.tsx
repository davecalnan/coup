import { HTMLProps } from "react";
import classNames from "classnames";

export type ButtonProps = {
  primary?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
} & HTMLProps<HTMLButtonElement>;

const determineStyleClassNames = ({
  disabled,
  primary,
  destructive,
}: Pick<ButtonProps, "disabled" | "primary" | "destructive">) => {
  if (disabled) return "bg-gray-100 text-black";
  if (primary) return "bg-indigo-500 text-white";
  if (destructive) return "bg-red-500 text-white";
  return "bg-white text-black";
};

export const Button = ({
  primary,
  destructive,
  children,
  className,
  ...props
}: ButtonProps) => (
  <button
    className={classNames(
      "px-3 py-2 rounded shadow",
      determineStyleClassNames({
        disabled: props.disabled,
        primary,
        destructive,
      }),
      className
    )}
    {...props}
  >
    {children}
  </button>
);
