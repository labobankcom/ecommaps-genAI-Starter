import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User, PackageSearch, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import ProfileTab from "@/components/account/ProfileTab";
import OrdersTab from "@/components/account/OrdersTab";
import AddressesTab from "@/components/account/AddressesTab";
import { getCustomer, isAuthenticated } from "@/app/actions/auth";
import { getMyOrders } from "@/app/actions/orders";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/account/LogoutButton";

export default async function AccountDashboardPage() {
    const loggedIn = await isAuthenticated();
    if (!loggedIn) {
        redirect("/login");
    }

    const [customer, ordersResult] = await Promise.all([
        getCustomer(),
        getMyOrders(),
    ]);

    const addresses = customer?.addresses || [];
    const orders = ordersResult.data || [];
    const customerFirstName = customer?.full_name?.split(" ")[0] || "ضيفنا";

    return (
        <div className="container mx-auto min-h-[60vh] max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
                <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm">
                    <CardContent className="grid gap-6 p-6 md:grid-cols-[1.4fr_.8fr] md:p-8">
                        <div className="space-y-5 text-right">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                                <Sparkles className="size-4" />
                                مساحة الحساب
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
                                    حسابي
                                </h1>
                                <p className="max-w-2xl text-lg text-muted-foreground">
                                    أهلاً {customerFirstName}، من هنا تتابع طلباتك، تدير عناوينك، وتراجع بياناتك الشخصية ضمن تجربة نظيفة وواضحة.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                                    <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                                    <p className="mt-2 text-2xl font-black">{orders.length}</p>
                                </div>
                                <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                                    <p className="text-sm text-muted-foreground">العناوين المحفوظة</p>
                                    <p className="mt-2 text-2xl font-black">{addresses.length}</p>
                                </div>
                                <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                                    <p className="text-sm text-muted-foreground">حالة الحساب</p>
                                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-zinc-800/10 px-3 py-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                        <ShieldCheck className="size-4" />
                                        نشط
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-4 rounded-[1.75rem] border border-border/70 bg-background/90 p-5 shadow-sm">
                            <div className="space-y-3 text-right">
                                <p className="text-sm font-medium text-muted-foreground">الملف الشخصي</p>
                                <div>
                                    <p className="text-2xl font-black">{customer?.full_name || "—"}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{customer?.email || "—"}</p>
                                </div>
                            </div>
                            <div className="grid gap-3 text-right text-sm">
                                <div className="rounded-2xl bg-muted/50 p-4">
                                    <p className="text-muted-foreground">رقم الهاتف</p>
                                    <p className="mt-1 font-bold" dir="ltr">{customer?.phone || "غير مضاف"}</p>
                                </div>
                                <LogoutButton />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="profile" className="flex flex-col gap-6" dir="rtl">
                    <TabsList className="grid w-full grid-cols-1 gap-2 rounded-[1.5rem] border border-border/70 bg-background/90 p-2 shadow-sm group-data-[orientation=horizontal]/tabs:h-auto md:grid-cols-3">
                        <TabsTrigger
                            value="profile"
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 text-base font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                            <User className="size-5" />
                            <span className="whitespace-nowrap">المعلومات الشخصية</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="orders"
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 text-base font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                            <PackageSearch className="size-5" />
                            <span className="whitespace-nowrap">الطلبات السابقة</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="addresses"
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 text-base font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                            <MapPin className="size-5" />
                            <span className="whitespace-nowrap">إدارة العناوين</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="min-w-0 flex-1">
                        <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <ProfileTab customer={customer} />
                        </TabsContent>
                        <TabsContent value="orders" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <OrdersTab orders={orders} />
                        </TabsContent>
                        <TabsContent value="addresses" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <AddressesTab addresses={addresses} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
