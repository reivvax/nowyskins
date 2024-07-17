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

window.onload = function() {
    showPopup();
}


document.getElementById('submit-btn').onclick = function() {
    var email = document.getElementById('email').value;
    var tradelink = document.getElementById('tradelink').value;
    if (email && tradelink) {
        if (!validateEmail(email)) {
            setError("Invalid email", true);
            return;
        }

        if (!validateTradeLink(tradelink)) {
            setError("Invalid trade link", true);
            return;
        }

        try {
            sendData(email, tradelink);
            hidePopup();
        } catch (error) {
            console.log(error);
            setError("Error: ", error, "\nPlease try again.");
        }
    } else {
       setError('Please fill in both email and trade link.', true);
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter')
        document.getElementById('submit-btn').click();
});