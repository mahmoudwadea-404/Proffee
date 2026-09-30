import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const products = [
  {
    name: "Plain Light Roast – سادة فاتح",
    slug: "plain-light-roast",
    description: "A clean, classic light roast – نقي وخفيف, perfect for pour-over and drip.",
    longDescription:
      "قهوة سادة فاتح تجسد أرقى معايير القهوة المختصة بنقائها الاستثنائي وقوامها الحريري الخفيف. تم تحميص حبوب الأرابيكا الإثيوبية بعناية لتبرز النغمات الزهرية العطرة مع لمسات عسلية طبيعية وانتعاش حمضي هادئ. تنتهي بنعومة فائقة تخلو من أي مرارة، لتكون خيارك الأمثل لتقطير صباحي منعش وراقي.",
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
      "قهوتنا السادة الوسط هي القلب النابض لقائمة بروفي، والخلطة المتوازنة التي تألفها حواسك من أول رشفة. تجمع حبوب الأرابيكا الكولومبية بين حلاوة الكراميل الدافئة ولمسات مخملية من شوكولاتة الحليب واللوز المحمص. تمتاز بقوام ناعم ومتناسق يلائم كافة طرق التحضير لتستمتع بنهاية سكرية تدوم طويلاً.",
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
      "قهوة سادة غامق لعشاق الطابع القوي والتركيز العالي، حيث نوصل التحميص بحرفية لإطلاق كامل الزيوت العطرية العميقة. تفوح بنكهات الشوكولاتة الداكنة الكثيفة مع لمحات اللوز المحمص ونفحات دخانية دافئة تأسر الحواس. تمتاز بقوام مخملي ثقيل يوقظ تركيزك ويمنحك دفعة طاقة حقيقية في كل فنجان.",
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
      "تحويجة بروفي الفاتحة تقدم التوليفة التراثية المصرية العريقة بأرقى لمسات حبوب الأرابيكا اليمنية الفاخرة. يمتزج فيها الهيل الحبشي الأخضر مع لمسة قرفة هادئة والنغمات الزهرية الطبيعية لحبات البن الخفيفة. تمنحك رائحة زكية تملأ الأرجاء وطعماً سلساً ينبض بالأصالة دون أي ثقل، ليكون ختاماً راقياً ليومك.",
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
      "الخلطة الأيقونية المحبوبة التي صنعت على الأصول لتكون المعيار الذهبي للقهوة المحوجة المتزنة في مصر. يلتقي فيها الهيل العطري الفاخر مع دفء الزنجبيل ولمسات خفيفة من القرنفل، ملتفة حول قوام القهوة السلس ونغمات الكراميل الطبيعية. تمنحك مذاقاً دافئاً ومريحاً مع وش متماسك لبداية يوم مفعمة بالنشاط.",
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
      "لعشاق التوابل الجريئة والنكهات العميقة التي تترك بصمة لا تُنسى، صممنا هذا المزيج المحوج الغامق المكثف. تلتقي فيه حدة الشوكولاتة السوداء مع عبق الهيل المركز ولدغة لطيفة من الفلفل الأسود والقرنفل تمنحه شخصية فريدة. مشروب ذو قوام ثقيل ونكهة عارمة تفرض هيبتها من أول رشفة وحتى آخر الفنجان.",
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
      "التحميص الفرنسي الكلاسيكي على أصوله بلونه البني الداكن وطابعه الدخاني الفاخر المعقد والآسر. ينفرد بنوتات ساحرة من الكاكاو المر المركز، خشب البلوط المعتق، ولمسات غنية من الكراميل المحروق بحموضة شبه منعدمة. يمثل هذا البن القاعدة الذهبية لإعداد قهوة فرنساوي بالحليب برغوة غنية وقوام زيتي ممتلئ.",
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
      "القهوة الأكثر دلالاً ورفاهية، حيث نجمع بين فخامة التحميص الفرنسي الغامق والنكهة الدافئة للبندق المحمص الفاخر. يمنحك هذا المزيج تجربة غنية تفوح برائحة الكراميل الزبدي والفانيليا الرقيقة لتذوب في الفم بنعومة تنسيك الحاجة للسكر. صُممت لتمنحك شعوراً بالدفء والراحة مع الحليب المبخر في أوقات الاسترخاء.",
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
  console.log("Upserting 8 products with 4-line Arabic descriptions...")
  for (const product of products) {
    const updated = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        longDescription: product.longDescription,
        origin: product.origin,
      },
      create: product,
    })
    console.log(`  ✓ ${updated.name}`)
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
