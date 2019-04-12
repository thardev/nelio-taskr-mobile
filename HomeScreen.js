import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, TextInput, ToastAndroid} from 'react-native';
import AppContainer from './Navigator';

/**
 * Main screen of the app, shows app logo and input for entering task id.
 * @class HomeScreen
 * @extends {Component}
 */
class HomeScreen extends Component<Props> {
  // Hide header on this screen not needed here
  static navigationOptions = {
    header: null,
  };
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={require('./res/img/taskr_logo.png')} resizeMode='contain'></Image>
        <TextInput
          onSubmitEditing={(event) => getTaskFromApi(this.props.navigation, event.nativeEvent.text)}
          returnKeyType='search'
          placeholder='Enter task id'
          underlineColorAndroid="white"
          style={styles.inputTaskId}>
        </TextInput>
      </View>
    );
  }
}

/**
 * Get task by id from API if id does not exist on the database, let user know
 * @param {Object} navigation - contains navigation stack for navigation between screens.
 * @param {String} textFromInput - contains the string entered on input.
 */
function getTaskFromApi(navigation, textFromInput) {
  let taskId = textFromInput;
  return fetch(`http://10.0.2.2:8080/task/${taskId}`)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw new ToastAndroid.show('Task does not exists', ToastAndroid.SHORT);
    })
    .then((responseJson) => {
      navigation.navigate('TaskDetails', responseJson);
    })
    .catch((error) => {
    });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9ededd',
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 60,
  },
  inputTaskId: {
    width: '80%',
    height: 38,
  }
});

export default HomeScreen;
