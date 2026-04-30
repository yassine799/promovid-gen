// App — root, top bar, state

const { useState: useStateA, useEffect: useEffectA } = React;

const INITIAL = {
  video: null,
  data: {
    artistName: 'AMELIE LENS',
    logoUrl: null,
    logoName: null,
    logoMode: 'text',
    venue: 'PRINTWORKS · LONDON',
    date: '2026-06-14',
    time: '22:00',
    cta: 'TICKETS VIA RA',
  },
  preset: 'huge-center',
  fontFamily: "'Archivo Black', sans-serif",
  fontName: 'Archivo Black',
  fontScale: 1.0,
  aspect: '9:16',
  showSafeZone: true,
  animate: true,
};

const App = () => {
  const [state, setState] = useStateA(() => {
    try {
      const saved = localStorage.getItem('promo-state-v1');
      if (saved) {
        const p = JSON.parse(saved);
        return { ...INITIAL, ...p, video: null };
      }
    } catch {}
    return INITIAL;
  });
  const [showExport, setShowExport] = useStateA(false);

  useEffectA(() => {
    const toSave = { ...state, video: null, data: { ...state.data, logoUrl: null } };
    try { localStorage.setItem('promo-state-v1', JSON.stringify(toSave)); } catch {}
  }, [state]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="assets/logo.png" alt="" />
          <span>promovid-gen</span>
          <span className="crumbs">
            <span>·</span>
            <b>Untitled session</b>
          </span>
        </div>
        <div className="crumbs" style={{ marginLeft: 'auto' }}>
          <span className="tag">9:16 · 30 fps</span>
          <span className="tag">Safe-zone 4:5</span>
        </div>
        <div className="tb-right">
          <button className="btn ghost sm">
            <Icon name="sparkle" size={12} />
            <span>Shortcuts</span>
            <span className="kbd">?</span>
          </button>
          <button className="btn primary sm"
            disabled={!state.video}
            onClick={() => setShowExport(true)}>
            <Icon name="download" size={12} />
            <span>Export</span>
          </button>
        </div>
      </header>

      <Form state={state} setState={setState} />
      <Preview state={state} setState={setState} onExport={() => setShowExport(true)} />

      {showExport && <ExportModal state={state} onClose={() => setShowExport(false)} />}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
