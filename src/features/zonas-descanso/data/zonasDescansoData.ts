export interface ZonaDescanso {
  ubicacion: string;
  maps: string;
}

export interface RutaZonas {
  ruta: string;
  zonas: ZonaDescanso[];
}

export const zonasDescansoData: RutaZonas[] = [
  {
    ruta: "Ruta 1",
    zonas: [
      {
        ubicacion: "Km 66.500, Estación ANCAP, San José",
        maps: "https://www.google.com/maps/search/?api=1&query=Km+66.5+Ruta+1,+San+José,+Uruguay"
      },
      {
        ubicacion: "Km 121, Empalme Ruta 52, Estación ANCAP, Colonia Valdense, Colonia",
        maps: "https://www.google.com/maps/search/?api=1&query=Km+121+Ruta+1,+Colonia+Valdense,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 2",
    zonas: [
      {
        ubicacion: "Empalme con Ruta 12, Balanza, Florencio Sánchez, Colonia",
        maps: "https://www.google.com/maps/search/?api=1&query=Florencio+Sánchez,+Colonia,+Uruguay"
      },
      {
        ubicacion: "Parador Treinta y Tres Orientales, José Enrique Rodó, Soriano",
        maps: "https://www.google.com/maps/search/?api=1&query=José+Enrique+Rodó,+Soriano,+Uruguay"
      },
      {
        ubicacion: "Empalme con Ruta 24, Parador La Víbora, Fray Bentos, Río Negro",
        maps: "https://www.google.com/maps/search/?api=1&query=Parador+La+Víbora,+Fray+Bentos,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 3",
    zonas: [
      {
        ubicacion: "Km 92, Empalme Ruta 11, Estación ANCAP, San José de Mayo",
        maps: "https://www.google.com/maps/search/?api=1&query=Km+92+Ruta+3,+San+José+de+Mayo,+Uruguay"
      },
      {
        ubicacion: "Km 93, Esq. 25 de Mayo, Estación ESSO, San José de Mayo",
        maps: "https://www.google.com/maps/search/?api=1&query=Km+93+Ruta+3,+San+José+de+Mayo,+Uruguay"
      },
      {
        ubicacion: "Km 193.500, Estación ANCAP, Trinidad, Flores",
        maps: "https://www.google.com/maps/search/?api=1&query=Trinidad,+Flores,+Uruguay"
      },
      {
        ubicacion: "Km 272.800, Parque Andresito, Soriano",
        maps: "https://www.google.com/maps/search/?api=1&query=Parque+Andresito,+Soriano,+Uruguay"
      },
      {
        ubicacion: "Km 383.500, La Constancia, Paysandú",
        maps: "https://www.google.com/maps/search/?api=1&query=La+Constancia,+Paysandú,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 5",
    zonas: [
      {
        ubicacion: "Empalme Ruta 56, Estación ANCAP, Florida",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+5+Empalme+Ruta+56,+Florida,+Uruguay"
      },
      {
        ubicacion: "Km 139.500, Estación ANCAP, Sarandí Grande, Florida",
        maps: "https://www.google.com/maps/search/?api=1&query=Sarandí+Grande,+Florida,+Uruguay"
      },
      {
        ubicacion: "Km 182, Empalme Ruta 14, Durazno",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+5+Km+182,+Durazno,+Uruguay"
      },
      {
        ubicacion: "Km 252, Esq. 25 de Agosto, Paso de los Toros, Tacuarembó",
        maps: "https://www.google.com/maps/search/?api=1&query=Paso+de+los+Toros,+Tacuarembó,+Uruguay"
      },
      {
        ubicacion: "Estación ANCAP, Tacuarembó",
        maps: "https://www.google.com/maps/search/?api=1&query=Tacuarembó,+Uruguay"
      },
      {
        ubicacion: "Km 426, Empalme Ruta 29, Tacuarembó",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+5+Km+426,+Tacuarembó,+Uruguay"
      },
      {
        ubicacion: "Km 458, Empalme Ruta 30, Rivera",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+5+Km+458,+Rivera,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 8",
    zonas: [
      {
        ubicacion: "Km 79, Estación ANCAP, Solís de Mataojo, Lavalleja",
        maps: "https://www.google.com/maps/search/?api=1&query=Solís+de+Mataojo,+Lavalleja,+Uruguay"
      },
      {
        ubicacion: "Km 183, Estación ANCAP, Mariscala, Lavalleja",
        maps: "https://www.google.com/maps/search/?api=1&query=Mariscala,+Lavalleja,+Uruguay"
      },
      {
        ubicacion: "Km 256, Estación Petrobras, José Pedro Varela, Lavalleja",
        maps: "https://www.google.com/maps/search/?api=1&query=José+Pedro+Varela,+Lavalleja,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 9",
    zonas: [
      {
        ubicacion: "Km 208, Estación ESSO, Rocha",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+9+Km+208,+Rocha,+Uruguay"
      },
      {
        ubicacion: "Km 208, Estación ANCAP, Rocha",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+9+Km+208,+Rocha,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 12",
    zonas: [
      {
        ubicacion: "Empalme Ruta 23, Estación ANCAP, Ismael Cortinas, San José",
        maps: "https://www.google.com/maps/search/?api=1&query=Ismael+Cortinas,+San+José,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 18",
    zonas: [
      {
        ubicacion: "Km 387, Estación ANCAP, Rincón, Treinta y Tres",
        maps: "https://www.google.com/maps/search/?api=1&query=Ruta+18+Km+387,+Treinta+y+Tres,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 22",
    zonas: [
      {
        ubicacion: "Entre calles 18 de Julio y Rosario, Tarariras, Colonia",
        maps: "https://www.google.com/maps/search/?api=1&query=Tarariras,+Colonia,+Uruguay"
      }
    ]
  },
  {
    ruta: "Ruta 26",
    zonas: [
      {
        ubicacion: "Km 349, Parador La Rueda, Las Toscas, Tacuarembó",
        maps: "https://www.google.com/maps/search/?api=1&query=Parador+La+Rueda,+Las+Toscas,+Tacuarembó,+Uruguay"
      }
    ]
  }
];