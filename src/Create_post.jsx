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
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  Chip,
  IconButton,
} from 'react-native-paper';

const CreatePost = ({ route, navigation }) => {
  const { onPostCreated } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const theme = useTheme();

  const categories = [
    '清洁技巧',
    '烹饪分享',
    '收纳整理',
    '时间管理',
    '经验分享',
  ];

  const commonTags = [
    '厨房',
    '客厅',
    '卧室',
    '卫生间',
    '阳台',
    '日常清洁',
    '深度清洁',
    '收纳技巧',
    '时间规划',
    '效率提升',
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (title.trim() && content.trim() && category) {
      const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        author: {
          name: '当前用户',
          level: '家务达人',
          avatar: null
        },
        timestamp: '刚刚',
        likes: 0,
        comments: []
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.form}>
          <TextInput
            label="标题"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholder="请输入标题"
            maxLength={50}
          />

          <Text style={styles.label}>分类</Text>
          <SegmentedButtons
            value={category}
            onValueChange={setCategory}
            buttons={categories.map(cat => ({ value: cat, label: cat }))}
            style={styles.segmentedButtons}
          />

          <Text style={styles.label}>标签</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                style={styles.tag}
              >
                {tag}
              </Chip>
            ))}
          </View>
          <View style={styles.tagInput}>
            <TextInput
              placeholder="添加标签"
              value={newTag}
              onChangeText={setNewTag}
              style={styles.tagInputField}
            />
            <IconButton
              icon="plus"
              size={24}
              onPress={handleAddTag}
              disabled={!newTag.trim()}
            />
          </View>

          <Text style={styles.label}>常用标签</Text>
          <View style={styles.commonTagsContainer}>
            {commonTags.map(tag => (
             <Chip
             key={tag}
             onPress={() => {
               if (!tags.includes(tag)) {
                 setTags([...tags, tag]);
               }
             }}
             style={[
               {
                 marginRight: 8,
                 marginBottom: 8,
                 backgroundColor: tags.includes(tag) ? '#E6E0FF' : '#FFFFFF',
                 borderWidth: 1,
                 borderColor: tags.includes(tag) ? '#E6E0FF' : '#E6E0FF',
               }
             ]}
             textStyle={{
               color: tags.includes(tag) ? '#666666' : '#666666'
             }}
           >
             {tag}
           </Chip>
            ))}
          </View>

          <TextInput
            label="内容"
            value={content}
            onChangeText={setContent}
            style={styles.contentInput}
            placeholder="分享你的家务经验..."
            multiline
            numberOfLines={10}
            maxLength={1000}
          />

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>发布提示：</Text>
            <Text style={styles.tip}>• 标题最多50个字</Text>
            <Text style={styles.tip}>• 内容最多1000个字</Text>
            <Text style={styles.tip}>• 建议分享实用的家务技巧和经验</Text>
            <Text style={styles.tip}>• 可以添加图片（开发中）</Text>
          </View>
        </Surface>
      </ScrollView>

      <Surface style={styles.footer}>
        <View style={styles.wordCount}>
          <Text style={styles.countText}>
            已输入 {content.length}/1000 字
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!title.trim() || !content.trim() || !category}
          style={styles.submitButton}
        >
          发布
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
  form: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  titleInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  contentInput: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 4,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  tip: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    elevation: 4,
  },
  wordCount: {
    flex: 1,
  },
  countText: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    marginLeft: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagInputField: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  commonTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  commonTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#6200ee',
  },
});

export default CreatePost; 