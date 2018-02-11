const path = require('path');
const { stripIndents } = require('common-tags');
const install = require('./installer.js');
const uninstall = require('./uninstaller.js');
const util = require('./util.js');
process.env.injDir = __dirname;

function exit(code = 0) {
    if (!(typeof code == 'number')) code = 0;
    console.log(`Exiting with code ${code}`);
    process.exit(code);
}

function err(err) {
    console.error(`An error has occurred: ${err.message}`);
    exit(1);
}

util.getDiscordProcess().then((proc) => {
	util.askQuestion( stripIndents`
		EnhancedDiscord v0.7
		----------------------------------------------------------------------
		Please choose an operation:
		1. inject (install EnhancedDiscord; for first-time use or after uninject)
		2. uninject (remove EnhancedDiscord completely)
		3. reinject (uninjects then injects; use this when Discord is updated)
	`).then(answer => {
        const index = parseInt(answer);

        switch (index) {
	        case 1:
	        	console.log('Installing...');
	            install(proc).then(exit).catch(err);
	            resolve();
	            break;
	        case 2:
	        	console.log('Uninstalling');
	            uninstall(proc).then(exit).catch(err);
	            resolve();
	            break;
	        case 3:
	            console.log('Reinstalling');
        		uninstall(proc, true).then(() => install(proc, false, true)).then(exit).catch(err);
	            resolve();
	            break;
	        default:
	            reject(new Error('Invalid response'));
	            break;
	    }
    });
}).catch(() => {
    console.log('No discord process was found. Please open your discord client and try again.');
    process.exit(0);
});

