import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async () => {
    
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: '如何高效清洁厨房？',
            content: '分享一些实用的厨房清洁技巧，包括油烟机、灶台和地面的清洁方法...',
            category: '清洁技巧',
            tags: ['厨房', '日常清洁', '深度清洁'],
            author: {
              name: '张妈妈',
              level: '家务达人',
              avatar: null
            },
            timestamp: '2小时前',
            likes: 128,
            comments: [
              {
                id: '1',
                author: '李爸爸',
                content: '很实用的方法，学习了！',
                timestamp: '1小时前'
              }
            ]
          },
          {
            id: '2',
            title: '一周晚餐计划分享',
            content: '这是我的一周晚餐计划，每天不重样，营养均衡...',
            category: '烹饪分享',
            tags: ['厨房', '时间规划', '效率提升'],
            author: {
              name: '美食爱好者',
              level: '中级',
              avatar: null,
            },
            timestamp: '4小时前',
            likes: 256,
            comments: [
              {
                id: '2',
                author: '王妈妈',
                content: '太棒了，收藏了！',
                timestamp: '2小时前'
              }
            ]
          }
        ]);
      }, 1000);
    });
    return response;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    filters: {
      category: '全部',
      tags: [],
      searchQuery: '',
    },
  },
  reducers: {
    addPost: (state, action) => {
      state.items.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.items.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '全部',
        tags: [],
        searchQuery: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addPost, updatePost, setFilters, clearFilters } = postsSlice.actions;

export default postsSlice.reducer;

 