exports.seed = async function(knex) {
    // Deletes ALL existing entries in the "properties" table.
    await knex('properties').del();
  
    // Inserts seed entries.
    await knex('properties').insert([
      {
        id: 10,
        title: 'Casa',
        description:
          "¡VENTA!\r\n🏡Casa ubicada en la colonia Malopan🏡\r\nEl inmueble cuenta con:\r\n-2 recamaras\r\n-Sala/comedor \r\n-Cocina\r\n-2 baños\r\n-Patio de servicio\r\n-Cochera\r\n105m² de superficie y 127m² de construcción\r\nSe acepta pago en efectivo, créditos hipotecario, bancario y FOVISSSTE.\r\n¡Tramita tu crédito con nosotros!\r\nMayor información:\r\n2321595276\r\n",
        price: "20000000",
        created_at: "1736476621070",
        updated_at: "1738359672880",
        ubication: "Maloapan, Martinez de la Torre, Veracruz.",
        cover_image_id: "90",
        number_of_bathrooms: "1",
        number_of_rooms: "3",
        total_area: 90,
        built_area: 2990,
        ubication_image_id: null,
        latitude: null,
        longitude: null
      },
      {
        id: 11,
        title: "Casa",
        description:
          "¡VENTA!\r\n🏡Excelente inmueble ubicado en la colonia Ruiz Cortinez (atrás de Chedraui)🏡\r\nCuenta con: \r\n-Sala\r\n-Comedor/Cocina\r\n-2 recamaras\r\n-1 ½ Baño\r\n-Patio de servicio\r\n-Cochera\r\nSuperficie 77m², construcción 72m²\r\nSe acepta pago en efectivo, créditos hipotecarios, bancarios, INFONAVIT y FOVISSSTE.\r\n¡Tramita tu crédito con nosotros!\r\nMayor información:\r\n2321595276",
        price: "300000000000",
        created_at: "1736476886123",
        updated_at: "1738359619150",
        ubication:
          "Colonia Ruiz Cortinez (atrás de Chedraui), Martinez de la Torre, Veracruz.",
        cover_image_id: "77",
        number_of_bathrooms: "0",
        number_of_rooms: "0",
        total_area: 0,
        built_area: 0,
        ubication_image_id: null,
        latitude: null,
        longitude: null
      },
      {
        id: 12,
        title: "Casa-Habitación",
        description:
          "BECRU pone a su disposición:\r\nCasa-Habitación ubicada en la colonia Pedernales. calle el diamante.\r\nEl inmueble cuenta con:\r\n•Sala-comedor\r\n•Cocina\r\n• Recamara \r\n• Servicios públicos\r\nSe acepta crédito Infonavit y pago en efectivo. Documentos en regla para su venta\r\nPara mayor información y agendar cita:\r\nMari Cruz\r\n2321595276\r\n",
        price: "400000000",
        created_at: "1736477366573",
        updated_at: "1738359559058",
        ubication:
          "Colonia Pedernales, calle el diamante, Martinez de la Torre, Veracruz.",
        cover_image_id: "76",
        number_of_bathrooms: "0",
        number_of_rooms: "0",
        total_area: 0,
        built_area: 0,
        ubication_image_id: null,
        latitude: null,
        longitude: null
      },
      {
        id: 13,
        title: "Casa Infonavit",
        description:
          "Casa ubicada en la colonia Infonavit. calle Galeana.\r\nEl inmueble cuenta con:\r\n• Sala\r\n• Comedor\r\n• Cocina\r\n• 4 Recamaras\r\n• 2 baños\r\n• Estudio\r\n• Patio de servicio\r\n• Cochera \r\nSe acepta crédito Infonavit, fovissste y pago en efectivo. Documentos en regla para su venta\r\nPara mayor información y agendar cita:\r\nMari Cruz\r\n2321595276",
        price: "50000000000000000",
        created_at: "1736477752858",
        updated_at: "1738359501162",
        ubication: "Colonia Infonavit, Martinez de la Torre, Veracruz.",
        cover_image_id: "75",
        number_of_bathrooms: "0",
        number_of_rooms: "0",
        total_area: 0,
        built_area: 0,
        ubication_image_id: null,
        latitude: null,
        longitude: null
      },
      {
        id: 18,
        title: "Espacios y Confort en Ejidal: Casa para Toda la Familia",
        description:
          "BECRU te presenta una gran oportunidad en la colonia Ejidal, con una ubicación privilegiada en Ruiz Cortinez 410, Ejidal, 93606 Martínez de la Torre, Ver.  \r\n\r\nEsta propiedad ofrece comodidad, amplitud y la posibilidad de convertirla en tu hogar ideal. Cuenta con:  \r\n- Sala-comedor  \r\n- Cocina  \r\n- 2 baños  \r\n- 2 recámaras  \r\n- 1 alcoba  \r\n- Patio de servicio  \r\n- Cochera  \r\n\r\nAceptamos crédito FOVISSSTE, efectivo y te asesoramos en el trámite de tu crédito hipotecario, para que la compra de tu casa sea sencilla y segura.\r\n\r\nPara más información:  \r\nMary Cruz – 232 159 5276  \r\nO visítanos en nuestras oficinas en la colonia Santana Maloapan, calle Jorge Todd.\r\n\r\n¡Haz realidad el sueño de tener tu propia casa! No dejes pasar esta oportunidad.",
        price: "20000000000",
        created_at: "1737953501811",
        updated_at: "1738388760294",
        ubication: "Ruiz Cortinez 410, Ejidal, 93606 Martínez de la Torre, Ver.",
        cover_image_id: "110",
        number_of_bathrooms: "2",
        number_of_rooms: "3",
        total_area: 100,
        built_area: 200,
        ubication_image_id: null,
        latitude: 20.0732259,
        longitude: -97.0385969
      }
    ]);
  };
  