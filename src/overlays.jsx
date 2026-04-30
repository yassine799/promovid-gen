// Overlay layouts + preset thumbnails

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const Overlay = ({ preset, data, fontFamily, fontScale = 1, animate = true }) => {
  const { artistName, logoUrl, logoMode, venue, date, time, cta } = data;

  const dateStr = formatDate(date);
  const timeStr = time || '';

  const font = { fontFamily };
  const textShadow = 'none';

  const ArtistMark = ({ style = {}, size = 1, textAlign = 'center' }) => {
    const showLogo = logoUrl && (logoMode === 'logo' || logoMode === 'both');
    const showText = !logoUrl || logoMode === 'text' || logoMode === 'both';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: textAlign === 'center' ? 'center' : 'flex-start', gap: `${0.6 * size}em`, ...style }}>
        {showLogo && (
          <img className="logo" src={logoUrl} alt="" style={{
            maxHeight: `${(logoMode === 'logo' ? 28 : 16) * size}%`,
            maxWidth: '80%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }} />
        )}
        {showText && artistName && (
          <div style={{
            fontFamily,
            fontWeight: 900,
            fontSize: `${size * fontScale}em`,
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            textAlign,
            textShadow,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}>{artistName}</div>
        )}
      </div>
    );
  };

  const MetaLine = ({ children, size = 1, align = 'center' }) => (
    <div style={{
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontWeight: 500,
      fontSize: `${size}em`,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textAlign: align,
      opacity: 0.92,
    }}>{children}</div>
  );

  if (preset === 'huge-center') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div className="safe" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', ...font }}>
            <MetaLine size={0.85} align="left">{venue}</MetaLine>
            <MetaLine size={0.85} align="right">{[dateStr, timeStr].filter(Boolean).join(' · ')}</MetaLine>
          </div>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '4% 0' }}>
            <ArtistMark size={3.2} textAlign="center" />
          </div>
          <MetaLine size={0.85} align="center">{cta || 'LIVE'}</MetaLine>
        </div>
      </div>
    );
  }

  if (preset === 'top-bottom') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div className="safe" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ width: '100%' }}>
            <ArtistMark size={2.6} textAlign="center" />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6em' }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.6)', width: '30%', margin: '0 auto' }} />
            <MetaLine size={1.0}>{venue}</MetaLine>
            <MetaLine size={1.0}>{[dateStr, timeStr].filter(Boolean).join('  ·  ')}</MetaLine>
            {cta && <MetaLine size={0.85}>{cta}</MetaLine>}
          </div>
        </div>
      </div>
    );
  }

  if (preset === 'stacked-bl') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div className="safe" style={{ flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.9em', alignItems: 'flex-start' }}>
            <ArtistMark size={2.4} textAlign="left" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em', alignItems: 'flex-start' }}>
              <MetaLine size={0.85} align="left">{venue}</MetaLine>
              <MetaLine size={0.85} align="left">{dateStr}{timeStr ? `  ·  ${timeStr}` : ''}</MetaLine>
              {cta && <MetaLine size={0.85} align="left">{cta}</MetaLine>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (preset === 'side-vert') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div className="safe" style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '5%', top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'left center',
              whiteSpace: 'nowrap',
              fontFamily,
              fontWeight: 900,
              fontSize: `${2.2 * fontScale}em`,
              letterSpacing: '-0.015em',
              textTransform: 'uppercase',
              lineHeight: 0.9,
              position: 'absolute',
              left: '0.5em',
              top: '50%',
              translate: '0 0',
            }}>{artistName}</div>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            {logoUrl && (logoMode === 'logo' || logoMode === 'both') && (
              <img className="logo" src={logoUrl} alt="" style={{ height: '9%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            )}
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35em', paddingLeft: '14%', alignItems: 'flex-start' }}>
            <MetaLine size={0.85} align="left">{venue}</MetaLine>
            <MetaLine size={0.85} align="left">{dateStr}{timeStr ? `  ·  ${timeStr}` : ''}</MetaLine>
            {cta && <MetaLine size={0.85} align="left">{cta}</MetaLine>}
          </div>
        </div>
      </div>
    );
  }

  if (preset === 'corner-tags') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div className="safe" style={{ justifyContent: 'space-between', alignItems: 'stretch', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}>
              <MetaLine size={0.8} align="left">{venue || '—'}</MetaLine>
              <MetaLine size={0.8} align="left">{dateStr || '—'}</MetaLine>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
              {logoUrl && (logoMode === 'logo' || logoMode === 'both') && (
                <img className="logo" src={logoUrl} alt="" style={{ height: '8%', maxHeight: '3em', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              )}
              <MetaLine size={0.8} align="right">{timeStr || 'LIVE'}</MetaLine>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {(logoMode === 'text' || logoMode === 'both' || !logoUrl) && artistName ? (
              <div style={{
                fontFamily,
                fontWeight: 900,
                fontSize: `${1.8 * fontScale}em`,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                maxWidth: '70%',
              }}>{artistName}</div>
            ) : <div />}
            <MetaLine size={0.8} align="right">{cta || '◉ REC'}</MetaLine>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// SVG thumbnails for preset picker
const PresetThumb = ({ preset }) => {
  const dim = 'rgba(255,255,255,0.25)';
  const hi = 'rgba(255,255,255,0.9)';
  switch (preset) {
    case 'huge-center':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="8" y="28" width="24" height="3" fill={dim}/>
          <rect x="58" y="28" width="24" height="3" fill={dim}/>
          <rect x="12" y="65" width="66" height="14" fill={hi}/>
          <rect x="18" y="82" width="54" height="14" fill={hi}/>
          <rect x="35" y="128" width="20" height="3" fill={dim}/>
        </svg>
      );
    case 'top-bottom':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="18" y="28" width="54" height="10" fill={hi}/>
          <rect x="24" y="40" width="42" height="10" fill={hi}/>
          <rect x="30" y="106" width="30" height="1" fill={dim}/>
          <rect x="22" y="114" width="46" height="3" fill={dim}/>
          <rect x="26" y="122" width="38" height="3" fill={dim}/>
        </svg>
      );
    case 'stacked-bl':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="10" y="95" width="54" height="10" fill={hi}/>
          <rect x="10" y="107" width="44" height="10" fill={hi}/>
          <rect x="10" y="125" width="36" height="3" fill={dim}/>
          <rect x="10" y="132" width="28" height="3" fill={dim}/>
        </svg>
      );
    case 'side-vert':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <g transform="translate(18 115) rotate(-90)">
            <rect width="70" height="8" fill={hi}/>
          </g>
          <rect x="22" y="130" width="46" height="2.5" fill={dim}/>
          <rect x="22" y="136" width="36" height="2.5" fill={dim}/>
        </svg>
      );
    case 'corner-tags':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="8" y="26" width="22" height="2.5" fill={dim}/>
          <rect x="8" y="32" width="16" height="2.5" fill={dim}/>
          <rect x="66" y="26" width="16" height="2.5" fill={dim}/>
          <rect x="10" y="120" width="36" height="8" fill={hi}/>
          <rect x="10" y="130" width="28" height="8" fill={hi}/>
          <rect x="68" y="132" width="14" height="2.5" fill={dim}/>
        </svg>
      );
    default:
      return null;
  }
};

window.Overlay = Overlay;
window.PresetThumb = PresetThumb;
window.formatDate = formatDate;
