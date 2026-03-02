export type ItemCategory = 'hat' | 'toy';

export interface UrwisItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ItemCategory;
  imageSrc: string; // ścieżka do podglądu lub warstwy CSS
  requiredLevel: number; // np. 5, 10
}

export const SHOP_ITEMS: UrwisItem[] = [
  // CZAPKI (Zostają w Ekwipunku)
  {
    id: "hat_cap",
    name: "Czapka z daszkiem",
    description: "Stylowa czapka wymagająca odrobiny wprawy w opiece.",
    price: 3500,
    category: "hat",
    imageSrc: "/urwisek/layers/hat_cap.webp",
    requiredLevel: 5
  },
  {
    id: "hat_crown",
    name: "Korona Władcy",
    description: "Pokaż wszystkim kto tu rządzi. Kosztuje absurdalnie dużo.",
    price: 35000,
    category: "hat",
    imageSrc: "/urwisek/layers/hat_crown.webp",
    requiredLevel: 20
  },

  // TOWARZYSZE (ZWIERZAKI)
  {
    id: "pet_cat",
    name: "Mruczek Puszysty",
    description: "Wierny kotek dotrzymujący towarzystwa Urwiskowi. Wymaga dużego doświadczenia!",
    price: 50000,
    category: "toy",
    imageSrc: "/urwisek/layers/pet_cat.webp",
    requiredLevel: 30
  },
  {
    id: "pet_dragon",
    name: "Mały Smok",
    description: "Legendarny smoczek! Tylko dla prawdziwych weteranów opieki.",
    price: 100000,
    category: "toy",
    imageSrc: "/urwisek/layers/pet_dragon.webp",
    requiredLevel: 50
  }
];
