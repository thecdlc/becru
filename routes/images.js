const express = require('express');
const router = express.Router();
const knex = require('../db');
const fs = require('fs');
const path = require('path');
const isAuthenticated = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'properties'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post(
  '/',
  isAuthenticated,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { property_id } = req.body;
      if (!property_id) {
        return res.status(400).json({ success: false, message: 'property_id is required' });
      }

      let coverImageResult = null;
      let additionalImagesResult = [];

      if (req.files && req.files.cover && req.files.cover.length > 0) {
        const coverFile = req.files.cover[0];

        const property = await knex('properties').where({ id: property_id }).first();
        if (property && property.cover_image_id) {
          const existingImage = await knex('images').where({ id: property.cover_image_id }).first();
          if (existingImage) {
            const oldFilePath = path.join(__dirname, '..', 'public', existingImage.filepath);
            fs.unlink(oldFilePath, (err) => {
              if (err) console.error(`Error deleting file ${oldFilePath}:`, err);
            });
            await knex('images').where({ id: property.cover_image_id }).del();
          }
        }
        const [coverImageId] = await knex('images').insert({
          property_id: property_id,
          filename: coverFile.originalname,
          filepath: `/uploads/properties/${coverFile.filename}`,
          created_at: new Date()
        });
        coverImageResult = {
          id: coverImageId,
          filename: coverFile.originalname,
          filepath: `/uploads/properties/${coverFile.filename}`
        };
        await knex('properties').where({ id: property_id }).update({ cover_image_id: coverImageId });
      }

      if (req.files && req.files.images && req.files.images.length > 0) {
        const imagesData = req.files.images.map(file => ({
          property_id: property_id,
          filename: file.originalname,
          filepath: `/uploads/properties/${file.filename}`,
          created_at: new Date()
        }));
        await knex('images').insert(imagesData);
        additionalImagesResult = await knex('images')
          .where({ property_id: property_id })
          .orderBy('id', 'desc')
          .limit(req.files.images.length);
      }

      res.json({
        success: true,
        coverImage: coverImageResult,
        additionalImages: additionalImagesResult
      });
    } catch (error) {
      console.error('Error processing images:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
);


router.delete('/:image_id', isAuthenticated, async (req, res) => {
  try {
    const { image_id } = req.params;
    const image = await knex('images').where({ id: image_id }).first();
    if (!image) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    const filePath = path.join(__dirname, '..', 'public', image.filepath);
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filePath}:`, err);
    });

    await knex('images').where({ id: image_id }).del();

    const property = await knex('properties').where({ cover_image_id: image_id }).first();
    if (property) {
      await knex('properties').where({ id: property.id }).update({ cover_image_id: null });
    }

    res.status(200).json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
