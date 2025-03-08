/* eslint-disable camelcase */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {logger} from "firebase-functions/v2";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
interface MessageRepsonse {
  roomId: string;
  request:string,
  text:string,
  senderName:string,
  recipientName:string,
  senderId:string,
  recipientId:string
}
interface PostResponse{
  auth_id: string,
  name: string,
  content: string
  like_count: number
  comment_count: number
  liked_by: string[]
  category: string[]
  imageUrl: string
}
/**
 * Retrieves a user's device token from Firestore
 * @param {string} userId - The unique identifier of the user
 * @return {Promise<string | null>}
 */
async function getUserDeviceToken(userId: string): Promise<string | null> {
  try {
    const userDoc = await getFirestore()
      .collection("users")
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
  notification:unknown | any):Promise<void> {
  try {
    const token = await getUserDeviceToken(userId);
    if (!token) {
      throw new Error("No valid device token found for user");
    }
    const payload = {
      notification: {
        title: notification.title || "Foundry Notification",
        body: notification.body,
      },
      data: notification.data,
      token,
    };
    await getMessaging().send(payload);
    logger.info(`Notification sent successfully to user: ${userId}`);
  } catch (error) {
    logger.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }
}
exports.addMessage = onCall<MessageRepsonse>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  try {
    const newMessage = request.data.text;
    const roomId = request.data.roomId;
    const senderName = request.data.senderName;
    const recipientName = request.data.recipientName;
    const senderId = request.data.senderId;
    const recipientId = request.data.recipientId;
    await getFirestore()
      .collection("chat-rooms")
      .doc(roomId)
      .collection("messages")
      .add({
        senderId: senderId,
        recipientId: recipientId,
        roomId: roomId,
        senderName: senderName,
        recipientName: recipientName,
        text: newMessage,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    logger.error("Error Processing Message:", error);
  }
});
exports.newChatRooomMessage = onDocumentCreated(
  "/chat-rooms/{roomId}/messages/{messageId}",
  async (event: unknown | any) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        logger.warn("No data associated with the event");
        return {success: false, error: "No data found"};
      }
      const messageData = snapshot.data();
      const roomId = event.params.roomId;
      const roomDoc = await getFirestore().collection("chat-rooms")
        .doc(roomId).get();
      if (!roomDoc.exists) {
        logger.warn(`Room ${roomId} not found`);
        return {success: false, error: "Room not found"};
      }
      const roomData = roomDoc.data();
      const participantId = roomData?.recipientId.find(
        (Id: string) => Id !== messageData.senderId);
      if (participantId) {
        await sendNotification(participantId, {
          title: "New Message",
          body: `You have a new message from ${roomData?.senderName}`,
          data: {
            roomId,
            messageId: snapshot.id,
            type: "new_message",
          },
        });
      }
      return {success: true};
    } catch (error) {
      logger.error("Error processing new message:", error);
      throw new Error("Failed to process new message notification");
    }
  });
exports.addPost = onCall<PostResponse>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  try {
    const auth_id = request.data.auth_id;
    const name = request.data.name;
    const content = request.data.content;
    const like_count = request.data.like_count;
    const comment_count = request.data.comment_count;
    const liked_by = request.data.liked_by;
    const category = request.data.category;
    const image = request.data.imageUrl;
    const createdAt = FieldValue.serverTimestamp();
    const newDoc = await getFirestore().collection("posts").add({
      auth_id: auth_id,
      name: name,
      content: content,
      like_count: like_count,
      comment_count: comment_count,
      liked_by: liked_by,
      category: category,
      createdAt: createdAt,
    });
    await getFirestore().collection("posts").doc(newDoc.id).update({
      imageUrl: image,
      post_id: newDoc.id,
    });
    await sendNotification(auth_id, {
      title: "Post has sent!",
    });
  } catch (error) {
    logger.error("Error Proccessing Post:", error);
  }
});
exports.newUser = onCall(async (request: unknown | any) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  const userId = request.data.userId;
  const username = request.data.username;
  await getFirestore().collection("users").doc(userId).set({
    username: username,
    userId: userId,
  });
  return {success: true, msg: "New User!!"};
});
exports.newUserDoc = onDocumentCreated("/users/{userId}",
  async (event:unknown | any) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        logger.warn("No data associated with the event");
        return {success: false, error: "No data found"};
      }
      const userId = event.params.userId;
      await sendNotification(userId, {
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
exports.sendTestNotification = onCall((request: unknown | any) => {
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
