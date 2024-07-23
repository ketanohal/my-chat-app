document.addEventListener('DOMContentLoaded', function() {
    const capturePhotoButton = document.getElementById('capture-photo');
    const cameraModal = document.getElementById('camera-modal');
    const closeButton = document.querySelector('.close-button');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const takePhotoButton = document.getElementById('take-photo');
    const messages = document.getElementById('messages');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');

    // Function to send a text message
    function sendMessage(text) {
        if (text.trim() === '') return; // Avoid sending empty messages
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        messageDiv.textContent = text;

        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
        messageInput.value = ''; // Clear the input field
    }

    // Handle sending text messages
    sendButton.addEventListener('click', function() {
        const messageText = messageInput.value;
        sendMessage(messageText);
    });

    // Handle Enter key for sending messages
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent new line in input
            sendMessage(messageInput.value);
        }
    });

    // Handle photo capture
    capturePhotoButton.addEventListener('click', function() {
        cameraModal.style.display = 'block';
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                video.srcObject = stream;
                video.play();
            });
        }
    });

    closeButton.addEventListener('click', function() {
        cameraModal.style.display = 'none';
        let stream = video.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(function(track) {
            track.stop();
        });

        video.srcObject = null;
    });

    takePhotoButton.addEventListener('click', function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataURL;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        img.style.marginBottom = '10px';

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        messageDiv.appendChild(img);

        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
        
        cameraModal.style.display = 'none';
        let stream = video.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(function(track) {
            track.stop();
        });

        video.srcObject = null;
    });
});
