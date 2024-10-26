document.addEventListener("DOMContentLoaded", function() {
    const watchlistButtons = document.querySelectorAll('.watchlist-button');

    watchlistButtons.forEach(button => {
        const listing_id = this.getAttribute('data-listing-id');

        fetch('/watchlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: listing_id })
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            if (response.status >= 400)
                throw new Error("Unauthorized");
            return response.json();
        })
        .catch(err => { console.log(err); });
    });
});