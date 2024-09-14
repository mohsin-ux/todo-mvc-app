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
}

function itemAttributes(item, model, signal) {
  return [
    "data-id=" + item.id,
    "id=" + item.id,
    item.done ? "class=completed" : "",
    model && model.editing && model.editing === item.id ? "class=editing" : "",
  ];
}

function renderDiv(item, model, signal) {
  return [
    div(
      ["class=view"],
      [
        input(
          [
            item.done ? "checked=true" : "",
            "class=toggle",
            "type=checkbox",
            typeof signal === "function" ? signal("TOGGLE", item.id) : "",
          ],
          []
        ),
        label(
          // [typeof signal === "function" ? signal("EDIT", item.id) : ""],
          [signal?.("EDIT", item.id) ?? ""],
          [text(item.title)]
        ),
        button([
          "class=destroy",
          typeof signal === "function" ? signal("DELETE", item.id) : "",
        ]),
      ]
    ),
  ];
}

function footerData(model) {
  const count =
    model.todos && model.todos.length > 0
      ? model.todos.filter((item) => {
          return !item.done;
        }).length
      : 0;
  const done =
    model.todos && model.todos.length > 0 ? model.todos.length - count : 0;
  return {
    count,
    done,
    display: count > 0 || done > 0 ? "block" : "none",
    display_clear: done > 0 ? "block;" : "none;",
    left: " item" + (count > 1 || count === 0 ? "s" : "") + " left",
  };
}
function allTodos(model) {
  return [
    a(
      ["href=#/", "id=all", "class=" + (model.hash === "#/" ? "selected" : "")],
      [text("All")]
    ),
  ];
}

function activeTodos(model) {
  return [
    a(
      [
        "href=#/active",
        "id=active",
        "class=" + (model.hash === "#/active" ? "selected" : ""),
      ],
      [text("Active")]
    ),
  ];
}
function completedTodos(model) {
  return [
    a(
      [
        "href=#/completed",
        "id=completed",
        "class=" + (model.hash === "#/completed" ? "selected" : ""),
      ],
      [text("Completed")]
    ),
  ];
}
function clearCompletedButton(done, display_clear, signal) {
  return button(
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
  );
}

function enterKey(signal) {
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
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    itemAttributes,
    renderDiv,
    footerData,
    allTodos,
    activeTodos,
    completedTodos,
    clearCompletedButton,
    enterKey,
  };
}
