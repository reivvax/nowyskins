async function sendEmail(email) {
    const response = await fetch('/users/email/' + user.steam_id, {
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
    const response = await fetch('/users/tradelink/' + user.steam_id, {
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
    const response = await fetch('/users/userinfo/' + user.steam_id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, tradelink })
    });
    if (!response.ok) {
        throw new Error('Failed to save data');
    }
}