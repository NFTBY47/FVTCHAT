// Локальное хранилище для тем, сообщений и пользователей
let topics = JSON.parse(localStorage.getItem('topics')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Элементы DOM
const authPanel = document.querySelector('.auth-panel');
const content = document.getElementById('content');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const exportBtn = document.getElementById('export-btn');
const topicsList = document.getElementById('topics');
const adminPanel = document.getElementById('admin-panel'); // Панель админа
const topicTitleInput = document.getElementById('topic-title');
const topicContentInput = document.getElementById('topic-content');
const createTopicBtn = document.getElementById('create-topic-btn');
const topicModal = document.getElementById('topic-modal');
const modalTopicTitle = document.getElementById('modal-topic-title');
const modalTopicContent = document.getElementById('modal-topic-content');
const modalMessages = document.getElementById('modal-messages');
const newMessageInput = document.getElementById('new-message');
const fileInput = document.createElement('input'); // Поле для загрузки файлов
fileInput.type = 'file';
fileInput.accept = '.pdf, .jpg, .jpeg, .png';
const sendMessageBtn = document.getElementById('send-message-btn');
const clearTopicBtn = document.getElementById('clear-topic-btn'); // Кнопка очистки темы
const closeModal = document.querySelector('.close');
const usernameDisplay = document.getElementById('username-display');

// Текущий пользователь, тема и статус админа
let currentUser = null;
let currentTopicId = null;
let isAdmin = false;

// Цвета для имен пользователей (кроме админа)
const usernameColors = ['username-pink', 'username-green', 'username-yellow'];

// Функция для получения случайного цвета
function getRandomColor() {
    return usernameColors[Math.floor(Math.random() * usernameColors.length)];
}

// Удаляем все существующие темы
topics = [];

// Создаем три новые темы
topics.push({
    title: "Чат студентов",
    content: "Соблюдайте правила, установленные администратором, если не хотите быть заблокированы.",
    messages: [
        { user: "Админ", text: "Добро пожаловать в чат студентов! Пожалуйста, соблюдайте правила.", color: "username-gold", files: [] },
        { user: "Студент", text: "Привет! Кто-то уже сдал экзамен по математике?", color: "username-green", files: [] }
    ]
});

topics.push({
    title: "Ответы",
    content: "Добавляйте сюда ответы на ТР, фотки билетов и прочее, связанное с экзаменами.",
    messages: [
        { user: "Студент", text: "Вот ответы на ТР по физике: [ссылка на файл].", color: "username-yellow", files: [] },
        { user: "Преподаватель", text: "Пожалуйста, не публикуйте ответы до окончания экзамена.", color: "username-pink", files: [] }
    ]
});

topics.push({
    title: "Работа",
    content: "Размещайте вакансии и указывайте почту для обратной связи.",
    messages: [
        { user: "Работодатель", text: "Ищем стажёра в IT-компанию. Пишите на email: hr@company.com.", color: "username-green", files: [] },
        { user: "Студент", text: "Есть ли вакансии для junior-разработчиков?", color: "username-yellow", files: [] }
    ]
});

// Сохраняем темы в localStorage
localStorage.setItem('topics', JSON.stringify(topics));

// Функция для отображения тем
function renderTopics() {
    topicsList.innerHTML = '';
    topics.forEach((topic, index) => {
        const li = document.createElement('li');
        li.textContent = topic.title;
        li.addEventListener('click', () => openTopic(index));
        topicsList.appendChild(li);
    });
}

// Функция для открытия темы
function openTopic(id) {
    currentTopicId = id;
    const topic = topics[id];
    modalTopicTitle.textContent = topic.title;
    modalTopicContent.textContent = topic.content;
    renderMessages(topic.messages);
    topicModal.style.display = 'flex';
}

// Функция для отображения сообщений
function renderMessages(messages) {
    modalMessages.innerHTML = '';
    messages.forEach(message => {
        const li = document.createElement('li');
        const crown = message.user === "ADMIN_RGRTU" ? "🎓" : ""; // Значок короны для админа
        li.innerHTML = `<span class="${message.color}">${message.user} ${crown}:</span> ${message.text}`;

        // Отображение файлов
        if (message.files && message.files.length > 0) {
            message.files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    li.innerHTML += `<br><img src="${file.url}" alt="Загруженное изображение" style="max-width: 200px;">`;
                } else if (file.type === 'application/pdf') {
                    li.innerHTML += `<br><a href="${file.url}" target="_blank">Скачать PDF</a>`;
                }
            });
        }

        modalMessages.appendChild(li);
    });
}

