import { Platform, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ptBR from "date-fns/locale/pt-BR";
import { format, addSeconds } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Task } from "./models/task";
import TaskItem from "./components/TaskItem";
import { Database } from "./models/database";
import { Template } from "./models/template";
import RNPickerSelect from "react-native-picker-select";

// Task-Timer
// ----------
// TODO: Ao terminar o tempo, deve tirar a tarefa
// TODO: Aumentar o espaço da tarefa (texto)
// TODO: publicar novamente

export default function App() {
  const database = new Database();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTask, setCurrentTask] = useState("");
  const [isIdle, setIsIdle] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [newTemplateTitle, setNewTemplateTitle] = useState<string>("");

  const fillInitialData = async () => {
    const storedTemplates = await database.queryTemplates();
    setTemplates(storedTemplates);
    console.log(storedTemplates);
  };

  // ok
  useEffect(() => {
    // loadAlarmSound();
    const intervalId = setInterval(() => {
      const brazilTimeZone = "America/Sao_Paulo";
      const zonedTime = utcToZonedTime(new Date(), brazilTimeZone);
      setCurrentDateTime(zonedTime);
      // console.log(tasks);
    }, 1000);

    fillInitialData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // const loadAlarmSound = async () => {
  //   try {
  //     await alarmSound.loadAsync(require("./assets/alarm.mp3"));
  //   } catch (error) {
  //     console.error("Failed to load alarm sound:", error);
  //   }
  // };

  const handleIdleTimer = () => {
    // if (!tasks.some((task) => task.isRunning)) {
    //   setIsIdle(true);
    //   clearInterval(idleInterval);
    // } else {
    //   setIsIdle(false);
    //   idleInterval = setInterval(handleIdleTimer, 1000);
    // }
  };

  useEffect(() => {
    handleIdleTimer();
    return () => {
      // clearInterval(idleInterval);
    };
  }, [tasks]);

  const handleAddTask = () => {
    if (currentTask) {
      setTasks([
        ...tasks,
        {
          id: new Date().getTime(),
          title: currentTask,
          time: "00:30:00",
          isRunning: false,
        },
      ]);
      setCurrentTask("");
    }
  };

  const onDeleteTask = (taskId: number) => {
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex((t) => t.id == taskId);
    if (taskId >= 0) {
      updatedTasks.splice(taskIndex, 1);
      setTasks(updatedTasks);
    }
  };

  const onTaskUpdate = (task: Task) => {
    const updatedTasks = [...tasks];

    for (const t of updatedTasks) {
      if (t.id == task.id) {
      } else {
        t.isRunning = false;
      }
      if (t.id == task.id) {
        t.isRunning = task.isRunning;
        t.title = task.title;
        t.time = task.time;
        t.intervalId = task.intervalId;
      } else if (task.isRunning) {
        t.isRunning = false;
      }
    }
    console.log(updatedTasks);
    setTasks(updatedTasks);
    console.log("onTaskUpdate", updatedTasks);

    setIsIdle(!updatedTasks.some((t) => t.isRunning));
  };

  const parseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const handleTaskCompletion = (index: number) => {
    console.log("handleTaskCompletion", index);
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

  const calculateEstimatedCompletionTime = () => {
    try {
      const currentTime = new Date().getTime();
      let totalRemainingTime = 0;

      tasks.forEach((task) => {
        totalRemainingTime +=
          new Date().getTime() + parseTime(task.time) - currentTime;
      });

      const estimatedCompletionTime = addSeconds(
        new Date(),
        Math.round(totalRemainingTime / 1000)
      );
      const brazilTimeZone = "America/Sao_Paulo";
      const zonedTime = utcToZonedTime(estimatedCompletionTime, brazilTimeZone);

      return format(zonedTime, "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      });
    } catch (error: any) {
      return `error: ${error.message || error.error}`;
    }
  };

  const handleAddTemplate = async () => {
    if (newTemplateTitle && tasks?.length) {
      const template = await database.insertTemplate({
        id: 0,
        title: newTemplateTitle,
      });
      for (const task of tasks) {
        task.templateId = template.id;
        await database.insertTask(task);
      }
      setTemplates([...templates, template]);
      setNewTemplateTitle("");
      setTasks(tasks);
    }
  };

  const handleLoadTemplate = async (templateId: number) => {
    if (templateId) {
      for (let i = 0; i <= 99999; i++) {
        clearInterval(i);
      }
      const storedTasks = await database.queryTasks(templateId);
      console.log(storedTasks);
      setTasks(storedTasks);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "900",
            alignSelf: "center",
            marginBottom: 30,
            color: "#820263",
          }}
        >
          MCBMAX Task timer
        </Text>
        <Text>Hora atual:</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            marginBottom: 10,
          }}
        >
          {format(currentDateTime, "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </Text>
        <Text>Tarefa:</Text>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          <TextInput
            style={{
              flexGrow: 1,
              borderWidth: 1,
              padding: 4,
              marginRight: 10,
              borderRadius: 5,
            }}
            maxLength={50}
            multiline
            value={currentTask}
            onChangeText={(text) => setCurrentTask(text)}
            placeholder="Escreva a tarefa..."
          />
          <Button title="+" onPress={handleAddTask} />
        </View>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          <View style={{ flexGrow: 1, gap: 2 }}>
            <RNPickerSelect
              style={{
                inputWeb: {
                  height: 35,
                  marginRight: 5,
                  borderColor: "#000",
                  borderRadius: 5,
                },
              }}
              placeholder={{
                label: "Carregar Modelo...",
                value: 0,
                color: "#9EA0A4",
              }}
              items={templates.map((t) => ({ value: t.id, label: t.title }))}
              onValueChange={(value) => handleLoadTemplate(value)}
            />
          </View>
          <View style={{ flexDirection: "row", flexGrow: 1 }}>
            <TextInput
              style={{
                flexGrow: 1,
                borderWidth: 1,
                padding: 4,
                marginRight: 10,
                borderRadius: 5,
              }}
              maxLength={20}
              value={newTemplateTitle}
              onChangeText={(text) => setNewTemplateTitle(text)}
              placeholder="Nome do modelo..."
            />
            <Button title="Salvar modelo" onPress={handleAddTemplate} />
          </View>
        </View>
        <Text
          style={{
            fontWeight: "900",
            marginBottom: 15,
            fontSize: 20,
            borderBottomColor: "silver",
            borderBottomWidth: 1,
          }}
        >
          Tarefas
        </Text>
        {tasks?.length ? (
          <FlatList
            style={{ marginBottom: 15 }}
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TaskItem
                data={item}
                onDelete={(taskId) => onDeleteTask(taskId)}
                onUpdate={(t) => onTaskUpdate(t)}
              />
            )}
          />
        ) : (
          <Text>Nenhum tarefa listada</Text>
        )}
      </View>
      <View style={{ marginBottom: 10 }}>
        {isIdle && <Text>Nenhuma tarefa rodando.</Text>}
        <Text>Término Previsto:</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
          }}
        >
          {calculateEstimatedCompletionTime()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    maxWidth: 1000,
    marginRight: "auto",
    marginLeft: "auto",
    width: "100%",
  },
});
