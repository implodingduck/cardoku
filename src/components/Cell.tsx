export default function Cell({
  color,
  revealed,
  isCar,
  carImg,
  onClick,
}: {
  color: string;
  revealed: boolean;
  isCar: boolean;
  carImg?: string;
  onClick?: () => void;
}) {
  const bgStyle: any = isCar && revealed
    ? { background: '#ffffff', border: 'none', boxShadow: 'none' }
    : { background: color };

  return (
    <button
      className="cell"
      onClick={onClick}
      style={{ ...bgStyle }}
      aria-pressed={revealed}
    >
      {revealed ? (
        isCar ? (
          carImg ? (
            <img
              src={carImg}
              alt="car"
              className="car-img"
              style={{ width: '92%', height: '92%', objectFit: 'contain', transform: 'scale(1.02)', background: '#fff' }}
            />
          ) : (
            <span className="car" role="img" aria-label="car">🚗</span>
          )
        ) : (
          <span className="miss">X</span>
        )
      ) : null}
    </button>
  );
}
