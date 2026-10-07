export const MOCK_PROFILE = {
  name: 'Hala Baheyeldin Hozayen',
  contact_email: 'hala.hozayen@example.com',
  contact_phone: '01006632331',
  whatsapp_number: '201006632331',
  instagram_url: '',
  tiktok_url: '',
  group_url: '',
  about_quote: '',
}

export const MOCK_ARTWORKS = [
  {
    id: 'mock-1', title: 'Valley at Dusk', year: '2024', medium: 'Oil on canvas',
    length_in: 20, width_in: 16, price: 4200, status: 'available',
    description: 'A quiet mountain valley caught in the last warm light of the day.',
    image: null, images: [], sort_order: 0,
  },
  {
    id: 'mock-2', title: 'Olive Grove', year: '2024', medium: 'Oil on canvas',
    length_in: 24, width_in: 18, price: 5400, status: 'available',
    description: 'Rows of olive trees under a hazy Mediterranean sky.',
    image: null, images: [], sort_order: 1,
  },
  {
    id: 'mock-3', title: 'Harbor Light', year: '2023', medium: 'Acrylic on canvas',
    length_in: 16, width_in: 12, price: 2600, status: 'reserved',
    description: 'Small fishing boats resting at the edge of the harbor.',
    image: null, images: [], sort_order: 2,
  },
  {
    id: 'mock-4', title: 'Desert Bloom', year: '2023', medium: 'Mixed media',
    length_in: 18, width_in: 24, price: 3800, status: 'available',
    description: 'Wildflowers breaking through cracked desert earth.',
    image: null, images: [], sort_order: 3,
  },
  {
    id: 'mock-5', title: 'Still Waters', year: '2022', medium: 'Oil on canvas',
    length_in: 30, width_in: 20, price: 6200, status: 'sold',
    description: 'A still lake reflecting the surrounding pines.',
    image: null, images: [], sort_order: 4,
  },
  {
    id: 'mock-6', title: 'Rooftops of Old Cairo', year: '2022', medium: 'Acrylic on canvas',
    length_in: 14, width_in: 14, price: 2100, status: 'available',
    description: 'A dense skyline of domes, minarets, and washing lines.',
    image: null, images: [], sort_order: 5,
  },
]

export const MOCK_QNA = [
  {
    id: 'q1',
    question_en: 'What mediums do you work in?',
    question_ar: 'ما هي الخامات التي تستخدمينها؟',
    answer_en: 'Mostly oil on canvas, with some pieces in acrylic and mixed media.',
    answer_ar: 'في الغالب الألوان الزيتية على القماش، مع بعض الأعمال بالأكريليك والوسائط المختلطة.',
    sort_order: 0,
  },
  {
    id: 'q2',
    question_en: 'Do you take commissions?',
    question_ar: 'هل تقبلين أعمالًا حسب الطلب؟',
    answer_en: 'Yes — reach out via WhatsApp with your idea and I\'ll get back to you with timing and pricing.',
    answer_ar: 'نعم — تواصل معي عبر واتساب بفكرتك وسأرد عليك بالمدة والسعر.',
    sort_order: 1,
  },
  {
    id: 'q3',
    question_en: 'How do I buy a painting?',
    question_ar: 'كيف أشتري لوحة؟',
    answer_en: 'Open any painting and tap "Buy via WhatsApp" — your details and the painting are sent straight to me.',
    answer_ar: 'افتح أي لوحة واضغط على "الشراء عبر واتساب" — سيتم إرسال بياناتك واللوحة إليّ مباشرة.',
    sort_order: 2,
  },
  {
    id: 'q4',
    question_en: 'Do you ship outside Egypt?',
    question_ar: 'هل تشحنين خارج مصر؟',
    answer_en: 'Yes, on a case-by-case basis — message me for a shipping quote.',
    answer_ar: 'نعم، حسب كل حالة — راسليني لمعرفة تكلفة الشحن.',
    sort_order: 3,
  },
]
