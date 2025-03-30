import { createStackNavigator } from '@react-navigation/stack';
import FamilyTaskDetail from './src/Family_task_detail';
// ... 其他导入

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ... 其他屏幕 ... */}
        <Stack.Screen 
          name="FamilyTaskDetail" 
          component={FamilyTaskDetail} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App; 