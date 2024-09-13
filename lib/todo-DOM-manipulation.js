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
  var { render_item } = require("./todo-app.js");
}
function attributesOfItem(item, model, signal) {
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

function renderSingleItem(item, model, signal) {
  return li(
    attributesOfItem(item, model, signal),
    renderDiv(item, model, signal).concat(
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

function renderListOfItems(model, signal, render_item) {
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
function footerItems(model) {
  return [
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
  ];
}

function renderTodoFooter(model, signal) {
  const { count, done, display, display_clear, left } = footerData(model);
  return footer(
    ["class=footer", "id=footer", "style=display:" + display],
    [
      span(["class=todo-count", "id=count"], [strong(count), text(left)]),
      ul(["class=filters"],
        footerItems(model)
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

function renderHeader() {
  return header(
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
  );
}

function todoEvents(signal) {
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
    renderSingleItem,
    renderListOfItems,
    renderTodoFooter,
    renderHeader,
    todoEvents,
  };
}
