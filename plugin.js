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

    /**
     * Load this plugin.
     */
    load () {}

    /**
     * Unload this plugin.
     */
    unload () {}

    /**
     * Reload this plugin.
     */
    reload () {
        this.log('Reloading...');
        this.unload();
        delete require.cache[require.resolve(`./plugins/${this.id}`)];
        const newPlugin = require(`./plugins/${this.id}`);
        ED.plugins[this.id] = newPlugin;
        newPlugin.id = this.id;
        return newPlugin.load();
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
    
    /**
     * Get plugin settings.
     * @returns {Object} Plugin settings object
     */
    get settings() {
        return EDApi.loadPluginSettings(this.id);
    }

    /**
     * Get particular plugin setting.
     * @param {string} key
     * @returns Plugin setting value
     */
    getSetting(key) {
        return EDApi.loadData(this.id, key);
    }

    /**
     * Save plugin settings.
     * @param {Object} newSets - New plugin settings object
     */
    set settings(newSets = {}) {
        return EDApi.savePluginSettings(this.id, newSets);
    }

    /**
     * Set particular plugin setting.
     * @param {string} key
     * @param data
     */
    setSetting(key, data) {
        return EDApi.saveData(this.id, key, data);
    }
}

module.exports = Plugin;
