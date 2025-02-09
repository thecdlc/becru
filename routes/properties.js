const express = require('express');
const router = express.Router();
const csrfProtection = require('csurf')();
const isAuthenticated = require('../middleware/auth');
const { upload, compressImage } = require('../middleware/upload');
const knex = require('../db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PDFDocument = require('pdfkit');


const uploadFields = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 100 }
]);


router.get('/',    csrfProtection, async (req, res) => {
  try {
    const rawProperties = await knex('properties').select('*');
    const properties = await Promise.all(
      rawProperties.map(async (prop) => {
        const images = await knex('images').where({ property_id: prop.id });
        let coverImage = null;
        if (prop.cover_image_id) {
          coverImage = await knex('images').where({ id: prop.cover_image_id }).first();
        }
        if (!coverImage && images.length) {
          coverImage = images[0];
        }
        return { ...prop, images, coverImage };
      })
    );
    res.render('properties', { properties, username: req.session.user, csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Error interno del servidor');
  }
});



router.get('/nuevo', isAuthenticated, csrfProtection, (req, res) => {
  res.render('new', { username: req.session.user, csrfToken: req.csrfToken() });
});

router.get('/:id', csrfProtection, async (req, res) => {
  try {
    const { id } = req.params;

    const property = await knex('properties').where({ id }).first();
    if (!property) return res.status(404).send('Propiedad no encontrada');

    const images = await knex('images').where({ property_id: id });

    const featuredProps = await knex('properties')
      .whereNot({ id }) 
      .orderBy('updated_at', 'desc') 
      .limit(3); 

    const featuredPropsWithCovers = await Promise.all(
      featuredProps.map(async (fp) => {
        const coverImage = await knex('images')
          .where({ id: fp.cover_image_id }).first();
        return {
          ...fp,
          coverFilepath: coverImage ? coverImage.filepath : '/images/property-placeholder.jpg', 
        };
      })
    );

    res.render('propiedad', {
      property,
      images,
      featuredProps: featuredPropsWithCovers,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await knex('properties').where({ id }).first();
    if (!property) {
      return res.status(404).send('Propiedad no encontrada');
    }

    const images = await knex('images').where({ property_id: id });
    const becruLogoPath = path.join(__dirname, '..', 'public', 'images', 'becru_logo.jpg');

  
    const cleanText = (text) => {
      return text ? text.replace(/[Ðð]/g, '').replace(/\r\n|\r/g, '\n') : '';
    };

    property.title = cleanText(property.title);
    property.description = cleanText(property.description);
    property.ubication = cleanText(property.ubication);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="propiedad-${id}.pdf"`);
    doc.pipe(res);

  
    if (fs.existsSync(becruLogoPath)) {
      doc.image(becruLogoPath, 50, 30, { height: 60 });
    }

    doc
      .fontSize(10)
      .fillColor('#666666')
      .rect(doc.page.width - 250, 30, 200, 60)
      .stroke();
    doc
      .fillColor('#666666')
      .text('Becru', doc.page.width - 240, 40, { align: 'left' })
      .text('Teléfono: 2321596250', { align: 'left' })
      .text('Email: becru_sa@outlook.com', { align: 'left' })
      .moveDown(2);

 
    const titleY = 110;
    doc.fillColor('#1a365d')
      .fontSize(24)
      .text(property.title, 50, titleY, {
        align: 'center',
        width: doc.page.width - 100
      })
      .moveDown(2);


 
    const addSectionHeader = (text, options = {}) => {
      doc
        .fontSize(16)
        .fillColor('#2c5282')
        .text(text, options.x || 50, doc.y, { align: options.align || 'left' })
        .fillColor('#000000')
        .moveDown(0.5);
    };

  
    addSectionHeader('Detalles de la Propiedad');
    doc
      .fontSize(11)
      .fillColor('#4a5568')
      .text(`Precio: `, { continued: true })
      .fillColor('#000000')
      .text(`$${property.price.toLocaleString()}`)
      .fillColor('#4a5568')
      .text(`Ubicación: `, { continued: true })
      .fillColor('#000000')
      .text(property.ubication)
      .fillColor('#4a5568')
      .text(`Área Total: `, { continued: true })
      .fillColor('#000000')
      .text(`${property.total_area} m²`)
      .fillColor('#4a5568')
      .text(`Área Construida: `, { continued: true })
      .fillColor('#000000')
      .text(`${property.built_area} m²`)
      .fillColor('#4a5568')
      .text(`Habitaciones: `, { continued: true })
      .fillColor('#000000')
      .text(property.number_of_rooms)
      .fillColor('#4a5568')
      .text(`Baños: `, { continued: true })
      .fillColor('#000000')
      .text(property.number_of_bathrooms)
      .moveDown(2);

   
    addSectionHeader('Descripción');
    doc
      .fontSize(11)
      .fillColor('#000000')
      .text(property.description, {
        align: 'justify',
        lineGap: 4
      })
      .moveDown(2);

    doc.addPage();
    addSectionHeader('Imágenes de la Propiedad', { align: 'center' });

    if (images.length > 0) {
      const margin = 50;
      const gutter = 20;
      const availableWidth = doc.page.width - 2 * margin;
      const imageWidth = (availableWidth - gutter) / 2;
      const imageHeight = imageWidth * 0.75; 
      let x = margin;
      let y = doc.y + 10; 

      for (let i = 0; i < images.length; i++) {
        const imagePath = path.join(__dirname, '..', 'public', images[i].filepath);
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, x, y, { fit: [imageWidth, imageHeight], align: 'center', valign: 'center' });

          if ((i + 1) % 2 === 0) {
            x = margin;
            y += imageHeight + gutter;
            if (y + imageHeight > doc.page.height - margin) {
              doc.addPage();
              y = margin;
            }
          } else {
            x += imageWidth + gutter;
          }
        }
      }
      doc.moveDown(2);
    }

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error interno del servidor');
  }
});


router.post('/', isAuthenticated, uploadFields, csrfProtection, async (req, res) => {
  try {
    console.log('Starting property creation process...');
    const {
      title,
      description,
      price,
      ubication,
      number_of_bathrooms,
      number_of_rooms,
      total_area,
      built_area
    } = req.body;

    console.log('Creating base property record...');
    const [propertyId] = await knex('properties').insert({
      title,
      description,
      price,
      ubication,
      number_of_bathrooms,
      number_of_rooms,
      total_area,
      built_area,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log(`Base property created with ID: ${propertyId}`);

    let coverImageId = null;
    if (req.files && req.files.cover && req.files.cover.length > 0) {
      console.log('Processing cover image...');
      const coverFile = req.files.cover[0];
      console.log('Cover file details:', coverFile.filename);
      const [coverImageRecordId] = await knex('images').insert({
        property_id: propertyId,
        filename: coverFile.originalname,
        filepath: `/uploads/properties/${coverFile.filename}`,
        created_at: new Date(),
      });
      coverImageId = coverImageRecordId;
      console.log(`Cover image processed and saved with ID: ${coverImageId}`);
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log(`Processing ${req.files.images.length} additional images...`);
      const imagesData = req.files.images.map(file => ({
        property_id: propertyId,
        filename: file.originalname,
        filepath: `/uploads/properties/${file.filename}`,
        created_at: new Date(),
      }));
      await knex('images').insert(imagesData);
      console.log('Additional images processed and saved');
    }

    if (coverImageId) {
      console.log('Updating property with cover image reference...');
      await knex('properties')
        .where({ id: propertyId })
        .update({
          cover_image_id: coverImageId,
          updated_at: new Date(),
        });
    }

    if (ubication) {
      console.log('Starting geocoding process...');
      const encodedAddress = encodeURIComponent(ubication);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

      try {
        console.log('Sending geocoding request for address:', ubication);
        const response = await axios.get(url);
        const data = response.data;

        console.log('Geocoding API response status:', data.status);
        if (data.status === 'OK') {
          console.log('Geocoding successful, updating coordinates...');
          const { lat, lng } = data.results[0].geometry.location;
          await knex('properties')
            .where({ id: propertyId })
            .update({
              latitude: lat,
              longitude: lng,
              updated_at: new Date(),
            });
          console.log('Coordinates updated:', { lat, lng });
        } else {
          console.warn('Geocoding failed. Details:', {
            status: data.status,
            errorMessage: data.error_message,
            results: data.results,
            address: ubication
          });
        }
      } catch (error) {
        console.error('Geocoding request failed:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          address: ubication
        });
      }
    }

    console.log('Property creation process completed successfully');
    res.redirect('/admin');
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).send('Error interno del servidor');
  }
});




router.get('/:id/editar', isAuthenticated, csrfProtection, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await knex('properties').where({ id }).first();

    if (!property) return res.status(404).send('Propiedad no encontrada');

    const images = await knex('images').where({ property_id: id });

    res.render('edit', { property, images, csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching property for edit:', error);
    res.status(500).send('Error interno del servidor');
  }
});


router.post('/:id/editar', isAuthenticated, uploadFields, csrfProtection, async (req, res) => {
  try {
    console.log('Starting property update process...');
    const { id } = req.params;
    const {
      title,
      description,
      price,
      ubication,
      number_of_bathrooms,
      number_of_rooms,
      total_area,
      built_area
    } = req.body;

    console.log(`Fetching existing property with ID: ${id}`);
    const existingProperty = await knex('properties').where({ id }).first();
    if (!existingProperty) {
      console.log('Property not found');
      return res.status(404).send('Propiedad no encontrada');
    }

    const updateData = {
      title,
      description,
      price,
      ubication,
      number_of_bathrooms,
      number_of_rooms,
      total_area,
      built_area,
      updated_at: new Date(),
    };

    if (ubication && ubication !== existingProperty.ubication) {
      console.log('Location changed, starting geocoding process...');
      const encodedAddress = encodeURIComponent(ubication);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      try {
        console.log('Sending geocoding request for address:', ubication);
        const response = await axios.get(url);
        const data = response.data;

        console.log('Geocoding API response status:', data.status);
        if (data.status === 'OK') {
          console.log('Geocoding successful, updating coordinates...');
          const { lat, lng } = data.results[0].geometry.location;
          updateData.latitude = lat;
          updateData.longitude = lng;
          console.log('New coordinates:', { lat, lng });
        } else {
          console.warn('Geocoding failed. Details:', {
            status: data.status,
            errorMessage: data.error_message,
            results: data.results,
            address: ubication
          });
        }
      } catch (error) {
        console.error('Geocoding request failed:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          address: ubication
        });
      }
    }

    if (req.files && req.files.cover && req.files.cover[0]) {
      console.log('Processing new cover image...');
      const coverFile = req.files.cover[0];
      console.log('New cover file details:', coverFile.filename);

      if (existingProperty.cover_image_id) {
        console.log('Removing old cover image...');
        await knex('images').where({ id: existingProperty.cover_image_id }).del();
      }

      const [coverImageId] = await knex('images').insert({
        property_id: id,
        filename: coverFile.originalname,
        filepath: `/uploads/properties/${coverFile.filename}`,
        created_at: new Date(),
      });

      updateData.cover_image_id = coverImageId;
      console.log(`New cover image processed and saved with ID: ${coverImageId}`);
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log(`Processing ${req.files.images.length} additional images...`);
      const imagesData = req.files.images.map(file => ({
        property_id: id,
        filename: file.originalname,
        filepath: `/uploads/properties/${file.filename}`,
        created_at: new Date(),
      }));
      await knex('images').insert(imagesData);
      console.log('Additional images processed and saved');
    }

    console.log('Updating property record...');
    await knex('properties').where({ id }).update(updateData);
    console.log('Property update process completed successfully');
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).send('Error interno del servidor');
  }
});





router.delete('/:id', isAuthenticated, csrfProtection, async (req, res) => {
  try {
    const images = await knex('images').where({ property_id: req.params.id });
    images.forEach((image) => {
      const filePath = path.join(__dirname, '..', 'public', image.filepath);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file ${filePath}:`, err);
      });
    });

    await knex('properties').where({ id: req.params.id }).del();
    res.redirect('/admin');
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router;
