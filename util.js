const ps = require('ps-node');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

module.exports = {
    getDiscordProcess: function() {
        return new Promise((resolve, reject) => {
            ps.lookup({psargs: 'alx'}, function (err, res) {
                if (err) reject(err);
                else {
                    const rawProcs = res.filter(p => p.command.includes('Discord'));
                    const procs = {};

                    rawProcs.forEach(p => {
                        if (!procs[p.command])
                            procs[p.command] = { command: p.command, pid: [] };

                        procs[p.command].pid.push(p.pid);
                    });

                    if (Object.keys(procs).length == 1) {
                        resolve(procs[Object.keys(procs)[0]]);
                    } else if (Object.keys(procs).length == 0) {
                        reject(new Error('No processes'));
                    } else {
                        let question = `Please choose your process from the list:`;
                        const keys = Object.keys(procs);
                        for (let i = 0; i < keys.length; i++) {
                            question += `\n${i}. ${keys[i]} (${procs[keys[i]].pid.join(', ')})`;
                        }
                        this.askQuestion(question).then(answer => {
                            const index = parseInt(answer);
                            if (!isNaN(index) && index >= 0 && index < keys.length) {
                                resolve(procs[keys[index]]);
                            } else {
                                reject(new Error('Invalid response'));
                            }
                        });
                    }
                }
            });
        });
    },
    askQuestion: function(question) {
        return new Promise((resolve) => {
            rl.question(question + '\nInput: ', answer => {
                resolve(answer);
            });
        });
    }
};
