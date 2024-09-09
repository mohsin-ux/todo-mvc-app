
function empty(node) {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
} // this function produces a (DOM) "mutation" but has no other "side effects".


function mount(model, update, view, root_element_id, subscriptions) {
  var ROOT = document.getElementById(root_element_id); // root DOM element
  var store_name = "todos-elmish_" + root_element_id; // test-app !== app

  function render(mod, sig, root) {
    // DRY rendering code (invoked twice)
    localStorage.setItem(store_name, JSON.stringify(mod)); // save the model!
    empty(root); // clear root element (container) before (re)rendering
    root.appendChild(view(mod, sig)); // render view based on model & signal
  }


  function signal(action, data, model) {
    // signal function takes action
    return function callback() {
      // and returns callback
      model = JSON.parse(localStorage.getItem(store_name)); //|| model;
      var updatedModel = update(action, model, data); // update model for action
      render(updatedModel, signal, ROOT);
    };
  }

  model = JSON.parse(localStorage.getItem(store_name)) || model;
  render(model, signal, ROOT);
  if (subscriptions && typeof subscriptions === "function") {
    subscriptions(signal);
  }
}


function add_attributes(attrlist, node) {
  // console.log(attrlist, node);
  if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach(function (attr) {
      // apply all props in array
      // do not attempt to "split" an onclick function as it's not a string!
      if (typeof attr === "function") {
        node.onclick = attr;
        return node;
      }
      // apply any attributes that are *not* functions (i.e. Strings):
      var a = attr.split("=");
      switch (a[0]) {
        case "autofocus":
          node.autofocus = "autofocus";
          node.focus();
          setTimeout(function () {
            // wait till DOM has rendered then focus()
            node.focus();
          }, 200);
          break;
        case "checked":
          node.setAttribute("checked", true);
        case "class":
          node.className = a[1]; // apply one or more CSS classes
          break;
        case "data-id":
          node.setAttribute("data-id", a[1]); // add data-id e.g: to <li>
          break;
        case "for":
          node.setAttribute("for", a[1]); // e.g: <label for="toggle-all">
          break;
        case "href":
          node.href = a[1]; // e.g: <a href="#/active">Active</a>
          break;
        case "id":
          node.id = a[1]; // apply element id e.g: <input id="toggle-all">
          break;
        case "placeholder":
          node.placeholder = a[1]; // add placeholder to <input> element
          break;
        case "style":
          node.setAttribute("style", a[1]); // <div style="display: block;">
          break;
        case "type":
          node.setAttribute("type", a[1]); // <input id="go" type="checkbox">
          break;
        case "value":
          console.log("value:", a[1]);
          node.value = a[1];
        default:
          break;
      } // end switch
    });
  }
  return node;
}


function append_childnodes(childnodes, parent) {
  if (
    childnodes &&
    Object.prototype.toString.call(childnodes) === "[object Array]" &&
    childnodes.length > 0
  ) {
    childnodes.forEach(function (el) {
      parent.appendChild(el);
    });
  }
  return parent;
}


function create_element(type, attrlist, childnodes) {
  return append_childnodes(
    childnodes,
    add_attributes(attrlist, document.createElement(type))
  );
}


function section(attrlist, childnodes) {
  return create_element("section", attrlist, childnodes);
}
// these are a *bit* repetitive, if you know a better way, please open an issue!
function a(attrlist, childnodes) {
  return create_element("a", attrlist, childnodes);
}

function button(attrlist, childnodes) {
  return create_element("button", attrlist, childnodes);
}

function div(attrlist, childnodes) {
  return create_element("div", attrlist, childnodes);
}

function footer(attrlist, childnodes) {
  return create_element("footer", attrlist, childnodes);
}

function header(attrlist, childnodes) {
  return create_element("header", attrlist, childnodes);
}

function h1(attrlist, childnodes) {
  return create_element("h1", attrlist, childnodes);
}

function input(attrlist, childnodes) {
  return create_element("input", attrlist, childnodes);
}

function label(attrlist, childnodes) {
  return create_element("label", attrlist, childnodes);
}

function li(attrlist, childnodes) {
  return create_element("li", attrlist, childnodes);
}

function span(attrlist, childnodes) {
  return create_element("span", attrlist, childnodes);
}

function strong(text_str) {
  var el = document.createElement("strong");
  el.innerHTML = text_str;
  return el;
}

function text(text) {
  return document.createTextNode(text);
}

function ul(attrlist, childnodes) {
  return create_element("ul", attrlist, childnodes);
}

function route(model, title, hash) {
  window.location.hash = hash;
  var new_state = JSON.parse(JSON.stringify(model)); // clone model
  new_state.hash = hash;
  return new_state;
}

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    add_attributes: add_attributes,
    append_childnodes: append_childnodes,
    a: a,
    button: button,
    div: div,
    empty: empty,
    footer: footer,
    input: input,
    h1,
    h1,
    header: header,
    label: label,
    li: li,
    mount: mount,
    route: route,
    section: section,
    span: span,
    strong: strong,
    text: text,
    ul: ul,
  };
}
