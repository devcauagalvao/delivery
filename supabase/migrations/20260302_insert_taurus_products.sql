/*
  # Insert Taurus Black Burger Products

  Insert the 8 premium burger products for Taurus Black Burger restaurant
  These products include descriptions, pricing, images and sort order
*/

-- First, ensure we have the Hamburgers category
INSERT INTO categories (name, active, sort_order)
VALUES ('Hamburgers', true, 1)
ON CONFLICT DO NOTHING;

-- Get the category id for linking products
WITH cat_id AS (
  SELECT id FROM categories WHERE name = 'Hamburgers' LIMIT 1
)

-- Insert the 8 burger products
INSERT INTO products (name, description, price_cents, image_url, active, sort_order)
VALUES
  (
    'Bacon Bull',
    'Hambúrguer artesanal com blend especial, queijo e bacon crocante.',
    2990,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/bacon-bull.png',
    true,
    1
  ),
  (
    'Big Black Taurus Bacon',
    'Pão brioche preto, hambúrguer duplo e muito bacon.',
    3990,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/big-black-taurus-bacon.png',
    true,
    2
  ),
  (
    'Big Black Taurus',
    'Versão premium no pão preto com blend especial.',
    3690,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/big-black-taurus.png',
    true,
    3
  ),
  (
    'Black Chimichurri',
    'Blend artesanal com molho chimichurri especial.',
    3290,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/black-chimichurri.png',
    true,
    4
  ),
  (
    'Black Onion Sweet',
    'Carne artesanal com cebola caramelizada.',
    3190,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/black-onion-sweet.png',
    true,
    5
  ),
  (
    'Chicken Burger',
    'Filé de frango crocante com molho especial.',
    2790,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/chicken.png',
    true,
    6
  ),
  (
    'Classic Bull',
    'Hambúrguer clássico com queijo, alface e tomate.',
    2590,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/classic-bull.png',
    true,
    7
  ),
  (
    'Salad Burguer',
    'Opção leve com salada fresca e molho especial.',
    2490,
    'https://ipoxnjvljstfakjevmix.supabase.co/storage/v1/object/public/products/salad-burguer.png',
    true,
    8
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

-- Now link all inserted products to the Hamburgers category
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE c.name = 'Hamburgers'
  AND p.name IN (
    'Bacon Bull',
    'Big Black Taurus Bacon',
    'Big Black Taurus',
    'Black Chimichurri',
    'Black Onion Sweet',
    'Chicken Burger',
    'Classic Bull',
    'Salad Burguer'
  )
ON CONFLICT DO NOTHING;
