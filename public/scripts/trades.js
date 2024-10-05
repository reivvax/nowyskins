document.addEventListener("DOMContentLoaded", function() {
    const acceptButtons = document.querySelectorAll('.circle-button.accept');
    const cancelButtons = document.querySelectorAll('.circle-button.cancel');

    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tradeId = this.getAttribute('data-trade-id');
            fetch(`/trades/accept/${tradeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
            })
            .catch(error => {
                console.error('Error accepting trade:', error);
            });
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tradeId = this.getAttribute('data-trade-id');
            fetch(`/trades/cancel/${tradeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
            })
            .catch(error => {
                console.error('Error cancelling trade:', error);
            });
        });
    });
});