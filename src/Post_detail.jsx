import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  IconButton,
  TextInput,
  Divider,
  useTheme,
} from 'react-native-paper';
import { CommonImages } from './assets/images';

const PostDetail = ({ route, navigation }) => {
  const { postId, onPostUpdate } = route.params;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: '李爸爸',
      content: '很实用的方法，学习了！',
      timestamp: '1小时前'
    }
  ]);
  const theme = useTheme();

  
  const post = {
    id: postId,
    title: '如何高效清洁厨房？',
    content: '分享一些实用的厨房清洁技巧：\n\n1. 油烟机清洁\n- 使用专业的油烟机清洁剂\n- 定期清洗滤网\n- 注意通风\n\n2. 灶台清洁\n- 使用小苏打和醋\n- 及时清理油渍\n- 保持干燥\n\n3. 地面清洁\n- 选择合适的清洁剂\n- 使用拖把或抹布\n- 定期消毒\n\n这些方法都很实用，希望对大家有帮助！',
    author: {
      name: '张妈妈',
      level: '家务达人',
      avatar: null
    },
    timestamp: '2小时前',
    likes: 128,
    comments: comments
  };

  const handleLike = () => {
    if (onPostUpdate) {
      onPostUpdate(postId, {
        likes: post.likes + 1
      });
    }
  };

  const handleComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        author: '当前用户',
        content: comment.trim(),
        timestamp: '刚刚'
      };
      setComments(prevComments => [newComment, ...prevComments]);
      setComment('');
      
      if (onPostUpdate) {
        onPostUpdate(postId, {
          comments: [newComment, ...comments]
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.postCard}>
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
          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postFooter}>
            <View style={styles.actionButton}>
              <IconButton
                icon="heart-outline"
                size={20}
                onPress={handleLike}
              />
              <Text>{post.likes}</Text>
            </View>
            <View style={styles.actionButton}>
              <IconButton
                icon="comment-outline"
                size={20}
                onPress={() => {}}
              />
              <Text>{comments.length}</Text>
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

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>评论 ({comments.length})</Text>
          {comments.map(comment => (
            <Surface key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthorInfo}>
                  <Avatar.Image
                    size={32}
                    source={CommonImages.avatar}
                  />
                  <View style={styles.commentAuthorText}>
                    <Text style={styles.commentAuthorName}>{comment.author}</Text>
                    <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                  </View>
                </View>
                <IconButton
                  icon="more-vert"
                  size={20}
                  onPress={() => {}}
                />
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <View style={styles.commentActions}>
                <IconButton
                  icon="heart-outline"
                  size={16}
                  onPress={() => {}}
                />
                <IconButton
                  icon="reply"
                  size={16}
                  onPress={() => {}}
                />
              </View>
            </Surface>
          ))}
        </View>
      </ScrollView>

      <Surface style={styles.commentInput}>
        <TextInput
          placeholder="写下你的评论..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
        />
        <Button
          mode="contained"
          onPress={handleComment}
          disabled={!comment.trim()}
          style={styles.sendButton}
        >
          发送
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
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
    marginLeft: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthorText: {
    marginLeft: 8,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 8,
  },
});

export default PostDetail; 