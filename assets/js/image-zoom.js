document.addEventListener('DOMContentLoaded', function() {
  const zoomBtn = document.getElementById('zoom-btn');
  const zoomModal = document.getElementById('zoom-modal');
  const closeZoomBtn = document.getElementById('close-zoom-btn');
  const zoomedImg = document.getElementById('zoomed-img');
  const img = document.getElementById('pageimg');

  if (!zoomBtn || !zoomModal || !closeZoomBtn || !zoomedImg || !img) return;

  zoomBtn.onclick = function() {
    zoomModal.style.display = 'flex';
    zoomedImg.src = img.src;
  };

  closeZoomBtn.onclick = function() {
    zoomModal.style.display = 'none';
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && zoomModal.style.display === 'flex') {
      zoomModal.style.display = 'none';
    }
  });

  zoomModal.addEventListener('mousedown', function(e) {
    if (e.target === zoomModal) {
      zoomModal.style.display = 'none';
    }
  });
});
