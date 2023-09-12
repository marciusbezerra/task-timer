import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Task } from "../models/task";
import { TimePickerModal } from "react-native-paper-dates";

interface Props {
  data: Task;
  onDelete(taskId: number): void;
  onUpdate(task: Task): void;
}

export default function TaskItem({ data, onDelete, onUpdate }: Props) {
  const [task, setTask] = useState<Task>(data);

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

  useEffect(() => {
    setTask((prevTask) => ({ ...prevTask, isRunning: data.isRunning }));
  }, [data.isRunning]);

  useEffect(() => {
    if (task.isRunning) {
      console.log("iniciando task...");
      const intervalId = setInterval(() => {
        const currentTime = new Date().getTime();
        if (currentTime >= (task.endTime || 0)) {
          // handleTaskCompletion(i);
          setTask((prevTask) => ({ ...prevTask, isRunning: false }));
          onUpdate({ ...task, isRunning: false });
        } else {
          const remainingTime = (task.endTime || 0) - currentTime;
          const time = formatTime(remainingTime);
          setTask((prevTask) => ({ ...prevTask, time }));
          onUpdate({ ...task, time });
        }
      }, 900);
      setTask((prevTask) => ({ ...prevTask, intervalId }));
      console.log("novo interval", intervalId);
    } else {
      console.log("limpando intervalo", task.intervalId);
      clearInterval(task.intervalId);
      setTask((prevTask) => ({ ...prevTask, intervalId: null }));
    }

    return () => {
      clearInterval(task.intervalId);
    };
  }, [task.isRunning]);

  function handlePlayPauseTask() {
    if (!task.isRunning) {
      const endTime = new Date().getTime() + parseTime(task.time);
      setTask((prevTask) => ({ ...prevTask, isRunning: true, endTime }));
      onUpdate({ ...task, isRunning: true, endTime });
    } else {
      clearInterval(task.intervalId);
      setTask((prevTask) => ({
        ...prevTask,
        isRunning: false,
        intervalId: null,
      }));
      onUpdate({ ...task, isRunning: false, intervalId: null });
    }
  }

  function handleDeleteTask() {
    clearInterval(task.intervalId);
    onUpdate({ ...task, intervalId: null });
    onDelete(data.id);
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeDescription}>
        <TextInput
          style={{ fontWeight: "900", marginRight: 10 }}
          value={task.title}
          multiline
          autoCorrect={false}
          selectTextOnFocus={true}
          onChangeText={(text) => {
            setTask((prevTask) => ({ ...prevTask, title: text }));
            onUpdate({ ...task, title: text });
          }}
        />
        <TextInput
          style={{
            fontWeight: "900",
            fontSize: 30,
            color: task.isRunning ? "#000" : "silver",
          }}
          value={task.time}
          onChangeText={(text) => {
            if (!task.isRunning) {
              setTask((prevTask) => ({ ...prevTask, time: text }));
              console.log("call update...");
              onUpdate({ ...task, time: text });
            }
          }}
          editable={!task.isRunning}
        />
      </View>
      {/* <TimePickerModal
        visible={true}
        onDismiss={() => {}}
        onConfirm={() => {}}
        use24HourClock={true}
        hours={12}
        minutes={14}
      /> */}
      <View style={{ flexDirection: "row", gap: 3 }}>
        <Button
          title={task.isRunning ? "Parar" : "Rodar"}
          onPress={handlePlayPauseTask}
        />
        <Button title="Deletar" onPress={handleDeleteTask} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "silver",
  },
  timeDescription: {
    flex: 1,
    flexDirection: "column",
  },
});
