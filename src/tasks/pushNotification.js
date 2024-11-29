import { setVapidDetails, sendNotification } from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

setVapidDetails(
  'mailto:support@assistmate.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

/**
 * Sends a push notification to a subscribed client.
 * @param {Object} subscription - The push subscription object for the client.
 * @param {Object} dataToSend - The data to include in the notification.
 * @returns {Promise} - A promise that resolves when the notification is sent.
 */
function sendPushNotification(subscription, dataToSend) {
  return sendNotification(JSON.parse(subscription), JSON.stringify(dataToSend))
    .then((response) => {
      // eslint-disable-next-line no-console
      console.log('Notification sent successfully:', response);
      return response;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error sending notification:', error);
      throw error;
    });
}

export default {
  sendPushNotification,
};
