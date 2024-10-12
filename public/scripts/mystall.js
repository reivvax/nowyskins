document.addEventListener("DOMContentLoaded", function() {
    const sellButtons = document.querySelectorAll('.remove-button');

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

    document.querySelector('.inspect-button').addEventListener('click', function() {
        const inspectUrl = this.getAttribute('data-inspect-url');
        window.location.href = inspectUrl;
    });
});