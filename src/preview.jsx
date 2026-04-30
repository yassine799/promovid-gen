// Preview — right stage with 9:16 canvas, safe-zone, playback
const { useRef: useRefP, useState: useStateP, useEffect: useEffectP } = React;

const Preview = ({ state, setState, onExport }) => {
  const videoRef = useRefP(null);
  const [playing, setPlaying] = useStateP(false);
  const [time, setTime] = useStateP(0);
  const [duration, setDuration] = useStateP(0);

  useEffectP(() => {
    const v = videoRef.current;
    if (!v) return;
    const onT = () => setTime(v.currentTime);
    const onD = () => setDuration(v.duration);
    const onE = () => setPlaying(false);
    v.addEventListener('timeupdate', onT);
    v.addEventListener('loadedmetadata', onD);
    v.addEventListener('ended', onE);
    return () => {
      v.removeEventListener('timeupdate', onT);
      v.removeEventListener('loadedmetadata', onD);
      v.removeEventListener('ended', onE);
    };
  }, [state.video?.url]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const scrub = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
    setTime(v.currentTime);
  };

  const fmtT = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <main className="stage">
      <div className="stage-top">
        <div className="stage-info">
          <span><b>{state.video ? `${state.video.w}×${state.video.h}` : 'No source'}</b></span>
          <span>{state.preset.toUpperCase()}</span>
          <span>{state.fontName}</span>
        </div>
        <div className="float-tool">
          <button className={state.aspect === '9:16' ? 'on' : ''}
            onClick={() => setState(s => ({ ...s, aspect: '9:16' }))}>9:16</button>
          <button className={state.aspect === '4:5' ? 'on' : ''}
            onClick={() => setState(s => ({ ...s, aspect: '4:5' }))}>4:5</button>
          <div style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />
          <button className={state.showSafeZone ? 'on' : ''}
            onClick={() => setState(s => ({ ...s, showSafeZone: !s.showSafeZone }))}>
            <Icon name="crop" size={11} />
            <span>Safe</span>
          </button>
        </div>
      </div>

      <div className="stage-body">
        <div className={`canvas-wrap ${state.aspect === '4:5' ? 'r45' : ''}`}>
          <div className="canvas-inner">
            {state.video ? (
              <video ref={videoRef} src={state.video.url} playsInline loop muted={false} />
            ) : (
              <div className="placeholder-bg">
                <div>
                  <div style={{ fontSize: 22, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--sans)', fontWeight: 600 }}>
                    DROP A VIDEO TO BEGIN
                  </div>
                  <div>9:16 · vertical · HD</div>
                </div>
              </div>
            )}

            <Overlay
              preset={state.preset}
              data={state.data}
              fontFamily={state.fontFamily}
              bodyFontFamily={state.bodyFontFamily}
              fontScale={state.fontScale}
              animate={state.animate}
            />

            {state.showSafeZone && state.aspect === '9:16' && (
              <div className="safe-zone">
                <div className="frame" />
                <div className="badge">4:5 Crop-safe</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stage-bottom">
        <button className="play-btn" onClick={toggle} disabled={!state.video}>
          <Icon name={playing ? 'pause' : 'play'} size={14} />
        </button>
        <div className="scrub-wrap">
          <div className="scrub" onClick={scrub}>
            <div className="fill" style={{ width: `${pct}%` }} />
            <div className="thumb" style={{ left: `${pct}%` }} />
          </div>
          <div className="scrub-meta">
            <span>{fmtT(time)}</span>
            <span>{fmtT(duration)}</span>
          </div>
        </div>
        <button className="btn primary" onClick={onExport} disabled={!state.video}>
          <Icon name="download" size={12} />
          <span>Render video</span>
        </button>
      </div>
    </main>
  );
};

window.Preview = Preview;
