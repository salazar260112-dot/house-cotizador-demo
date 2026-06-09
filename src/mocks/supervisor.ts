export interface SupervisorQuotation {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  city: string;
  origin: string;
  branch: string;
  advisorId: string;
  advisorName: string;
  productsCount: number;
  currency: string;
  subtotal: number;
  status: string;
}

export const supervisorQuotations: SupervisorQuotation[] = [
  {
    id: 'COT-2026-001', date: '2026-04-03', clientName: 'Laura Hernández', clientPhone: '667 234 5678', clientEmail: 'laura.h@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 4, currency: 'MXN', subtotal: 45999, status: 'Aprobada',
  },
  {
    id: 'COT-2026-002', date: '2026-04-05', clientName: 'Miguel Ángel Ruiz', clientPhone: '667 345 6789', clientEmail: 'miguel.r@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-004', advisorName: 'Ana Patricia Silva',
    productsCount: 2, currency: 'MXN', subtotal: 23900, status: 'Enviada',
  },
  {
    id: 'COT-2026-003', date: '2026-04-08', clientName: 'Sofía Martínez', clientPhone: '662 456 7890', clientEmail: 'sofia.m@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-002', advisorName: 'María Fernanda López',
    productsCount: 3, currency: 'MXN', subtotal: 89900, status: 'Aprobada',
  },
  {
    id: 'COT-2026-004', date: '2026-04-10', clientName: 'Ricardo Torres', clientPhone: '662 567 8901', clientEmail: 'ricardo.t@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-005', advisorName: 'Jorge Eduardo Núñez',
    productsCount: 5, currency: 'MXN', subtotal: 156800, status: 'Pendiente',
  },
  {
    id: 'COT-2026-005', date: '2026-04-12', clientName: 'Gabriela Flores', clientPhone: '624 678 9012', clientEmail: 'gabriela.f@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 1, currency: 'USD', subtotal: 1899, status: 'Vencida',
  },
  {
    id: 'COT-2026-006', date: '2026-04-15', clientName: 'Andrés Palacios', clientPhone: '667 789 0123', clientEmail: 'andres.p@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 3, currency: 'MXN', subtotal: 67800, status: 'Aprobada',
  },
  {
    id: 'COT-2026-007', date: '2026-04-18', clientName: 'Fernanda Castillo', clientPhone: '662 890 1234', clientEmail: 'fernanda.c@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-002', advisorName: 'María Fernanda López',
    productsCount: 2, currency: 'MXN', subtotal: 34500, status: 'Enviada',
  },
  {
    id: 'COT-2026-008', date: '2026-04-20', clientName: 'Proyecto Residencial Altamar', clientPhone: '667 901 2345', clientEmail: 'proyectos@altamar.com',
    city: 'Culiacán', origin: 'Proyectos Directos', branch: 'Proyectos Directos', advisorId: 'proj-001', advisorName: 'Eduardo Ramos',
    productsCount: 8, currency: 'MXN', subtotal: 345600, status: 'Aprobada',
  },
  {
    id: 'COT-2026-009', date: '2026-04-22', clientName: 'Diana Vega', clientPhone: '624 012 3456', clientEmail: 'diana.v@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 2, currency: 'MXN', subtotal: 45999, status: 'Enviada',
  },
  {
    id: 'COT-2026-010', date: '2026-04-25', clientName: 'Héctor Medina', clientPhone: '667 123 4567', clientEmail: 'hector.m@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-004', advisorName: 'Ana Patricia Silva',
    productsCount: 1, currency: 'MXN', subtotal: 13999, status: 'Vencida',
  },
  {
    id: 'COT-2026-011', date: '2026-05-02', clientName: 'Karina Olvera', clientPhone: '662 234 5678', clientEmail: 'karina.o@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-002', advisorName: 'María Fernanda López',
    productsCount: 4, currency: 'MXN', subtotal: 112400, status: 'Aprobada',
  },
  {
    id: 'COT-2026-012', date: '2026-05-05', clientName: 'Luis Roberto Díaz', clientPhone: '667 345 6789', clientEmail: 'luis.d@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 3, currency: 'MXN', subtotal: 78900, status: 'Enviada',
  },
  {
    id: 'COT-2026-013', date: '2026-05-08', clientName: 'Proyecto Plaza Comercial Norte', clientPhone: '662 456 7890', clientEmail: 'info@plazanorte.com',
    city: 'Hermosillo', origin: 'Proyectos Directos', branch: 'Proyectos Directos', advisorId: 'proj-001', advisorName: 'Eduardo Ramos',
    productsCount: 12, currency: 'MXN', subtotal: 567800, status: 'Enviada',
  },
  {
    id: 'COT-2026-014', date: '2026-05-10', clientName: 'Valeria Sánchez', clientPhone: '624 567 8901', clientEmail: 'valeria.s@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 5, currency: 'MXN', subtotal: 134500, status: 'Aprobada',
  },
  {
    id: 'COT-2026-015', date: '2026-05-12', clientName: 'Oscar Núñez', clientPhone: '662 678 9012', clientEmail: 'oscar.n@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-005', advisorName: 'Jorge Eduardo Núñez',
    productsCount: 2, currency: 'MXN', subtotal: 28999, status: 'Pendiente',
  },
  {
    id: 'COT-2026-016', date: '2026-05-15', clientName: 'Rosa Isela Chávez', clientPhone: '667 789 0123', clientEmail: 'rosa.c@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-004', advisorName: 'Ana Patricia Silva',
    productsCount: 3, currency: 'MXN', subtotal: 67800, status: 'Enviada',
  },
  {
    id: 'COT-2026-017', date: '2026-05-18', clientName: 'Alberto Carmona', clientPhone: '624 890 1234', clientEmail: 'alberto.c@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 1, currency: 'USD', subtotal: 1699, status: 'Aprobada',
  },
  {
    id: 'COT-2026-018', date: '2026-05-20', clientName: 'Mónica Paredes', clientPhone: '667 901 2345', clientEmail: 'monica.p@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 4, currency: 'MXN', subtotal: 98500, status: 'Enviada',
  },
  {
    id: 'COT-2026-019', date: '2026-05-22', clientName: 'Proyecto Hotel Boutique Costa', clientPhone: '624 012 3456', clientEmail: 'reservas@hotelcosta.com',
    city: 'Los Cabos', origin: 'Proyectos Directos', branch: 'Proyectos Directos', advisorId: 'proj-002', advisorName: 'Mariana Torres',
    productsCount: 15, currency: 'MXN', subtotal: 789200, status: 'Aprobada',
  },
  {
    id: 'COT-2026-020', date: '2026-05-25', clientName: 'Javier Olmos', clientPhone: '662 123 4567', clientEmail: 'javier.o@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-002', advisorName: 'María Fernanda López',
    productsCount: 2, currency: 'MXN', subtotal: 41999, status: 'Pendiente',
  },
  {
    id: 'COT-2026-021', date: '2026-06-02', clientName: 'Paola Rentería', clientPhone: '667 234 5678', clientEmail: 'paola.r@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 3, currency: 'MXN', subtotal: 56800, status: 'Aprobada',
  },
  {
    id: 'COT-2026-022', date: '2026-06-03', clientName: 'Eduardo Fierro', clientPhone: '662 345 6789', clientEmail: 'eduardo.f@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-005', advisorName: 'Jorge Eduardo Núñez',
    productsCount: 1, currency: 'MXN', subtotal: 9999, status: 'Vencida',
  },
  {
    id: 'COT-2026-023', date: '2026-06-04', clientName: 'Adriana Noriega', clientPhone: '624 456 7890', clientEmail: 'adriana.n@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 6, currency: 'MXN', subtotal: 189400, status: 'Enviada',
  },
  {
    id: 'COT-2026-024', date: '2026-06-05', clientName: 'Fernando Alvarado', clientPhone: '667 567 8901', clientEmail: 'fernando.a@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-004', advisorName: 'Ana Patricia Silva',
    productsCount: 2, currency: 'MXN', subtotal: 31999, status: 'Pendiente',
  },
  {
    id: 'COT-2026-025', date: '2026-06-06', clientName: 'Proyecto Departamento Premier', clientPhone: '667 678 9012', clientEmail: 'ventas@premier.com',
    city: 'Culiacán', origin: 'Proyectos Directos', branch: 'Proyectos Directos', advisorId: 'proj-001', advisorName: 'Eduardo Ramos',
    productsCount: 6, currency: 'MXN', subtotal: 234500, status: 'Enviada',
  },
  {
    id: 'COT-2026-026', date: '2026-06-07', clientName: 'Claudia Serrano', clientPhone: '662 789 0123', clientEmail: 'claudia.s@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-002', advisorName: 'María Fernanda López',
    productsCount: 3, currency: 'MXN', subtotal: 87900, status: 'Aprobada',
  },
  {
    id: 'COT-2026-027', date: '2026-06-07', clientName: 'Rafael Molina', clientPhone: '624 890 1234', clientEmail: 'rafael.m@gmail.com',
    city: 'Los Cabos', origin: 'Los Cabos', branch: 'Los Cabos', advisorId: 'adv-003', advisorName: 'Roberto Gutiérrez',
    productsCount: 4, currency: 'USD', subtotal: 4496, status: 'Enviada',
  },
  {
    id: 'COT-2026-028', date: '2026-06-07', clientName: 'Teresa Godínez', clientPhone: '667 901 2345', clientEmail: 'teresa.g@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-001', advisorName: 'Carlos Mendoza',
    productsCount: 1, currency: 'MXN', subtotal: 20999, status: 'Pendiente',
  },
  {
    id: 'COT-2026-029', date: '2026-06-07', clientName: 'Gustavo Leyva', clientPhone: '662 012 3456', clientEmail: 'gustavo.l@gmail.com',
    city: 'Hermosillo', origin: 'Hermosillo', branch: 'Hermosillo', advisorId: 'adv-005', advisorName: 'Jorge Eduardo Núñez',
    productsCount: 2, currency: 'MXN', subtotal: 33998, status: 'Enviada',
  },
  {
    id: 'COT-2026-030', date: '2026-06-08', clientName: 'Lucía Zavala', clientPhone: '667 123 4567', clientEmail: 'lucia.z@gmail.com',
    city: 'Culiacán', origin: 'Culiacán', branch: 'Culiacán', advisorId: 'adv-004', advisorName: 'Ana Patricia Silva',
    productsCount: 2, currency: 'MXN', subtotal: 25999, status: 'Aprobada',
  },
];

export const allStatuses = ['Aprobada', 'Enviada', 'Pendiente', 'Vencida'];