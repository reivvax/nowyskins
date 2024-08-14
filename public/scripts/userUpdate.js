// Assumes steam_id is passed to the script

async function sendEmail(email) {
    const response = await fetch('/users/email/' + steam_id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
    if (!response.ok) {
        throw new Error(response.body);
    }
}

async function sendTradeLink(tradelink) {
    const response = await fetch('/users/tradelink/' + steam_id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tradelink })
    });
    if (!response.ok) {
        throw new Error('Failed to save data');
    }
}

function sendData(email, tradelink) {
    return new Promise(async (resolve, reject) => {
        try {
            var response = await fetch('/users/userinfo/' + steam_id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, tradelink })
            });
            if (response.ok)
                resolve(response);
            else {
                var errMessage = await response.text();
                reject(errMessage);
            }
        } catch (error) {
            reject("Network error: " + error.message);
        }
    });
}