/* Sound toggle for hero background videos — one round button pinned to the video's top-right corner.
   Videos start muted (browsers block unmuted autoplay); the button unmutes / mutes on demand. */
(function(){
  var ON  = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4h4l5 5V5L8 10H4z" fill="white"/><path d="M16.3 8.8a5 5 0 0 1 0 6.4" stroke="white" stroke-width="1.6" stroke-linecap="round"/><path d="M18.8 6.3a9 9 0 0 1 0 11.4" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></svg>';
  var OFF = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4h4l5 5V5L8 10H4z" fill="white"/><path d="M16 9l5 6M21 9l-5 6" stroke="white" stroke-width="1.6" stroke-linecap="round"/></svg>';

  function add(video){
    if (!video || video.dataset.soundToggle) return;
    var host = video.parentElement;
    if (!host) return;
    video.dataset.soundToggle = '1';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ac-sound-btn';
    btn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:30;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:9999px;border:1px solid #fff;background:rgba(255,255,255,.2);cursor:pointer;backdrop-filter:blur(4px);transition:background .2s,transform .2s;padding:0';
    btn.addEventListener('mouseenter', function(){ btn.style.background = 'rgba(255,255,255,.35)'; btn.style.transform = 'scale(1.06)'; });
    btn.addEventListener('mouseleave', function(){ btn.style.background = 'rgba(255,255,255,.2)'; btn.style.transform = 'none'; });
    function paint(){
      var muted = video.muted;
      btn.innerHTML = muted ? OFF : ON;
      btn.setAttribute('aria-pressed', String(muted));
      btn.setAttribute('aria-label', muted ? 'Unmute video sound' : 'Mute video sound');
    }
    video.muted = true;
    paint();
    btn.addEventListener('click', function(){
      video.muted = !video.muted;
      if (!video.muted) { var p = video.play(); if (p && p.catch) p.catch(function(){}); }
      paint();
    });
    host.appendChild(btn);
  }

  window.acAddSoundToggle = add;
  function scan(){ Array.prototype.forEach.call(document.querySelectorAll('section video[autoplay]'), add); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
