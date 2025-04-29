// __tests__/addMessage.test.js
// At the top of test/index.test.js
//const functiontest = require('firebase-functions-test')();
//const admin = require('firebase-admin');
// Import the function after mocking dependencies
//const { admin } = require('../testSetup');
const {addMessage} = require('../../functions/src/index'); // Adjust path to where your function is defined

// Mocks
jest.mock('firebase-admin', () => {
  const pushMock = jest.fn().mockReturnValue({
    set: jest.fn().mockResolvedValue(true)
  });
  
  const refMock = jest.fn().mockReturnValue({
    push: pushMock,
    update: jest.fn().mockResolvedValue(true)
  });
  
  return {
    database: jest.fn().mockReturnValue({
      ref: refMock
    }),
    initializeApp: jest.fn()
  };
});

jest.mock('firebase-functions', () => {
  return {
    https: {
      HttpsError: jest.fn((code, message) => ({ code, message })),
      onCall: jest.fn(handler => handler)
    },
    logger: {
      error: jest.fn()
    }
  };
});


type MockMessage = {
    auth:string | null,
    content:string,
    roomId:string,
    senderName:string,
    recipientName:string,
    senderId:string,
    recipientId:string,
    status:string
}
describe('addMessage Cloud Function', () => {
  let mockRequest:MockMessage;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup a default valid request
    mockRequest = {
        auth: 'user123' ,
        content: 'Hello world',
        roomId: 'room123',
        senderName: 'Sender',
        recipientName: 'Recipient',
        senderId: 'sender123',
        recipientId: 'recipient123',
        status: 'sent'
    };
  });

  it('should add a message to the database when authenticated', async () => {
    // Execute the function
    await addMessage(mockRequest);
    
    // Verify database ref was called with correct path
    expect(admin.database().ref()).toHaveBeenCalledWith('/messages/room123');
    
    // Verify push and set were called
    const dbRef = admin.database().ref('/messages/room123');
    expect(dbRef.push).toHaveBeenCalled();
    
    // Verify set was called with the correct data
    const messageData = {
      senderId: 'sender123',
      recipientId: 'recipient123',
      roomId: 'room123',
      senderName: 'Sender',
      recipientName: 'Recipient',
      content: 'Hello world',
      status: 'sent',
      createdAt: expect.any(Number)
    };
    expect(dbRef.push.set).toHaveBeenCalledWith(messageData);
    
    // Verify chat ref was updated with last message
    expect(admin.database().ref).toHaveBeenCalledWith('/chats/room123');
    
    const chatRef = admin.database().ref('/chats/room123');
    expect(chatRef.update).toHaveBeenCalledWith({
      lastMessage: {
        senderId: 'sender123',
        recipientId: 'recipient123',
        senderName: 'Sender',
        recipientName: 'Recipient',
        content: 'Hello world',
        status: 'sent',
        createdAt: expect.any(Number)
      }
    });
  });

  it('should throw an error when not authenticated', async () => {
    // Create an unauthenticated request
    mockRequest.auth = null;
    
    // Execute and expect an error to be thrown
    await expect(addMessage(mockRequest))
      .rejects
      .toEqual({
        code: 'unauthenticated',
        message: 'This endpoint requires authentication'
      });
    
    // Verify database was not called
    expect(admin.database().ref).not.toHaveBeenCalled();
  });

  it('should log errors when database operations fail', async () => {
    // Make the database operation fail
    admin.database().ref().push().set.mockRejectedValueOnce(new Error('Database error'));
    
    // Execute the function
    await addMessage(mockRequest);
    
    // Verify error was logged
    expect(functions.logger.error).toHaveBeenCalledWith(
      'Error Processing Message:',
      expect.any(Error)
    );
  });

  it('should handle missing data parameters', async () => {
    // Create a request with missing data
    mockRequest.roomId = 'room123'; // Assign a valid string value
    
    // Execute the function
    await addMessage(mockRequest);
    
    // Verify error was logged
    expect(functions.logger.error).toHaveBeenCalled();
  });
});