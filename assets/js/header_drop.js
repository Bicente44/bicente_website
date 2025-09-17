
(function () { 'use strict';

	const navbar = document.getElementById('navbar');
	if (!navbar) return;
	
	document.documentElement.style.setProperty('--nav-height', navbar.offsetHeight + 'px');
	
	//Scroll position
	let last = window.pageYOffset || 0;
	const threshold = 6;
	let ticking = false;
	
	function update() {
		const cur = window.pageYOffset || 0;
		const diff = cur - last;

		if (cur <= 0) {
			//Show when top of page
			navbar.style.transform = 'translateY(0)';
		} else if (Math.abs(diff) > threshold) {
			  if (diff > 0 && cur > navbar.offsetHeight) {
				  navbar.style.transform = `translateY(-${navbar.offsetHeight}px)`;
		} else {
			navbar.style.transform = 'translateY(0)';
		}
	}

	last = cur; // Save for next frame
	ticking = false;
}

window.addEventListener('scroll', function(){
	if (!ticking) {
		ticking = true;
		window.requestAnimationFrame(update);
	}
}, { passive: true });
	
	})();
