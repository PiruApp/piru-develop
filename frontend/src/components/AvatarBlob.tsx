const PALETAS = [
  ["#B84A39", "#D4725F"],
  ["#2D3142", "#4A5068"],
  ["#E09F3E", "#EBB965"],
  ["#6C665F", "#8A847D"],
  ["#5B7F4A", "#7DA06B"],
  ["#8B5E3C", "#AB7E5C"],
  ["#7B6B8A", "#9B8BAA"],
  ["#4A7B7B", "#6A9B9B"],
];

function hashNombre(nombre: string): number {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = ((h << 5) - h + nombre.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  return (nombre[0] ?? "?").toUpperCase();
}

const BLOBS = [
  "M44.5,24.2C47.3,30.8,42.9,40.1,35.9,44.4C28.9,48.7,19.3,47.9,13.1,43C6.9,38.1,4.1,29.1,6.3,21.8C8.5,14.5,15.7,8.9,23.5,6.5C31.3,4.1,39.7,4.9,44.1,10.4C48.5,15.9,41.7,17.6,44.5,24.2Z",
  "M42.1,26.5C44.2,33.2,39.8,41.3,33.1,45.1C26.4,48.9,17.4,48.4,11.5,43.6C5.6,38.8,2.8,29.7,5.5,22.6C8.2,15.5,16.4,10.4,24.1,8.1C31.8,5.8,38.9,6.3,42.5,11.5C46.1,16.7,40,19.8,42.1,26.5Z",
  "M43.8,25.1C46.5,31.6,41.2,40.5,34,44.6C26.8,48.7,17.7,47.9,11.9,43C6.1,38.1,3.6,29.1,6.4,22C9.2,14.9,17.3,9.7,25,7.5C32.7,5.3,40,6.1,43.4,11.4C46.8,16.7,41.1,18.6,43.8,25.1Z",
];

export function AvatarBlob({ nombre, size = 36 }: { nombre: string; size?: number }) {
  const h = hashNombre(nombre);
  const [bg, fg] = PALETAS[h % PALETAS.length];
  const blob = BLOBS[h % BLOBS.length];
  const letras = iniciales(nombre);
  const fontSize = size * 0.38;

  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="shrink-0">
      <defs>
        <linearGradient id={`av-${h}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={fg} />
        </linearGradient>
      </defs>
      <path d={blob} fill={`url(#av-${h})`} />
      <text x="25" y="25" textAnchor="middle" dominantBaseline="central"
        fill="white" fontWeight="700" fontSize={fontSize} fontFamily="inherit">
        {letras}
      </text>
    </svg>
  );
}
