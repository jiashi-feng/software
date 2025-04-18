import task_data_str from './task_data.json';
import user_data_str from './user_data.json';

// 解析JSON数据
const tasks = JSON.parse(task_data_str);
const user = JSON.parse(user_data_str);

/**
 * 计算用户与特定任务的匹配分数
 * @param {Object} user 用户数据
 * @param {String} task_name 任务名称
 * @param {Object} task_info 任务信息
 * @returns {Object} 匹配详情
 */
function calculateMatchScore(user, task_name, task_info) {
  // 1. 技能匹配度 (0-100分)
  const skill_score = user.skills.includes(task_name) ? 100 : 0;

  // 2. 偏好匹配度 (0-100分)
  let preference_score = 0;
  for (const tag of task_info.tags) {
    if (user.preferences.includes(tag)) {
      preference_score += 50; // 每个匹配的标签加50分
    }
  }
  preference_score = Math.min(preference_score, 100); // 上限100分

  // 3. 时间匹配度 (0-100分)
  let time_score = 0;
  for (const task_slot of task_info.time_slots) {
    if (task_slot === "全天") {
      time_score = 100;
      break;
    }
    for (const user_slot of user.time_slots) {
      if (task_slot === user_slot) {
        time_score += 100 / task_info.time_slots.length;
      }
    }
  }

  // 4. 环境兼容度 (0-100分)
  // 噪音兼容度
  let noise_compatibility = 100;
  if (task_info.environment.includes("高噪音耐受")) {
    noise_compatibility = user.environment["噪音耐受度"];
  } else if (task_info.environment.includes("中等噪音")) {
    noise_compatibility = Math.min(100, user.environment["噪音耐受度"] * 1.5);
  } else if (task_info.environment.includes("低噪音") || task_info.environment.includes("安静")) {
    noise_compatibility = 100; // 低噪音环境对任何人都适合
  }

  // 空间需求兼容度
  let space_compatibility = 100;
  if (task_info.environment.includes("高空间需求")) {
    space_compatibility = user.environment["空间需求"];
  } else if (task_info.environment.includes("中等空间需求")) {
    space_compatibility = Math.min(100, user.environment["空间需求"] * 1.5);
  }

  // 社交密度兼容度
  let social_compatibility = 100;
  if (task_info.environment.includes("高社交密度")) {
    social_compatibility = user.environment["社交密度"];
  } else if (task_info.environment.includes("中等社交密度")) {
    social_compatibility = Math.min(100, user.environment["社交密度"] * 1.5);
  } else if (task_info.environment.includes("低社交密度")) {
    social_compatibility = 100; // 低社交密度对任何人都适合
  }

  // 紧急程度兼容度
  let urgency_compatibility = 100;
  if (task_info.environment.includes("紧急程度高") || task_info.urgency >= 4) {
    urgency_compatibility = user.environment["紧急程度接受度"];
  }

  // 多任务处理兼容度
  let multitask_compatibility = 100;
  if (task_info.environment.includes("可多任务处理")) {
    multitask_compatibility = user.environment["多任务处理"];
  }

  // 计算平均环境兼容度
  const env_score = (
    noise_compatibility +
    space_compatibility +
    social_compatibility +
    urgency_compatibility +
    multitask_compatibility
  ) / 5;

  // 5. 任务水平与难度匹配
  // 假设用户技能中的任务，其难度用户都能胜任
  const level_score = user.skills.includes(task_name) ? 100 : Math.max(0, 100 - (task_info.level - 2) * 20);

  // 计算综合匹配分数 (加权平均)
  // 技能匹配度权重最高，其次是时间匹配和偏好匹配
  const weights = {
    skill: 0.35,
    preference: 0.2,
    time: 0.25,
    environment: 0.15,
    level: 0.05
  };

  const final_score = (
    skill_score * weights.skill +
    preference_score * weights.preference +
    time_score * weights.time +
    env_score * weights.environment +
    level_score * weights.level
  );

  // 详细匹配结果
  const match_details = {
    task_name: task_name,
    task_id: task_info.task_id,
    final_score: Number(final_score.toFixed(2)),
    component_scores: {
      skill_score: skill_score,
      preference_score: preference_score,
      time_score: time_score,
      environment_score: Number(env_score.toFixed(2)),
      level_score: level_score
    }
  };

  return match_details;
}

// 为所有任务计算匹配分数
const all_matches = [];
for (const [task_name, task_info] of Object.entries(tasks)) {
  const match_score = calculateMatchScore(user, task_name, task_info);
  all_matches.push(match_score);
}

// 按匹配分数排序
const sorted_matches = all_matches.sort((a, b) => b.final_score - a.final_score);

// 输出前6个最匹配的任务
console.log(`用户 ${user.name} 的最佳任务匹配:`);

for (let i = 0; i < Math.min(6, sorted_matches.length); i++) {
  const match = sorted_matches[i];
  console.log(`${i + 1}. ${match.task_name} 总匹配分数: ${match.final_score}`);
}