/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/firestore";
admin.initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
interface MessageData {
    recipentId?:string
    senderId?:string
  }
interface UserData{
    userId:string
  }
const CONFIG = {
  NOTIFICATION: {
    DEFAULT_TITLE: "Foundry Notification",
    COLLECTION: {
      USERS: "users",
      ROOMS: "chat-rooms",
      MESSAGES: "messages",
      POSTS: "posts",
      COMMENTS: "comments",
    },
  },
} as const;
/**
 * Retrieves a user's device token from Firestore
 * @param {string} userId - The unique identifier of the user
 * @return {Promise<string | null>}
 */
async function getUserDeviceToken(userId: string): Promise<string | null> {
  try {
    const userDoc = await admin.firestore()
      .collection(CONFIG.NOTIFICATION.COLLECTION.USERS)
      .doc(userId)
      .get();
    if (!userDoc.exists) {
      logger.warn(`No user found with ID: ${userId}`);
      return null;
    }
    const token = userDoc.data()?.token;
    if (!token) {
      logger.warn(`No token found for user: ${userId}`);
      return null;
    }
    return token;
  } catch (error) {
    logger.error("Error fetching user device token:", error);
    throw new Error("Failed to fetch device token");
  }
}
/**
 * Retrieves a user's device token from Firestore
 * @param {string} userId - The unique identifier of the user
 * @param {NotificationPayload} notification
 * @return {Promise<void>}*/
async function sendNotification(userId: string,
  notification: NotificationPayload):Promise<void> {
  try {
    const token = await getUserDeviceToken(userId);
    if (!token) {
      throw new Error("No valid device token found for user");
    }
    const payload = {
      notification: {
        title: notification.title || CONFIG.NOTIFICATION.DEFAULT_TITLE,
        body: notification.body,
      },
      data: notification.data,
      token,
    };
    await admin.messaging().send(payload);
    logger.info(`Notification sent successfully to user: ${userId}`);
  } catch (error) {
    logger.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }
  exports.checkAuthUser = onCall((request:CallableRequest<unknown>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated", "This endpoint requires authentication");
    }
    return {authenticated: true, uid: request.auth.uid};
  });
}
exports.newUser = onDocumentCreated(
  `${CONFIG.NOTIFICATION.COLLECTION.USERS}/{userId}`,
  async (event:{data:unknown | any}) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        logger.warn("No data associated with the event");
        return {success: false, error: "No data found"};
      }
      const userData = snapshot.data() as UserData;
      const userId = userData.userId;
      sendNotification(userId, {
        title: "Foundry",
        body: "Welcome to Foundry!",
        data: {
          messageId: snapshot.id,
          type: "new_message",
        },
      });
      return {success: true};
    } catch (error) {
      logger.error("Error processing new message:", error);
      throw new Error("Failed to process new message notification");
    }
  });
exports.newMessage = onDocumentCreated(
  `${CONFIG.NOTIFICATION.COLLECTION.ROOMS}
  /{roomId}/${CONFIG.NOTIFICATION.COLLECTION.MESSAGES}`,
  async (event: { data:unknown | any}) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        logger.warn("No data associated with the event");
        return {success: false, error: "No data found"};
      }
      const messageData = snapshot.data() as MessageData;
      const roomId = snapshot.ref.parent.parent?.id;
      const roomDoc = await admin.firestore()
        .collection(CONFIG.NOTIFICATION.COLLECTION.ROOMS)
        .doc(roomId)
        .get();
      if (!roomDoc.exists) {
        logger.warn(`Room ${roomId} not found`);
        return {success: false, error: "Room not found"};
      }
      const roomData = roomDoc.data();
      const participantsToNotify = roomData?.recipientId.filter(
        (Id: string) => Id !== messageData.senderId);
      const notificationPromises = participantsToNotify.map(
        (Id: string) => sendNotification(Id, {
          title: "New Message",
          body: `You have a new message from ${roomData?.senderName}`,
          data: {
            roomId,
            messageId: snapshot.id,
            type: "new_message",
          },
        }));
      await Promise.all(notificationPromises);
      return {success: true};
    } catch (error) {
      logger.error("Error processing new message:", error);
      throw new Error("Failed to process new message notification");
    }
  });
exports.sendTestNotification = onCall((request:CallableRequest<unknown>) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  try {
    sendNotification(request.auth.uid, {
      title: "Test Notification",
      body: "This is a test notification",
      data: {type: "test"},
    });
    return {success: true};
  } catch (error) {
    logger.error("Error sending test notification:", error);
    throw new HttpsError("internal", "Failed to send test notification");
  }
});
