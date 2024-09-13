const itemsPerPage = 10;
let currentPage = 1;
let allClients = [];
let currentSortColumn = '';
let currentSortOrder = 'asc';

async function fetch_data() {
  const table = document.getElementById('data-fetch');
  const error_msg = document.getElementById('error-msg');

  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    allClients = data; // Store all clients for filtering and sorting
    updateTable();
  } catch (error) {
    console.error('Error fetching data:', error);
    error_msg.textContent = "Failed to fetch data.";
  }
}

function displayData(data) {
  const table = document.getElementById('data-fetch');
  let rows = '';

  data.forEach(client => {
    rows += `
      <tr>
        <td class="id">${client.id}</td>
        <td class="name">${client.name}</td>
        <td class="mobile">${client.mobile}</td>
        <td class="email">${client.email}</td>
        <td class="city">${client.city}</td>
        <td class="action"><button class="btn btn-dark" type="button" data-bs-toggle="offcanvas" onclick='viewClientDetails(${JSON.stringify(client)})' data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">View</button></td>
      </tr>
    `;
  });

  table.innerHTML = rows;
}

function updateTable() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = allClients.slice(start, end);
  displayData(paginatedItems);
  renderPagination(allClients.length);
}

function renderPagination(totalItems) {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage > 1) {
    pagination.innerHTML += `<li class="page-item" id="prev-btn"><a class="page-link" href="#">Previous</a></li>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}" data-page="${i}"><a class="page-link" href="#">${i}</a></li>`;
  }
  if (currentPage < totalPages) {
    pagination.innerHTML += `<li class="page-item" id="next-btn"><a class="page-link" href="#">Next</a></li>`;
  }
}

function handlePagination(event) {
  const target = event.target;
  if (target.tagName === 'A') {
    const page = parseInt(target.parentElement.getAttribute('data-page'));
    if (page) {
      currentPage = page;
      updateTable();
    } else if (target.parentElement.id === 'prev-btn' && currentPage > 1) {
      currentPage--;
      updateTable();
    } else if (target.parentElement.id === 'next-btn') {
      currentPage++;
      updateTable();
    }
  }
}

function viewClientDetails(client) {
  document.getElementById('client-id').textContent = client.id;
  document.getElementById('client-name').textContent = client.name;
  document.getElementById('client-mobile').textContent = client.mobile;
  document.getElementById('client-email').textContent = client.email;
  document.getElementById('client-city').textContent = client.city;

  // Show the offcanvas
  const offcanvasElement = document.getElementById('offcanvasRight');
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}

function filterData(query) {
  const filteredClients = allClients.filter(client => {
    return client.id.toString().toLowerCase().includes(query.toLowerCase()) ||
           client.name.toLowerCase().includes(query.toLowerCase()) ||
           client.mobile.toLowerCase().includes(query.toLowerCase()) ||
           client.email.toLowerCase().includes(query.toLowerCase()) ||
           client.city.toLowerCase().includes(query.toLowerCase());
  });
  allClients = filteredClients;
  updateTable();
}

function sort(event) {
  const column = event.target.getAttribute('data-column');
  const order = event.target.getAttribute('data-order');

  if (currentSortColumn === column) {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = column;
    currentSortOrder = 'asc';
  }

  const sortedClients = [...allClients].sort((a, b) => {
    if (a[column] < b[column]) return currentSortOrder === 'asc' ? -1 : 1;
    if (a[column] > b[column]) return currentSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  document.querySelectorAll('.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  event.target.classList.add(currentSortOrder);

  allClients = sortedClients;
  updateTable();
  event.target.setAttribute('data-order', currentSortOrder);
}

function toggleColumn(event) {
  event.preventDefault();
  const columnClass = event.target.getAttribute('data-column');
  const columnHeader = document.querySelector(`th[data-column="${columnClass}"]`);
  const columnCells = document.querySelectorAll(`td.${columnClass}`);
  
  if (columnHeader.classList.contains('hidden')) {
    columnHeader.classList.remove('hidden');
    columnCells.forEach(cell => cell.classList.remove('hidden'));
  } else {
    columnHeader.classList.add('hidden');
    columnCells.forEach(cell => cell.classList.add('hidden'));
  }
}

document.getElementById('search-input').addEventListener('input', (event) => {
  filterData(event.target.value);
});

document.querySelector('.pagination').addEventListener('click', handlePagination);

fetch_data();

function exportDataToCsv(data) {
  const csvContent = convertToCsv(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'export_data.csv');
  document.body.appendChild(link); // Append link to the body
  link.click(); // Trigger download
  document.body.removeChild(link); // Remove link from the body
}

function convertToCsv(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => `"${obj[header]}"`).join(','));
  const headerRow = headers.join(',');
  const csvRows = [headerRow, ...rows];
  return csvRows.join('\n');
}
