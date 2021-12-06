// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '541300589581'  // UPDATE SENDER ID HERE
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

console.log('Service worker is loaded!');

self.addEventListener('install', function (event) {
    console.log('Service Worker is being installed.');
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker is being activated.', self);

});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (event.notification.data) {
        event.waitUntil(clients.matchAll({ includeUncontrolled: true }).then(function (allClients) {
            console.log('notification clicked', allClients);

            if (allClients.length > 0) {
                allClients.forEach(client => {
                    client.postMessage({
                        clickAction: event.notification.data
                    });
                    if ('focus' in client) client.focus();
                });
            }
            else if (event.notification.data.actionLink) {
                clients.openWindow(event.notification.data.actionLink);
            }
        }));
    }
})

messaging.setBackgroundMessageHandler(function (payload) {

    self.clients.matchAll({ includeUncontrolled: true }).then(allClients => {
        console.log('notification show', allClients, payload);
        allClients.forEach(client => {
            client.postMessage({ notif: payload.data });
        });
    });

    if (!payload.data.action) {

        const notificationTitle = payload.data.title;
        const notificationOptions = {
            tag: payload.data.id,
            body: payload.data.content,
            icon: payload.data.image,
            data: payload.data
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
    }
});