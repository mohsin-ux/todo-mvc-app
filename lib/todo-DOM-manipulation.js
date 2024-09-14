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
    itemAttributes,
    renderDiv,
    footerData,
    allTodos,
    activeTodos,
    completedTodos,
    clearCompletedButton,
    enterKey,
  } = require("./todo-DOM-helpers.js");
}


function renderSingleItem(item, model, signal) {
  return li(
    itemAttributes(item, model, signal),
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



function footerItems(model) {
  return [
    li([], allTodos(model)),
    li([], activeTodos(model)),
    li([], completedTodos(model)),
  ];
}


function renderTodoFooter(model, signal) {
  const { count, done, display, display_clear, left } = footerData(model);
  return footer(
    ["class=footer", "id=footer", "style=display:" + display],
    [
      span(["class=todo-count", "id=count"], [strong(count), text(left)]),
      ul(["class=filters"], footerItems(model)),
      clearCompletedButton(done, display_clear,signal)
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
        enterKey(signal);
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
