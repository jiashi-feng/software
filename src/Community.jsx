import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  IconButton,
  useTheme,
  Searchbar,
  Chip,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, setFilters, addPost, updatePost } from './store/slices/postsSlice';
import { CommonImages } from './assets/images';

const categories = [
  '全部',
  '清洁技巧',
  '烹饪分享',
  '收纳整理',
  '时间管理',
  '经验分享',
];

const Community = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: posts, status, error, filters } = useSelector(state => state.posts);
  const theme = useTheme();
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleCreatePost = (newPost) => {
    dispatch(addPost(newPost));
  };

  const handlePostPress = (postId) => {
    navigation.navigate('PostDetail', {
      postId,
      onPostUpdate: (postId, updates) => {
        dispatch(updatePost({ id: postId, ...updates }));
      }
    });
  };

  const handleTagPress = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    dispatch(setFilters({ tags: newTags }));
  };

  const handleSearch = (query) => {
    dispatch(setFilters({ searchQuery: query }));
  };

  const handleCategoryChange = (category) => {
    dispatch(setFilters({ category }));
  };

  const handleLikePress = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      dispatch(updatePost({ 
        id: postId, 
        likes: posts.find(p => p.id === postId).likes - 1 
      }));
    } else {
      newLikedPosts.add(postId);
      dispatch(updatePost({ 
        id: postId, 
        likes: posts.find(p => p.id === postId).likes + 1 
      }));
    }
    setLikedPosts(newLikedPosts);
  };

  const handleCommentPress = (postId) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && selectedPostId) {
      const selectedPost = posts.find(p => p.id === selectedPostId);
      const updatedComments = [
        ...selectedPost.comments,
        {
          id: Date.now().toString(),
          author: '当前用户',
          content: newComment.trim(),
          timestamp: '刚刚'
        }
      ];
      
      dispatch(updatePost({
        id: selectedPostId,
        comments: updatedComments
      }));

      setNewComment('');
      setCommentModalVisible(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filters.category === '全部' || post.category === filters.category;
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.every(tag => post.tags?.includes(tag));
    const matchesSearch = !filters.searchQuery || 
      post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return matchesCategory && matchesTags && matchesSearch;
  });

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.errorContainer}>
        <Text>加载失败: {error}</Text>
        <Button onPress={onRefresh}>重试</Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={status === 'loading'} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.header}>
          <Searchbar
            placeholder="搜索家务经验"
            onChangeText={handleSearch}
            value={filters.searchQuery}
            style={styles.searchBar}
          />
        </Surface>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <Chip
              key={category}
              selected={filters.category === category}
              onPress={() => handleCategoryChange(category)}
              style={styles.categoryChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {filters.tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedTagsContainer}
          >
            {filters.tags.map(tag => (
              <Chip
                key={tag}
                selected
                onClose={() => handleTagPress(tag)}
                style={styles.selectedTag}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        )}

        <View style={styles.postsContainer}>
          {filteredPosts.map(post => (
            <Surface 
              key={post.id} 
              style={styles.postCard}
              onPress={() => handlePostPress(post.id)}
            >
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <Avatar.Image
                    size={40}
                    source={post.author.avatar || CommonImages.avatar}
                  />
                  <View style={styles.authorText}>
                    <Text style={styles.authorName}>{post.author.name}</Text>
                    <Text style={styles.authorLevel}>{post.author.level}</Text>
                  </View>
                </View>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content}
              </Text>

              {post.tags && post.tags.length > 0 && (
                <View style={styles.postTags}>
                  {post.tags.map(tag => (
                    <Chip
                      key={tag}
                      onPress={() => handleTagPress(tag)}
                      style={styles.postTag}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}

              <View style={styles.postFooter}>
                <View style={styles.actionButton}>
                  <IconButton
                    icon={likedPosts.has(post.id) ? "heart" : "heart-outline"}
                    size={20}
                    onPress={() => handleLikePress(post.id)}
                    iconColor={likedPosts.has(post.id) ? '#E6E0FF' : '#666666'}
                  />
                  <Text>{post.likes}</Text>
                </View>
                <View style={styles.actionButton}>
                  <IconButton
                    icon="comment-outline"
                    size={20}
                    onPress={() => handleCommentPress(post.id)}
                  />
                  <Text>{post.comments.length}</Text>
                </View>
                <View style={styles.actionButton}>
                  <IconButton
                    icon="share-outline"
                    size={20}
                    onPress={() => {}}
                  />
                </View>
              </View>
            </Surface>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreatePost', {
            onPostCreated: handleCreatePost
          })}
          style={styles.createPostButton}
        >
          发布经验
        </Button>
      </ScrollView>

      <Portal>
        <Modal
          visible={commentModalVisible}
          onDismiss={() => setCommentModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>评论</Text>
            
            <ScrollView style={styles.commentsContainer}>
              {selectedPostId && posts.find(p => p.id === selectedPostId)?.comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="写下你的评论..."
                style={styles.commentInput}
                multiline
              />
              <Button
                mode="contained"
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
                style={styles.submitButton}
              >
                发送
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    elevation: 4,
  },
  searchBar: {
    elevation: 0,
  },
  categoriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  categoryChip: {
    marginRight: 8,
  },
  selectedTagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedTag: {
    marginRight: 8,
  },
  postsContainer: {
    padding: 16,
  },
  postCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorLevel: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 12,
  },
  postTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  createPostButton: {
    margin: 16,
    marginTop: 0,
  },
  likedIcon: {
    color: '#E6E0FF',
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    padding: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  commentsContainer: {
    maxHeight: 400,
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  commentInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginLeft: 8,
  },
});

export default Community;
