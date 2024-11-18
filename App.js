import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'delete' or 'edit'
  const [selectedTask, setSelectedTask] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for pop-up

  // Load tasks from storage when the app initializes
  useEffect(() => {
    const loadTasksFromStorage = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    loadTasksFromStorage();
  }, []);

  // Save tasks to storage whenever they are updated
  useEffect(() => {
    const saveTasksToStorage = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };
    saveTasksToStorage();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
      };

      setTasks([...tasks, newTask]);
      setTask("");
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };
const handleEdit = () => {
  if (task.trim() && editTaskId) {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === editTaskId ? { ...item, text: task } : item
      )
    );
    setTask(""); // Clear the task input
    hidePopUp(); // Properly close the pop-up after editing
  }
};


  const handleDelete = () => {
    setTasks(tasks.filter((item) => item.id !== selectedTask.id));
    hidePopUp();
  };

  const showPopUpAnimation = () => {
    setShowPopUp(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

 const hidePopUp = () => {
   setShowPopUp(false); // Hide the pop-up immediately
   Animated.timing(fadeAnim, {
     toValue: 0, // Fade out
     duration: 300,
     useNativeDriver: true,
   }).start(() => {
     setCurrentAction(null); // Reset the current action after animation
     setSelectedTask(null); // Clear the selected task
     setEditTaskId(null); // Reset editTaskId to avoid lingering state
   });
 };

  const confirmAction = (action, task) => {
    setCurrentAction(action);
    setSelectedTask(task);
    if (action === "edit") {
      setEditTaskId(task.id); // Set editTaskId for editing
      setTask(task.text || ""); // Pre-fill the input field with task text
    } else {
      setTask(""); // Clear the input field for delete action
    }
    showPopUpAnimation(); // Trigger the pop-up animation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add or edit a task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={editTaskId ? handleEdit : addTask}
        >
          <Text style={styles.addButtonText}>{editTaskId ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
              <Text
                style={[
                  styles.taskText,
                  item.completed && {
                    textDecorationLine: "line-through",
                    color: "#aaa",
                  },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => confirmAction("edit", item)}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmAction("delete", item)}
              >
                <Text>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      {showPopUp && (
        <Animated.View style={[styles.popUpContainer, { opacity: fadeAnim }]}>
          <View style={styles.popUpContent}>
            <Text style={styles.popUpText}>
              {currentAction === "delete"
                ? "Are you sure you want to delete this task?"
                : "Edit the task below:"}
            </Text>
            {currentAction === "edit" && (
              <TextInput
                style={styles.input}
                value={task}
                onChangeText={(text) => setTask(text)}
              />
            )}
            <View style={styles.popUpButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={hidePopUp}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={currentAction === "delete" ? handleDelete : handleEdit}
              >
                <Text style={styles.confirmButtonText}>
                  {currentAction === "delete" ? "Delete" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefae0",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#bc6c25",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#bc6c25",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "green",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#faedcd",
    borderColor: "#d4a373",
  },
  taskText: {
    fontSize: 16,
    color: "#bc6c25",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    color: "white",
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#bc6c25",
    borderRadius: 5,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FF5C5C",
    borderRadius: "50%",
  },
  popUpContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popUpContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    height: "30%",
  },
  popUpText: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  popUpButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#FF5C5C",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
  },
  confirmButtonText: {
    color: "white",
  },
});
