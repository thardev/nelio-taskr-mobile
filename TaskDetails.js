import React, {Component} from 'react';
import { StyleSheet, Text, View, ToastAndroid, Button} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faCalendar, faClock, faShoppingCart, faTruck, faTasks, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

/**
 * A screen to show the details of a task.
 * @class TaskDetails
 * @extends {Component}
 */
class TaskDetails extends Component<Props> {
  // Set task id on header bar
  static navigationOptions = ({navigation}) => {
    let taskId = navigation.getParam('id');
    return {
      title: `Task ${taskId}`
    };
  };

  render() {
    const {navigation} = this.props;
    const taskId = navigation.getParam('id', 0);
    const taskType = navigation.getParam('type', '');
    const taskClientEmail = navigation.getParam('client', '');
    const taskAvailableDays = navigation.getParam('availableDay', '');
    const taskAvailableTime = navigation.getParam('availableTime', []);
    const taskRetailer = navigation.getParam('retailer', '');
    const taskPickupList = navigation.getParam('pickupList', []);
    const taskCompleted = navigation.getParam('completed', false);
    const iconSize = 22;
    let times;
    let days;
    let pickupList;
    let taskTypeElement;

    // Format array of available times for better readability
    times = taskAvailableTime.map((time, index, array) => {
      if (array.length > 1 && index === 0) {
        return `${time.start} to ${time.stop}\n`;
      }
      return `${time.start} to ${time.stop}`
    });

    // Format array to string and replace commas to space for presentation
    days = taskAvailableDays.toString().replace(/,/g, ' ');
    pickupList = taskPickupList.toString();

    const RetailerElement = (props) => {
      return (
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon icon={faShoppingCart} size={iconSize}/>
          <Text style={styles.taskDescriptionText}>{taskRetailer}</Text>
        </View>
      );
    }

    const PickupListElement = (props) => {
      return (
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon icon={faTruck} size={iconSize}/>
          <Text style={styles.taskDescriptionText}>{pickupList}</Text>
        </View>
      );
    }

    /** We get different types of tasks from the API, so we create two different
     *  components to choose between them depending on the task type.
     *  There are two task type values: 'pickup' or 'dropoff'
     */
    if (taskType.toLowerCase() === 'pickup') {
      taskTypeElement = <RetailerElement />;
    } else {
      taskTypeElement = <PickupListElement />;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.taskTypeText}>{taskType} task</Text>
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon icon={faUserCircle} size={iconSize} />
          <Text style={styles.taskDescriptionText}>{taskClientEmail}</Text>
        </View>
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon icon={faCalendar} size={iconSize} />
          <Text style={styles.taskDescriptionText}>{days}</Text>
        </View>
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon style={styles.clock} icon={faClock} size={iconSize} />
          <Text style={styles.taskDescriptionText}>{times.toString().replace(/,/g, '')}</Text>
        </View>
        {taskTypeElement}
        <View style={styles.descriptionEntryContainer}>
          <FontAwesomeIcon icon={faTasks} size={iconSize} />
          <Text style={styles.taskDescriptionText}>{taskCompleted ? 'Completed' : 'Not completed'}</Text>
          <FontAwesomeIcon style={styles.completedIcon} icon={ taskCompleted ? faCheck : faTimes} color={ taskCompleted ? 'green' : 'red'} size={iconSize} />
        </View>
        <View style={styles.completedButtonContainer}>
          <Button onPress={() => markTaskAsCompleted(navigation, taskAvailableDays, taskAvailableTime)} disabled={taskCompleted ? true : false} title='Mark as completed'></Button>
        </View>
      </View>
    );
  }
}

/**
* Mark task as completed if it's on the day and time range specified, if not, let user know.
* @param {Object} navigation - contains navigation stack for navigation between screens.
* @param {Array} taskAvailableDays - contains days available when the task can be completed.
* @param {Array} taskAvailableTime - contains the opening and closing hours when the task can be completed.
*/
function markTaskAsCompleted(navigation, taskAvailableDays, taskAvailableTime) {
  let date = moment();
  let daysAvailable = taskAvailableDays.map((day) => day.toLowerCase());
  let dayWeekName = date.format('dddd').toLowerCase(); // Format current day to weekday name instead of number
  let timeInOpeningRange = false; // By default we are always in closing hours

  // If today as a weekday name is not present inside the array show a message and return
  if (!daysAvailable.includes(dayWeekName)) {
    ToastAndroid.show('Cannot complete task on unavailable day of week', ToastAndroid.SHORT);
    return;
  }

  // Check if local hour is between the opening hours, if not, do nothing and leave timeInOpeningRange to false
  for (availableTime of taskAvailableTime) {
    let openingHour = moment(availableTime.start, 'hh:mm a');
    let closingHour = moment(availableTime.stop, 'hh:mm a');

    if (date.isBetween(openingHour, closingHour)) {
      timeInOpeningRange = true;
      break;
    }
  }

  if (!timeInOpeningRange) {
    ToastAndroid.show('Cannot complete task on closing hours', ToastAndroid.SHORT);
    return;
  }

  let taskId = navigation.getParam('id', 0);
  fetch(`http://10.0.2.2:8080/task/${taskId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCompleted: true })
    }
  )
  .then((response) => response.json())
  .then((responseJson) => {
    state.disabled = true;
    ToastAndroid.show('Task marked as completed', ToastAndroid.SHORT);
  })
  .catch((error) => {
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: '#9ededd',
    fontSize: 20,
  },
  descriptionEntryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  taskTypeText: {
    alignSelf: 'center',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  taskDescriptionText: {
    fontSize: 16,
    marginLeft: 10,
    alignSelf: 'center'
  },
  completedIcon: {
    marginLeft: 10
  },
  completedButtonContainer: {
    width: '100%'
  }
});

export default TaskDetails;
