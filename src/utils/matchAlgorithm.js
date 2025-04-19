/**
 * 用户与任务的匹配算法
 * 根据算法.js中的算法逻辑实现
 */

/**
 * 计算用户与特定任务的匹配分数
 * @param {Object} user 用户数据
 * @param {Object} task 任务信息
 * @returns {Object} 匹配详情
 */
function calculateMatchScore(user, task) {
  // 1. 技能匹配度 (0-100分)
  const skill_score = user.skills.includes(task.name) ? 100 : 0;

  // 2. 偏好匹配度 (0-100分)
  let preference_score = 0;
  for (const tag of task.tags) {
    if (user.preferences.includes(tag)) {
      preference_score += 50; // 每个匹配的标签加50分
    }
  }
  preference_score = Math.min(preference_score, 100); // 上限100分

  // 3. 时间匹配度 (0-100分)
  let time_score = 0;
  for (const task_slot of task.time_slots) {
    if (task_slot === "全天") {
      time_score = 100;
      break;
    }
    for (const user_slot of user.time_slots) {
      if (task_slot === user_slot) {
        time_score += 100 / task.time_slots.length;
      }
    }
  }

  // 4. 环境兼容度 (0-100分)
  // 噪音兼容度
  let noise_compatibility = 100;
  if (task.environment.includes("高噪音耐受")) {
    noise_compatibility = user.environment.噪音耐受度;
  } else if (task.environment.includes("中等噪音")) {
    noise_compatibility = Math.min(100, user.environment.噪音耐受度 * 1.5);
  } else if (task.environment.includes("低噪音") || task.environment.includes("安静")) {
    noise_compatibility = 100; // 低噪音环境对任何人都适合
  }

  // 空间需求兼容度
  let space_compatibility = 100;
  if (task.environment.includes("高空间需求")) {
    space_compatibility = user.environment.空间需求;
  } else if (task.environment.includes("中等空间需求")) {
    space_compatibility = Math.min(100, user.environment.空间需求 * 1.5);
  }

  // 社交密度兼容度
  let social_compatibility = 100;
  if (task.environment.includes("高社交密度")) {
    social_compatibility = user.environment.社交密度;
  } else if (task.environment.includes("中等社交密度")) {
    social_compatibility = Math.min(100, user.environment.社交密度 * 1.5);
  } else if (task.environment.includes("低社交密度")) {
    social_compatibility = 100; // 低社交密度对任何人都适合
  }

  // 紧急程度兼容度
  let urgency_compatibility = 100;
  if (task.environment.includes("紧急程度高") || task.urgency >= 4) {
    urgency_compatibility = user.environment.紧急程度接受度;
  }

  // 多任务处理兼容度
  let multitask_compatibility = 100;
  if (task.environment.includes("可多任务处理")) {
    multitask_compatibility = user.environment.多任务处理;
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
  const level_score = user.skills.includes(task.name) ? 100 : Math.max(0, 100 - (task.level - 2) * 20);

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

/**
 * 计算用户与多个任务的匹配分数，并按得分排序
 * @param {Object} user 用户数据
 * @param {Array} tasks 任务列表
 * @param {Number} limit 返回的最大数量
 * @returns {Array} 匹配结果，按匹配度排序
 */
function findBestMatches(user, tasks, limit = 6) {
  const all_matches = [];
  
  for (const task of tasks) {
    const match_score = calculateMatchScore(user, task);
    all_matches.push({
      task: task._id,
      match_score: match_score.final_score,
      component_scores: match_score.component_scores
    });
  }

  // 按匹配分数排序
  const sorted_matches = all_matches.sort((a, b) => b.match_score - a.match_score);
  
  // 返回前N个最匹配的任务
  return sorted_matches.slice(0, limit);
}

module.exports = {
  calculateMatchScore,
  findBestMatches
}; 