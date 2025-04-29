// __tests__/addPost.test.js
// At the top of test/index.test.js
//const functiontest = require('firebase-functions-test')();
//const {admin = require('firebase-admin');
//const {admin} = require('../testSetup');
// Import the function after mocking dependencies
const {addPost} = require('../../functions/src/index'); // Adjust path to where your function is defined

// Mocks
jest.mock('firebase-admin',() => {
    const pushMock = jest.fn().mockReturnValue({
        set:jest.fn().mockResolvedValue(true)
    });

    const refMock = jest.fn().mockReturnValue({
        push: pushMock,
        update: jest.fn().mockResolvedValue(true)
    });


    return {
        database: jest.fn().mockReturnValue({
            ref:refMock
        }),
        initializeApp: jest.fn()
    };
});

jest.mock('firebase-functions',() => {
    return {
        https: {
            HttpsError: jest.fn((code, message) => ({code, message})),
            onCall: jest.fn(handler => handler)
        },
        logger: {
            error: jest.fn()
        }
    }
})

type MockPost = {
    auth_id: string | null,
    auth_profile: string,
    name: string,
    content: string,
    like_count: number,
    comment_count: number,
    category: string,
    createdAt: Date,
    imageUrl: string,
    videoUrl: string,
}

describe('addPost Cloud Function', () => {
    let mockRequest:MockPost;

    beforeEach(() => {
        //Reset mocks before each test
        jest.clearAllMocks();


        // Setup default valid request
        mockRequest = {
            auth_id: "user123",
            auth_profile: "",
            name: "user123",
            content: "mock post",
            like_count: 0,
            comment_count: 0,
            category: "",
            createdAt: new Date(),
            imageUrl: "",
            videoUrl: ""
        };
    });
    it('should add a post to the database when authenticated',async () => {
        // Execute the function
        await addPost(mockRequest);

        // Verify databaseref ws called with correct path
        expect(admin.database().ref()).toHaveBeenCalledWith('/posts/')

          // Verify push and set were called
          const dbRef = admin.database().ref('/posts/');
          // Verify set was called with the correct data
          const postData = {
            auth_id: "user123",
            auth_profile: "",
            name: "user123",
            content: "mock post",
            like_count: 0,
            comment_count: 0,
            category: "",
            createdAt: new Date(),
            imageUrl: "",
            videoUrl: ""};
            expect(dbRef.push().set).toHaveBeenCalledWith(postData);
        })
    it('should throw an error when not authenticated', async () => {
        // Create an unauthenticated request
        mockRequest.auth_id = null;
        // Execute and expect an error to be thrown
        await expect(addMessage(mockRequest)).rejects.toEqual({
            code: 'unauthenticated',
            message: 'This endpoint requires authentication'});
            // Verify database was not called
        expect(admin.database().ref).not.toHaveBeenCalled();
    });
    it('should log errors when database operations fail', async () => {
        // Make the database operation fail
        admin.database().ref().push().set.mockRejectedValueOnce(new Error('Database error'));
        // Execute the function
        await addPost(mockRequest);
        // Verify error was logged
        expect(functions.logger.error).toHaveBeenCalledWith('Error Processing Message:',expect.any(Error));
    });
    it('should handle missing data parameters', async () => {
        // Create a request with missing data
        mockRequest.auth_id= 'room123'; // Assign a valid string value
        // Execute the function
        await addMessage(mockRequest);
        // Verify error was logged
        expect(functions.logger.error).toHaveBeenCalled();
    });
});