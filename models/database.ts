import AsyncStorage from "@react-native-async-storage/async-storage";
import { Template } from "./template";
import { Task } from "./task";

export class Database {
  // templates
  insertTemplate = async (template: Template) => {
    const list = await this.queryTemplates();
    template.id = new Date().getTime() + list.length;
    list.push(template);
    await AsyncStorage.setItem("templates", JSON.stringify(list));
    return template;
  };

  queryTemplates = async () => {
    const data = await AsyncStorage.getItem("templates");
    if (!data) return [];
    return JSON.parse(data) as Template[];
  };

  deleteTemplate = async (id: number) => {
    const list = await this.queryTemplates();
    const index = list.findIndex((i) => i.id == id);
    if (index >= 0) {
      list.splice(index, 1);
      await AsyncStorage.setItem("templates", JSON.stringify(list));
    }
  };

  // tasks
  insertTask = async (task: Task) => {
    const list = await this.queryTasks();
    task.id = new Date().getTime() + list.length;
    list.push({
      id: task.id,
      title: task.title,
      time: task.time,
      isRunning: false,
      templateId: task.templateId,
    });
    await AsyncStorage.setItem("tasks", JSON.stringify(list));
  };

  queryTasks = async (templateId?: any) => {
    const data = await AsyncStorage.getItem("tasks");
    if (!data) return [];
    const list = JSON.parse(data) as Task[];
    if (templateId) {
      return list.filter((i) => i.templateId == templateId);
    }
    return list;
  };

  deleteTask = async (id: number) => {
    const list = await this.queryTasks();
    const index = list.findIndex((i) => i.id == id);
    if (index >= 0) {
      list.splice(index, 1);
      await AsyncStorage.setItem("tasks", JSON.stringify(list));
    }
  };
}
