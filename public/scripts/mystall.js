document.addEventListener("DOMContentLoaded", function() {
    const sellButtons = document.querySelectorAll('.sell-button');

    sellButtons.forEach(button => {
        button.addEventListener('click', function() {
            const asset_id = this.getAttribute('data-asset-id');
            
            fetch('/listeditems/' + asset_id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ asset_id: asset_id })
            })
            .then(data => {
                var div = document.getElementById(asset_id);
                if (div)
                    div.remove();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    });
});