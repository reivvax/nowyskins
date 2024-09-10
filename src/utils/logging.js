const verboseLog = (...args) => {
    if (process.env['LOGLEVEL'] == 'verbose')
        console.log(...args);
}

const debugLog = (...args) => {
    if (process.env['LOGLEVEL'] == 'debug' || process.env['LOGLEVEL'] == 'verbose')
        console.log("Error: ", ...args);
}

const warnLog = (...args) => {
    if (process.env['LOGLEVEL'] == 'warn' || process.env['LOGLEVEL'] == 'debug' || process.env['LOGLEVEL'] == 'verbose')
        console.log("Warn: ", ...args);
}

module.exports = {
    debugLog,
    warnLog,
    verboseLog,
}