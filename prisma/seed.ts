import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const products = [
  {
    name: "Plain Light Roast – سادة فاتح",
    slug: "plain-light-roast",
    description: "A clean, classic light roast – نقي وخفيف, perfect for pour-over and drip.",
    longDescription:
      "Plain Light Roast is our purest expression of specialty coffee — سادة فاتح, just the way coffee should taste. Lightly roasted to preserve the bean's natural character, this cup delivers a silky body with bright floral notes and a hint of honey sweetness. It starts delicate on the tongue and finishes clean, with zero bitterness. Perfect for your morning V60 or Chemex, yā sādi — ياسلام على النقاوة. If you love a cup that lets the bean speak for itself, this is your brew.",
    origin: "Ethiopia",
    price: 180,
    stock: 50,
    roastLevel: "Light",
    flavorNotes: ["Jasmine", "Honey", "Citrus Zest", "Silky"],
    weightOptions: [
      { label: "250g", grams: 250, price: 180 },
      { label: "500g", grams: 500, price: 320 },
      { label: "1kg", grams: 1000, price: 580 },
    ],
    imageUrl: "/images/products/plain-light-roast.jpg",
    images: ["/images/products/plain-light-roast.jpg"],
    featured: true,
  },
  {
    name: "Plain Medium Roast – سادة وسط",
    slug: "plain-medium-roast",
    description: "Balanced and approachable – وسط في كل حاجة, smooth enough for everyone.",
    longDescription:
      "Our Plain Medium Roast is the heart of the menu — سادة وسط, the balance you come home to. Roasted to a perfect medium, this coffee brings together caramel sweetness, milk chocolate roundness, and a hint of toasted almond. It is smooth, approachable, and works beautifully with any brewing method — espresso, Aeropress, or simply sāda on the stove. Yā salām on that lingering sweet finish. For those who want a cup that just feels right, this is it.",
    origin: "Colombia",
    price: 170,
    stock: 50,
    roastLevel: "Medium",
    flavorNotes: ["Caramel", "Milk Chocolate", "Toasted Almond", "Smooth"],
    weightOptions: [
      { label: "250g", grams: 250, price: 170 },
      { label: "500g", grams: 500, price: 300 },
      { label: "1kg", grams: 1000, price: 540 },
    ],
    imageUrl: "/images/products/plain-medium-roast.jpg",
    images: ["/images/products/plain-medium-roast.jpg"],
    featured: true,
  },
  {
    name: "Plain Dark Roast – سادة غامق",
    slug: "plain-dark-roast",
    description: "Bold, smoky, and unapologetically dark – غامق وقوي, for the true coffee soul.",
    longDescription:
      "Plain Dark Roast is for those who like it deep — سادة غامق, no sugar, no fuss, just pure intensity. We push this roast just into second crack to unlock a powerful cup with notes of dark chocolate, roasted almond, and a whisper of fine tobacco smoke. Full-bodied and velvety, it stands up to milk, cuts through desserts, and satisfies that deep coffee craving. El3ab yā bā — العب يا بطل, this one is not messing around. A classic dark roast that earns its place on any shelf.",
    origin: "Brazil",
    price: 175,
    stock: 50,
    roastLevel: "Dark",
    flavorNotes: ["Dark Chocolate", "Roasted Almond", "Smoky", "Velvety"],
    weightOptions: [
      { label: "250g", grams: 250, price: 175 },
      { label: "500g", grams: 500, price: 310 },
      { label: "1kg", grams: 1000, price: 560 },
    ],
    imageUrl: "/images/products/plain-dark-roast.jpg",
    images: ["/images/products/plain-dark-roast.jpg"],
    featured: true,
  },
  {
    name: "Mahwaj Light Roast – محوج فاتح",
    slug: "mahwaj-light-roast",
    description: "A traditional spiced blend with a light touch – محوج فاتح, aromatic and elegant.",
    longDescription:
      "Mahwaj is a beloved Egyptian coffee tradition — محوج, a carefully spiced blend passed down through generations. Our Light Roast version keeps the spice gentle and the coffee forward, allowing floral and citrus notes to mingle with warm cardamom and a hint of cinnamon. This is a cup that smells as beautiful as it tastes, with a clean, bright finish. Perfect after a meal, or whenever you want something special. Yā zahra — يا زهرة, this one is pure heritage in a cup.",
    origin: "Yemen",
    price: 200,
    stock: 50,
    roastLevel: "Light",
    flavorNotes: ["Cardamom", "Cinnamon", "Citrus", "Floral"],
    weightOptions: [
      { label: "250g", grams: 250, price: 200 },
      { label: "500g", grams: 500, price: 360 },
      { label: "1kg", grams: 1000, price: 660 },
    ],
    imageUrl: "/images/products/mahwaj-light-roast.jpg",
    images: ["/images/products/mahwaj-light-roast.jpg"],
    featured: false,
  },
  {
    name: "Mahwaj Medium Roast – محوج وسط",
    slug: "mahwaj-medium-roast",
    description: "The classic mahwaj blend – محوج على الأصول, spiced, warm, and perfectly balanced.",
    longDescription:
      "This is the mahwaj everyone knows and loves — محوج وسط, the Goldilocks of spiced coffee. Medium-roasted to marry the coffee body with the spice profile, it delivers bold notes of cardamom, ginger, and clove wrapped around a rich caramel centre. The spices are present but never overpowering — just warm, aromatic, and deeply comforting. Brew it on the stove with sugar the Egyptian way, or enjoy it black. Alf saba7 sharaf — ألف صباح شرف, this is how you start a morning right.",
    origin: "Yemen",
    price: 195,
    stock: 50,
    roastLevel: "Medium",
    flavorNotes: ["Cardamom", "Ginger", "Clove", "Caramel"],
    weightOptions: [
      { label: "250g", grams: 250, price: 195 },
      { label: "500g", grams: 500, price: 350 },
      { label: "1kg", grams: 1000, price: 640 },
    ],
    imageUrl: "/images/products/mahwaj-medium-roast.jpg",
    images: ["/images/products/mahwaj-medium-roast.jpg"],
    featured: false,
  },
  {
    name: "Mahwaj Dark Roast – محوج غامق",
    slug: "mahwaj-dark-roast",
    description: "Bold spice meets deep roast – محوج غامق, intense and unforgettable.",
    longDescription:
      "Mahwaj Dark Roast is for the spice lover who wants it all — محوج غامق, deep, dark, and layered. We take the classic mahwaj spice mix and pair it with a full dark roast, creating a cup that is both powerfully bold and aromatically complex. Dark chocolate, smoky cardamom, and a hint of black pepper come together in a velvety brew that lingers long after the last sip. This is not a subtle coffee — ده مش قهوة عادية. It demands attention, and it rewards the brave.",
    origin: "Yemen",
    price: 205,
    stock: 50,
    roastLevel: "Dark",
    flavorNotes: ["Dark Chocolate", "Smoky Cardamom", "Black Pepper", "Velvety"],
    weightOptions: [
      { label: "250g", grams: 250, price: 205 },
      { label: "500g", grams: 500, price: 370 },
      { label: "1kg", grams: 1000, price: 680 },
    ],
    imageUrl: "/images/products/mahwaj-dark-roast.jpg",
    images: ["/images/products/mahwaj-dark-roast.jpg"],
    featured: false,
  },
  {
    name: "French Roast – فرنساوي",
    slug: "french-roast",
    description: "The classic French-style dark roast – فرنساوي أصلي, rich, smoky, and timeless.",
    longDescription:
      "French Roast is a worldwide classic — فرنساوي أصلي, and ours is true to the tradition. Roasted to a deep, oily dark brown, this coffee delivers an intense, smoky-sweet cup with notes of bittersweet chocolate, charred oak, and a hint of dark caramel. Low acidity and a full, almost syrupy body make it the ultimate espresso base or a powerful black coffee on its own. Mazyōna awī — مزبوطة أوي, this is the French roast you have been looking for. It does not hide. It does not apologise.",
    origin: "Blend",
    price: 190,
    stock: 50,
    roastLevel: "Dark",
    flavorNotes: ["Bittersweet Chocolate", "Charred Oak", "Dark Caramel", "Smoky"],
    weightOptions: [
      { label: "250g", grams: 250, price: 190 },
      { label: "500g", grams: 500, price: 340 },
      { label: "1kg", grams: 1000, price: 620 },
    ],
    imageUrl: "/images/products/french-roast.png",
    images: ["/images/products/french-roast.png"],
    featured: true,
  },
  {
    name: "French Hazelnut – فرنساوي بندق",
    slug: "french-hazelnut",
    description: "A silky French roast kissed with hazelnut – فرنساوي بندق, smooth, sweet, and irresistible.",
    longDescription:
      "French Hazelnut is our most indulgent brew — فرنساوي بندق, combining the bold depth of a French roast with the sweet, buttery warmth of toasted hazelnut. The base is the same rich, smoky French roast you love. A touch of natural hazelnut flavouring adds a layer of sweetness and creaminess that makes this coffee dangerously drinkable black. No sugar needed. It is smooth, aromatic, and finishes like a warm hug. Yā salām on this one — ياسلام على البندق. If you love flavoured coffee, you just found your new favourite.",
    origin: "Blend",
    price: 210,
    stock: 50,
    roastLevel: "Medium-Dark",
    flavorNotes: ["Toasted Hazelnut", "Vanilla", "Caramel", "Creamy"],
    weightOptions: [
      { label: "250g", grams: 250, price: 210 },
      { label: "500g", grams: 500, price: 380 },
      { label: "1kg", grams: 1000, price: 700 },
    ],
    imageUrl: "/images/products/french-hazelnut.jpeg",
    images: ["/images/products/french-hazelnut.jpeg"],
    featured: true,
  },
]

async function main() {
  console.log("Clearing old products...")
  const { count } = await prisma.product.deleteMany()
  console.log(`  Removed ${count} old products.`)

  console.log("Seeding 8 real products...")
  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    console.log(`  ✓ ${created.name}`)
  }

  console.log("Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
