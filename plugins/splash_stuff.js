var theQuotes = ["Deleting system32", "Loading shitty Electron app", "Enforcing rate limits", "Deploying errors", "Distributing bad memes", "Waiting for b1nzy to ban you", "Stealing your token", "&lt;Insert bad pun here&gt;", "Breaking mobile app", "Generating Nitro advertisements", "Making the TOS worse"];
setTimeout(() => {
	var splash = document.getElementById('splash');
	if (!splash) return;
	var quote = document.getElementsByClassName('quote')[0];
	var checkingText = document.querySelector('span.quote+span');
	var splashInner = document.querySelector('#splash > .splash-inner');

	splash.style.background = '#7b0000';
	splash.style.borderRadius = '20px';
	quote.innerHTML = theQuotes[Math.floor(Math.random()*theQuotes.length)];
	checkingText.style.color = '#e17e17';

	var promoShit = document.createElement('span');
	promoShit.innerHTML = '<span id="theme_shit">EnhancedDiscord v1.1 by <b style="color: rgba(255, 255, 255, 0.7);">Joe 🎸#7070</b></span>';
	promoShit.style.color = 'rgba(255, 255, 255, 0.5)';
	splashInner.appendChild(promoShit);
}, 1000);