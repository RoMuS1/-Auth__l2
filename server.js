const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Имитация текущего пользователя
let currentUser = null;

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || username.includes(' ') || password.includes(' ')) {
        return res.status(400).json({ message: 'Логин и пароль не должны содержать пробелы' });
    }

    const users = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Логин уже занят.' });
    }

    users.push({ username, password, registrationDate: new Date().toISOString() });
    fs.writeFileSync('./db.json', JSON.stringify(users, null, 2));
    res.status(200).json({ message: 'Пользователь зарегистрирован.' });
});

// Вход пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    const user = users.find(user => user.username === username);

    if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Неверно введен логин и/или пароль' });
    }

    currentUser = user;
    res.status(200).json({ message: 'Вход выполнен.' });
});

// Загрузка профиля
app.get('/profile', (req, res) => {
    if (!currentUser) {
        return res.status(401).json({ message: 'Вы не авторизованы' });
    }
    res.status(200).json({
        username: currentUser.username,
        registrationDate: currentUser.registrationDate
    });
});

// Выход пользователя
app.post('/logout', (req, res) => {
    currentUser = null; // Очистка текущего пользователя
    res.status(200).json({ message: 'Вы успешно вышли из аккаунта.' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
