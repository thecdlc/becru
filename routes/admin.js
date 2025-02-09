const express = require('express');
const router = express.Router();
const csrfProtection = require('csurf')();
const isAuthenticated = require('../middleware/auth');
const knex = require('../db');

router.get('/', csrfProtection, async (req, res) => {
    if (!req.session.user) {
        console.log("No user: ", req.session.user)
        return res.render('login', { error: null });
    }

    try {
        const rawProperties = await knex('properties')
            .select('*')
            .orderBy('created_at', 'desc'); 

        const properties = await Promise.all(
            rawProperties.map(async (property) => {
                const images = await knex('images').where({ property_id: property.id });
                return { ...property, images };
            })
        );

        res.render('dashboard', {
            username: req.session.user,
            properties,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        console.error('Error fetching properties for dashboard:', error);
        res.status(500).send('Error interno del servidor');
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const knex = require('../db');
    const bcrypt = require('bcrypt');

    try {
        const admin = await knex('admins').where({ username }).first();
        console.log("admin found:", admin);

        if (admin) {
            const match = await bcrypt.compare(password, admin.password);
            console.log("password match:", match);

            if (match) {
                req.session.user = admin.username;
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).send('Error saving session');
                    }
                    console.log("Session saved:", req.session);
                    return res.redirect('/admin');
                });
            } else {
                res.render('login', { error: 'Credenciales inválidas. Por favor, intenta de nuevo.' });
            }
        } else {
            res.render('login', { error: 'Credenciales inválidas. Por favor, intenta de nuevo.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});



module.exports = router;
