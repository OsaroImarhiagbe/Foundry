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
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {getDatabase, ServerValue} from "firebase-admin/database";
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
    const {newMessage, roomId, senderName, recipientName, senderId, recipientId} = request.data;
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
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        logger.warn("No data associated with the event");
        return {success: false, error: "No data found"};
      }
      const messageData = snapshot.data();
      const {roomId} = event.params;
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
exports.addPost = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", "This endpoint requires authentication");
  }
  try {
    const {auth_id, name, content, like_count, comment_count, liked_by, category, image, video} = request.data;
    const createdAt = ServerValue.TIMESTAMP;
    const postRef = getDatabase().ref("/posts");
    const newPost = postRef.push();
    await newPost.set({
      auth_id: auth_id,
      name: name,
      content: content,
      like_count: like_count,
      comment_count: comment_count,
      liked_by: liked_by,
      category: category,
      createdAt: createdAt,
      imageUrl: image,
      post_id: " ",
      videoUrl: video,
    });
    await newPost.update({
      post_id: newPost.key,
    });
    await sendNotification(auth_id, {
      title: "Post has sent!",
      body: "Your post has been successfully sent",
      data: {
        type: "new_message",
      },
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
    const {post_id, currentUser, comment_id, reply_id} = request.data;
    if (post_id) {
      const docRef = getDatabase().ref(`/posts/${post_id}`);
      await docRef.transaction((currentData) => {
        if (!currentData) {
          throw new HttpsError("not-found", "Document doesn't exist");
        }
        const currentLikes = currentData?.data()?.like_count || 0;
        const likeBy = currentData?.liked_by || [];
        const hasliked = likeBy.includes(currentUser);
        let newlike;
        let updatedLike;
        if (hasliked) {
          newlike = currentLikes - 1;
          updatedLike = likeBy.filter((id:string)=> id != currentUser);
        } else {
          newlike = currentLikes + 1;
          updatedLike = [...likeBy, currentUser];
        }
        return {
          ...currentData,
          like_count: newlike,
          liked_by: updatedLike,
        };
      });
    } else if (comment_id) {
      const docRef = getDatabase().ref(`/comments/${comment_id}`);
      await docRef.transaction((currentData) => {
        if (!currentData) {
          throw new HttpsError("not-found", "Document doesn't exist");
        }
        const currentLikes = currentData?.data()?.like_count || 0;
        const likeBy = currentData?.liked_by || [];
        const hasliked = likeBy.includes(currentUser);
        let newlike;
        let updatedLike;
        if (hasliked) {
          newlike = currentLikes - 1;
          updatedLike = likeBy.filter((id:string)=> id != currentUser);
        } else {
          newlike = currentLikes + 1;
          updatedLike = [...likeBy, currentUser];
        }
        return {
          ...currentData,
          like_count: newlike,
          liked_by: updatedLike,
        };
      });
    } else {
      const docRef = getDatabase().ref(`/replys/${reply_id}`);
      await docRef.transaction((currentData) => {
        if (!currentData) {
          throw new HttpsError("not-found", "Document doesn't exist");
        }
        const currentLikes = currentData?.data()?.like_count || 0;
        const likeBy = currentData?.liked_by || [];
        const hasliked = likeBy.includes(currentUser);
        let newlike;
        let updatedLike;
        if (hasliked) {
          newlike = currentLikes - 1;
          updatedLike = likeBy.filter((id:string)=> id != currentUser);
        } else {
          newlike = currentLikes + 1;
          updatedLike = [...likeBy, currentUser];
        }
        return {
          ...currentData,
          like_count: newlike,
          liked_by: updatedLike,
        };
      });
    }
  } catch (error) {
    logger.error("Error handling like", error);
    throw new HttpsError("internal", "Failed to Like");
  }
});
exports.handleSend = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "This endpoint requires authentication");
  }
  const {post_id, name, content, createdAt, auth_profile, comment_id} = request.data;
  if (comment_id) {
    const docRef = getDatabase().ref(`/replys/${comment_id}`);
    const newReply = docRef.push();
    await newReply.set({
      name: name,
      content: content,
      parentId: comment_id,
      createdAt: createdAt,
    });
    await newReply.update({
      id: newReply.key,
    });
  } else {
    try {
      const docRef = getDatabase().ref(`/comments/${post_id}`);
      const newComment = docRef.push();
      await newComment.set({
        parentId: " ",
        content: content,
        auth_profile: auth_profile,
        name: name,
        createdAt: createdAt,
      });
      await newComment.update({
        comment_id: newComment.key,
      });
      const postRef = getDatabase().ref(`/posts/${post_id}`);
      await postRef.transaction((currentData) => {
        const commentCount = currentData.comment_count || 0;

        return {
          commentCount: commentCount +1,
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
