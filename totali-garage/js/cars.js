/* Acervo da Totali Garage. Cada carro pode ter fotos reais (campo `fotos`);
   sem isso, cai na vitrine gerada em SVG (ver photo-art.js). */

const CARS = [
  {
    id: "bmw-320i-m-sport-2025",
    marca: "BMW",
    modelo: "320i",
    versao: "2.0 16V Turbo M Sport",
    ano: 2025,
    categoria: "Sedã",
    cor: "Branco",
    corHex: "#eef0ee",
    km: 5000,
    cambio: "Automático",
    combustivel: "Gasolina",
    portas: 4,
    preco: 277855,
    fipe: 297057,
    destaque: true,
    fotos: [
      "assets/carros/bmw-320i-m-sport-2025/1-frontal.jpg",
      "assets/carros/bmw-320i-m-sport-2025/2-traseira.jpg",
    ],
    fotoLabels: ["Frontal", "Traseira"],
    descricao:
      "Sedã esportivo com o pacote M Sport de série, motor 2.0 turbo e praticamente zero km. Presença marcante e a dinâmica de condução que só a BMW entrega.",
    diferenciais: ["Pacote M Sport", "Rodas exclusivas", "Baixa quilometragem"],
  },
  {
    id: "toyota-sw4-diamond-2026",
    marca: "Toyota",
    modelo: "SW4",
    versao: "Diamond 7 Lugares",
    ano: 2026,
    categoria: "SUV",
    cor: "Branco",
    corHex: "#eef0ee",
    km: 12000,
    cambio: "Automático",
    combustivel: "Diesel",
    portas: 5,
    preco: 389990,
    fipe: 419990,
    destaque: true,
    fotos: [
      "assets/carros/toyota-sw4-diamond-2026/1-frontal.jpg",
      "assets/carros/toyota-sw4-diamond-2026/2-traseira.jpg",
    ],
    fotoLabels: ["Frontal", "Traseira"],
    descricao:
      "O SUV mais completo da linha Toyota, na versão topo de linha Diamond com 7 lugares. Praticamente zero km, com acabamento premium e bancos em couro em toda a cabine.",
    diferenciais: ["7 lugares", "Bancos em couro", "Acabamento premium"],
  },
];

const CATEGORIAS = ["Todos", ...Array.from(new Set(CARS.map((c) => c.categoria)))];
