// 产品图片
export const ProductImages = {
  // 清洁用品
  cleaningKit: require('../products/cleaning_kit.jpg'),
  // 收纳工具
  storageBox: require('../products/storage_box.jpg'),
  // 厨房用品
  kitchenSet: require('../products/kitchen_set.jpg'),
  // 厨房手套
  kitchenGloves: require('../products/kitchen_gloves.jpg'),
  // 默认商品图片
  defaultProduct: require('../products/default_product.jpg'),
};

// 家庭头像
export const FamilyAvatars = {
  profile1: require('../common/profile_picture1.webp'),
  profile2: require('../common/profile_picture2.webp'),
  profile3: require('../common/profile_picture3.webp'),
  profile4: require('../common/profile_picture4.webp'),
  profile5: require('../common/profile_picture5.webp'),
  profile6: require('../common/profile_picture6.webp'),
  profile7: require('../common/profile_picture7.webp'),
  profile8: require('../common/profile_picture8.webp'),
  profile9: require('../common/profile_picture9.webp'),
  profile10: require('../common/profile_picture10.webp'),
  profile11: require('../common/profile_picture11.webp'),
};

// 通用图片
export const CommonImages = {
  // Logo 和图标
  logo: require('../common/logo.webp'),
  placeholder: require('../common/placeholder.jpg'),
  avatar: require('../common/default_avatar.webp'),
  eating:require("../common/eating.jpg"),
  emptyBg: require('../common/empty_bg.webp'),
  word_style:require('../common/word_style.png'),
  background: require('../common/background.webp'),
  camping:require("../common/camping.webp"),
  default_avatar:require("../common/default_avatar.webp"),
  single:require("../common/single.webp"),
  unlogin:require("../common/unlogin.png"),
  a2:require("../common/a2.webp"),
  a3:require("../common/a3.webp"),
  a4:require("../common/a4.webp"),
  a5:require("../common/a5.webp"),
  a6:require("../common/a6.webp"),
  a7:require("../common/a7.webp"),
  a10:require("../common/player.webp"),
  a12:require("../common/a12.png"),
  ai_assistant:require("../common/ai_assistant.webp"),
  ai_chat:require("../common/ai_chat.webp"),
  tanchuangBg:require("../common/d1.jpg"),
};

// 导出所有图片
export default {
  ...ProductImages,
  ...FamilyAvatars,
  ...CommonImages,
}; 