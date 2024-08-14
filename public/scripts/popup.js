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


// document.getElementById('submit-btn').onclick = () => {
//     var email = document.getElementById('email').value;
//     var tradelink = document.getElementById('tradelink').value;
//     if (email && tradelink) {
//         try {
//             sendData(email, tradelink);
//             hidePopup();
//         } catch (error) {
//             setError("Error: ", error, "\nPlease try again.");
//         }
//     } else {
//        setError('Please fill in both email and trade link.', true);
//     }
// };

document.getElementById('submit-btn').onclick = () => {
    var email = document.getElementById('email').value;
    var tradelink = document.getElementById('tradelink').value;
    if (email && tradelink) {
        sendData(email, tradelink)
            .then((response) => hidePopup())
            .catch((errMessage) => setError("Error: " + errMessage + "\nPlease try again.", true));
    } else {
       setError('Please fill in both email and trade link.', true);
    }
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter')
        document.getElementById('submit-btn').click();
});