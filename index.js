// @ts-nocheck
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { registerValidation, loginValidation, postCreateValidation } from './validations/validations.js';
import { UserController, PostController } from './controllers/index.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';

mongoose
	.connect('mongodb+srv://admin:Izekzq_2022@cluster0.fxa1e.mongodb.net/blog?retryWrites=true&w=majority',)
	.then(() => console.log('DB ok'))
	.catch((err) => console.log('DB error:', err));

const app = express();

// создаю хранилище для файлов - картинок
// cb -> нет ошибок + сохраняет в папку 'uploads'
const storage = multer.diskStorage({
	// возвращает путь к файлу
	destination: (_, __, cb) => {
		cb(null, 'uploads');
	},
	// возвращает оригинальное имя файла
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	}
});

// функция для файлов - картинок
const upload = multer({ storage });

app.use(express.json());

// если приходит такой запрос, то надо идти в папку 'uploads'
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

app.get('/auth/me', checkAuth, UserController.getMe);

// роут для файлов - картинок
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		// @ts-ignore
		url: `/uploads/${req.file.originalname}`,

	});
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server OK');
});