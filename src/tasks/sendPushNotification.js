import { admin } from '../config/firebase.cjs';
import User from '../models/user.js';

export async function sendPushNotification(id, title, body) {
  try {
    const user = await User.findOne({ id });
    if (!user?.deviceToken) {
      throw new Error('No device token found for user: ' + id);
    }
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: fmcToken,
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    throw new Error(error);
  }
}
