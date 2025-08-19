# Black Bull Burgers - Food Delivery App

Uma aplicação web full-stack moderna para delivery de hambúrgueres com recursos avançados de geolocalização e tempo real.

## 🚀 Características

### Para Clientes
- **Cardápio Digital** com 8 hambúrgueres especiais
- **Carrinho Inteligente** com persistência local
- **Checkout Avançado** com captura de geolocalização em tempo real
- **Múltiplas Formas de Pagamento** (Dinheiro, Cartão, PIX)
- **Acompanhamento em Tempo Real** do status do pedido
- **Interface Premium** com estilo "liquid glass"

### Para Administradores
- **Painel em Tempo Real** para gerenciar pedidos
- **Mapa Interativo** mostrando a localização exata do cliente
- **Sistema de Status** completo (Pendente → Aceito → Preparando → Entregando → Entregue)
- **Gestão de Pedidos** com interface tipo Kanban

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **Animações**: Framer Motion
- **Mapas**: Leaflet com OpenStreetMap
- **Formulários**: React Hook Form + Zod
- **Testes**: Vitest + Testing Library

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone [repository-url]
cd black-bull-burgers
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   
   Clique no botão "Connect to Supabase" no canto superior direito para configurar seu projeto Supabase.

4. **Execute as migrações**
   
   No painel do Supabase, vá em SQL Editor e execute os arquivos:
   - `supabase/migrations/create_initial_schema.sql`
   - `supabase/migrations/seed_products.sql`

5. **Configure o Storage**
   
   No Supabase Storage, crie um bucket público chamado `products` para as imagens dos produtos.

6. **Execute o projeto**
```bash
npm run dev
```

## 🗃️ Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuários com roles (customer/admin)
- **products**: Catálogo de produtos com preços atuais e originais
- **orders**: Pedidos com geolocalização e dados de entrega
- **order_items**: Itens de cada pedido

### Configuração de Roles

Para criar um administrador:

1. Registre-se normalmente na aplicação
2. No Supabase SQL Editor, execute:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_ID_AQUI';
```

## 🗺️ Recursos de Geolocalização

### Cliente
- No checkout, clique em "Usar Minha Localização Atual"
- Permita o acesso à localização quando solicitado
- A localização será salva no pedido para entrega precisa

### Administrador  
- Visualize a localização exata de cada cliente no mapa
- Calcule automaticamente a distância até o restaurante
- Marker pulsante para destaque visual

## 💳 Sistema de Pagamentos

### Opções Disponíveis
- **Dinheiro**: Com opção de troco
- **Cartão**: POS na entrega
- **PIX**: Demonstração (QR code fake para testes)

*Nota: Este é um sistema de demonstração. Para produção, integre com gateways reais.*

## 🔄 Tempo Real

### Funcionalidades Realtime
- Novos pedidos aparecem automaticamente no painel admin
- Clientes recebem notificações quando pedidos são aceitos
- Status de pedidos atualizados em tempo real
- Toast notifications para feedback imediato

## 🎨 Design System

### Tema "Liquid Glass"
- Fundo gradiente escuro com tons de roxo
- Cards com `bg-white/10` e `backdrop-blur-xl`
- Bordas sutis com `border-white/15`
- Sombras customizadas para profundidade
- Animações suaves com Framer Motion

### Cores Principais
- **Primária**: Azul #159ADD
- **Fundo**: Gradiente escuro slate-900 → purple-900
- **Texto**: Branco com opacidades variadas
- **Acentos**: Verde (sucesso), Vermelho (erro), Amarelo (pendente)

## 🧪 Testes

Execute os testes:
```bash
npm run test
```

Testes incluem:
- Lógica do carrinho de compras
- Componentes principais
- Utilitários e helpers

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Tablet (768px) e Desktop (1024px+)
- **Touch Friendly**: Botões e elementos com tamanho adequado
- **Gestos**: Swipe e tap otimizados

## 🚀 Deploy

Para fazer deploy:

1. **Build da aplicação**
```bash
npm run build
```

2. **Configure as variáveis de ambiente** no seu provedor:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy** para Vercel, Netlify ou similar

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas protegidas com RLS
- Políticas específicas por role
- Clientes só acessam seus próprios dados
- Admins têm acesso completo aos pedidos

### Validações
- Formulários validados com Zod
- Sanitização de dados de entrada
- Verificação de permissões em todas as rotas

## 📈 Performance

### Otimizações
- Lazy loading de componentes
- Imagens otimizadas com Next.js
- Bundle splitting automático
- Caching inteligente
- Skeleton loaders para UX suave

## 🎯 Próximos Passos

### Funcionalidades Futuras
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade
- [ ] Notificações push
- [ ] Integração com WhatsApp
- [ ] Relatórios de vendas
- [ ] Sistema de cupons
- [ ] Multi-tenant (múltiplas lanchonetes)

### Melhorias Técnicas
- [ ] PWA completo
- [ ] Offline support
- [ ] Web Workers para notificações
- [ ] GraphQL subscriptions
- [ ] Micro-frontend architecture

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 💡 Dicas de Desenvolvimento

### Desenvolvimento Local
- Use `npm run dev` para desenvolvimento
- Logs do Supabase no console do navegador
- DevTools do React/Next.js habilitados

### Debugging
- Realtime logs no Supabase Dashboard
- Network tab para requisições da API
- Redux DevTools para estado do carrinho

### Performance Monitoring
- Core Web Vitals no Lighthouse
- Bundle analyzer: `npm run analyze`
- Supabase Analytics no dashboard

---

Desenvolvido com ❤️ para a melhor experiência em delivery de hambúrgueres.