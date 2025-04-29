// __tests__/HanleLike.test.js
// Test Suite for handle like clouf function
const {handleLike} = require('../../functions/src/index'); // Adjust path to where your function is defined



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

  type handleLike = {
    post_id:string,
    comment_id:string,
    currentUser:string,
  }

describe('Handle Like of Post or Comment', () => {
    let mockRequest:handleLike;
    let refMock: jest.Mock;
    let pushMock: jest.Mock;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks()

        mockRequest = {
            post_id:'post_id1234',
            comment_id:"comment_1234",
            currentUser:'user123',
        }

        // Get references to the mocks for easier assertions
        refMock = admin.database().ref;
        pushMock = admin.database().ref().push;
    })
    it('should handle a like for a post', async () => {
      await handleLike(mockRequest);
  
      // Verify the database reference path for a comment like
      expect(admin.database().ref()).toHaveBeenCalledWith('/posts/post_id1234/comments/comment_1234/likes');
      
      // Verify like data was pushed to the database
      expect(pushMock).toHaveBeenCalled();
      expect(pushMock().set).toHaveBeenCalledWith({
        userId: 'user123',
        timestamp: expect.any(Number)
      });
    });
    it('should handle a like for a comment', async () => {
      await handleLike(mockRequest);
  
      // Verify the database reference path for a comment like
      expect(refMock).toHaveBeenCalledWith('/posts/post_id1234/comments/comment_1234/likes');
      
      // Verify like data was pushed to the database
      expect(pushMock).toHaveBeenCalled();
      expect(pushMock().set).toHaveBeenCalledWith({
        userId: 'user123',
        timestamp: expect.any(Number)
      });
    });
    it('should throw an error if required fields are missing', async () => {
      // Missing post_id
      const invalidRequest = {
        comment_id: 'comment_1234',
        currentUser: 'user123',
      };
      
      await expect(handleLike(invalidRequest)).rejects.toEqual(
        expect.objectContaining({
          code: 'invalid-argument'
        })
      );
    });
});