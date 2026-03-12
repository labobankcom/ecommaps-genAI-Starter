import { CheckoutOne } from "@/components/commercn/checkouts/checkout-01";

export const metadata = {
    title: "إتمام الطلب | Ecommaps",
    description: "إتمام عملية الشراء بأمان",
};

export default function CheckoutPage() {
    return (
        <div className="container max-w-screen-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[60vh]">
            <div className="flex justify-center" dir="ltr">
                {/* The component defaults to ltr for now before the user asks for changes, but we wrap it correctly */}
                <CheckoutOne />
            </div>
        </div>
    );
}
