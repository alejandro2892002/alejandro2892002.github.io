document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-category li');
    const popup = document.getElementById('popup');
    const quantityPopup = document.getElementById('quantity-popup');
    const deletePopup = document.getElementById('delete-popup');
    const popupMessage = document.getElementById('popup-message');
    const continueButton = document.getElementById('continue');
    const cancelButton = document.getElementById('cancel');
    const addToOrderButton = document.getElementById('add-to-order');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const quantityInput = document.getElementById('quantity');
    const orderList = document.getElementById('order-list');
    const totalDisplay = document.getElementById('total');
    const tableNumberElement = document.getElementById("table-number"); // Número de mesa
    const placeOrderButton = document.getElementById('place-order');
    const orderConfirmationPopup = document.getElementById('order-confirmation-popup');
    const confirmOrderButton = document.getElementById('confirm-order');
    let selectedItem = null;
    let deleteTarget = null;
    let totalAmount = 0; // Variable para manejar el total

    // Función para actualizar el total
    const updateTotal = () => {
        let total = 0;
        const items = orderList.querySelectorAll('li');
        items.forEach(item => {
            const itemPrice = parseFloat(item.getAttribute('data-total-price'));
            total += itemPrice;
        });
        totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    };

    // Manejar clic en los elementos del menú
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.textContent;
            const price = parseFloat(item.getAttribute('data-price'));
            selectedItem = { name, price };
            popupMessage.textContent = `¡Excelente elección! Este producto tiene un costo de: $${price}`;
            popup.classList.remove('hidden');
        });
    });

    // Botón "Continuar" en el popup inicial
    continueButton.addEventListener('click', () => {
        popup.classList.add('hidden');
        quantityPopup.classList.remove('hidden');
    });

    // Botón "Cancelar" en el popup inicial
    cancelButton.addEventListener('click', () => {
        popup.classList.add('hidden');
    });

    // Botón "Agregar a la orden"
    addToOrderButton.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value, 10) || 0;
        if (quantity === 0) return;
        const { name, price } = selectedItem;
        const totalPrice = quantity * price;

        const orderItem = document.createElement('li');
        orderItem.setAttribute('data-total-price', totalPrice);
        orderItem.setAttribute('data-name', name);
        orderItem.setAttribute('data-quantity', quantity);
        orderItem.innerHTML = `${name} x${quantity} - $${totalPrice.toFixed(2)} 
            <div class="order-item-buttons">
                <button class="edit">Editar</button>
                <button class="delete">Eliminar</button>
            </div>`;
        orderList.appendChild(orderItem);

        updateTotal();
        quantityPopup.classList.add('hidden');
        quantityInput.value = 1;

        // Manejar los botones de editar y eliminar en el nuevo item
        addEventListenersToItem(orderItem, price);
    });

    // Botón "Confirmar eliminación"
    confirmDeleteButton.addEventListener('click', () => {
        if (deleteTarget) {
            orderList.removeChild(deleteTarget);
            updateTotal();
            deletePopup.classList.add('hidden');
        }
    });

    // Botón "Cancelar eliminación"
    cancelDeleteButton.addEventListener('click', () => {
        deletePopup.classList.add('hidden');
    });

    // Evento para "Realizar Orden"
    placeOrderButton.addEventListener('click', () => {
        if (orderList.children.length === 0) {
            alert('No hay productos en la orden para realizarla.');
            return;
        }

        // Mostrar el popup de confirmación
        orderConfirmationPopup.classList.remove('hidden');
    });

    // Evento para "Aceptar" en el popup de confirmación
    confirmOrderButton.addEventListener('click', () => {
        // Enviar la orden a WhatsApp primero
        sendOrderToWhatsApp();

        // Ocultar el popup de confirmación
        orderConfirmationPopup.classList.add('hidden');

        // Limpiar la lista de productos
        orderList.innerHTML = '';

        // Reiniciar el total
        totalAmount = 0;
        totalDisplay.textContent = `Total: $${totalAmount.toFixed(2)}`;
    });

    // Función para enviar la orden a WhatsApp
    function sendOrderToWhatsApp() {
        const tableNumber = tableNumberElement.textContent.trim();
        const date = new Date();
        const formattedDate = date.toLocaleDateString();  // Formato de fecha
        const formattedTime = date.toLocaleTimeString();  // Formato de hora
    
        // Crear el mensaje de la orden con los productos
        let orderDetails = '';
        let total = 0;
    
        const items = orderList.querySelectorAll('li'); // Obtenemos todos los productos de la lista
        items.forEach(item => {
            const productName = item.dataset.name.trim();  // Asegurar que no haya espacios adicionales
            const quantity = parseInt(item.dataset.quantity);  // Cantidad del producto
            const price = parseFloat(item.dataset.totalPrice).toFixed(2);  // Precio unitario
            const itemTotal = (price * quantity).toFixed(2);  // Calculamos el total por producto
    
            // Formateamos para que el nombre esté en una línea y lo demás en la siguiente
            orderDetails += `${productName}\n  x${quantity} - $${price} c/u - Total: $${itemTotal}\n`;
            total += parseFloat(itemTotal); // Sumamos el total de la orden
        });
    
        // Si no hay productos en la orden, mostramos un mensaje indicando que la orden está vacía
        if (orderDetails === '') {
            orderDetails = 'No se han agregado productos a la orden.\n';
        }
    
        // Crear el mensaje final que será enviado por WhatsApp
        const message = `Mesa: ${tableNumber}\nFecha: ${formattedDate}\nHora: ${formattedTime}\nOrden:\n${orderDetails}Total: $${total.toFixed(2)}`;
    
        const whatsappURL = `https://wa.me/+525636312119?text=${encodeURIComponent(message)}`;
    
        // Redirigir a WhatsApp
        window.location.href = whatsappURL;
    }
    
    

    // Función para agregar los event listeners a los botones de editar y eliminar
    function addEventListenersToItem(orderItem, price) {
        const editButton = orderItem.querySelector('.edit');
        const deleteButton = orderItem.querySelector('.delete');

        editButton.addEventListener('click', () => {
            const currentQuantity = parseInt(orderItem.textContent.match(/x(\d+)/)[1], 10);
            const newQuantity = parseInt(prompt('¿Cuántas unidades deseas?', currentQuantity), 10);
            if (!isNaN(newQuantity) && newQuantity > 0) {
                const newTotalPrice = newQuantity * price;
                orderItem.setAttribute('data-total-price', newTotalPrice);
                orderItem.innerHTML = `${orderItem.dataset.name} x${newQuantity} - $${newTotalPrice.toFixed(2)} 
                    <div class="order-item-buttons">
                        <button class="edit">Editar</button>
                        <button class="delete">Eliminar</button>
                    </div>`;
                updateTotal();

                // Reasignar eventos para los botones
                addEventListenersToItem(orderItem, price);
            }
        });

        deleteButton.addEventListener('click', () => {
            deleteTarget = orderItem;
            deletePopup.classList.remove('hidden');
        });
    }
});








