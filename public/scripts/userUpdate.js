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

async function sentTradeLink(tradelink) {
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

async function sendData(email, tradelink) {
    const response = await fetch('/users/userinfo/' + steam_id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, tradelink })
    });
    console.log(response);
    if (!response.status != 200) {
        throw new Error('Failed to save data');
    }
}