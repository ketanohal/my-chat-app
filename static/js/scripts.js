//
document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const messagesDiv = document.getElementById('messages');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const imageButton = document.getElementById('image-button');
    const cameraButton = document.getElementById('camera-button');
    const imageInput = document.getElementById('image-input');
    const cameraModal = document.getElementById('camera-modal');
    const closeModal = document.getElementById('close-modal');
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture-button');
    const canvas = document.getElementById('canvas');
    const logoutButton = document.getElementById('logout-button');
    const currentUsername = messagesDiv.getAttribute('data-username');

    // Function to fetch and display messages
    function fetchMessages() {
        socket.emit('fetch_messages');
    }

    // Function to scroll to the bottom of the chat window
    function scrollToBottom() {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Fetch messages on load
    fetchMessages();

    socket.on('messages', function(data) {
        messagesDiv.innerHTML = ''; // Clear current messages
        data.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
            if (msg.username === currentUsername) {
                messageElement.classList.add('sent');
            } else {
                messageElement.classList.add('received');
            }
            messagesDiv.appendChild(messageElement);
        });
        scrollToBottom(); // Scroll to bottom after loading messages
    });

    socket.on('receive_message', function(data) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        if (data.username === currentUsername) {
            messageElement.classList.add('sent');
        } else {
            messageElement.classList.add('received');
        }
        messagesDiv.appendChild(messageElement);
        scrollToBottom(); // Scroll to bottom when a new message is received
    });

    // Handle sending text messages
    sendButton.addEventListener('click', function() {
        const messageText = messageInput.value;
        if (messageText.trim() === '') return; // Avoid sending empty messages

        socket.emit('send_message', { message: messageText });
        messageInput.value = ''; // Clear the input field
    });

    // Handle Enter key for sending messages
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent new line in input
            sendButton.click(); // Trigger send button click
        }
    });

    // Handle image upload
    imageButton.addEventListener('click', function() {
        imageInput.click();
    });

    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            socket.emit('send_message', { message: `<img src="${imageUrl}" alt="Image" class="message-image">` });
        };
        reader.readAsDataURL(file);
    });

    // Handle camera capture
    cameraButton.addEventListener('click', function() {
        cameraModal.style.display = 'block';
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            video.srcObject = stream;
        }).catch(err => {
            console.error('Error accessing camera: ', err);
        });
    });

    closeModal.addEventListener('click', function() {
        cameraModal.style.display = 'none';
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    });

    captureButton.addEventListener('click', function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        socket.emit('send_message', { message: `<img src="${imageUrl}" alt="Captured Image" class="message-image">` });
        cameraModal.style.display = 'none';
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', function() {
        window.location.href = '/logout';
    });

    // Show full-size image in modal
    messagesDiv.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('message-image')) {
            const src = event.target.src;
            imageModal.style.display = 'block';
            imageModalContent.src = src;
        }
    });

    // Close image modal when clicking outside
    closeImageModal.addEventListener('click', function() {
        imageModal.style.display = 'none';
    });
});


