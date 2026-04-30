// Export — WebCodecs-based MP4 render + download

const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

// ─── Canvas overlay renderer (same logic as preview) ─────────────────────────

function wrapWords(ctx, text, maxW) {
  const words = text.toUpperCase().split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// logoImg is a pre-whitened canvas/image element, or null
function drawOverlay(ctx, W, H, state, logoImg = null) {
  const { preset, data, fontFamily, bodyFontFamily, fontScale = 1 } = state;
  const { artistName = '', venue = '', date = '', time = '', cta = '', logoMode = 'text' } = data;
  const dateStr = window.formatDate ? window.formatDate(date) : date;
  const timeStr = time || '';

  const safeH = H * 0.703125;
  const safeTop = (H - safeH) / 2;
  const padX = W * 0.05;
  const padY = safeH * 0.04;
  const x0 = padX, x1 = W - padX;
  const innerW = W - 2 * padX;
  const bottom = safeTop + safeH - padY;
  const em = W / 26;

  const displayFamily = (fontFamily.match(/^['"]?([^'"',]+)/) || [])[1]?.trim() || 'sans-serif';

  // Mirror the React ArtistMark logic
  const showLogo = logoImg && (logoMode === 'logo' || logoMode === 'both');
  const showText = !logoImg || logoMode === 'text' || logoMode === 'both';

  ctx.save();
  ctx.fillStyle = '#ffffff';

  const setDisplay = (size) => {
    ctx.font = `900 ${size * fontScale * em}px "${displayFamily}", sans-serif`;
    try { ctx.letterSpacing = '-0.02em'; } catch(e) {}
  };
  const setMono = (size) => {
    const bodyFamily = (bodyFontFamily?.match(/^['"]?([^'"',]+)/) || [])[1]?.trim() || 'JetBrains Mono';
    ctx.font = `500 ${size * em}px "${bodyFamily}", monospace`;
    try { ctx.letterSpacing = '0.12em'; } catch(e) {}
  };

  const fillMeta = (text, x, y, size, align) => {
    if (!text) return size * em * 1.5;
    setMono(size); ctx.textAlign = align; ctx.textBaseline = 'top';
    ctx.fillText(text.toUpperCase(), x, y);
    return size * em * 1.5;
  };

  // Draw logo image, scaled to fit maxH (px), centred on cx or left-aligned at lx
  // Returns the rendered height
  const fillLogo = (cx, y, maxH, maxW, align = 'center') => {
    if (!logoImg) return 0;
    const scale = Math.min(maxH / logoImg.height, maxW / logoImg.width);
    const lw = logoImg.width * scale;
    const lh = logoImg.height * scale;
    const dx = align === 'center' ? cx - lw / 2 : align === 'right' ? cx - lw : cx;
    ctx.drawImage(logoImg, dx, y, lw, lh);
    return lh;
  };

  // Draw artist mark (logo and/or text), returns total height
  const fillArtistMark = (x, y, size, align = 'center') => {
    let totalH = 0;
    const gap = 0.6 * size * em;
    const ax = align === 'center' ? x + innerW / 2 : x;

    if (showLogo) {
      const maxH = safeH * (logoMode === 'logo' ? 28 : 16) * size / 100;
      const maxW = innerW * 0.8;
      totalH += fillLogo(ax, y + totalH, maxH, maxW, align);
      if (showText) totalH += gap;
    }
    if (showText && artistName) {
      setDisplay(size); ctx.textBaseline = 'top';
      const lineH = size * fontScale * em * 0.95;
      const lines = wrapWords(ctx, artistName, innerW * 0.97);
      ctx.textAlign = align;
      lines.forEach((l, i) => ctx.fillText(l, ax, y + totalH + i * lineH));
      totalH += lines.length * lineH;
    }
    return totalH;
  };

  if (preset === 'huge-center') {
    fillMeta(venue, x0, safeTop + padY, 0.85, 'left');
    fillMeta([dateStr, timeStr].filter(Boolean).join(' · '), x1, safeTop + padY, 0.85, 'right');
    // Artist mark vertically centered — measure height first
    const markH = (() => {
      let h = 0;
      if (showLogo) h += safeH * (logoMode === 'logo' ? 28 : 16) * 3.2 / 100;
      if (showLogo && showText) h += 0.6 * 3.2 * em;
      if (showText && artistName) {
        setDisplay(3.2);
        const lh = 3.2 * fontScale * em * 0.95;
        h += wrapWords(ctx, artistName, innerW * 0.97).length * lh;
      }
      return h;
    })();
    fillArtistMark(x0, safeTop + safeH / 2 - markH / 2, 3.2, 'center');
    if (cta) fillMeta(cta, W / 2, bottom - 0.85 * em * 1.2, 0.85, 'center');
  }
  else if (preset === 'top-bottom') {
    fillArtistMark(x0, safeTop + padY, 2.6, 'center');
    const metaLineH = 0.85 * em * 1.5;
    const nMeta = [venue, dateStr, cta].filter(Boolean).length;
    const lineY = bottom - metaLineH * nMeta - 8;
    ctx.fillRect(W * 0.35, lineY, W * 0.30, 1);
    let dy = lineY + 10;
    dy += fillMeta(venue, W / 2, dy, 1.0, 'center');
    dy += fillMeta([dateStr, timeStr].filter(Boolean).join('  ·  '), W / 2, dy, 1.0, 'center');
    if (cta) fillMeta(cta, W / 2, dy, 0.85, 'center');
  }
  else if (preset === 'stacked-bl') {
    const metaLineH = 0.85 * em * 1.45;
    const metas = [venue, dateStr + (timeStr ? `  ·  ${timeStr}` : ''), cta].filter(Boolean);
    let dy = bottom - metas.length * metaLineH;
    metas.forEach(line => { fillMeta(line, x0, dy, 0.85, 'left'); dy += metaLineH; });
    // Measure artist mark height to anchor above meta
    setDisplay(2.4);
    const aLines = showText ? wrapWords(ctx, artistName, innerW * 0.97) : [];
    const logoH = showLogo ? safeH * (logoMode === 'logo' ? 28 : 16) * 2.4 / 100 : 0;
    const textH = aLines.length * 2.4 * fontScale * em * 0.95;
    const markH = logoH + (showLogo && showText ? 0.6 * 2.4 * em : 0) + textH;
    fillArtistMark(x0, bottom - metas.length * metaLineH - 0.9 * em - markH, 2.4, 'left');
  }
  else if (preset === 'side-vert') {
    if (showText && artistName) {
      const fontSize = 2.2 * fontScale * em;
      setDisplay(2.2);
      ctx.save();
      ctx.translate(x0 + fontSize * 0.55, H / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(artistName.toUpperCase(), 0, 0);
      ctx.restore();
    }
    if (showLogo) {
      const maxH = safeH * (logoMode === 'logo' ? 28 : 16) * 2.2 / 100;
      fillLogo(x1, safeTop + padY, maxH, innerW * 0.4, 'right');
    }
    const leftPad = x0 + innerW * 0.14;
    const metaLineH = 0.85 * em * 1.45;
    const metas = [venue, dateStr + (timeStr ? `  ·  ${timeStr}` : ''), cta].filter(Boolean);
    let dy = bottom - metas.length * metaLineH;
    metas.forEach(l => { fillMeta(l, leftPad, dy, 0.85, 'left'); dy += metaLineH; });
  }
  else if (preset === 'corner-tags') {
    if (venue) fillMeta(venue, x0, safeTop + padY, 0.8, 'left');
    if (dateStr) fillMeta(dateStr, x0, safeTop + padY + 0.8 * em * 1.4, 0.8, 'left');
    if (showLogo) {
      const maxH = Math.min(safeH * 8 / 100, 3 * em);
      fillLogo(x1, safeTop + padY, maxH, innerW * 0.3, 'right');
    } else if (timeStr) {
      fillMeta(timeStr, x1, safeTop + padY, 0.8, 'right');
    }
    setDisplay(1.8);
    const aLineH = 1.8 * fontScale * em * 0.95;
    const aLines = showText ? wrapWords(ctx, artistName, innerW * 0.7) : [];
    const aTop = bottom - aLines.length * aLineH;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    aLines.forEach((l, i) => ctx.fillText(l, x0, aTop + i * aLineH));
    if (cta) fillMeta(cta, x1, bottom - 0.8 * em * 1.2, 0.8, 'right');
  }

  ctx.restore();
}

// ─── MP4 export using WebCodecs + mp4-muxer ──────────────────────────────────

async function waitForMp4Muxer() {
  if (window.Mp4Muxer) return window.Mp4Muxer;
  return new Promise(res =>
    window.addEventListener('mp4muxer-ready', () => res(window.Mp4Muxer), { once: true })
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const STEPS = ['Loading video', 'Compositing overlay', 'Encoding frames', 'Writing file'];

const ExportModal = ({ state, onClose }) => {
  const [phase, setPhase] = useStateE('rendering');
  const [prog, setProg] = useStateE(0);
  const [stepIdx, setStepIdx] = useStateE(0);
  const [downloadUrl, setDownloadUrl] = useStateE(null);
  const [errorMsg, setErrorMsg] = useStateE('');
  const cleanupRef = useRefE(null);

  const fname = `${(state.data.artistName || 'promo').toLowerCase().replace(/\s+/g, '-')}_${state.data.date || 'tbd'}_9x16.mp4`;

  useEffectE(() => {
    if (state.video) startRender();
    return () => cleanupRef.current?.();
  }, []);

  const startRender = async () => {
    try {
      if (!window.VideoEncoder) throw new Error('WebCodecs not supported. Please use Chrome 94+ or Edge 94+.');

      const { Muxer, ArrayBufferTarget } = await waitForMp4Muxer();

      await document.fonts.ready;
      setStepIdx(0);

      // Pre-load and whiten logo (brightness(0) invert(1) → all pixels white, alpha preserved)
      let logoImg = null;
      if (state.data.logoUrl) {
        try {
          const img = new Image();
          img.src = state.data.logoUrl;
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
          const tc = document.createElement('canvas');
          tc.width = img.naturalWidth; tc.height = img.naturalHeight;
          const tc2 = tc.getContext('2d');
          tc2.drawImage(img, 0, 0);
          const id = tc2.getImageData(0, 0, tc.width, tc.height);
          for (let i = 0; i < id.data.length; i += 4) {
            id.data[i] = id.data[i + 1] = id.data[i + 2] = 255;
          }
          tc2.putImageData(id, 0, 0);
          logoImg = tc;
        } catch(e) { /* skip logo if load fails */ }
      }

      // Hidden video element for frame capture
      const vid = document.createElement('video');
      vid.src = state.video.url;
      vid.playsInline = true;

      await new Promise((res, rej) => {
        vid.onloadedmetadata = res;
        vid.onerror = () => rej(new Error('Failed to load video'));
        setTimeout(() => rej(new Error('Video load timeout')), 15000);
      });

      const W = vid.videoWidth || 1080;
      const H = vid.videoHeight || 1920;
      const FPS = 30;

      // Canvas for compositing
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Find a supported H.264 codec config
      const codecCandidates = ['avc1.640034', 'avc1.64002A', 'avc1.420034'];
      let videoCodec = null;
      for (const c of codecCandidates) {
        const { supported } = await VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: 8_000_000, framerate: FPS });
        if (supported) { videoCodec = c; break; }
      }
      if (!videoCodec) throw new Error('No supported H.264 encoder found in this browser.');

      // Audio setup
      let audioCtx = null, scriptProcessor = null, audioEncoder = null;
      let includeAudio = false;
      let audioTimestamp = 0;

      try {
        if (typeof AudioEncoder !== 'undefined') {
          const { supported: audioSupported } = await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2, bitrate: 128000 });
          if (audioSupported) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
            const source = audioCtx.createMediaElementSource(vid);
            scriptProcessor = audioCtx.createScriptProcessor(4096, 2, 2);
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
            includeAudio = true;
          }
        }
      } catch(e) { /* video-only fallback */ }

      // Muxer
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: { codec: 'avc', width: W, height: H },
        ...(includeAudio ? { audio: { codec: 'aac', sampleRate: 44100, numberOfChannels: 2 } } : {}),
        fastStart: 'in-memory',
      });

      // Video encoder
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: e => { throw e; },
      });
      videoEncoder.configure({ codec: videoCodec, width: W, height: H, bitrate: 8_000_000, framerate: FPS });

      // Audio encoder
      if (includeAudio) {
        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error: e => console.warn('Audio encode error:', e),
        });
        audioEncoder.configure({ codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2, bitrate: 128000 });

        scriptProcessor.onaudioprocess = (e) => {
          if (!audioEncoder || audioEncoder.state === 'closed') return;
          const left = e.inputBuffer.getChannelData(0);
          const right = e.inputBuffer.getChannelData(1);
          const n = left.length;
          const data = new Float32Array(n * 2);
          data.set(left, 0); data.set(right, n);
          const ad = new AudioData({ format: 'f32-planar', sampleRate: 44100, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(audioTimestamp), data });
          audioEncoder.encode(ad);
          ad.close();
          audioTimestamp += (n / 44100) * 1e6;
        };
      }

      setStepIdx(1);
      let frameCount = 0;
      let finished = false;

      const finish = async () => {
        if (finished) return;
        finished = true;
        if (scriptProcessor) { scriptProcessor.disconnect(); scriptProcessor.onaudioprocess = null; }
        if (audioCtx) audioCtx.close();
        setStepIdx(3);
        await videoEncoder.flush();
        if (audioEncoder) await audioEncoder.flush();
        muxer.finalize();
        const blob = new Blob([target.buffer], { type: 'video/mp4' });
        setDownloadUrl(URL.createObjectURL(blob));
        setPhase('done');
        setProg(100);
      };

      // requestVideoFrameCallback fires exactly once per decoded video frame —
      // avoids the duplicate-timestamp problem that RAF at 60fps causes.
      const onFrame = (now, metadata) => {
        ctx.drawImage(vid, 0, 0, W, H);
        drawOverlay(ctx, W, H, state, logoImg);

        const timestamp = Math.round(metadata.mediaTime * 1e6);
        const vf = new VideoFrame(canvas, { timestamp });
        videoEncoder.encode(vf, { keyFrame: frameCount === 0 || frameCount % (FPS * 2) === 0 });
        vf.close();
        frameCount++;

        const p = vid.duration ? (vid.currentTime / vid.duration) * 100 : 0;
        setProg(Math.min(97, p));
        setStepIdx(p > 85 ? 3 : p > 15 ? 2 : 1);

        if (!vid.ended) vid.requestVideoFrameCallback(onFrame);
      };

      vid.onended = () => finish();

      cleanupRef.current = () => {
        finished = true;
        vid.pause(); vid.src = '';
        if (scriptProcessor) { scriptProcessor.disconnect(); scriptProcessor.onaudioprocess = null; }
        if (audioCtx) audioCtx.close();
        if (videoEncoder.state !== 'closed') videoEncoder.close();
        if (audioEncoder?.state !== 'closed') audioEncoder?.close();
      };

      vid.currentTime = 0;
      vid.requestVideoFrameCallback(onFrame);
      await vid.play();

    } catch(e) {
      setPhase('error');
      setErrorMsg(e.message || 'Unknown error');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl; a.download = fname;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="modal-bg" onClick={phase === 'done' ? onClose : null}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="ttl">
            {phase === 'rendering' ? 'Rendering promo' : phase === 'done' ? 'Export complete' : 'Export failed'}
          </div>
          <button className="btn ghost sm" onClick={() => { cleanupRef.current?.(); onClose(); }}>
            <Icon name="x" size={12} />
          </button>
        </div>
        <div className="modal-body">
          {phase === 'rendering' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                <span>{STEPS[stepIdx]}…</span>
                <span>{Math.floor(prog)}%</span>
              </div>
              <div className="progress"><div style={{ width: `${prog}%` }} /></div>
              <ul className="render-list" style={{ listStyle: 'none', padding: 0 }}>
                {STEPS.map((s, i) => (
                  <li key={i} className={i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'todo'}>{s}</li>
                ))}
              </ul>
              <div className="hint" style={{ marginTop: 14 }}>
                Recording in real-time · {state.video?.w || 1080}×{state.video?.h || 1920} · H.264 MP4
              </div>
            </>
          )}
          {phase === 'done' && (
            <div className="export-success">
              <div className="check"><Icon name="check" size={24} stroke={2.5} /></div>
              <div className="t">Promo ready</div>
              <div className="s" style={{ fontFamily: 'var(--mono)', marginTop: 10 }}>{fname}</div>
              <div className="hint" style={{ marginTop: 14 }}>
                H.264 · {state.video?.w || 1080}×{state.video?.h || 1920} · AAC audio
              </div>
            </div>
          )}
          {phase === 'error' && (
            <div>
              <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 6 }}>Render failed</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>{errorMsg}</div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {phase === 'done' ? (
            <>
              <button className="btn" onClick={onClose}>Close</button>
              <button className="btn primary" onClick={handleDownload}>
                <Icon name="download" size={12} />
                <span>Download .mp4</span>
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => { cleanupRef.current?.(); onClose(); }}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

window.ExportModal = ExportModal;
