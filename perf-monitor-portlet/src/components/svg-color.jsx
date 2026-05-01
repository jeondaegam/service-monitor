export function SvgColor({ src, sx }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        display: "inline-block",
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        backgroundColor: "currentColor",
        ...sx,
      }}
    />
  );
}
