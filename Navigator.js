import HomeScreen from './HomeScreen';
import TaskDetails from './TaskDetails';
import {createStackNavigator, createAppContainer} from 'react-navigation';

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    TaskDetails: TaskDetails
  },
  {
    initialRouteName: 'Home',
    headerLayoutPreset: 'center' // Center header title on every screen
  }
);
const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
