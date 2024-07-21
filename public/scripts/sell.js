const decrementItemCount = () => {
    if (itemCount > 0) {
        itemCount--;
        document.getElementById('itemCount').textContent = itemCount + ' items';
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const sellButtons = document.querySelectorAll('.sell-button');

    sellButtons.forEach(button => {
        button.addEventListener('click', function() {
            const asset_id = this.getAttribute('data-asset-id');
            const class_id = this.getAttribute('data-class-id');
            const instance_id = this.getAttribute('data-instance-id');
            
            fetch('/listeditems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ asset_id: asset_id, class_id: class_id, instance_id: instance_id })
            })
            .then(response => {
                if (response.status >= 400)
                    throw new Error("Unauthorized");
                console.log('Success listing item');
                var div = document.getElementById(asset_id);
                if (div) {
                    div.remove();
                }
                decrementItemCount();
            })
            .catch((error) => {
                console.error('Error: ', error);
            });
        });
    });
});