// Assumes the user object is passed to the script

function showPopup() {
    var popup = document.getElementById('popup');
    var overlay = document.getElementById('overlay');
    
    popup.style.display = 'block';
    overlay.style.display = 'block';
}


function hidePopup() {
    var popup = document.getElementById('popup');
    var overlay = document.getElementById('overlay');
    
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

function clearError() {
    setError("", false);
    
}

function setError(prompt, visible) {
    var errorMessage = document.getElementById('error-message');
    errorMessage.innerText = prompt;
    errorMessage.style.display = visible ? 'block' : 'none';
}

async function sendData(email, tradelink) {
    console.log(email, tradelink);
    try {
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
        console.log(response);
        hidePopup();
    } catch (error) {
        console.log(error);
        setError("Error: ", error, "\nPlease try again.");
    }
}

window.onload = function() {
    showPopup();
}

document.getElementById('submit-btn').onclick = function() {
    var email = document.getElementById('email').value;
    var tradelink = document.getElementById('tradelink').value;
    if (email && tradelink) {
        //email validation
        var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            setError("Invalid email", true);
            return;
        }

        //tradelink validation
        regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=[a-zA-Z0-9]{8}$/;
        const match = tradelink.match(regex);
        const steamIDBase = 76561197960265728;
        if (match == null || match.length < 2 || parseInt(match[1], 10) + steamIDBase != user.steam_id) {
            setError("Invalid trade link", true);
            return;
        }
        sendData(email, tradelink);
    } else {
       setError('Please fill in both email and trade link.', true);
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter')
        document.getElementById('submit-btn').click();
});