const fs = require('fs');

class Plugin {
	constructor (opts = {}) {
		if (!opts.name || typeof opts.load !== 'function')
			return 'Invalid plugin. Needs an ID, name and a load() function.';

		Object.assign(this, opts);
        if (!this.color)
            this.color = 'orange';
        if (!this.author)
            this.author = '<unknown>';
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
    get settings() {
        //this.log('getting settings');
        if (window.ED.config && window.ED.config[this.id])
            return window.ED.config[this.id];

        let final = {};
        if (this.config)
            for (let key in this.config)
                final[key] = this.config[key].default;
        return this.settings = final;
        //return final;
    }
    set settings(newSets = {}) {
        //this.log(__dirname, process.env.injDir);
        //console.log(`setting settings for ${this.id} to`, newSets);
        try {
            let gay = window.ED.config;
            gay[this.id] = newSets;
            window.ED.config = gay;
            //console.log(`set settings for ${this.id} to`, this.settings);
        } catch(err) {
            this.error(err);
        }
        return this.settings;
    }
}

module.exports = Plugin;
