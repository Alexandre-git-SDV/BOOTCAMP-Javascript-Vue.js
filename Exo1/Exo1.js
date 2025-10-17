// Exo1
document.body.style.backgroundColor = 'lightblue';

// Const pour chaque élément HTML
const titre = document.createElement('h1');
titre.textContent = 'Task Manager';
document.body.appendChild(titre);

const buttonadd = document.createElement('button');
buttonadd.textContent = 'Ajouter tâche';
document.body.appendChild(buttonadd);

document.body.appendChild(document.createElement('br'));
document.body.appendChild(document.createElement('br'));

const filterContainer = document.createElement('div');
document.body.appendChild(filterContainer);

const ul = document.createElement('ul');
document.body.appendChild(ul);

// Gestion des données
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'toutes';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Gestion des Filtres
function renderTasks() {
  ul.innerHTML = '';

  let filteredTasks = tasks;
  if (currentFilter === 'faites') {
    filteredTasks = tasks.filter(t => t.status === 'fait');
  } else if (currentFilter === 'à faire') {
    filteredTasks = tasks.filter(t => t.status === 'à faire');
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = `${task.name} (${task.status}) `;

    // Bouton statut
    const statusButton = document.createElement('input');
    statusButton.type = 'checkbox';
    statusButton.checked = task.status === 'fait';
    
    statusButton.onchange = function () {
      task.status = statusButton.checked ? 'fait' : 'à faire';
      saveTasks();
      renderTasks();
    };
    li.appendChild(statusButton);

    // Bouton supprimer
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.onclick = function () {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };
    
    li.appendChild(deleteButton);
    ul.appendChild(li);
  });
}

// Bouton d'Ajout
buttonadd.onclick = function () {
  const taskName = prompt("Entrez votre tâche");
  
  const newTask = { name: taskName, status: 'à faire' };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
};

// Filtres
const filters = ['toutes', 'faites', 'à faire'];
filters.forEach(filterName => {
  const btn = document.createElement('button');
  btn.textContent = filterName.charAt(0).toUpperCase() + filterName.slice(1);
  btn.onclick = function () {
    currentFilter = filterName;
    renderTasks();
  };
  filterContainer.appendChild(btn);
});

// --- Chargement initial ---
renderTasks();
