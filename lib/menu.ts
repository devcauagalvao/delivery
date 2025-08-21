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
        id: "1",
        name: "Bacon Bull",
        description: "Simples, direto, forte. Carne no ponto certo, cheddar, bacon crocante e um destruidor picles de cebola roxa — um clássico com pegada agressiva. Para quem não pede licença, morde e domina.",
        price: 29,
        image: "./taurus-black-burguer/bacon-bull.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["classic"],
        ingredients: [
            "Carne bovina grelhada",
            "Cheddar",
            "Bacon crocante",
            "Picles de cebola roxa",
            "Pão brioche"
        ]
    },
    {
        id: "2",
        name: "Chicken",
        description: "Burguer de frango temperado e grelhado no ponto, coberto com muçarela derretida, alface crocante, cebola branca para uma crocancia maior ainda com uma camada cremosa de maionese branca, tudo isso no clássico pão brioche selado. Leve na aparência, inesquecível no sabor!",
        price: 23,
        image: "./taurus-black-burguer/chicken.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["classic"],
        ingredients: [
            "Hambúrguer de frango grelhado",
            "Muçarela derretida",
            "Alface crocante",
            "Cebola branca",
            "Maionese branca",
            "Pão brioche selado"
        ]
    },
    {
        id: "3",
        name: "Sallad Burguer",
        description: "Pra quem gosta da calmaria relaxante ! O Sallad é montado com alface crocante, tomate suculento, cebola roxa, queijo prato e nosso hambúrguer artesanal perfeitamente grelhado, tudo dentro de um pão brioche macio. Pra quem gosta de frescor!!",
        price: 26,
        image: "./taurus-black-burguer/sallad-burguer.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["classic"],
        ingredients: [
            "Alface crocante",
            "Tomate suculento",
            "Cebola roxa",
            "Queijo prato",
            "Hambúrguer artesanal grelhado",
            "Pão brioche macio"
        ]
    },
    {
        id: "4",
        name: "Big Black Taurus Bacon",
        description: "Aqui é o indomável! Duas carnes poderosas, temperadas e feitas no carvão, cheddar duplo, cebola roxa, e bacon crocante e um banho avassalador de barbecue artesanal. Potência, selvageria e sabor em estado bruto.",
        price: 44,
        image: "./taurus-black-burguer/big-black-taurus-bacon.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["black"],
        ingredients: [
            "Duas carnes bovinas feitas no carvão",
            "Cheddar duplo",
            "Cebola roxa",
            "Bacon crocante",
            "Barbecue artesanal",
            "Pão brioche"
        ]
    },
    {
        id: "5",
        name: "Big Black Taurus",
        description: "A fera do cardápio! Duas carnes brutas, temperadas e feitas no carvão, cheddar derretido, cebola roxa e um manto de barbecue artesanal espesso e marcante. Esse não é um hambúrguer, é uma investida de puro sabor.",
        price: 42,
        image: "./taurus-black-burguer/big-black-taurus.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["black"],
        ingredients: [
            "Duas carnes bovinas feitas no carvão",
            "Cheddar derretido",
            "Cebola roxa",
            "Barbecue artesanal",
            "Pão brioche"
        ]
    },
    {
        id: "6",
        name: "Black Onion Sweet",
        description: "A fúria agridoce! Burger temperado e feito no carvão, muita muçarela derretida, e uma cebola caramelizada de VERDADE! — intensa, suculenta e provocante. Tudo isso envolto no pão brioche macio, pronto para uma mordida cheia de atitude.",
        price: 33,
        image: "./taurus-black-burguer/black-onion-sweet.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["black"],
        ingredients: [
            "Hambúrguer de carne feito no carvão",
            "Muçarela derretida",
            "Cebola caramelizada",
            "Pão brioche macio"
        ]
    },
    {
        id: "7",
        name: "Classic Bull",
        description: "Simples, direto e absolutamente delicioso. O Classic Bull é a definição de sabor: pão brioche artesanal, carne 100% bovina suculenta, queijo prato derretido e fatias crocantes de picles. O básico bem feito!",
        price: 23,
        image: "./taurus-black-burguer/classic-bull.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["classic"],
        ingredients: [
            "Carne 100% bovina suculenta",
            "Queijo prato derretido",
            "Picles crocante",
            "Pão brioche artesanal"
        ]
    },
    {
        id: "8",
        name: "Black Chimichurri",
        description: "Um rugido verde em forma de burger! Uma camada bruta de mussarela derretida, esmagada por um chimichurri selvagem, cheio de ervas e potência. Maionese branca, cebola roxa e pão brioche completam essa combinação feita para quem encarar sabor de frente. Isso é sabor!",
        price: 23,
        image: "./taurus-black-burguer/black-chimichurri.png",
        active: true,
        created_at: "2025-08-20",
        updated_at: "2025-08-20",
        categories: ["black"],
        ingredients: [
            "Muçarela derretida",
            "Chimichurri artesanal",
            "Maionese branca",
            "Cebola roxa",
            "Pão brioche"
        ]
    }
]