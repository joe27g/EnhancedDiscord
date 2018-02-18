class Plugin {
	constructor (opts = {}) {
		if (!opts.name || typeof opts.load !== 'function')
			return 'Invalid plugin. Needs a name and a load() function.';

		this.color = 'orange';
		this.author = '<unknown>';

		Object.assign(this, opts);
	}

	load () {}

	unload () {}

  	log (msg) {
        console.log(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, msg);
    }
    info (msg) {
        console.info(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, msg);
    }
    warn (msg) {
        console.warn(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, msg);
    }
    error (msg) {
        console.error(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, msg);
    }
    sleep (ms) { 
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

module.exports = Plugin
