

const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const filesToProcess = [
  'src/Task_detail.jsx',
  'src/shopping.jsx',
  'src/Setting.jsx',
  'src/Ranking.jsx',
  'src/Private_information.jsx',
  'src/Post_detail.jsx',
  'src/Person_center.jsx',
  'src/Log_in.jsx',
  'src/Index.jsx',
  'src/Group_chat.jsx',
  'src/ExchangeHistory.jsx',
  'src/Create_task.jsx',
  'src/Create_post.jsx',
  'src/Community.jsx',
  'src/AI_assistant.jsx',
  'src/Achievement.jsx',
];

async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    
    let updatedContent = content.replace(
      /import Icon from 'react-native-vector-icons\/MaterialCommunityIcons';/g,
      "import CustomIcon from './components/CustomIcon';"
    );
    
    
    updatedContent = updatedContent.replace(
      /<Icon\s+name="([^"]+)"\s+size=\{([^}]+)\}\s+color=\{([^}]+)\}/g,
      '<CustomIcon name="$1" size={$2} color={$3}'
    );
    
    
    
    
    await writeFile(filePath, updatedContent, 'utf8');
    
  } catch (error) {
    
  }
}

async function updateAllFiles() {
  for (const file of filesToProcess) {
    await processFile(file);
  }
  
}

updateAllFiles();

