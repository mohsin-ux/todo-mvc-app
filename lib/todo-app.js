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

const initial_model = {
  todos: [],
  hash: "#/",
};

function update(action, model, data) {
  let new_model = JSON.parse(JSON.stringify(model));

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
      return saveTodoItem(new_model);

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

function addTodoItem(new_model, model, data) {
  const last = model.todos?.[model.todos.length - 1] ?? null
  const id = last ? last.id + 1 : 1;
  const input = document.getElementById("new-todo");
  new_model.todos =
    new_model.todos && new_model.todos.length > 0 ? new_model.todos : [];
  new_model.todos.push({
    id: id,
    title: data || input.value.trim(),
    done: false,
  });
  return new_model;
}

function toggle(new_model, data) {
  new_model.todos.every((item) => {
    if (item.id === data) {
      item.done = !item.done;
    }
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
    // takes 1ms on a "slow mobile"
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

function saveTodoItem(new_model) {
  const edit = document.getElementsByClassName("edit")[0];
  const value = edit.value;
  const id = parseInt(edit.id, 10);
  // End Editing
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

function render_item(item, model, signal) {
  return li(
    [
      "data-id=" + item.id,
      "id=" + item.id,
      item.done ? "class=completed" : "",
      model && model.editing && model.editing === item.id
        ? "class=editing"
        : "",
    ],
    [
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
            [typeof signal === "function" ? signal("EDIT", item.id) : ""],
            [text(item.title)]
          ),
          button([
            "class=destroy",
            typeof signal === "function" ? signal("DELETE", item.id) : "",
          ]),
        ]
      ),
    ].concat(
      model && model.editing && model.editing === item.id
        ? [
            input([
              "class=edit",
              "id=" + item.id,
              "value=" + item.title,
              "autofocus",
            ]),
          ]
        : []
    )
  );
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
          typeof signal === "function" ? signal("TOGGLE_ALL") : "",
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
      ), // </ul>
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
          signal("SAVE")();
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
