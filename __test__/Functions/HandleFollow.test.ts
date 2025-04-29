import { push } from "@react-native-firebase/database";

const {handleFollow} = require('../../functions/src/index'); // Adjust path to where your function is defined

// Mocks
jest.mock('firebase-admi',() => {
    const pushMock = jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(true)
    })

    const refMock = jest.fn().mockRejectedValue({
        push: pushMock,
        update: jest.fn().mockResolvedValue(true)
    })
    return {
        database: jest.fn().mockReturnValue({
            ref: refMock
        }),
        initializeApp: jest.fn()
    }
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

  type Follow = {
    other_user_id:string,
    currentUser:string,
  }
  describe('Handle Follow CLoud Function', () => {
    let mockRequest:Follow;
    let refMock: jest.Mock;
    let pushMock: jest.Mock;
    let updateMock: jest.Mock;

    beforeEach(() => {
      //resetting mocks before each test
      jest.clearAllMocks()
    })
    mockRequest = {
      other_user_id:'user123',
      currentUser:'user234',
    }
     // Get references to the mocks for easier assertions
    refMock = admin.database().ref;
    pushMock = admin.database().ref().push;
    updateMock = admin.database().ref().update

    // Handle test for following a user
    it('should handle a follow for a user', async () => {
      // Call the Function
      await handleFollow(mockRequest)


       // Assertions
      expect(refMock).toHaveBeenCalledWith(`followers/${mockRequest.other_user_id}`)
      expect(pushMock).toHaveBeenCalledWith()
      expect(pushMock().set).toHaveBeenCalledWith({
        follower_id: mockRequest.currentUser,
        timestamp: expect.any(Number)
      });
    });
    it('should throw an error when following yourself', async () => {
      // Setup request where user tries to follow themselves
      mockRequest.other_user_id = mockRequest.currentUser;
      
      // Call the function and expect it to throw
      await expect(handleFollow(mockRequest)).rejects.toEqual(
        expect.objectContaining({
          code: 'invalid-argument',
          message: expect.stringContaining('cannot follow yourself')
        })
      );
      
      // Verify that database was not called
      expect(pushMock).not.toHaveBeenCalled();
    });
  
    it('should throw an error when user IDs are missing', async () => {
      // Setup invalid request with missing data
      const invalidRequest = { currentUser: '', other_user_id: 'user123' };
      
      // Call the function and expect it to throw
      await expect(handleFollow(invalidRequest as Follow)).rejects.toEqual(
        expect.objectContaining({
          code: 'invalid-argument'
        })
      );
      
      // Verify that database was not called
      expect(pushMock).not.toHaveBeenCalled();
    });
  
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      refMock.mockReturnValueOnce({
        push: jest.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        })
      });
      
      // Call the function and expect it to throw
      await expect(handleFollow(mockRequest)).rejects.toEqual(
        expect.objectContaining({
          code: 'internal',
          message: expect.stringContaining('Error following user')
        })
      );
      
      // Verify that error was logged
      expect(functions.logger.error).toHaveBeenCalled();
    });
  });