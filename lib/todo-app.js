/* if require fn is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
if (typeof require !== "undefined" && this.window !== this) {
  const {
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
  const new_model = JSON.parse(JSON.stringify(model));

  switch (action) {
    case "ADD":
      const last =
        typeof model.todos !== "undefined" && model.todos.length > 0
          ? model.todos[model.todos.length - 1]
          : null;
      var id = last ? last.id + 1 : 1;
      const input = document.getElementById("new-todo");
      new_model.todos =
        new_model.todos && new_model.todos.length > 0 ? new_model.todos : [];
      new_model.todos.push({
        id: id,
        title: data || input.value.trim(),
        done: false,
      });
      break;
    case "TOGGLE":
      new_model.todos.forEach((item) => {
        if (item.id === data) {
          // this should only "match" one item.
          item.done = !item.done; // invert state of "done" e.g false >> true
        }
      });
      // if all todos are done=true then "check" the "toggle-all" checkbox:
      const all_done = new_model.todos.filter((item) => {
        return item.done === false; // only care about items that are NOT done
      }).length;
      new_model.all_done = all_done === 0 ? true : false;
      break;
    case "TOGGLE_ALL":
      new_model.all_done = new_model.all_done ? false : true;
      new_model.todos.forEach((item) => {
        // takes 1ms on a "slow mobile"
        item.done = new_model.all_done;
      });
      break;
    case "DELETE":
      // console.log('DELETE', data);
      new_model.todos = new_model.todos.filter((item) => {
        return item.id !== data;
      });
      break;
    case "EDIT":
      // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
      // simplified as we are not altering the DOM!
      if (
        new_model.clicked &&
        new_model.clicked === data &&
        Date.now() - 300 < new_model.click_time
      ) {
        // DOUBLE-CLICK < 300ms
        new_model.editing = data;
      } else {
        // first click
        new_model.clicked = data; // so we can check if same item clicked twice!
        new_model.click_time = Date.now(); // timer to detect double-click 300ms
        new_model.editing = false; // reset
      }
      break;
    case "SAVE":
      const edit = document.getElementsByClassName("edit")[0];
      const value = edit.value;
      var id = parseInt(edit.id, 10);
      // End Editing
      new_model.clicked = false;
      new_model.editing = false;

      if (!value || value.length === 0) {
        // delete item if title is blank:
        return update("DELETE", new_model, id);
      }
      // update the value of the item.title that has been edited:
      new_model.todos = new_model.todos.map((item) => {
        if (item.id === id && value && value.length > 0) {
          item.title = value.trim();
        }
        return item; // return all todo items.
      });
      break;
    case "CANCEL":
      new_model.clicked = false;
      new_model.editing = false;
      break;
    case "CLEAR_COMPLETED":
      new_model.todos = new_model.todos.filter((item) => {
        return !item.done; // only return items which are item.done = false
      });
      break;
    case "ROUTE":
      new_model.hash = window.location.hash; // (window && window.location && window.location.hash) ? // : '#/';
      break;
    default: // if action unrecognised or undefined,
      return model; // return model unmodified
  } // see: https://softwareengineering.stackexchange.com/a/201786/211301
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
          ), // <input> does not have any nested elements
          label(
            [typeof signal === "function" ? signal("EDIT", item.id) : ""],
            [text(item.title)]
          ),
          button([
            "class=destroy",
            typeof signal === "function" ? signal("DELETE", item.id) : "",
          ]),
        ]
      ), // </div>
    ].concat(
      model && model.editing && model.editing === item.id
        ? [
            // editing?
            input([
              "class=edit",
              "id=" + item.id,
              "value=" + item.title,
              "autofocus",
            ]),
          ]
        : []
    ) // end concat()
  ); // </li>
}

function render_main(model, signal) {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display =
    "style=display:" +
    (model.todos && model.todos.length > 0 ? "block" : "none");

  return section(
    ["class=main", "id=main", display],
    [
      // hide if no todo items.
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
                  default: // if hash doesn't match Active/Completed render ALL todos:
                    return item;
                }
              })
              .map(function (item) {
                return render_item(item, model, signal);
              })
          : null
      ), // </ul>
    ]
  ); // </section>
}

function render_footer(model, signal) {
  // count how many "active" (not yet done) items by filtering done === false:
  let done =
    model.todos && model.todos.length > 0
      ? model.todos.filter((i) => {
          return i.done;
        }).length
      : 0;
  const count =
    model.todos && model.todos.length > 0
      ? model.todos.filter((i) => {
          return !i.done;
        }).length
      : 0;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = count > 0 || done > 0 ? "block" : "none";

  // number of completed items:
  done = model.todos && model.todos.length > 0 ? model.todos.length - count : 0;
  display_clear = done > 0 ? "block;" : "none;";

  // pluarisation of number of items:
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
      // array of "child" elements
      header(
        ["class=header"],
        [
          h1([], [text("todos")]), // </h1>
          input(
            [
              "id=new-todo",
              "class=new-todo",
              "placeholder=What needs to be done?",
              "autofocus",
            ],
            []
          ), // <input> is "self-closing"
        ]
      ), // </header>
      render_main(model, signal),
      render_footer(model, signal),
    ]
  ); // <section>
}

function subscriptions(signal) {
  const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
  const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener("keyup", (e) => {
    // console.log('e.keyCode:', e.keyCode, '| key:', e.key);

    switch (e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName("editing");
        if (editing && editing.length > 0) {
          signal("SAVE")(); // invoke singal inner callback
        }

        const new_todo = document.getElementById("new-todo");
        if (new_todo.value.length > 0) {
          signal("ADD")(); // invoke singal inner callback
          new_todo.value = ""; // reset <input> so we can add another todo
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

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    model: initial_model,
    update: update,
    render_item: render_item, // export so that we can unit test
    render_main: render_main, // export for unit testing
    render_footer: render_footer, // export for unit testing
    subscriptions: subscriptions,
    view: view,
  };
}
