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
function attributesOfRenderLi(item, model, signal) {
  return (
    [
      "data-id=" + item.id,
      "id=" + item.id,
      item.done ? "class=completed" : "",
      model && model.editing && model.editing === item.id
      ? "class=editing"
      : "",
    ]
  )
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

function renderItemAsSingleTodo(item, model, signal) {
  return li(
    attributesOfRenderLi(item, model, signal),
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    renderItemAsSingleTodo,
  };
}
