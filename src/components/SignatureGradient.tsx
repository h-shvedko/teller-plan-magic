import React from "react";

/*****
 SignatureGradient
 A lightweight component that adds a pointer-reactive radial gradient using CSS variables.
*****/

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const SignatureGradient: React.FC<Props> = ({ className, children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background:
          "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--brand) / 0.12), transparent 60%)",
      }}
    >
      {children}
    </div>
  );
};

export default SignatureGradient;
