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
		EnhancedDiscord v1.1.0
		${process.pkg ? `----------------------------------------------------------------------
		NOTE: You should be running this file where you want EnhancedDiscord's files to go.
		(A directory called EnhancedDiscord will be created here, with plugins and other essential files inside.)
		If this is not the desired location, find a suitable location and place this executable there.` : ''}
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
	            break;
	        case 2:
	        	console.log('Uninstalling');
	            uninstall(proc).then(exit).catch(err);
	            break;
	        case 3:
	            console.log('Reinstalling');
        		uninstall(proc, true).then(() => install(proc, false, true)).then(exit).catch(err);
	            break;
	        default:
	            throw new Error('Invalid response');
	            break;
	    }
    });
}).catch(() => {
    console.log('No discord process was found. Please open your discord client and try again.');
    process.exit(0);
});

