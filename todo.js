'use strict'

const INIT_TASKS = ['create todo list', 'add filtering by priority', 'use rest api backend']

const buttons = document.getElementsByClassName('remove');
const editValues = document.getElementsByClassName('edit');
const editInputs = document.getElementsByClassName('edit-input');

function TodoList() {
  const tasks = new Map();
  let current_id = 0;
  return {
    completeTask: function (task_id) {
      let task = tasks.get(parseInt(task_id));
      task.completed = true;
    },
    uncompleteTask: function (task_id) {
      let task = tasks.get(parseInt(task_id));
      task.completed = false;
    },
    editTask: function (task_id, description) {
      let task = tasks.get(parseInt(task_id));
      task.description = description;
    },
    getTasks: function (task_id) {
      return tasks.get(task_id);
    },
    addTask: function (task) {
      task.id = current_id
      tasks.set(current_id, task);
      current_id += 1;
      return task;
    },
    removeTask: function (task_id) {
      return tasks.delete(parseInt(task_id));
    },
    allTasks: function () {
      return tasks.values();
    },
    initTasks: function() {
      INIT_TASKS.forEach((description) => this.addTask({description, completed: false}));
    }
  }
}

const todoList = new TodoList();
todoList.initTasks()
let activeFilter = 'all'

function add() {
  const description = document.getElementById('task').value;
  if (description) {
    todoList.addTask({description, completed: false});
    document.getElementById('main').reset()
    showTaskList();
  }
}

function changeLabel() {
  const editCurrentLabel = this.nextElementSibling;
  this.style.display = 'none';
  editCurrentLabel.style.display = 'inline-block';
  editCurrentLabel.focus();
}

function labelChanged() {
  const id = this.previousElementSibling.dataset.id
  let description = this.value || todoList.getTasks(parseInt(id)).description;
  todoList.editTask(id, description);
  showTaskList();
}

function changeStatus(task_id) {
  const task = todoList.getTasks(task_id);
  if (task.completed) {
    todoList.uncompleteTask(task_id);
    return showTaskList();
  }
  todoList.completeTask(task_id)
  return showTaskList();
}

function isTaskCompleted(task_id) {
  return todoList.getTasks(task_id).completed;
}

function checkedProperty(task_id) {
  return isTaskCompleted(task_id) && 'checked="true"'
}

function remove() {
  const id = this.getAttribute('id');
  todoList.removeTask(id);
  showTaskList();
}

const taskList = function () {
  let html = '';
  for (let todo of todoList.allTasks()) {
    const onclick =`onchange="changeStatus(${todo.id})"`
    const checked = checkedProperty(todo.id);
    const isHidden = checked ? (activeFilter === 'active') : (activeFilter === 'completed')
    html += `
      <div class="input-group style" ${isHidden && 'style="display: none"'}>
        <span class="input-group">
          <input type="checkbox" ${onclick} ${checked}>
          <label class="edit" data-id="${todo.id}">${todo.description}</label>
          <input class="edit-input" />
        </span>
        <span class="input-group-btn">
          <button aria-label="Close" class="close remove" id="${todo.id}">
            <span aria-hidden="true">&times;</span>
          </button>
        </span>
      </div>
    `;
  }

  document.getElementById('todos').innerHTML = html;

  [...buttons].forEach((button) => button.addEventListener('click', remove));
  [...editValues].forEach((editItem) => {
    editItem.addEventListener('dblclick', changeLabel);
    editItem.addEventListener('touchmove', changeLabel);
  });
  [...editInputs].forEach((edit_input) => edit_input.addEventListener('focusout', labelChanged));
}

function calculateCounter() {
  const allTask = todoList.allTasks();
  const itemsLeftLength = Array.from(allTask).filter((item) => !item.completed).length;
  const $counter = document.getElementById('counter');
  $counter.innerHTML = itemsLeftLength.toString();
}
function filterByActive() {
  activeFilter = 'active'
  document.getElementById('activeFilter').classList.add('active')
  document.getElementById('allFilter').classList.remove('active')
  document.getElementById('activeFilter').classList.remove('active')
  showTaskList();
}

function filterByCompleted() {
  activeFilter = 'completed'
  document.getElementById('activeFilter').classList.remove('active')
  document.getElementById('allFilter').classList.remove('active')
  document.getElementById('completedFilter').classList.add('active')
  showTaskList();
}

function filterByAll() {
  activeFilter = 'all'
  document.getElementById('activeFilter').classList.remove('active')
  document.getElementById('allFilter').classList.add('active')
  document.getElementById('completedFilter').classList.remove('active')
  showTaskList();
}

function showTaskList() {
  taskList();
  calculateCounter();
}

showTaskList();
const inputs = document.querySelectorAll('input[type=checkbox]');

function selectAll() {
  [...inputs].map((input) => {
    const id = input.nextElementSibling.dataset.id;
    input.checked = true;
    todoList.completeTask(id);
  })
  showTaskList();
}


function deselectAll() {
  [...inputs].map((input) => {
    const id = input.nextElementSibling.dataset.id;
    input.checked = false;
    todoList.uncompleteTask(id);
  })
  showTaskList();
}

function completedRemove() {
  [...inputs].map((input) => {
    const id = input.nextElementSibling.dataset.id;
    if (input.checked) {
      todoList.removeTask(id);
    }
  })
  showTaskList();
}

document.getElementById("allFilter").addEventListener('click', filterByAll, false);
document.getElementById("activeFilter").addEventListener('click', filterByActive, false);
document.getElementById("completedFilter").addEventListener('click', filterByCompleted, false);
document.getElementById('add').addEventListener('click', add);
document.getElementById("selectAll").addEventListener('click', selectAll, false);
document.getElementById("deselectAll").addEventListener('click', deselectAll, false);
document.getElementById("completedRemove").addEventListener('click', completedRemove, false);
