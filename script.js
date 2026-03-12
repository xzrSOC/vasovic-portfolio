// Lang switch
  function setLang(lang) {
    document.body.classList.toggle('en', lang === 'en');
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.lang-btn').forEach(b => { if(b.textContent === lang.toUpperCase()) b.classList.add('active'); });
  }

  // Modal
  const modalMap = {
    'modal-ad': 'ad', 'modal-azure': 'azure', 'modal-zabbix': 'zabbix', 'modal-glpi': 'glpi'
  };
  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
    const key = modalMap[id];
    if(key) { carousels[key] = 0; renderCarousel(key); }
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }
  function closeModalOutside(e) {
    if(e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
  }
  document.addEventListener('keydown', e => { if(e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id)); });

  // Carousel
  const carousels = { ad:0, azure:0, zabbix:0, glpi:0 };
  function getSlidesCount(key) { return document.getElementById('track-'+key).children.length; }
  function renderCarousel(key) {
    const track = document.getElementById('track-'+key);
    track.style.transform = `translateX(-${carousels[key]*100}%)`;
    const dotsEl = document.getElementById('dots-'+key);
    dotsEl.innerHTML = '';
    for(let i=0;i<getSlidesCount(key);i++){
      const d = document.createElement('div');
      d.className = 'carousel-dot' + (i===carousels[key]?' active':'');
      d.onclick = ()=>{ carousels[key]=i; renderCarousel(key); };
      dotsEl.appendChild(d);
    }
  }
  function moveCarousel(key, dir) {
    const max = getSlidesCount(key);
    carousels[key] = (carousels[key]+dir+max)%max;
    renderCarousel(key);
  }

  // Attach click on project cards
  document.querySelectorAll('.project-card').forEach(card => {
    const h3 = card.querySelector('h3');
    if(!h3) return;
    const title = h3.textContent.toLowerCase();
    let modalId = null;
    if(title.includes('active directory')) modalId = 'modal-ad';
    else if(title.includes('azure') || title.includes('intune')) modalId = 'modal-azure';
    else if(title.includes('zabbix')) modalId = 'modal-zabbix';
    else if(title.includes('glpi') || title.includes('ticketing')) modalId = 'modal-glpi';
    if(modalId) card.addEventListener('click', ()=>openModal(modalId));
  });


(function(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  // Very subtle floating dots
  const COUNT = 55;
  const dots = Array.from({length: COUNT}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.5 + 0.5,
  }));

  // Mouse
  let mx = -9999, my = -9999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const MAX_DIST = 130;
  const MOUSE_DIST = 100;

  function draw(){
    ctx.clearRect(0, 0, W, H);

    // Subtle radial bg glow — single soft violet center
    const grad = ctx.createRadialGradient(W*0.5, H*0.35, 0, W*0.5, H*0.35, W*0.65);
    grad.addColorStop(0, 'rgba(124,58,237,0.07)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // Update & draw dots
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if(d.x < 0) d.x = W; if(d.x > W) d.x = 0;
      if(d.y < 0) d.y = H; if(d.y > H) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(148,163,184,0.35)';
      ctx.fill();
    });

    // Lines between close dots
    for(let i = 0; i < COUNT; i++){
      for(let j = i+1; j < COUNT; j++){
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < MAX_DIST){
          const alpha = (1 - dist/MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      // Mouse interaction — highlight nearby dots & lines
      const mdx = dots[i].x - mx;
      const mdy = dots[i].y - my;
      const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
      if(mdist < MOUSE_DIST){
        const alpha = (1 - mdist/MOUSE_DIST) * 0.5;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Glow dot
        ctx.beginPath();
        ctx.arc(dots[i].x, dots[i].y, dots[i].r + 1, 0, Math.PI*2);
        ctx.fillStyle = `rgba(124,58,237,${alpha * 0.8})`;
        ctx.fill();
      }
    }

    // Vignette
    const vig = ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9);
    vig.addColorStop(0,'transparent');
    vig.addColorStop(1,'rgba(0,0,0,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0,0,W,H);

    requestAnimationFrame(draw);
  }

  draw();
})();