const API_BASE_URL = 'https://fastapi-user-management-4cgx.onrender.com';

const userForm = document.getElementById('userForm');
const updateUserForm = document.getElementById('updateUserForm');
const usersTableBody = document.getElementById('usersTableBody');
const refreshUsersBtn = document.getElementById('refreshUsersBtn');
const searchUserBtn = document.getElementById('searchUserBtn');
const deleteUserBtn = document.getElementById('deleteUserBtn');
const clearTableBtn = document.getElementById('clearTableBtn');
const userIdInput = document.getElementById('userId');
const deleteUserIdInput = document.getElementById('deleteUserId');
const singleUserResult = document.getElementById('singleUserResult');
const updateUserIdInput = document.getElementById('updateUserId');
const updateNameInput = document.getElementById('updateName');
const updateAgeInput = document.getElementById('updateAge');
const totalUsersStat = document.getElementById('totalUsersStat');
const visibleUsersStat = document.getElementById('visibleUsersStat');
const statusIndicator = document.getElementById('statusIndicator');
const messageBox = document.getElementById('message');

let currentUsers = [];

function updateSummary(users) {
  const count = Array.isArray(users) ? users.length : 0;
  totalUsersStat.textContent = String(count);
  visibleUsersStat.textContent = String(count);
  statusIndicator.textContent = count > 0 ? 'Live' : 'Empty';
  statusIndicator.classList.toggle('status-empty', count === 0);
}

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;

  clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 3000);
}

function renderUsers(users) {
  currentUsers = Array.isArray(users) ? users : [];
  updateSummary(currentUsers);

  if (!Array.isArray(users) || users.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">No users found.</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.age}</td>
        </tr>
      `
    )
    .join('');
}

async function fetchUsers() {
  try {
    // Frontend API call: GET /users
    const response = await fetch(`${API_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const users = await response.json();
    renderUsers(users);
    showMessage('Users refreshed successfully.', 'success');
  } catch (error) {
    showMessage(`Unable to load users: ${error.message}`, 'error');
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">Failed to load users from the API.</td>
      </tr>
    `;
  }
}

async function addUser(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const age = Number(document.getElementById('age').value);

  if (!name || !Number.isFinite(age) || age <= 0) {
    showMessage('Please enter a valid name and age.', 'error');
    return;
  }

  const payload = { name, age };

  try {
    // Frontend API call: POST /user
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const createdUser = await response.json();
    showMessage(`User added successfully: ${createdUser.name}`, 'success');
    userForm.reset();
    await fetchUsers();
  } catch (error) {
    showMessage(`Add user failed: ${error.message}`, 'error');
  }
}

async function searchUserById() {
  const id = Number(userIdInput.value);

  if (!Number.isInteger(id) || id <= 0) {
    showMessage('Please enter a valid user ID.', 'error');
    singleUserResult.textContent = 'Invalid user ID.';
    singleUserResult.classList.remove('empty');
    return;
  }

  try {
    // Frontend API call: GET /users/{id}
    const response = await fetch(`${API_BASE_URL}/users/${id}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const user = await response.json();

    if (!user) {
      singleUserResult.textContent = `No user found with ID ${id}.`;
      singleUserResult.classList.remove('empty');
      return;
    }

    singleUserResult.classList.remove('empty');
    singleUserResult.innerHTML = `
      <strong>ID:</strong> ${user.id} <br>
      <strong>Name:</strong> ${user.name} <br>
      <strong>Age:</strong> ${user.age}
    `;
    showMessage('User loaded successfully.', 'success');
  } catch (error) {
    singleUserResult.textContent = `Unable to find user ${id}.`;
    singleUserResult.classList.remove('empty');
    showMessage(`Search failed: ${error.message}`, 'error');
  }
}

async function updateUser(event) {
  event.preventDefault();

  const id = Number(updateUserIdInput.value);
  const name = updateNameInput.value.trim();
  const age = Number(updateAgeInput.value);

  if (!Number.isInteger(id) || id <= 0) {
    showMessage('Please enter a valid user ID to update.', 'error');
    return;
  }

  if (!name || !Number.isFinite(age) || age <= 0) {
    showMessage('Please enter a valid name and age to update.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, age }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const updatedUser = await response.json();

    if (updatedUser && updatedUser.message) {
      throw new Error(updatedUser.message);
    }

    showMessage(`User ${id} updated successfully.`, 'success');
    updateUserForm.reset();
    await fetchUsers();
  } catch (error) {
    showMessage(`Update failed: ${error.message}`, 'error');
  }
}

async function deleteUserById() {
  const id = Number(deleteUserIdInput.value);

  if (!Number.isInteger(id) || id <= 0) {
    showMessage('Please enter a valid user ID to delete.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }

    const result = await response.json();
    showMessage(result.message || `User ${id} deleted successfully.`, 'success');
    deleteUserIdInput.value = '';
    await fetchUsers();
  } catch (error) {
    showMessage(`Delete failed: ${error.message}`, 'error');
  }
}

async function deleteAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }

    const result = await response.json();
    showMessage(result.message, 'success');
    await fetchUsers();
  } catch (error) {
    showMessage(`Delete failed: ${error.message}`, 'error');
  }
}

userForm.addEventListener('submit', addUser);
updateUserForm.addEventListener('submit', updateUser);
deleteUserBtn.addEventListener('click', deleteUserById);
clearTableBtn.addEventListener('click', deleteAllUsers);
refreshUsersBtn.addEventListener('click', fetchUsers);
searchUserBtn.addEventListener('click', searchUserById);

fetchUsers();
