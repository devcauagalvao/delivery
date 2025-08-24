import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  active: boolean
  created_at: string
  updated_at: string
  description?: string
  ingredients?: string[]
  categories?: string[]
}

export const menu: Product[] = [
  {
    id: "eb562ed7-b9a2-4ab6-a636-d5fb9dd46efd",
    name: "Bacon Bull",
    description: "Simples, direto, forte. Carne no ponto certo, cheddar, bacon crocante e um destruidor picles de cebola roxa — um clássico com pegada agressiva. Para quem não pede licença, morde e domina.",
    price: 29,
    image: "./taurus-black-burguer/bacon-bull.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["classic"],
    ingredients: ["Carne bovina grelhada", "Cheddar", "Bacon crocante", "Picles de cebola roxa", "Pão brioche"]
  },
  {
    id: "51fb29bd-6f8b-4c07-b2b7-46a8e93fa59f",
    name: "Chicken",
    description: "Burguer de frango temperado e grelhado no ponto, coberto com muçarela derretida, alface crocante, cebola branca e camada cremosa de maionese branca, no clássico pão brioche selado.",
    price: 23,
    image: "./taurus-black-burguer/chicken.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["classic"],
    ingredients: ["Hambúrguer de frango grelhado", "Muçarela derretida", "Alface crocante", "Cebola branca", "Maionese branca", "Pão brioche selado"]
  },
  {
    id: "d75f54a3-dd37-4f53-b30f-0eece6bfb0a6",
    name: "Sallad Burguer",
    description: "Alface crocante, tomate suculento, cebola roxa, queijo prato e hambúrguer artesanal perfeitamente grelhado, tudo dentro de um pão brioche macio.",
    price: 26,
    image: "./taurus-black-burguer/sallad-burguer.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["classic"],
    ingredients: ["Alface crocante", "Tomate suculento", "Cebola roxa", "Queijo prato", "Hambúrguer artesanal grelhado", "Pão brioche macio"]
  },
  {
    id: "16fdd594-820a-40b1-8af5-6abd4a8b5b75",
    name: "Big Black Taurus Bacon",
    description: "Duas carnes poderosas, cheddar duplo, cebola roxa, bacon crocante e barbecue artesanal. Potência, selvageria e sabor.",
    price: 44,
    image: "./taurus-black-burguer/big-black-taurus-bacon.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["black"],
    ingredients: ["Duas carnes bovinas feitas no carvão", "Cheddar duplo", "Cebola roxa", "Bacon crocante", "Barbecue artesanal", "Pão brioche"]
  },
  {
    id: "69db0166-4be0-43bf-8755-febb12f27db1",
    name: "Big Black Taurus",
    description: "Duas carnes brutas, cheddar derretido, cebola roxa e barbecue artesanal. Um ataque de sabor.",
    price: 42,
    image: "./taurus-black-burguer/big-black-taurus.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["black"],
    ingredients: ["Duas carnes bovinas feitas no carvão", "Cheddar derretido", "Cebola roxa", "Barbecue artesanal", "Pão brioche"]
  },
  {
    id: "ee0e6f46-0a59-4e11-8ada-90d194315592",
    name: "Black Onion Sweet",
    description: "Burger temperado no carvão, muçarela derretida, cebola caramelizada intensa e pão brioche macio.",
    price: 33,
    image: "./taurus-black-burguer/black-onion-sweet.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["black"],
    ingredients: ["Hambúrguer de carne feito no carvão", "Muçarela derretida", "Cebola caramelizada", "Pão brioche macio"]
  },
  {
    id: "c869b797-ba73-4dc0-8b20-58ad8066a841",
    name: "Classic Bull",
    description: "Pão brioche artesanal, carne 100% bovina, queijo prato derretido e fatias crocantes de picles.",
    price: 23,
    image: "./taurus-black-burguer/classic-bull.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["classic"],
    ingredients: ["Carne 100% bovina suculenta", "Queijo prato derretido", "Picles crocante", "Pão brioche artesanal"]
  },
  {
    id: "afad8a8b-cc6f-4e21-9108-2e2f8f76ad1a",
    name: "Black Chimichurri",
    description: "Camada de mussarela derretida com chimichurri artesanal, maionese branca, cebola roxa e pão brioche.",
    price: 23,
    image: "./taurus-black-burguer/black-chimichurri.png",
    active: true,
    created_at: "2025-08-20",
    updated_at: "2025-08-20",
    categories: ["black"],
    ingredients: ["Muçarela derretida", "Chimichurri artesanal", "Maionese branca", "Cebola roxa", "Pão brioche"]
  }
]