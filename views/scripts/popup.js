function showPopup() {
    var popup = document.getElementById('popup');
    popup.style.display = 'block';
}

function hidePopup() {
    var popup = document.getElementById('popup');
    popup.style.display = 'none';
}

window.onload = function() {
        showPopup();
}

document.getElementById('popup-close').onclick = function() {
    hidePopup();
}