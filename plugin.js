/**
 * Plugin Class
 */
class Plugin {
    /**
     * Create your plugin, must have a name and load() function
     * @constructor
     * @param {object} options - Plugin options
     */
    constructor (opts = {}) {
        if (!opts.name || typeof opts.load !== 'function')
            return 'Invalid plugin. Needs a name and a load() function.';

        Object.assign(this, opts);
        if (!this.color)
            this.color = 'orange';
        if (!this.author)
            this.author = '<unknown>';
    }

    load () {}

    unload () {}

    reload () {
        this.unload();
        delete require.cache[require.resolve(`./plugins/${this.id}`)];
        const newPlugin = require(`./plugins/${this.id}`);
        window.ED.plugins[this.id] = newPlugin;
        newPlugin.id = this.id;
        newPlugin.load();
    }

    /**
     * Send a decorated console.log prefixed with ED and your plugin name
     * @param {...string} msg - Message to be logged
     */
    log (...msg) {
        console.log(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, ...msg);
    }
    /**
     * Send a decorated console.info prefixed with ED and your plugin name
     * @param {...string} msg - Message to be logged
     */
    info (...msg) {
        console.info(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, ...msg);
    }
    /**
     * Send a decorated console.warn prefixed with ED and your plugin name
     * @param {...string} msg - Message to be logged
     */
    warn (...msg) {
        console.warn(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, ...msg);
    }
    /**
     * Send a decorated console.error prefixed with ED and your plugin name
     * @param {...string} msg - Message to be logged
     */
    error (...msg) {
        console.error(`%c[EnhancedDiscord] %c[${this.name}]`, 'color: red;', `color: ${this.color}`, ...msg);
    }
    /**
     * Returns a Promise that resolves after ms milliseconds.
     * @param {number} ms - How long to wait before resolving the promise
     */
    sleep (ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    get settings() {
        //this.log('getting settings');
        if (window.ED.config && window.ED.config[this.id])
            return window.ED.config[this.id];

        const final = {};
        if (this.config)
            for (const key in this.config)
                final[key] = this.config[key].default;
        return this.settings = final;
        //return final;
    }
    set settings(newSets = {}) {
        //this.log(__dirname, process.env.injDir);
        //console.log(`setting settings for ${this.id} to`, newSets);
        try {
            const gay = window.ED.config;
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
