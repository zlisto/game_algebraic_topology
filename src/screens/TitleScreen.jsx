export default function TitleScreen({ concept, onNewGame }) {
  const story = concept?.story || {}
  const title = story.title || 'Winding World'
  const tagline = story.tagline || "Shape can change. Topology can't."
  const cover = `${import.meta.env.BASE_URL}assets/cover.png`

  return (
    <div
      className="title-screen"
      style={{ backgroundImage: `url(${cover})` }}
    >
      <div className="title-card">
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={onNewGame}>
            New Game
          </button>
          <button type="button" className="btn" disabled title="Coming soon">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
