import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Task {
  title: string;
  time: string;
  isRunning: boolean;
  startTime?: number;
  intervalId?: any;
  endTime?: number;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState("");
  const [isIdle, setIsIdle] = useState(true);

  // useEffect(() => {
  //   loadAlarmSound();
  // }, []);

  // const loadAlarmSound = async () => {
  //   try {
  //     await alarmSound.loadAsync(require("./assets/alarm.mp3"));
  //   } catch (error) {
  //     console.error("Failed to load alarm sound:", error);
  //   }
  // };

  const handleAddTask = () => {
    if (currentTask) {
      setTasks([
        ...tasks,
        { title: currentTask, time: "00:00:00", isRunning: false },
      ]);
      setCurrentTask("");
    }
  };

  const handleDeleteTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const handlePlayPauseTask = (index: number) => {
    const updatedTasks = [...tasks];

    updatedTasks.forEach((task, i) => {
      if (i === index) {
        if (!task.isRunning) {
          task.isRunning = true;
          task.endTime = new Date().getTime() + parseTime(task.time);
          task.intervalId = setInterval(() => {
            const currentTime = new Date().getTime();
            if (currentTime >= (task.endTime || 0)) {
              handleTaskCompletion(i);
            } else {
              const remainingTime = (task.endTime || 0) - currentTime;
              task.time = formatTime(remainingTime);
            }
          }, 1000);
        } else {
          clearInterval(task.intervalId);
          task.isRunning = false;
        }
      } else {
        clearInterval(task.intervalId);
        task.isRunning = false;
      }
    });

    setIsIdle(false);
    setTasks(updatedTasks);
  };

  const parseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleTaskCompletion = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    // playAlarmSound();
  };

  // const playAlarmSound = async () => {
  //   try {
  //     await alarmSound.setPositionAsync(0);
  //     await alarmSound.playAsync();
  //   } catch (error) {
  //     console.error("Failed to play alarm sound:", error);
  //   }
  // };

  return (
    <View>
      <Text>Add Task</Text>
      <TextInput
        value={currentTask}
        onChangeText={(text) => setCurrentTask(text)}
        placeholder="Enter task name"
      />
      <Button title="Add" onPress={handleAddTask} />
      <Text>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
            <Text>{item.title}</Text>
            <TextInput
              value={item.time}
              onChangeText={(text) => {
                if (!item.isRunning) {
                  const updatedTasks = [...tasks];
                  updatedTasks[index].time = text;
                  setTasks(updatedTasks);
                }
              }}
              editable={!item.isRunning}
            />
            <Button
              title={item.isRunning ? "Pause" : "Play"}
              onPress={() => handlePlayPauseTask(index)}
            />
            <Button title="Delete" onPress={() => handleDeleteTask(index)} />
          </View>
        )}
      />
      {isIdle && <Text>No tasks in progress.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
