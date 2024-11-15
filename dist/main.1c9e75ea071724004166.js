/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/project.js
class Project {
    constructor(name) {
        this.name = name;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todo) {
        this.todos = this.todos.filter(t => t !== todo);
    }

    setName(name) {
        this.name = name;
    }
}
;// ./src/todo.js
class Todo {
    constructor(title, dueDate, priority, ) {
        this.title = title;
        this.dueDate = this.validateDate(dueDate);
        this.priority = priority;
        this.completed = false;
    }

    validateDate(date) {
        const [year, month, day] = date.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (isNaN(parsedDate)) {
            throw new Error('Invalid date. Could not parse into a valid Date object.');
        }
        return parsedDate;
    }
}
;// ./src/index.js






document.addEventListener('DOMContentLoaded', () => {
    const newProjButton = document.querySelector('.newProj');
    const projectsContainer = document.querySelector('.projects');
    const todosContainer = document.querySelector('.todos');
    const todoFormContainer = document.querySelector('.todo-form-container');
    const todoForm = document.querySelector('.todo-form');
    const todoTitleInput = document.querySelector('#todo-title');
    const todoDateInput = document.querySelector('#todo-date');
    const todoPrioritySelect = document.querySelector('#todo-priority');
    const submitTodoButton = document.querySelector('#submit-todo');
    const exitButton = document.querySelector('.exit-btn');
    
    let projects = loadProjectsFromLocalStorage() || [];

    if (projects.length === 0) {
        const defProj = new Project("Project");
        const defTodo = new Todo("ToDo", "9999-12-31", 'Low');
        defProj.addTodo(defTodo);
        projects.push(defProj);
    }

    let selectedProjectIndex = null;
    let editingTodo = null;
    
    function saveProjectsToLocalStorage() {
        const serializedProjects = projects.map(project => ({
            name: project.name,
            todos: project.todos.map(todo => ({
                title: todo.title,
                dueDate: todo.dueDate.toISOString().split('T')[0],
                priority: todo.priority,
                completed: todo.completed,
            }))
        }));
        localStorage.setItem('projects', JSON.stringify(serializedProjects));
    }
    
    function loadProjectsFromLocalStorage() {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
            const parsedProjects = JSON.parse(savedProjects);
            return parsedProjects.map(projectData => {
                const project = new Project(projectData.name);
                projectData.todos.forEach(todoData => {
                    const todo = new Todo(
                        todoData.title,
                        todoData.dueDate,
                        todoData.priority
                    );
                    todo.completed = todoData.completed;
                    project.addTodo(todo);
                });
                return project;
            });
        }
        return null;
    }

    function renderProjects() {
        projectsContainer.innerHTML = '';
        projects.forEach((project,index) => {
            
            const projectBox = document.createElement('li');
            projectBox.className = 'project';
            projectBox.textContent = project.name;
            if (index === selectedProjectIndex) {
                projectBox.classList.add('selected');
            }
    
            projectBox.addEventListener('click', () => {
                selectedProjectIndex = index;
                displayTodos(index);
                renderProjects();
            });
            
            const editButton = document.createElement('i');
            editButton.className = 'fas fa-edit edit-icon';
            editButton.addEventListener('click', () => {
                const newName = prompt('Enter new project name:', project.name);
            
                if (newName) {
                    project.setName(newName);
                    saveProjectsToLocalStorage();
                    renderProjects();
                }
            });

            const deleteButton = document.createElement('i');
            deleteButton.className = 'fas fa-trash delete-icon';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (selectedProjectIndex === index) {
                    selectedProjectIndex = null;
                    todosContainer.innerHTML = '';
                } else if (selectedProjectIndex > index) {
                    selectedProjectIndex -= 1;
                }
                projects.splice(index, 1);
                saveProjectsToLocalStorage();
                renderProjects();
            });
    
            projectBox.appendChild(editButton);
            projectBox.appendChild(deleteButton);
            projectsContainer.appendChild(projectBox);
        })
    }

    function addNewProject() {
        const projectName = prompt("Enter a new project name:");
        if (projectName) {
            const newProject = new Project(projectName);
            projects.push(newProject);
            saveProjectsToLocalStorage()
            renderProjects();
        }
    }
    newProjButton.addEventListener('click', addNewProject);

    function displayTodos(projectIndex) {
        todosContainer.innerHTML = '';
        const selectedProject = projects[projectIndex];
        
        const projectHeading = document.createElement('h1');
        projectHeading.textContent = selectedProject.name;
        todosContainer.appendChild(projectHeading);

        const todoList = document.createElement('ul');
        todoList.className = 'todo-list';

        selectedProject.todos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            todoItem.classList.toggle('completed', todo.completed);

            checkbox.addEventListener('change', () => {
                todo.completed = checkbox.checked;
                todoItem.classList.toggle('completed', todo.completed);
                saveProjectsToLocalStorage();
            });

            const todoTitle = document.createElement('span');
            todoTitle.className = 'todo-title';
            todoTitle.textContent = todo.title;
    
            const todoDate = document.createElement('span');
            todoDate.className = 'todo-date';
            todoDate.textContent = `Due: ${formatDate(todo.dueDate)}`;
    
            const todoPriority = document.createElement('span');
            todoPriority.className = `todo-priority priority-${todo.priority.toLowerCase()}`;
            todoPriority.textContent = `Priority: ${todo.priority}`;

            const editButton = document.createElement('i');
            editButton.className = 'fas fa-edit edit-icon';
            editButton.addEventListener('click', () => {
                todoTitleInput.value = todo.title;
                todoDateInput.value = todo.dueDate.toISOString().split('T')[0];
                todoPrioritySelect.value = todo.priority;

                todoFormContainer.classList.add('visible');
                editingTodo = todo;

                submitTodoButton.removeEventListener('click', addNewTodo);
                submitTodoButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const title = todoTitleInput.value;
                    const dueDate = todoDateInput.value;
                    const priority = todoPrioritySelect.value;
                    if (title && dueDate && priority && selectedProjectIndex !== null) {
                        editTodo(todo, title, dueDate, priority);
                    }
                });
            });

            const deleteButton = document.createElement('i');
            deleteButton.className = 'fas fa-trash delete-icon';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedProject.removeTodo(todo);
                saveProjectsToLocalStorage();
                displayTodos(selectedProjectIndex);
            });
        
            todoItem.appendChild(checkbox);
            todoItem.appendChild(todoTitle);
            todoItem.appendChild(todoDate);
            todoItem.appendChild(todoPriority);
            todoItem.appendChild(editButton);
            todoItem.appendChild(deleteButton);
            todosContainer.appendChild(todoItem);
        });

        const todoButton = document.createElement('button');
        todoButton.className = 'newTodo';
        todoButton.textContent = '+ New ToDo';
        todoButton.addEventListener('click', () => {
            todoFormContainer.classList.add('visible');
        });
        todosContainer.appendChild(todoButton);
    }

    function formatDate(date) {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    function addNewTodo() {
        const title = todoTitleInput.value;
        const dueDate = todoDateInput.value;
        const priority = todoPrioritySelect.value;

        if (title && dueDate && priority && selectedProjectIndex !== null) {
            const newTodo = new Todo(
                title,
                dueDate,
                priority
            );
            projects[selectedProjectIndex].addTodo(newTodo);
            saveProjectsToLocalStorage();
            displayTodos(selectedProjectIndex);
            todoForm.reset();
            todoFormContainer.classList.remove('visible');
        }
    }

    function editTodo(todo, title, dueDate, priority) {
        if (title && dueDate && priority) {
            
            todo.title = title;
            todo.dueDate = todo.validateDate(dueDate);
            todo.priority = priority;
            saveProjectsToLocalStorage();

            displayTodos(selectedProjectIndex);
            
            todoForm.reset();
            todoFormContainer.classList.remove('visible');
            editingTodo = null; 
        }
    }

    function handleEditOrAddTodo(e) {
        e.preventDefault();
        if (editingTodo) {
            editTodo(editingTodo, todoTitleInput.value, todoDateInput.value, todoPrioritySelect.value);
        } else {
            addNewTodo();
        }
    }

    submitTodoButton.addEventListener('click', handleEditOrAddTodo);

    exitButton.addEventListener('click', () => {
        todoFormContainer.classList.remove('visible');
        editingTodo = null;
        todoForm.reset();
    });

    renderProjects();
});
/******/ })()
;
//# sourceMappingURL=main.1c9e75ea071724004166.js.map