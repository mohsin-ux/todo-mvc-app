if (typeof require !== "undefined" && this.window !== this) {
  var {
    a,
    button,
    div,
    empty,
    footer,
    input,
    h1,
    header,
    label,
    li,
    mount,
    route,
    section,
    span,
    strong,
    text,
    ul,
  } = require("./elmish.js");
  var {
    addTodoItem,
    toggle,
    toggleAll,
    deleteTodoItem,
    editTodoItem,
    saveTodoItem,
    cancelTodoItem,
    clearCompletedTodoItems,
    setRouteWithHash,
  } = require("./todo-update.js");
  var { renderItemAsSingleTodo } = require("./todo-DOM-manipulation.js");
}

var initial_model = {
  todos: [
    // { id: 0, title: "Make something people want .", done: false },
    // { id: 1, title: "Bootstrap for as long as you can", done: false },
    // { id: 2, title: "Let's solve our own problem", done: false },
  ],
  hash: "#/active",
  // editing: 2,
};

function update(action, model, data) {
  let new_model = { ...model };

  switch (action) {
    case "ADD":
      return addTodoItem(new_model, model, data);

    case "TOGGLE":
      return toggle(new_model, data);

    case "TOGGLE_ALL":
      return toggleAll(new_model, data);

    case "DELETE":
      return deleteTodoItem(new_model, data);

    case "EDIT":
      return editTodoItem(new_model, data);

    case "SAVE":
      return saveTodoItem(new_model, update);

    case "CANCEL":
      return cancelTodoItem(new_model);

    case "CLEAR_COMPLETED":
      return clearCompletedTodoItems(new_model);

    case "ROUTE":
      return setRouteWithHash(new_model);

    default:
      return model;
  }
}

function render_item(item, model, signal) {
  return renderItemAsSingleTodo(item, model, signal);
}

function render_main(model, signal) {
  const display =
    "style=display:" +
    (model.todos && model.todos.length > 0 ? "block" : "none");

  return section(
    ["class=main", "id=main", display],
    [
      input(
        [
          "id=toggle-all",
          "type=checkbox",
          // typeof signal === "function" ? signal("TOGGLE_ALL") : "",
          signal?.("TOGGLE_ALL") ?? "",
          model.all_done ? "checked=checked" : "",
          "class=toggle-all",
        ],
        []
      ),
      label(["for=toggle-all"], [text("Mark all as complete")]),
      ul(
        ["class=todo-list"],
        model.todos && model.todos.length > 0
          ? model.todos
              .filter((item) => {
                switch (model.hash) {
                  case "#/active":
                    return !item.done;
                  case "#/completed":
                    return item.done;
                  default:
                    return item;
                }
              })
              .map(function (item) {
                return render_item(item, model, signal);
              })
          : null
      ),
    ]
  );
}

function render_footer(model, signal) {
  const count =
    model.todos && model.todos.length > 0
      ? model.todos.filter((item) => {
          return !item.done;
        }).length
      : 0;

  const done =
    model.todos && model.todos.length > 0 ? model.todos.length - count : 0;
  const display = count > 0 || done > 0 ? "block" : "none";
  const display_clear = done > 0 ? "block;" : "none;";

  const left = " item" + (count > 1 || count === 0 ? "s" : "") + " left";

  return footer(
    ["class=footer", "id=footer", "style=display:" + display],
    [
      span(["class=todo-count", "id=count"], [strong(count), text(left)]),
      ul(
        ["class=filters"],
        [
          li(
            [],
            [
              a(
                [
                  "href=#/",
                  "id=all",
                  "class=" + (model.hash === "#/" ? "selected" : ""),
                ],
                [text("All")]
              ),
            ]
          ),
          li(
            [],
            [
              a(
                [
                  "href=#/active",
                  "id=active",
                  "class=" + (model.hash === "#/active" ? "selected" : ""),
                ],
                [text("Active")]
              ),
            ]
          ),
          li(
            [],
            [
              a(
                [
                  "href=#/completed",
                  "id=completed",
                  "class=" + (model.hash === "#/completed" ? "selected" : ""),
                ],
                [text("Completed")]
              ),
            ]
          ),
        ]
      ),
      button(
        [
          "class=clear-completed",
          "style=display:" + display_clear,
          typeof signal === "function" ? signal("CLEAR_COMPLETED") : "",
        ],
        [
          text("Clear completed ["),
          span(["id=completed-count"], [text(done)]),
          text("]"),
        ]
      ),
    ]
  );
}

function view(model, signal) {
  return section(
    ["class=todoapp"],
    [
      header(
        ["class=header"],
        [
          h1([], [text("todos")]),
          input(
            [
              "id=new-todo",
              "class=new-todo",
              "placeholder=What needs to be done?",
              "autofocus",
            ],
            []
          ),
        ]
      ),
      render_main(model, signal),
      render_footer(model, signal),
    ]
  );
}

function subscriptions(signal) {
  const ENTER_KEY = 13;
  const ESCAPE_KEY = 27;

  document.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName("editing");
        if (editing && editing.length > 0) {
          const callBack = signal("SAVE");
          callBack();
        }

        const new_todo = document.getElementById("new-todo");
        if (new_todo.value.length > 0) {
          signal("ADD")();
          new_todo.value = "";
          document.getElementById("new-todo").focus();
        }
        break;
      case ESCAPE_KEY:
        signal("CANCEL")();
        break;
    }
  });

  window.onhashchange = function route() {
    signal("ROUTE")();
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    model: initial_model,
    update: update,
    render_item: render_item,
    render_main: render_main,
    render_footer: render_footer,
    subscriptions: subscriptions,
    view: view,
  };
}
