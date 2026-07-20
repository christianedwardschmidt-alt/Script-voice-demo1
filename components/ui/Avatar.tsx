interface AvatarProps {
  initials: string;
  accent?: string;
  size?: number;
  fontSize?: number;
}

export function Avatar({ initials, accent = '#3a7dff', size = 44, fontSize }: AvatarProps) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: fontSize ?? Math.round(size * 0.36),
        background: `linear-gradient(135deg, ${accent}, #16294f)`,
      }}
    >
      {initials}
    </div>
  );
}
