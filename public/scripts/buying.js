document.addEventListener("DOMContentLoaded", function() {
    const buyButtons = document.querySelectorAll('.remove-button');
    buyButtons.forEach(button => {

        button.addEventListener('click', function() {
            const asset_id = this.getAttribute('data-asset-id');
            const seller_id = this.getAttribute('data-seller-id');
            buyItem(asset_id, seller_id);
        });
    });
});

function buyItem(asset_id, seller_id) {
    fetch('/trades/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            asset_id: asset_id,
            seller_id: seller_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log(response.json())
        return response.json();
    })
    .catch(error => {
        console.error('Error initiating trade:', error);
    });
}