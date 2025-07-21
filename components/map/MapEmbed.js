export default function MapEmbed({ lat, lng }) {
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      width="100%"
      height="400"
      src={url}
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    />
  );
}