// Функция для создания новой темы
createTopicBtn.addEventListener('click', () => {
    const title = topicTitleInput.value.trim();
    const content = topicContentInput.value.trim();

    if (title && content) {
        topics.push({
            title,
            content,
            messages: []
        });
        localStorage.setItem('topics', JSON.stringify(topics));
        renderTopics();
        topicTitleInput.value = '';
        topicContentInput.value = '';
    }
});

// Функция для отправки сообщения
sendMessageBtn.addEventListener('click', () => {
    const message = newMessageInput.value.trim();
    const files = fileInput.files;

    if ((message || files.length > 0) && currentTopicId !== null && currentUser) {
        const userData = users.find(user => user.username === currentUser);
        const color = userData.color;

        const newMessage = {
            user: currentUser,
            text: message,
            color: color,
            files: []
        };

        // Обработка файлов
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const fileURL = URL.createObjectURL(file);
                newMessage.files.push({
                    type: file.type,
                    url: fileURL
                });
            });
        }

        topics[currentTopicId].messages.push(newMessage);
        localStorage.setItem('topics', JSON.stringify(topics));
        renderMessages(topics[currentTopicId].messages);
        newMessageInput.value = '';
        fileInput.value = ''; // Очищаем поле загрузки файлов
    }
});

// Функция для очистки темы
clearTopicBtn.addEventListener('click', () => {
    if (currentTopicId !== null) {
        topics[currentTopicId].messages = [];
        localStorage.setItem('topics', JSON.stringify(topics));
        renderMessages(topics[currentTopicId].messages);
    }
});

// Функция для регистрации
registerBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
        const userExists = users.some(user => user.username === username);
        if (!userExists) {
            const color = getRandomColor();
            users.push({ username, password, color });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Регистрация успешна!');
        } else {
            alert('Пользователь уже существует!');
        }
    }
});

// Функция для входа
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Проверка на админа
    if (username === "ADMIN_RGRTU" && password === "sasatsasat123") {
        currentUser = username;
        isAdmin = true;
        authPanel.style.display = 'none';
        content.style.display = 'block';
        adminPanel.style.display = 'block'; // Показываем панель админа
        clearTopicBtn.style.display = 'block'; // Показываем кнопку очистки темы
        usernameDisplay.textContent = `Пользователь: ${username} 🎓`; // Значок короны для админа
        usernameDisplay.className = "username-gold"; // Золотой цвет для админа
        return;
    }

    // Обычный пользователь
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        currentUser = username;
        isAdmin = false;
        authPanel.style.display = 'none';
        content.style.display = 'block';
        adminPanel.style.display = 'none'; // Скрываем панель админа
        clearTopicBtn.style.display = 'none'; // Скрываем кнопку очистки темы
        usernameDisplay.textContent = `Пользователь: ${username}`;
        usernameDisplay.className = user.color; // Используем сохраненный цвет
    } else {
        alert('Неверный логин или пароль!');
    }
});

// Функция для экспорта в Excel
exportBtn.addEventListener('click', () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Пользователи');
    XLSX.writeFile(wb, 'users.xlsx');
});

// Закрытие модального окна
closeModal.addEventListener('click', () => {
    topicModal.style.display = 'none';
});

// Инициализация
renderTopics();

// Добавляем поле для загрузки файлов
document.querySelector('.modal-content').insertBefore(fileInput, newMessageInput);