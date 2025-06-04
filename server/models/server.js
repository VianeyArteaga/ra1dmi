const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();  // Asegúrate de cargar las variables de entorno

// Modelo de usuario
const User = require('../models/User');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000; 

        this.connectDB();  // Conexión a la base de datos MongoDB
        this.middlewares();
        this.routes();
        this.listen();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    async connectDB() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("Conectado a MongoDB");
        } catch (error) {
            console.error("Error al conectar con MongoDB", error);
        }
    }

    routes() {


       
        this.app.post('/enviar-correo', (req, res) => {
            const { nombre, correo, mensaje } = req.body;
        
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS,
                },
            });
        
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: process.env.GMAIL_USER, // recibes tú mismo el mensaje
                subject: `Mensaje de ${nombre} (${correo})`,
                text: mensaje,
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar:', error);
                    return res.send('<script>alert("Ocurrió un error al enviar el mensaje."); window.history.back();</script>');
                }
                res.send('<script>alert("Mensaje enviado correctamente, gracias por contactarnos."); window.history.back();</script>');
            });
        });


        // Ruta de prueba
        this.app.get("/", (req, res) => {
            res.sendFile(__dirname + '/views/login.html');
        });

        // Ruta para el formulario de registro
        this.app.get('/views/registro.html', (req, res) => {
            console.log('Ruta alcanzada');
            res.sendFile(path.join(__dirname, 'views', 'registro.html'));
        });

        // Ruta para login.html
        this.app.get('/views/login.html', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'login.html'));
        });
        this.app.get('/views/index.html', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'index.html'));
        });
        

        // Ruta para manejar el registro de usuario
        this.app.post('/api/register', async (req, res) => {
            const { username, email, password } = req.body;

            try {
                // Verificar si el usuario ya existe
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.json({ success: false, message: "El correo ya está registrado." });
                }

                // Hashear la contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                // Crear un nuevo usuario
                const newUser = new User({
                    username,
                    email,
                    password: hashedPassword
                });

                // Guardar el nuevo usuario en la base de datos
                await newUser.save();
                res.json({ success: true, message: "Usuario registrado exitosamente." });
            } catch (error) {
                console.error(error);
                res.json({ success: false, message: "Error al registrar el usuario." });
            }
        });

        // Ruta para login (la que falta)
            this.app.post('/api/login', async (req, res) => {
                const { email, password } = req.body;

                try {
                    const user = await User.findOne({ email });
                    if (!user) {
                        return res.json({ success: false, message: "Usuario no encontrado." });
                    }

                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        return res.json({ success: false, message: "Contraseña incorrecta." });
                    }

                    res.json({ success: true, message: "Inicio de sesión exitoso", username: user.username });
                } catch (error) {
                    console.error(error);
                    res.json({ success: false, message: "Error en el inicio de sesión." });
                }
            });

           // Ruta para obtener todos los usuarios en formato JSON
            this.app.get('/api/users', async (req, res) => {
                try {
                    const users = await User.find();
                    res.json(users);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, message: "Error al obtener los usuarios." });
                }
            });



    }

    listen() {

        
        // Iniciar servidor 
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en http://localhost:${this.port}`);
        });
    }
}

module.exports = Server;