let currentImageIndex = 0;
let images = [];

function openCarousel(imageArray) {
    // Prepara las rutas completas para las imágenes
    images = imageArray.map(image => `../img-productos/${image}`);
    currentImageIndex = 0;

    const carouselImages = document.getElementById('carousel-images');
    carouselImages.innerHTML = '';

    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.style.display = index === 0 ? 'block' : 'none';
        carouselImages.appendChild(img);
    });

    document.getElementById('carousel').style.display = 'flex';
}

function closeCarousel() {
    document.getElementById('carousel').style.display = 'none';
}

function showImage(index) {
    const carouselImages = document.querySelectorAll('#carousel-images img');
    carouselImages.forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none';
    });
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showImage(currentImageIndex);
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showImage(currentImageIndex);
}









let currentIndex = 0;
const menuCategories = document.querySelectorAll(".menu-category");

function showCurrentCategory() {
    menuCategories.forEach((category, index) => {
        if (index === currentIndex) {
            category.classList.add("active");
            category.classList.remove("hidden"); // Muestra la categoría activa
        } else {
            category.classList.remove("active");
            category.classList.add("hidden"); // Oculta las categorías no activas
        }
    });
}

function showNext() {
    currentIndex = (currentIndex + 1) % menuCategories.length; // Cicla hacia el siguiente
    showCurrentCategory();
}

function showPrevious() {
    currentIndex = (currentIndex - 1 + menuCategories.length) % menuCategories.length; // Cicla hacia el anterior
    showCurrentCategory();
}

// Inicializa mostrando el primer div
showCurrentCategory();
