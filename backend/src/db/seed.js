const crypto = require('node:crypto');
const { hashPassword } = require('../utils/password');

/** Senha de todos os usuários de demonstração. */
const DEMO_PASSWORD = '123456';

const TEACHERS = [
  { name: 'Marina Souza', email: 'professor@escola.com', subject: 'Matemática' },
  { name: 'Carlos Lima', email: 'carlos.lima@escola.com', subject: 'História' },
  { name: 'Juliana Alves', email: 'juliana.alves@escola.com', subject: 'Língua Portuguesa' },
  { name: 'Ricardo Mendes', email: 'ricardo.mendes@escola.com', subject: 'Ciências' },
  { name: 'Fernanda Rocha', email: 'fernanda.rocha@escola.com', subject: 'Geografia' },
  { name: 'Paulo Henrique', email: 'paulo.henrique@escola.com', subject: 'Educação Física' },
  { name: 'Beatriz Santos', email: 'beatriz.santos@escola.com', subject: 'Inglês' },
];

const STUDENTS = [
  { name: 'Lucas Oliveira', email: 'aluno@escola.com', registration: 'RA2026001' },
  { name: 'Gabriela Costa', email: 'gabriela.costa@escola.com', registration: 'RA2026002' },
  { name: 'Pedro Martins', email: 'pedro.martins@escola.com', registration: 'RA2026003' },
  { name: 'Isabela Ferreira', email: 'isabela.ferreira@escola.com', registration: 'RA2026004' },
  { name: 'Matheus Ribeiro', email: 'matheus.ribeiro@escola.com', registration: 'RA2026005' },
  { name: 'Larissa Gomes', email: 'larissa.gomes@escola.com', registration: 'RA2026006' },
  { name: 'Rafael Carvalho', email: 'rafael.carvalho@escola.com', registration: 'RA2026007' },
  { name: 'Camila Barbosa', email: 'camila.barbosa@escola.com', registration: 'RA2026008' },
  { name: 'Thiago Araújo', email: 'thiago.araujo@escola.com', registration: 'RA2026009' },
  { name: 'Mariana Pinto', email: 'mariana.pinto@escola.com', registration: 'RA2026010' },
  { name: 'Bruno Teixeira', email: 'bruno.teixeira@escola.com', registration: 'RA2026011' },
  { name: 'Letícia Moreira', email: 'leticia.moreira@escola.com', registration: 'RA2026012' },
];

