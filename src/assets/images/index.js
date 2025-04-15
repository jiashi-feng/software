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
  profile1: require('../common/profile_picture1.png'),
  profile2: require('../common/profile_picture2.png'),
  profile3: require('../common/profile_picture3.png'),
  profile4: require('../common/profile_picture4.png'),
  profile5: require('../common/profile_picture5.png'),
  profile6: require('../common/profile_picture6.png'),
  profile7: require('../common/profile_picture7.png'),
  profile8: require('../common/profile_picture8.png'),
  profile9: require('../common/profile_picture9.png'),
  profile10: require('../common/profile_picture10.png'),
  profile11: require('../common/profile_picture11.png'),
};

// 通用图片
export const CommonImages = {
  // Logo 和图标
  logo: require('../common/logo.png'),
  placeholder: require('../common/placeholder.jpg'),
  avatar: require('../common/default_avatar.png'),
  eating:require("../common/eating.jpg"),
  emptyBg: require('../common/empty_bg.png'),
  word_style:require('../common/word_style.png'),
  background: require('../common/background.png'),
  camping:require("../common/camping.png"),
  default_avatar:require("../common/default_avatar.png"),
  single:require("../common/single.png"),
  unlogin:require("../common/unlogin.png"),
  a2:require("../common/a2.png"),
  a3:require("../common/a3.png"),
  a4:require("../common/a4.png"),
  a5:require("../common/a5.png"),
  a6:require("../common/a6.png"),
  a7:require("../common/a7.png"),
  a10:require("../common/player.png"),
  a12:require("../common/a12.png"),
  ai_assistant:require("../common/ai_assistant.png"),
  ai_chat:require("../common/ai_chat.png"),
  tanchuangBg:require("../common/d1.jpg"),
};

// 导出所有图片
export default {
  ...ProductImages,
  ...FamilyAvatars,
  ...CommonImages,
}; 