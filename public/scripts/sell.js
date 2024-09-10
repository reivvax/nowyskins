const decrementItemCount = () => {
    if (itemCount > 0) {
        itemCount--;
        document.getElementById('itemCount').textContent = itemCount + (itemCount == 1 ? ' item' : ' items');
    }
}

const sendData = (asset_id, class_id, instance_id, inspect_url, price) => {
    return fetch('/listeditems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ asset_id: asset_id, class_id: class_id, instance_id: instance_id, inspect_url: inspect_url, price: price })
    })
    .then(response => {
        if (response.status >= 400)
            throw new Error("Unauthorized");
        var div = document.getElementById(asset_id);
        if (div) {
            div.remove();
        }
        decrementItemCount();
        return true;
    })
    .catch(err => { return false; })
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('sellModal');
    const closeBtn = document.querySelector('.close');
    const confirmSellBtn = document.getElementById('confirm-sell');
    const customPriceInput = document.getElementById('modal-custom-price');

    document.querySelectorAll('.item-card').forEach(card => {
        const sellButton = card.querySelector('.sell-button');
        sellButton.addEventListener('click', function() {
            // Fill modal
            document.getElementById('modal-item-name').textContent = card.querySelector('.item-name').textContent; 
            document.getElementById('modal-item-exterior').textContent = card.querySelector('.item-exterior').textContent;
            document.getElementById('modal-item-image').src = this.getAttribute('data-icon-url');
            document.getElementById('modal-item-image').alt = card.querySelector('.item-name').textContent;
            document.getElementById('modal-item-wear').textContent = card.querySelector('.paint-wear').textContent;
            document.getElementById('modal-item-seed').textContent = card.querySelector('.paint-seed').textContent;
            
            let price = card.querySelector('.item-price').textContent;

            if (price.startsWith("$"))
                customPriceInput.value = price.substring(1);
            else
                customPriceInput.placeholder = price;

            confirmSellBtn.setAttribute('data-asset-id', sellButton.getAttribute('data-asset-id'));
            confirmSellBtn.setAttribute('data-class-id', sellButton.getAttribute('data-class-id'));
            confirmSellBtn.setAttribute('data-instance-id', sellButton.getAttribute('data-instance-id'));
            confirmSellBtn.setAttribute('data-inspect-url', sellButton.getAttribute('data-inspect-url'));

            document.body.classList.add('no-scroll');
            modal.style.display = "block";
            confirmSellBtn.focus();
        });
    });

    document.addEventListener('keydown', function(event) {
        if (modal.style.display === "block" && event.key === 'Enter')
            confirmSellBtn.click();
    });

    const closeModal = () => {
        modal.style.display = "none";
        document.body.classList.remove('no-scroll');
    }

    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Handle confirm sell button
    confirmSellBtn.addEventListener('click', async function() {
        // Call sendData with the necessary data
        const asset_id = this.getAttribute('data-asset-id');
        const class_id = this.getAttribute('data-class-id');
        const instance_id = this.getAttribute('data-instance-id');
        const inspect_url = this.getAttribute('data-inspect-url');
        const customPrice = customPriceInput.value;

        let success = await sendData(asset_id, class_id, instance_id, inspect_url, customPrice);
        if (success)
            closeModal();
    });
});