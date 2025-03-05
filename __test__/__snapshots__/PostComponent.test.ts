import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostComponent from 'app/components/PostComponent';
import { Alert } from 'react-native';
import {addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, runTransaction} from '@react-native-firebase/firestore';
import { useAuth } from '../../app/authContext';


jest.mock('../../app/authContext', () => ({
  useAuth: jest.fn()
}));// A function in jest framework used to mock modules jest.mock()

jest.mock('@react-native-firebase/firestore',() => ({ // mocking the react-native-firebase/firestore module
    addDoc: jest.fn(),
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    runTransaction: jest.fn(),
    Timestamp: {
      fromDate: jest.fn(() => 'mocked-timestamp')
    }
}))

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('react-native-vector-icons/Feather', () => 'Feather');
jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(() => 100),
  heightPercentageToDP: jest.fn(() => 100)
}));
jest.mock('expo-image', () => ({
  Image: 'MockedImage'
}));
jest.mock('FIrebaseConfig', () => ({
  db: 'mockedDB',
  PostRef: 'mockedPostRef'
}));
jest.mock('react-native-fast-image', () => 'FastImage');
jest.mock('@shopify/flash-list', () => ({
  FlashList: 'MockedFlashList'
}));
jest.mock('react-native', () => {
  const originalModule = jest.requireActual('react-native');
  return {
    ...originalModule,
    Alert: {
      alert: jest.fn()
    }
  };
});

describe('PostComponent', () => {
  // Setup common props and mocks before each test
  const mockPost = {
    auth_profile: 'https://example.com/profile.jpg',
    count: 5,
    url: 'https://example.com/image.jpg',
    id: 'post123',
    name: 'testuser',
    content: 'This is a test post',
    date: '2025-03-04',
    comment_count: 3,
  };
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: 'user123', username: 'testuser' },
    });
  });
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        userId: 'test-user-id',
        username: 'testuser'
      }
    });

    // Mock Firebase functions
    (onSnapshot as jest.Mock).mockImplementation((query:unknown | string, callback:unknown | any) => {
      callback({
        empty: false,
        forEach: (fn:unknown | any) => {
          fn({
            data: () => ({
              auth_profile: 'test-profile',
              like_count: 5,
              content: 'Test comment',
              name: 'Test User',
              createdAt: {
                toDate: () => new Date()
              }
            }),
            id: 'comment-1'
          });
        }
      });
      return jest.fn(); // Return unsubscribe function
    });

    (doc as jest.Mock).mockReturnValue('docRef');
    (collection as jest.Mock).mockReturnValue('collectionRef');
    (query as jest.Mock).mockReturnValue('queryRef');
    (orderBy as jest.Mock).mockReturnValue('orderByRef');
  });

  // Basic rendering test
  it('renders correctly with required props', () => {
    const props = {
      id: 'test-post-id',
      auth_profile: 'https://example.com/profile.jpg',
      name: 'Test User',
      content: 'This is a test post',
      date: '2023-01-01',
      count: 10,
      comment_count: 5
    };

    const { getByText } = render(<PostComponent {...mockPost} />);
    
    expect(getByText('@Test User')).toBeTruthy();
    expect(getByText('This is a test post')).toBeTruthy();
    expect(getByText('2023-01-01')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  // Test like functionality
  it('calls handleLike when like button is pressed', async () => {
    (runTransaction as jest.Mock).mockImplementation((db, callback) => {
      callback({
        get: async () => ({
          exists: true,
          data: () => ({
            like_count: 10,
            liked_by: []
          })
        }),
        update: jest.fn()
      });
      return Promise.resolve();
    });

    const props = {
      id: 'test-post-id',
      count: 10,
      name: 'Test User',
      content: 'Test content'
    };

    const { getByText } = render(<PostComponent {...props} />);
    
    // Find and press the like button (it has the count text)
    fireEvent.press(getByText('10'));
    
    await waitFor(() => {
      expect(runTransaction).toHaveBeenCalled();
    });
  });

  // Test comment modal opening
  it('opens comment modal when comment button is pressed', () => {
    const props = {
      id: 'test-post-id',
      comment_count: 5,
      name: 'Test User',
      content: 'Test content'
    };

    const { getByText } = render(<PostComponent {...props} />);
    
    // Find and press the comment button
    fireEvent.press(getByText('5'));
    
    // Check if modal title is visible
    expect(getByText('Comments')).toBeTruthy();
  });

  // Test delete functionality
  it('calls handleDelete when delete option is selected', async () => {
    (deleteDoc as jest.Mock).mockResolvedValue();
    
    const props = {
      id: 'test-post-id',
      name: 'Test User',
      content: 'Test content'
    };

    const { getByText } = render(<PostComponent {...props} />);
    
    // This will depend on how you trigger the menu in tests
    // This is a simplified example and might need adaptation

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Post Deleted!');
    });
  });

  // Test sending a comment
  it('sends a new comment when the send button is pressed', async () => {
    (addDoc as jest.Mock).mockResolvedValue({
      update: jest.fn()
    });
    
    const props = {
      id: 'test-post-id',
      name: 'Test User',
      content: 'Test content',
      comment_count: 5
    };

    const { getByText, getByPlaceholderText } = render(<PostComponent {...props} />);
    
    // Open comment modal
    fireEvent.press(getByText('5'));
    
    // Enter comment text
    const input = getByPlaceholderText('Write a comment...');
    fireEvent.changeText(input, 'This is a test comment');
    
    // Press send button
    fireEvent.press(getByText('Send'));
    
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(runTransaction).toHaveBeenCalled();
    });
  });
});