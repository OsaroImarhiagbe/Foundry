/* eslint-disable no-dupe-else-if */
/* eslint-disable max-len */
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
import {onValueWritten} from "firebase-functions/v2/database";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {getDatabase} from "firebase-admin/database";
initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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
exports.addMessage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  try {
    const {content, roomId, senderName, recipientName, senderId, recipientId, status} = request.data;
    const messageRef = getDatabase().ref(`/messages/${roomId}`);
    const newMessage = messageRef.push();
    await newMessage.set({
      senderId: senderId,
      recipientId: recipientId,
      roomId: roomId,
      senderName: senderName,
      recipientName: recipientName,
      content: content,
      status: status,
      createdAt: Date.now(),
    });
    const chatRef = getDatabase().ref(`/chats/${roomId}`);
    await chatRef.update({
      lastMessage: {
        senderId: senderId,
        recipientId: recipientId,
        senderName: senderName,
        status: status,
        recipientName: recipientName,
        content: content,
        createdAt: Date.now(),
      },
    });
  } catch (error) {
    logger.error("Error Processing Message:", error);
  }
});
exports.newChatRooomMessage = onValueWritten("/messages/{roomId}", async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No data associated with the event");
      return {success: false, error: "No data found"};
    }
    const {roomId} = event.params;
    const chatRef = await getDatabase().ref(`/chats/${roomId}`).get();
    if (!chatRef.exists()) {
      logger.warn(`Room ${roomId} not found`);
      return {success: false, error: "Room not found"};
    }
    const senderId = chatRef.val().lastMessage.senderId;
    const Chatroom = chatRef.val();
    const participantId = Chatroom?.lastMessage.recipientId.find((id:string) => id !== senderId);
    if (participantId) {
      await sendNotification(participantId, {
        title: "New Message",
        body: `You have a new message from ${Chatroom?.lastMessage.senderName}`,
        data: {
          roomId,
          messageId: snapshot.after.key,
          type: "message",
        },
      });
    }
    return {success: true};
  } catch (error) {
    logger.error("Error processing new message:", error);
    throw new Error("Failed to process new message notification");
  }
});
exports.addPost = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  try {
    const {auth_id, auth_profile, name, content, category, image, video} = request.data;
    const postRef = getDatabase().ref("/posts");
    const newPost = postRef.push();
    await newPost.set({
      auth_id: auth_id,
      auth_profile: auth_profile,
      name: name,
      content: content,
      like_count: 0,
      comment_count: 0,
      category: category,
      createdAt: Date.now(),
      imageUrl: image,
      videoUrl: video,
    });
    await newPost.update({
      post_id: newPost.key,
    });
    return {success: true};
  } catch (error) {
    logger.error("Error Proccessing Post:", error);
    throw new HttpsError("internal", "Failed to send test notification");
  }
});
exports.handleLike = onCall( async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "This endpoint requires authentication");
  }
  try {
    const {post_id, comment_id, reply_id, currentUser} = request.data;
    let path:string;
    if (post_id) {
      path = `/posts/${post_id}`;
    } else if (comment_id && post_id) {
      path = `/comments/${post_id}/${comment_id}`;
    } else if (reply_id && comment_id) {
      path = `/replies/${comment_id}/${reply_id}`;
    } else {
      throw new HttpsError("internal", "invalid parameters");
    }
    const LikeRef = getDatabase().ref(`${path}/liked_by/${currentUser}`);
    const like_CountRef = getDatabase().ref(`${path}/like_count`);
    const userLiked = await LikeRef.once("value");
    if (userLiked.exists()) {
      LikeRef.remove();
    } else {
      LikeRef.set(true);
    }
    await like_CountRef.transaction((currentCount) => {
      return (currentCount || 0) + (userLiked ? -1 : 1);
    });
    return {success: true};
  } catch (error) {
    logger.error("Error handling like", error);
    throw new HttpsError("internal", "Failed to Like");
  }
});
exports.handleFollow = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "This endpoint requires authentication");
  }
  const {other_user_id, currentUser} = request.data;
  try {
    const connectionRef = getDatabase().ref(`/users/${other_user_id}/connection`);
    const followRef = getDatabase().ref(`/users/${other_user_id}/follow_by/${currentUser}`);

    const followValue = await followRef.once("value");
    if (followValue.exists()) {
      followRef.remove();
    } else {
      followRef.set(true);
    }
    await connectionRef.transaction((currentFollow) => {
      return (currentFollow || 0) + (followValue ? -1 : 1);
    });
    return {sucess: true, followState: !followValue};
  } catch (error:unknown | any) {
    logger.error("Error handling follow", error);
    throw new HttpsError("internal", "Error handling Follow");
  }
});
exports.handleSend = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "This endpoint requires authentication");
  }
  const {post_id, name, content, auth_profile, comment_id, auth_id} = request.data;
  let path:string;
  if (comment_id) {
    path = `/replies/${comment_id}`;
  } else if (post_id) {
    path = `/comments/${post_id}`;
  } else {
    path = "";
  }
  if (comment_id) {
    const ReplyRef = getDatabase().ref(path);
    const newReply = ReplyRef.push();
    await newReply.set({
      auth_id: auth_id,
      name: name,
      content: content,
      auth_profile: auth_profile,
      parentId: comment_id,
      createdAt: Date.now(),
      like_count: 0,
      comment_count: 0,
    });
    await newReply.update({
      reply_id: newReply.key,
    });
  } else {
    try {
      const commentRef = getDatabase().ref(path);
      const newComment = commentRef.push();
      await newComment.set({
        auth_id: auth_id,
        parentId: post_id,
        content: content,
        auth_profile: auth_profile,
        name: name,
        createdAt: Date.now(),
        like_count: 0,
        comment_count: 0,
      });
      await newComment.update({
        comment_id: newComment.key,
      });
      const postRef = getDatabase().ref(`/posts/${post_id}/comment_count`);
      await postRef.transaction((currentData) => {
        const commentCount = currentData || 0;

        return {
          commentCount: commentCount + 1,
        };
      });
    } catch (error) {
      logger.error("Error handling Comments or Replys", error);
    }
  }
});
exports.addProject = onCall(async (request) =>{
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "This endpoint requires authentication");
  }
  const {Name, Overview, Tech, currentProjectId, image} = request.data;
  const docRef = getFirestore()
    .collection("projects")
    .doc(request.auth.uid)
    .collection("projects")
    .doc(currentProjectId);
  const docSnapshot = await docRef.get();
  try {
    if (docSnapshot.exists) {
      await docRef.update({
        Name: Name,
        Overview: Overview,
        Tech: Tech,
        image: image,
        updatedAt: new Date(),
      });
      return {success: true, projectid: docRef.id};
    } else {
      const newDoc = await getFirestore()
        .collection("projects")
        .doc(request.auth.uid)
        .collection("projects")
        .add({
          Name: Name,
          Overview: Overview,
          Tech: Tech,
          image: image,
          createdAt: FieldValue.serverTimestamp(),
        });
      await getFirestore()
        .collection("projects")
        .doc(request.auth.uid)
        .collection("projects")
        .doc(newDoc.id)
        .update({
          projectid: newDoc.id,
        });
      return {success: true, projectid: newDoc.id};
    }
  } catch (error) {
    logger.error("Error sending project", error);
    throw new HttpsError("internal", "Failed to send project");
  }
});
exports.newUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  const {username, userId} = request.data;
  await getFirestore().collection("users").doc(userId).set({
    username: username,
    userId: userId,
  });
  return {success: true, msg: "New User!!"};
});
exports.newUserDoc = onDocumentCreated("/users/{userId}",
  async (event) => {
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
exports.sendTestNotification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  try {
    await sendNotification(request.auth.uid, {
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
