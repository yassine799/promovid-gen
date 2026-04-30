// Form — left-side control panel

const { useRef, useState, useEffect } = React;

const DEFAULT_FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif", weight: 'Black 900', tag: 'sans' },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", weight: 'Bold 700', tag: 'sans' },
  { name: 'Archivo Black', family: "'Archivo Black', sans-serif", weight: 'Black 900', tag: 'display' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", weight: 'Regular 400', tag: 'display' },
  { name: 'Anton', family: "'Anton', sans-serif", weight: 'Regular 400', tag: 'display' },
  { name: 'Space Mono', family: "'Space Mono', monospace", weight: 'Bold 700', tag: 'mono' },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", weight: 'Medium 500', tag: 'mono' },
];

const PRESETS = [
  { id: 'huge-center', label: 'Huge Center' },
  { id: 'top-bottom', label: 'Top + Bottom' },
  { id: 'stacked-bl', label: 'Stack BL' },
  { id: 'side-vert', label: 'Vertical' },
  { id: 'corner-tags', label: 'Corners' },
];

const Form = ({ state, setState }) => {
  const videoInputRef = useRef();
  const logoInputRef = useRef();
  const fontInputRef = useRef();
  const [hotDrop, setHotDrop] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);

  const onVideoFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      setState(s => ({
        ...s,
        video: { url, name: file.name, w: v.videoWidth, h: v.videoHeight, duration: v.duration, size: file.size },
      }));
    };
  };

  const onLogoFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setState(s => ({ ...s, data: { ...s.data, logoUrl: url, logoName: file.name } }));
  };

  const onFontFile = (file) => {
    if (!file) return;
    const fontName = file.name.replace(/\.(ttf|otf|woff2?)$/i, '');
    const url = URL.createObjectURL(file);
    const ff = new FontFace(fontName, `url(${url})`);
    ff.load().then(loaded => {
      document.fonts.add(loaded);
      const entry = { name: fontName, family: `'${fontName}', sans-serif`, weight: 'Custom', tag: 'custom' };
      setCustomFonts(cf => [...cf, entry]);
      setState(s => ({ ...s, fontFamily: entry.family, fontName: entry.name }));
    });
  };

  const fonts = [...DEFAULT_FONTS, ...customFonts];

  const fmtBytes = (n) => {
    if (!n) return '—';
    const mb = n / 1024 / 1024;
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(n/1024).toFixed(0)} KB`;
  };

  return (
    <aside className="panel">
      {/* Source */}
      <div className="section">
        <div className="section-head">
          <div className="label">Source</div>
          <div className="count">01</div>
        </div>
        {!state.video ? (
          <label
            className={`drop ${hotDrop ? 'hot' : ''}`}
            onDragOver={e => { e.preventDefault(); setHotDrop(true); }}
            onDragLeave={() => setHotDrop(false)}
            onDrop={e => {
              e.preventDefault(); setHotDrop(false);
              const f = e.dataTransfer.files?.[0];
              if (f && f.type.startsWith('video/')) onVideoFile(f);
            }}
          >
            <input ref={videoInputRef} type="file" accept="video/*" className="file-input"
              onChange={e => onVideoFile(e.target.files?.[0])} />
            <div className="ico"><Icon name="video" size={28} stroke={1.3} /></div>
            <div className="ttl">Drop a vertical clip</div>
            <div className="sub">MP4 · MOV · WEBM · 9:16 recommended</div>
          </label>
        ) : (
          <div className="video-chip">
            <video className="thumb" src={state.video.url} muted />
            <div className="meta">
              <div className="name">{state.video.name}</div>
              <div className="dim">{state.video.w}×{state.video.h} · {state.video.duration ? state.video.duration.toFixed(1) : '—'}s · {fmtBytes(state.video.size)}</div>
            </div>
            <button className="x" onClick={() => setState(s => ({ ...s, video: null }))}>
              <Icon name="x" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Event */}
      <div className="section">
        <div className="section-head">
          <div className="label">Event</div>
          <div className="count">02</div>
        </div>

        <div className="field">
          <label>Artist name</label>
          <input className="input" placeholder="e.g. AMELIE LENS"
            value={state.data.artistName}
            onChange={e => setState(s => ({ ...s, data: { ...s.data, artistName: e.target.value } }))} />
        </div>

        <div className="field">
          <label>Logo <span className="opt">(optional)</span></label>
          {!state.data.logoUrl ? (
            <label className="drop" style={{ padding: 12 }}>
              <input ref={logoInputRef} type="file" accept="image/*" className="file-input"
                onChange={e => onLogoFile(e.target.files?.[0])} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Icon name="image" size={16} />
                <span className="sub" style={{ fontSize: 11.5 }}>Upload PNG / SVG (transparent bg)</span>
              </div>
            </label>
          ) : (
            <div className="logo-chip">
              <img src={state.data.logoUrl} alt="" />
              <div className="meta">
                <div className="name" style={{ fontSize: 12 }}>{state.data.logoName}</div>
                <div className="dim">Whitened on overlay</div>
              </div>
              <button className="x" onClick={() => setState(s => ({ ...s, data: { ...s.data, logoUrl: null, logoName: null }}))}>
                <Icon name="x" size={13} />
              </button>
            </div>
          )}

          {state.data.logoUrl && (
            <div style={{ marginTop: 8 }}>
              <div className="seg">
                {['text','logo','both'].map(m => (
                  <button key={m} className={state.data.logoMode === m ? 'on' : ''}
                    onClick={() => setState(s => ({ ...s, data: { ...s.data, logoMode: m }}))}>
                    {m === 'text' ? 'Name' : m === 'logo' ? 'Logo' : 'Both'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>Venue / Location</label>
          <input className="input" placeholder="e.g. PRINTWORKS · LONDON"
            value={state.data.venue}
            onChange={e => setState(s => ({ ...s, data: { ...s.data, venue: e.target.value }}))} />
        </div>

        <div className="row-2-sm">
          <div className="field">
            <label>Date</label>
            <input className="input" type="date"
              value={state.data.date}
              onChange={e => setState(s => ({ ...s, data: { ...s.data, date: e.target.value }}))} />
          </div>
          <div className="field">
            <label>Time <span className="opt">opt</span></label>
            <input className="input" placeholder="22:00" maxLength={5}
              value={state.data.time}
              onChange={e => setState(s => ({ ...s, data: { ...s.data, time: e.target.value }}))} />
          </div>
        </div>

        <div className="field">
          <label>Call to action <span className="opt">optional</span></label>
          <input className="input" placeholder="TICKETS VIA RA"
            value={state.data.cta}
            onChange={e => setState(s => ({ ...s, data: { ...s.data, cta: e.target.value }}))} />
        </div>
      </div>

      {/* Layout */}
      <div className="section">
        <div className="section-head">
          <div className="label">Layout</div>
          <div className="count">03</div>
        </div>
        <div className="preset-grid">
          {PRESETS.map(p => (
            <button key={p.id}
              className={`preset ${state.preset === p.id ? 'on' : ''}`}
              onClick={() => setState(s => ({ ...s, preset: p.id }))}>
              <PresetThumb preset={p.id} />
              <div className="lbl">{p.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="section">
        <div className="section-head">
          <div className="label">Typography</div>
          <div className="count">04</div>
        </div>

        {/* Headlines */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Headline</div>
          <div className="font-list">
            {fonts.map(f => (
              <div key={f.name} className={`font-opt ${state.fontFamily === f.family ? 'on' : ''}`}
                style={{ fontFamily: f.family }}
                onClick={() => setState(s => ({ ...s, fontFamily: f.family, fontName: f.name }))}>
                <span>{f.name}</span>
                <span className="fm">{f.weight}</span>
              </div>
            ))}
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Scale <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-4)', fontSize: 10.5 }}>{Math.round(state.fontScale * 100)}%</span></label>
            <div className="slider-row">
              <input type="range" min="0.7" max="1.4" step="0.02"
                value={state.fontScale}
                onChange={e => setState(s => ({ ...s, fontScale: parseFloat(e.target.value) }))} />
              <div className="val">{state.fontScale.toFixed(2)}×</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Body</div>
          <div className="font-list">
            {fonts.map(f => (
              <div key={f.name} className={`font-opt ${state.bodyFontFamily === f.family ? 'on' : ''}`}
                style={{ fontFamily: f.family }}
                onClick={() => setState(s => ({ ...s, bodyFontFamily: f.family, bodyFontName: f.name }))}>
                <span>{f.name}</span>
                <span className="fm">{f.weight}</span>
              </div>
            ))}
          </div>
        </div>

        <label className="btn sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
          <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="file-input"
            onChange={e => onFontFile(e.target.files?.[0])} />
          <Icon name="upload" size={12} />
          <span>Upload custom font</span>
        </label>
      </div>
    </aside>
  );
};

window.Form = Form;
