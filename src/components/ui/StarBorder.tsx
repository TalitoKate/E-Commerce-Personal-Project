import React from "react";

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties["animationDuration"];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = "button",>({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 2,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...(rest as any)}
      style={{
        ...(rest as any).style,
        // a tiny padding so the glowing layer can peek out
        padding: `${thickness}px`,
      background: "rgba(0,0,0,0.7)",
      }}
    >
      {/* bottom glow */}
      <div
        className="pointer-events-none absolute inset-x-[-40%] bottom-[-30%] h-[60%] opacity-80 rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 60%)`,
          animationDuration: speed,
        }}
      />

      {/* top glow */}
      <div
        className="pointer-events-none absolute inset-x-[-40%] top-[-30%] h-[60%] opacity-80 rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 60%)`,
          animationDuration: speed,
        }}
      />

      {/* content */}
      <div className="relative z-10 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[16px]">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
