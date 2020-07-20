const Plugin = require('../plugin');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const writeFile = require('util').promisify(fs.writeFile);
const path = require('path');
const crypto = require('crypto');
const file_blacklist = ["README.md", "installer", "plugins"];

module.exports = new Plugin({
    name: 'Updater',
    author: 'Joe 🎸#7070',
    description: 'An interface to update EnhancedDiscord.',
    color: '#7289da',

    defaultSettings: {
        branch: 'master',
        auto_check: true,
        auto_update: true,
        notify: true,
        changelogs: true
        // TODO: auto-update for plugins as well
    },

    load: function () {
        this._req = EDApi.findModule("post");
        this._upd = EDApi.findModule("checkForUpdates");
        EDApi.monkeyPatch(this._upd, "checkForUpdates", {
            silent: true, after: () => {
                if (this.settings.auto_check)
                    this.checkForUpdates();
            }
        });
    },
    unload: function () {
        this._upd.checkForUpdates.unpatch();
    },

    showNotices: function () {
        if (this.settings.notify && this.isUpdateAvailable()) {
            this.notify();
        }
        if (!this.viewed_changelog && this.settings.changelogs) {
            this.showChangelog();
        }
    },

    notify: function () {
        EDApi.showToast("Updates are available!");
        // TODO: better way of displaying this
    },

    showChangelog: function () {
        EDApi.showToast("Changelog from last update: " + this.settings.latest_commit_message);
        // TODO: better way of displaying this
        this.setSetting('viewed_changelog', true);
    },

    getGitDetails: function () {
        if (!this.settings.branch)
            return null;
        const deets = {
            user: 'joe27g',
            repo: 'EnhancedDiscord',
            branch: this.settings.branch
        };
        if (this.settings.branch.includes('/')) {
            const pieces = this.settings.branch.split(/\//);
            if (pieces.length > 2) {
                deets.user = pieces[0].trim();
                deets.repo = pieces[1].trim();
                deets.branch = pieces[2].trim();
            }
        }
        if (!deets.user || !deets.repo || !deets.branch)
            return null;
        return deets;
    },

    getHash: async function (filename) {
        if (!fs.existsSync(filename)) return null;
        let err;
        const content = await readFile(filename).catch(e => err = e);
        if (err) throw err;
        const mega_gay = crypto.createHash("sha1");
        mega_gay.update(`blob ${content.length}\u0000${content}`);
        return mega_gay.digest('hex');
    },

    formatElapsed: function (timestamp) {
        const duration = Date.now() - timestamp;
        if (!duration || isNaN(duration)) return null;

        const min = 1000 * 60;
        const hr = min * 60;
        const day = hr * 24;
        const wk = day * 7;

        if (duration >= wk)
            return `${Math.floor(duration / wk)} week(s) ago`;
        if (duration >= day)
            return `${Math.floor(duration / day)} day(s) ago`;
        if (duration >= hr)
            return `${Math.floor(duration / hr)} hour(s) ago`;
        if (duration >= min)
            return `${Math.floor(duration / min)} minute(s) ago`;
        return `${Math.floor(duration / 1000)} second(s) ago`;
    },

    isUpdateAvailable: function () {
        return this.settings.latest_commit && this.settings.latest_commit !== this.settings.current_rev;
    },

    checkForUpdates: async function () {
        const gitShit = this.getGitDetails();
        if (!gitShit) return;

        this.showNotices();

        let err;
        const data = await this._req.get(`https://api.github.com/repos/${gitShit.user}/${gitShit.repo}/branches/${gitShit.branch}`).catch(e => err = e);
        if (err)
            return this.error('checkForUpdates:', err);
        if (!data || !data.body)
            return this.warn("checkForUpdates: Got an empty response.");

        this.setSetting('last_check', Date.now());

        if (!data.body.commit || !data.body.commit.sha)
            return this.warn("Response didn't have expected content. Aborting update check.");

        const latest = data.body.commit.sha;
        if (this.settings.latestCommit === latest)
            return false;

        this.setSetting('latest_commit', latest);
        this.setSetting('latest_commit_message', data.body.commit.commit.message);

        if (this.settings.auto_update)
            return this.installUpdate();

        this.showNotices();
    },

    installUpdate: async function () {
        const gitShit = this.getGitDetails();
        if (!gitShit) return;

        let err;
        const fileData = await this._req.get(`https://api.github.com/repos/${gitShit.user}/${gitShit.repo}/contents?ref=${gitShit.branch}`).catch(e => err = e);
        //console.log(fileData);
        if (err)
            return this.error('installUpdate:', err);
        if (!fileData || !fileData.body || !fileData.body.length)
            return this.warn("installUpdate: Got an empty response.");

        const needUpdate = [];
        for (const file of fileData.body) {
            if (file.name.startsWith('.') || file.size === 0 || file_blacklist.includes(file.name)) continue;
            let hash;
            try {
                hash = await this.getHash(path.join(process.env.injDir, file.name));
            } catch (err) {
                return this.warn('installUpdate: failed to get hash:', err);
            }
            if (hash !== file.sha)
                needUpdate.push(file);
            //return this.error(`installUpdate: hash mismatch: ${hash} != ${file.sha}`)
        }
        if (!needUpdate.length) {
            this.setSetting('current_rev', this.settings.latest_commit);
            this.info('installUpdate: already up-to-date.');
            return false; // update not needed
        }

        const promises = [], errors = [], toWrite = {};
        for (const file of needUpdate) {
            promises.push(this._req.get(file.download_url).then(d => toWrite[file.name] = d.text).catch(e => {
                this.error(e);
                errors.push(e);
            }));
        }
        await Promise.all(promises); //download all in parallel
        this.info(`installUpdate: Finished downloading files with ${errors.length} errors.`);
        if (!Object.keys(toWrite).length) {
            this.warn('installUpdate: Aborted, no files to write. They probably had errors while downloading.');
            return false;
        }

        const writePromises = [], writeErrors = [];
        for (const filename in toWrite) {
            writePromises.push(writeFile(path.join(process.env.injDir, filename), toWrite[filename]).catch(e => {
                this.error(e);
                writeErrors.push(e);
            }));
        }
        await Promise.all(writePromises); //write all in parallel
        this.info(`installUpdate: Finished writing files with ${writeErrors.length} errors.`);

        for (const filename in toWrite) {
            const file = fileData.body.find(f => f.name === filename);
            if (!file) continue;
            let hash;
            try {
                hash = await this.getHash(path.join(process.env.injDir, file.name));
            } catch (err) {
                this.warn('installUpdate: failed to get hash:', err);
            }
            if (hash !== file.sha)
                return this.error(`installUpdate: hash mismatch: ${hash} != ${file.sha}`)
        }
        this.info(`installUpdate: Finished verifying hashes for ${Object.keys(toWrite).length} files.`);

        if (this.settings.viewed_changelog)
            this.setSetting('viewed_changelog', false);

        this.showNotices();

        return true;
    },

    generateSettings: function () {
        return [
            {
                type: "std:description",
                content: `Current branch: \`${this.settings.branch}\` | Latest revision: ${this.settings.latest_commit ? `\`${this.settings.latest_commit.substr(0, 7)}\`` : 'unknown'} | Last update check: ${this.settings.last_check ? this.formatElapsed(this.settings.last_check) : 'never'}`
            },
            {
                type: "std:description",
                content: `Local revision: ${this.settings.current_rev ? `\`${this.settings.current_rev.substr(0, 7)}\`` : 'unknown'} (ED v${ED.version}) | Status: ${this.isUpdateAvailable() ? 'Update available' : 'Up-to-date'}`
            },
            {
                type: "std:spacer",
                space: 10
            },
            {
                type: "input:button",
                name: "Check for Updates",
                onClick: setName => {
                    setName('Checking...');
                    this.checkForUpdates.bind(module.exports)().then(u => {
                        EDApi.showToast(u ? "Found updates!" : "No updates.");
                        setName("Check for Updates");
                    })
                }
            },
            {
                type: "input:button",
                name: "Install Updates",
                onClick: this.installUpdate.bind(module.exports),
                disabled: !this.isUpdateAvailable()
            },
            {
                type: "std:spacer",
                space: 15
            },
            {
                type: "input:boolean",
                configName: "auto_check",
                title: "Check for Updates",
                note: "Automatically check for updates. When deselected, you will have to come back here to see if updates are available."
            },
            {
                type: "input:boolean",
                configName: "notify",
                title: "Notify for New Updates",
                note: `Show a notification when updates are available ${this.settings && this.settings.auto_update ? "or being downloaded" : "and an option to install them"}.`,
                disabled: !(this.settings && this.settings.auto_check)
            },
            {
                type: "input:boolean",
                configName: "changelogs",
                title: "Show Change Notes",
                note: `Show a notification with change notes after updates are installed.`,
                disabled: !(this.settings && this.settings.auto_check)
            },
            {
                type: "input:boolean",
                configName: "auto_update",
                title: "Automatic Updates",
                note: "Automatically download and install updates in the background. When deselected, updates will only be applied when you choose.",
                disabled: !(this.settings && this.settings.auto_check)
            },
            {
                type: "input:text",
                configName: "branch",
                title: "Branch",
                desc: "Which branch to fetch from GitHub. The default (stable) branch is **master**. The **beta** branch includes new features, sometimes experimental or incomplete. You can also specify a fork with github_username/repo_name/branch_name.",
                placeholder: "master, beta, urmom/gay/master etc...",
                mini: true
            }
        ]
    }
});