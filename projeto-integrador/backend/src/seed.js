const { getDb, initDatabase } = require('./database');

const fornecedoresSeed = [
  {
    nomeEmpresa: 'Distribuidora Alfa LTDA',
    cnpj: '11.111.111/0001-01',
    endereco: 'Rua das Flores, 100 - São Paulo/SP',
    telefone: '(11) 3100-1001',
    email: 'contato@alfa.com',
    contatoPrincipal: 'Mariana Souza',
    produtos: [
      { nome: 'Café Torrado 500g', codigoBarras: '7891000000011', descricao: 'Café torrado e moído premium', quantidadeEstoque: 120, categoria: 'Alimentos' },
      { nome: 'Açúcar Refinado 1kg', codigoBarras: '7891000000012', descricao: 'Açúcar refinado pacote 1kg', quantidadeEstoque: 200, categoria: 'Alimentos' },
      { nome: 'Leite em Pó 400g', codigoBarras: '7891000000013', descricao: 'Leite em pó integral 400g', quantidadeEstoque: 90, categoria: 'Alimentos' },
    ],
  },
  {
    nomeEmpresa: 'Comercial Beta S.A.',
    cnpj: '22.222.222/0001-02',
    endereco: 'Av. Central, 245 - Campinas/SP',
    telefone: '(19) 3200-2002',
    email: 'vendas@beta.com',
    contatoPrincipal: 'Carlos Menezes',
    produtos: [
      { nome: 'Sabão em Pó 1kg', codigoBarras: '7891000000021', descricao: 'Sabão em pó limpeza profunda', quantidadeEstoque: 85, categoria: 'Limpeza' },
      { nome: 'Detergente Líquido 500ml', codigoBarras: '7891000000022', descricao: 'Detergente neutro para louças', quantidadeEstoque: 150, categoria: 'Limpeza' },
      { nome: 'Desinfetante 1L', codigoBarras: '7891000000023', descricao: 'Desinfetante floral 1 litro', quantidadeEstoque: 110, categoria: 'Limpeza' },
    ],
  },
  {
    nomeEmpresa: 'Atacado Gama ME',
    cnpj: '33.333.333/0001-03',
    endereco: 'Rua do Comércio, 88 - Belo Horizonte/MG',
    telefone: '(31) 3300-3003',
    email: 'suporte@gama.com',
    contatoPrincipal: 'Renata Oliveira',
    produtos: [
      { nome: 'Shampoo 350ml', codigoBarras: '7891000000031', descricao: 'Shampoo hidratação diária', quantidadeEstoque: 140, categoria: 'Higiene' },
      { nome: 'Condicionador 350ml', codigoBarras: '7891000000032', descricao: 'Condicionador nutrição intensa', quantidadeEstoque: 95, categoria: 'Higiene' },
      { nome: 'Sabonete 90g', codigoBarras: '7891000000033', descricao: 'Sabonete vegetal 90g', quantidadeEstoque: 260, categoria: 'Higiene' },
    ],
  },
  {
    nomeEmpresa: 'Fornecedor Delta EIRELI',
    cnpj: '44.444.444/0001-04',
    endereco: 'Av. Brasil, 510 - Rio de Janeiro/RJ',
    telefone: '(21) 3400-4004',
    email: 'compras@delta.com',
    contatoPrincipal: 'Fernando Lima',
    produtos: [
      { nome: 'Caneta Esferográfica Azul', codigoBarras: '7891000000041', descricao: 'Caneta ponta média azul', quantidadeEstoque: 400, categoria: 'Papelaria' },
      { nome: 'Caderno Universitário', codigoBarras: '7891000000042', descricao: 'Caderno 200 folhas capa dura', quantidadeEstoque: 130, categoria: 'Papelaria' },
      { nome: 'Marcador Permanente', codigoBarras: '7891000000043', descricao: 'Marcador permanente preto', quantidadeEstoque: 180, categoria: 'Papelaria' },
    ],
  },
  {
    nomeEmpresa: 'Suprimentos Ômega LTDA',
    cnpj: '55.555.555/0001-05',
    endereco: 'Rua das Indústrias, 1500 - Curitiba/PR',
    telefone: '(41) 3500-5005',
    email: 'atendimento@omega.com',
    contatoPrincipal: 'Patrícia Nunes',
    produtos: [
      { nome: 'Lâmpada LED 9W', codigoBarras: '7891000000051', descricao: 'Lâmpada LED branca fria 9W', quantidadeEstoque: 75, categoria: 'Elétricos' },
      { nome: 'Extensão Elétrica 5m', codigoBarras: '7891000000052', descricao: 'Extensão elétrica bivolt 5 metros', quantidadeEstoque: 60, categoria: 'Elétricos' },
      { nome: 'Tomada Dupla 10A', codigoBarras: '7891000000053', descricao: 'Tomada dupla padrão brasileiro', quantidadeEstoque: 115, categoria: 'Elétricos' },
    ],
  },
];

async function seedDatabase() {
  await initDatabase();
  const db = await getDb();

  await db.exec('BEGIN TRANSACTION');

  try {
    await db.run('DELETE FROM produto_fornecedor');
    await db.run('DELETE FROM produtos');
    await db.run('DELETE FROM fornecedores');

    for (const fornecedor of fornecedoresSeed) {
      const fornecedorResult = await db.run(
        `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        fornecedor.nomeEmpresa,
        fornecedor.cnpj,
        fornecedor.endereco,
        fornecedor.telefone,
        fornecedor.email,
        fornecedor.contatoPrincipal
      );

      for (const produto of fornecedor.produtos) {
        const produtoResult = await db.run(
          `INSERT INTO produtos (nome, codigo_barras, descricao, quantidade_estoque, categoria)
           VALUES (?, ?, ?, ?, ?)`,
          produto.nome,
          produto.codigoBarras,
          produto.descricao,
          produto.quantidadeEstoque,
          produto.categoria
        );

        await db.run(
          'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)',
          produtoResult.lastID,
          fornecedorResult.lastID
        );
      }
    }

    await db.exec('COMMIT');

    return {
      fornecedores: fornecedoresSeed.length,
      produtos: fornecedoresSeed.length * 3,
      associacoes: fornecedoresSeed.length * 3,
    };
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

async function runSeed() {
  const result = await seedDatabase();
  console.log(`Seed concluído: ${result.fornecedores} fornecedores, ${result.produtos} produtos, ${result.associacoes} associações.`);
}

if (require.main === module) {
  runSeed();
}

module.exports = {
  seedDatabase,
  fornecedoresSeed,
};
