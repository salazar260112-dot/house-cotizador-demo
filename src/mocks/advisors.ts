export const advisors = [
  {
    id: 'adv-001',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@cotizacioneshouse.com',
    password: 'house2026',
    branch: 'Culiacán',
    role: 'Asesor Senior',
    userRole: 'advisor',
  },
  {
    id: 'adv-002',
    name: 'María Fernanda López',
    email: 'maria.lopez@cotizacioneshouse.com',
    password: 'house2026',
    branch: 'Hermosillo',
    role: 'Asesor',
    userRole: 'advisor',
  },
  {
    id: 'adv-003',
    name: 'Roberto Gutiérrez',
    email: 'roberto.gutierrez@cotizacioneshouse.com',
    password: 'house2026',
    branch: 'Los Cabos',
    role: 'Asesor Senior',
    userRole: 'advisor',
  },
  {
    id: 'adv-004',
    name: 'Ana Patricia Silva',
    email: 'ana.silva@cotizacioneshouse.com',
    password: 'house2026',
    branch: 'Culiacán',
    role: 'Asesor',
    userRole: 'advisor',
  },
  {
    id: 'adv-005',
    name: 'Jorge Eduardo Núñez',
    email: 'jorge.nunez@cotizacioneshouse.com',
    password: 'house2026',
    branch: 'Hermosillo',
    role: 'Asesor Junior',
    userRole: 'advisor',
  },
  {
    id: 'sup-001',
    name: 'Enrique Salazar',
    email: 'house@gmail.com',
    password: '12345',
    branch: 'Corporativo',
    role: 'Supervisor',
    userRole: 'supervisor',
  },
];

export const branches = [
  'Culiacán',
  'Hermosillo',
  'Los Cabos',
  'Proyectos Directos',
];

export const quotationOrigins = [
  'Culiacán',
  'Hermosillo',
  'Los Cabos',
  'Proyectos Directos',
];

export const advisorsByBranch: Record<string, { id: string; name: string }[]> = {
  'Culiacán': [
    { id: 'adv-001', name: 'Carlos Mendoza' },
    { id: 'adv-004', name: 'Ana Patricia Silva' },
  ],
  'Hermosillo': [
    { id: 'adv-002', name: 'María Fernanda López' },
    { id: 'adv-005', name: 'Jorge Eduardo Núñez' },
  ],
  'Los Cabos': [
    { id: 'adv-003', name: 'Roberto Gutiérrez' },
  ],
  'Proyectos Directos': [],
};

export const leadSources = [
  'Piso de venta',
  'Llamada telefónica',
  'WhatsApp',
  'Redes sociales',
  'Recomendación',
  'Google',
  'Visita a sucursal',
  'Ferias y eventos',
];