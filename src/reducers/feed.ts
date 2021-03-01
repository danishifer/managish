import { FETCH_FEED_SUCCESS, REFRESH_FEED_REQUEST, REFRESH_FEED_SUCCESS, FETCH_FEED_PAGE_REQUEST, FETCH_FEED_PAGE_SUCCESS, FETCH_FEED_PAGE_FAILURE } from '../actions/index';
import update from 'immutability-helper';
import { 
  REVIEW_LIKE_ADD_REQUEST,
  REVIEW_LIKE_ADD_SUCCESS, 
  REVIEW_TOGGLE_REPLIES, 
  REVIEW_LIKE_REMOVE_REQUEST, 
  REPLY_LIKE_ADD_REQUEST, 
  REPLY_LIKE_REMOVE_REQUEST,
  REPLY_INPUT_CHANGE,
  REPLY_SEND_REQUEST,
  REPLY_SEND_SUCCESS
} from '../actions/feed';
import {REVIEW_SUBMIT_SUCCESS} from '../actions/review';

import { FeedState } from '../App';

const initialState: FeedState = {
  loading: true,
  loadingMore: false,
  posts: [],
  postsCount: 0,
  fetchedPostsCount: 0,
  nextPost: null,
  openReplies: {},
  repliesText: {},
  repliesLoading: {},
  refreshing: false,
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case REVIEW_SUBMIT_SUCCESS:
      return update(state, {
        posts: { $unshift: [action.payload.review] }
      })
    case REVIEW_TOGGLE_REPLIES:
      return update(state, {
        openReplies: {
          [action.payload]: { $set: !state.openReplies[action.payload] }
        }
      })
    case REVIEW_LIKE_ADD_REQUEST: {
      const reviewIndex = state.posts.findIndex(e => e.id === action.payload.reviewId);
      const review = update(state.posts.find(e => e.id === action.payload.reviewId), {
        votes: { positive: { $push: [action.payload.userId] }}
      });
      return update(state, {
        posts: { [reviewIndex]: { $set: review } }
      })
    }
    case REVIEW_LIKE_REMOVE_REQUEST: {
      const reviewIndex = state.posts.findIndex(e => e.id === action.payload.reviewId);
      const review = state.posts.find(e => e.id === action.payload.reviewId);
      const voteIndex = review.votes.positive.findIndex(e => e === action.payload.userId);
      const updatedReview = update(review, {
        votes: { positive: { $splice: [[voteIndex, 1]] }}
      });
      return update(state, {
        posts: { [reviewIndex]: { $set: updatedReview } }
      });
    }
    case REPLY_LIKE_ADD_REQUEST: {
      const reviewIndex = state.posts.findIndex(e => e.id === action.payload.reviewId);
      const replyIndex = state.posts[reviewIndex].replies.findIndex(e => e.id === action.payload.replyId);
      const reply = update(state.posts[reviewIndex].replies.find(e => e.id === action.payload.replyId), {
        votes: { positive: { $push: [action.payload.userId ]}}
      });

      return update(state, {
        posts: { [reviewIndex]: { replies: { [replyIndex]: { $set: reply } } } }
      })
    }
    case REPLY_LIKE_REMOVE_REQUEST: {
      const reviewIndex = state.posts.findIndex(e => e.id === action.payload.reviewId);
      const replyIndex = state.posts[reviewIndex].replies.findIndex(e => e.id === action.payload.replyId);

      const reply = state.posts[reviewIndex].replies[replyIndex];
      const voteIndex = reply.votes.positive.findIndex(e => e === action.payload.userId);
      const updatedreply = update(reply, {
        votes: { positive: { $splice: [[voteIndex, 1]] }}
      });
      return update(state, {
        posts: { [reviewIndex]: { replies: { [replyIndex]: { $set: updatedreply } } } }
      });
    }
    case REVIEW_LIKE_ADD_SUCCESS:
      return state;
    case REPLY_INPUT_CHANGE:
      return update(state, {
        repliesText: { [action.payload.reviewId]: { $set: action.payload.text } }
      })
    case REPLY_SEND_REQUEST:
      return update(state, {
        repliesLoading: { [action.payload.reviewId]: { $set: true } }
      });
    case REPLY_SEND_SUCCESS: {
      const reviewIndex = state.posts.findIndex(e => e.id === action.payload.reviewId);
      let review = update(state.posts[reviewIndex], {
        replies: { $push: [action.payload.reply] }
      })
      return update(state, {
        repliesText: { [action.payload.reviewId]: { $set: "" } },
        repliesLoading: { [action.payload.reviewId]: { $set: false } },
        posts: { [reviewIndex]: { $set: review }}
      })
    }
    case FETCH_FEED_SUCCESS: {
      const posts: [] = action.payload.posts;
      const fetchedPostsCount = posts.length;
      let nextPost;
      if (posts.length < action.payload.postsCount) {
        nextPost = posts.pop();
      }

      return update(state, {
        loading: { $set: false },
        posts: { $set: posts },
        postsCount: { $set: action.payload.postsCount },
        fetchedPostsCount: { $set: fetchedPostsCount },
        nextPost: { $set: nextPost }
      });
    }
    case REFRESH_FEED_REQUEST:
      return update(state, {
        refreshing: { $set: true }
      })
    case REFRESH_FEED_SUCCESS: {
      const posts: [] = action.payload.posts;
      const fetchedPostsCount = posts.length;
      let nextPost;
      if (posts.length < action.payload.postsCount) {
        nextPost = posts.pop();
      }
      return update(state, {
        refreshing: { $set: false },
        posts: { $set: posts },
        postsCount: { $set: action.payload.postsCount },
        fetchedPostsCount: { $set: fetchedPostsCount },
        nextPost: { $set: nextPost}
      })
    }
    case FETCH_FEED_PAGE_REQUEST:
      return update(state, {
        loadingMore: { $set: true }
      })
    case FETCH_FEED_PAGE_SUCCESS: {
      const posts: [] = action.payload.posts;
      const fetchedPostsCount = state.fetchedPostsCount + posts.length - 1; // remove one for paging
      let nextPost;
      if (fetchedPostsCount < action.payload.postsCount) {
        nextPost = posts.pop();
      }

      return update(state, {
        loadingMore: { $set: false },
        posts: { $push: [...posts] },
        postsCount: { $set: action.payload.postsCount },
        fetchedPostsCount: { $set: fetchedPostsCount },
        nextPost: { $set: nextPost }
      })
    }
    case FETCH_FEED_PAGE_FAILURE: {
      return update(state, {
        loadingMore: { $set: false }
      })
    }
    default:
      return state;
  }
}