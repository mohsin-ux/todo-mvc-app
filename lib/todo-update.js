// if (typeof require !== "undefined" && this.window !== this) {
//   let { update } = require("./todo-app.js");
// }
function addTodoItem(new_model, model, data) {
  console.log("add function is not running why");
  const last = model.todos?.[model.todos.length - 1] ?? null;
  const id = last ? last.id + 1 : 1;
  console.log("add function is not called why?????????");
  const input = document.getElementById("new-todo");

  new_model.todos.push({
    id: id,
    title: data || input.value.trim(),
    done: false,
  });
  return new_model;
}

function toggle(new_model, data) {
  new_model.todos = new_model.todos.map((item) => {
    return item.id === data ? { ...item, done: !item.done } : item;
  });
  const all_done = new_model.todos.filter((item) => {
    return item.done === false;
  }).length;
  new_model.all_done = all_done === 0 ? true : false;
  return new_model;
}
function toggleAll(new_model) {
  new_model.all_done = new_model.all_done ? false : true;
  new_model.todos.forEach((item) => {
    item.done = new_model.all_done;
  });
  return new_model;
}
function deleteTodoItem(new_model, data) {
  new_model.todos = new_model.todos.filter((item) => {
    return item.id !== data;
  });
  return new_model;
}

function editTodoItem(new_model, data) {
  if (
    new_model.clicked &&
    new_model.clicked === data &&
    Date.now() - 300 < new_model.click_time
  ) {
    new_model.editing = data;
  } else {
    new_model.clicked = data;
    new_model.click_time = Date.now();
    new_model.editing = false;
  }
  return new_model;
}

function saveTodoItem(new_model, update) {
  const edit = document.getElementsByClassName("edit")[0];
  const value = edit.value;
  const id = parseInt(edit.id, 10);
  new_model.clicked = false;
  new_model.editing = false;

  if (!value || value.length === 0) {
    return update("DELETE", new_model, id);
  }
  new_model.todos = new_model.todos.map((item) => {
    if (item.id === id && value && value.length > 0) {
      item.title = value.trim();
    }
    return item;
  });
  return new_model;
}

function cancelTodoItem(new_model) {
  new_model.clicked = false;
  new_model.editing = false;
  return new_model;
}

function clearCompletedTodoItems(new_model) {
  new_model.todos = new_model.todos.filter((item) => {
    return !item.done;
  });
  return new_model;
}

function setRouteWithHash(new_model) {
  new_model.hash = window.location.hash;
  return new_model;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addTodoItem,
    toggle,
    toggleAll,
    deleteTodoItem,
    editTodoItem,
    saveTodoItem,
    cancelTodoItem,
    clearCompletedTodoItems,
    setRouteWithHash,
  };
}