const POSTS = [
  {
    authorEmail: 'professor@escola.com',
    title: 'Frações no dia a dia: da pizza à receita de bolo',
    content:
      'Frações aparecem o tempo todo na nossa rotina. Quando dividimos uma pizza em 8 pedaços e comemos 3, consumimos 3/8 dela. Na cozinha, uma receita que pede 3/4 de xícara de açúcar exige que saibamos comparar e somar frações.\n\nNesta semana vamos praticar: frações equivalentes (1/2 = 2/4 = 4/8), comparação de frações com denominadores diferentes e soma de frações usando o mínimo múltiplo comum.\n\nDesafio: escolha uma receita da sua casa e reescreva as quantidades para fazer metade da receita. Traga para a próxima aula!',
  },
  {
    authorEmail: 'carlos.lima@escola.com',
    title: 'Independência do Brasil: muito além do grito do Ipiranga',
    content:
      'O 7 de setembro de 1822 costuma ser lembrado pela cena do "Independência ou Morte!", mas o processo de independência foi longo e envolveu conflitos em várias províncias, como Bahia, Maranhão e Pará.\n\nA independência da Bahia, por exemplo, só foi consolidada em 2 de julho de 1823, após meses de batalhas. Também é importante discutir quem participou desse processo e quem ficou de fora das decisões políticas.\n\nPara a próxima aula, leiam o capítulo 5 do livro e anotem três personagens que participaram das lutas pela independência fora do Rio de Janeiro e de São Paulo.',
  },
  {
    authorEmail: 'juliana.alves@escola.com',
    title: 'Dicas para escrever uma boa redação dissertativa',
    content:
      'Uma redação dissertativa-argumentativa bem estruturada tem introdução, desenvolvimento e conclusão. Na introdução, apresente o tema e deixe clara a sua tese. No desenvolvimento, use pelo menos dois argumentos, cada um em um parágrafo, com exemplos, dados ou citações.\n\nNa conclusão, retome a tese e apresente uma proposta de intervenção: quem vai agir, o que vai fazer, como, por qual meio e com qual finalidade.\n\nEvitem frases muito longas, revisem a concordância e leiam o texto em voz alta antes de entregar. Isso ajuda a perceber repetições e trechos confusos.',
  },
  {
    authorEmail: 'ricardo.mendes@escola.com',
    title: 'Ciclo da água: experimento para fazer em casa',
    content:
      'Vamos observar o ciclo da água em miniatura! Você vai precisar de um pote de vidro com tampa, um pouco de água morna, cubos de gelo e um prato pequeno.\n\nColoque a água morna no pote, tampe e coloque o prato com gelo sobre a tampa. Em alguns minutos, você verá gotículas se formando na parte de dentro da tampa: é a condensação. Quando as gotas ficam pesadas, elas "chovem" de volta para o fundo do pote, representando a precipitação.\n\nRegistre o experimento com fotos ou desenhos e explique cada etapa: evaporação, condensação e precipitação.',
  },
  {
    authorEmail: 'fernanda.rocha@escola.com',
    title: 'Biomas brasileiros: conhecendo o Cerrado',
    content:
      'O Cerrado é o segundo maior bioma do Brasil e é conhecido como a "caixa d\'água" do país, porque abriga nascentes de importantes bacias hidrográficas, como as dos rios São Francisco, Tocantins-Araguaia e Paraná.\n\nSua vegetação tem árvores de troncos retorcidos e cascas grossas, adaptadas às queimadas naturais e ao período de seca. Infelizmente, o bioma já perdeu cerca de metade da sua cobertura original.\n\nAtividade: pesquise um animal típico do Cerrado e apresente suas principais características e ameaças.',
  },
  {
    authorEmail: 'paulo.henrique@escola.com',
    title: 'Gincana esportiva da escola: inscrições abertas',
    content:
      'A gincana esportiva deste semestre acontecerá na última semana do mês, com provas de corrida de revezamento, cabo de guerra, queimada e circuito de habilidades.\n\nAs equipes devem ter de 6 a 10 integrantes, misturando alunos de turmas diferentes. As inscrições podem ser feitas com o professor de Educação Física até sexta-feira.\n\nLembrem-se: o mais importante é o respeito, o trabalho em equipe e a diversão. Usem roupas leves, tênis e não esqueçam a garrafinha de água!',
  },
  {
    authorEmail: 'beatriz.santos@escola.com',
    title: 'Five tips to practice English every day',
    content:
      'Learning a new language is all about consistency. Here are five simple ideas to practice English every day:\n\n1. Change your phone language to English.\n2. Listen to a podcast or song and try to write down the lyrics you understand.\n3. Watch series with English subtitles.\n4. Keep a small diary with three sentences about your day.\n5. Learn five new words every day and use them in sentences.\n\nNext class, share which tip you tried and how it went!',
  },
  {
    authorEmail: 'professor@escola.com',
    title: 'Revisão para a prova de equações do 1º grau',
    content:
      'A prova de equações do 1º grau será na próxima quinta-feira. Revise os seguintes tópicos: isolamento da incógnita, operações inversas, equações com parênteses e problemas que podem ser traduzidos em equações.\n\nExemplo: "O dobro de um número somado a 5 é igual a 17. Qual é o número?" Montamos 2x + 5 = 17, então 2x = 12 e x = 6.\n\nResolvam a lista de exercícios da página 84 e tragam as dúvidas para o plantão de quarta-feira.',
  },
];

const COMMENTS = [
  { postIndex: 0, authorEmail: 'aluno@escola.com', content: 'Vou fazer a receita de bolo de cenoura da minha avó pela metade!' },
  { postIndex: 0, authorEmail: 'gabriela.costa@escola.com', content: 'Professora, 2/3 é maior que 3/5?' },
  { postIndex: 3, authorEmail: 'pedro.martins@escola.com', content: 'Fiz o experimento e funcionou muito bem, deu para ver as gotinhas.' },
  { postIndex: 7, authorEmail: 'aluno@escola.com', content: 'Vai cair problema com frações dentro da equação?' },
];

/** Gera o estado inicial do banco com usuários, posts e comentários de exemplo. */
async function seed() {
  const baseTime = Date.now();
  const users = [];

  const people = [
    ...TEACHERS.map((teacher) => ({ ...teacher, role: 'teacher' })),
    ...STUDENTS.map((student) => ({ ...student, role: 'student' })),
  ];

  for (const [index, person] of people.entries()) {
    const createdAt = new Date(baseTime - (people.length - index) * 60_000).toISOString();
    users.push({
      id: crypto.randomUUID(),
      ...person,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      createdAt,
      updatedAt: createdAt,
    });
  }

  const byEmail = (email) => users.find((user) => user.email === email);

  const posts = POSTS.map((post, index) => {
    const author = byEmail(post.authorEmail);
    // Posts mais antigos primeiro: cada post foi publicado um dia depois do anterior
    const createdAt = new Date(baseTime - (POSTS.length - index) * 86_400_000).toISOString();
    return {
      id: crypto.randomUUID(),
      title: post.title,
      content: post.content,
      author: author.name,
      authorId: author.id,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const comments = COMMENTS.map((comment, index) => {
    const author = byEmail(comment.authorEmail);
    const post = posts[comment.postIndex];
    const createdAt = new Date(new Date(post.createdAt).getTime() + (index + 1) * 3_600_000).toISOString();
    return {
      id: crypto.randomUUID(),
      postId: post.id,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content: comment.content,
      createdAt,
    };
  });

  return { users, posts, comments };
}

module.exports = { seed, DEMO_PASSWORD };
