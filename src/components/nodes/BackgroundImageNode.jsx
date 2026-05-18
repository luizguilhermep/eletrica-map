export default function BackgroundImageNode({ data }) {
  return (
    <img
      src={data.src}
      alt="Planta baixa"
      draggable={false}
      style={{ display: 'block', userSelect: 'none', maxWidth: 'none', opacity: 0.65 }}
    />
  )
}
