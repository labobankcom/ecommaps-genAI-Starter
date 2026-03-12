import { CartItem } from "./type";

export const cartItems: CartItem[] = [
    {
        id: 1,
        title: "هودي كلاسيكي بشعار",
        price: "4500 د.ج",
        variant: "أسود",
        size: "Medium",
        quantity: 1,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200",
        in_stock: true,
    },
    {
        id: 2,
        title: "جاكيت جينز أزرق",
        price: "8000 د.ج",
        variant: "أزرق",
        size: "Large",
        quantity: 2,
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=200",
        in_stock: true,
    },
    {
        id: 3,
        title: "جينز سليم فيت محكم",
        price: "5000 د.ج",
        variant: "أزرق داكن",
        size: "32",
        quantity: 1,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200",
        in_stock: true,
    }
];
