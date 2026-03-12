"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useTransition } from "react";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";
import { OFFICIAL_COMMUNES } from "@/lib/data/official-locations";
import { ChevronDown, CheckCircle2, Loader2, PackageCheck, Copy, Check, TicketPercent, Tag, Trash2 } from "lucide-react";
import { getCart, createOrder, validateCoupon } from "@/app/actions/cart";
import { getCustomer } from "@/app/actions/auth";
import type { EcommapsCart, EcommapsCartItem, EcommapsCouponValidateResponse } from "@ecommaps/client";

interface AppliedDiscount {
	id?: string;
	code?: string | null;
	discount_type?: "percentage" | "fixed_amount" | "free_shipping";
	discount_value?: number;
	discount_amount?: number;
	promotion_type?: string;
	target_type?: string;
	message?: string | null;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null;
}

function asNumber(value: unknown, fallback = 0): number {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
	return typeof value === "string" ? value : fallback;
}

function normalizeOrderResult(value: unknown): OrderResult | null {
	if (!isRecord(value)) return null;

	const itemsRaw = Array.isArray(value.items) ? value.items : [];
	const items = itemsRaw
		.filter(isRecord)
		.map((item) => ({
			name: asString(item.name),
			product_name: asString(item.product_name),
			image: asString(item.image),
			product_image: asString(item.product_image),
			variantOptions: isRecord(item.variantOptions) ? (item.variantOptions as Record<string, string>) : undefined,
			variant_options: isRecord(item.variant_options) ? (item.variant_options as Record<string, string>) : undefined,
			quantity: asNumber(item.quantity, 1),
			subtotal: asNumber(item.subtotal, 0),
			product_price: asNumber(item.product_price, 0),
		}));

	return {
		order_number: asString(value.order_number, asString(value.id)),
		total: asNumber(value.total, 0),
		subtotal: asNumber(value.subtotal, 0),
		status: asString(value.status, "pending"),
		items,
		customer_name: asString(value.customer_name, asString(value.name, "عميل المتجر")),
	};
}

function normalizeCouponValidation(value: unknown): EcommapsCouponValidateResponse {
	if (!isRecord(value)) {
		return { valid: false, message: "فشل التحقق من الكوبون" };
	}
	return {
		valid: Boolean(value.valid),
		applied_discounts: Array.isArray(value.applied_discounts)
			? (value.applied_discounts as AppliedDiscount[])
			: [],
		message: typeof value.message === "string" ? value.message : undefined,
		code: typeof value.code === "string" ? value.code : undefined,
	};
}

function formatPrice(price: number): string {
	return `${price.toLocaleString("ar-DZ")} د.ج`;
}

interface OrderResult {
	order_number: string;
	total: number;
	subtotal: number;
	status: string;
	items: { name?: string; product_name?: string; image?: string; product_image?: string; variantOptions?: Record<string, string>; variant_options?: Record<string, string>; quantity: number; subtotal?: number; product_price?: number }[];
	customer_name: string;
}

type CheckoutAddress = {
	line1?: string | null;
	city?: string | null;
	state?: string | null;
	phone?: string | null;
	is_default?: boolean;
};

type CheckoutCustomer = {
	full_name?: string | null;
	phone?: string | null;
	email?: string | null;
	addresses?: CheckoutAddress[];
};

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(value: string): string {
	return value.replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

function resolveWilayaCode(state: string | null | undefined): string {
	if (!state) return "";
	const raw = toLatinDigits(state).trim();
	if (!raw) return "";

	const directCode = raw.match(/\d{1,2}/)?.[0];
	if (directCode) {
		const normalizedCode = directCode.padStart(2, "0");
		if (ALGERIAN_WILAYAS.some((w) => w.code === normalizedCode)) {
			return normalizedCode;
		}
	}

	const cleanedName = raw.replace(/^\d{1,2}\s*-\s*/, "").trim().toLowerCase();
	const byName = ALGERIAN_WILAYAS.find((w) => {
		const wilayaName = w.name.trim().toLowerCase();
		return wilayaName === cleanedName || wilayaName.replace(/^ولاية\s+/, "") === cleanedName;
	});

	return byName?.code || "";
}

function resolveCommune(commune: string | null | undefined, wilayaCode: string): string {
	if (!commune || !wilayaCode) return "";
	const list = (OFFICIAL_COMMUNES as Record<string, string[]>)[String(parseInt(wilayaCode, 10))] || [];
	if (list.includes(commune)) return commune;

	const normalized = commune.trim().toLowerCase();
	const matched = list.find((c) => c.trim().toLowerCase() === normalized);
	return matched || "";
}

export function CheckoutOne() {
	const [form, setForm] = useState({
		fullName: "",
		phone: "",
		email: "",
		wilaya: "",
		commune: "",
		address: "",
		notes: "",
	});

	const [shippingMethod] = useState<"home" | "pickup">("home");
	const [showMobileSummary, setShowMobileSummary] = useState(false);
	const [cart, setCart] = useState<EcommapsCart | null>(null);
	const [isLoadingCart, setIsLoadingCart] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// Coupon state
	const [couponCode, setCouponCode] = useState("");
	const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
	const [appliedDiscounts, setAppliedDiscounts] = useState<AppliedDiscount[]>([]);
	const [disabledDiscountCodes, setDisabledDiscountCodes] = useState<Set<string>>(new Set());
	const [couponError, setCouponError] = useState<string | null>(null);
	const [automaticDiscountDetected, setAutomaticDiscountDetected] = useState(false);

	// Fetch cart data
	useEffect(() => {
		async function loadCart() {
			setIsLoadingCart(true);
			const cartData = await getCart();
			setCart(cartData);
			setIsLoadingCart(false);

			// Check for automatic discounts
			if (cartData && cartData.subtotal > 0) {
				try {
					const result = normalizeCouponValidation(await validateCoupon("", cartData.subtotal, cartData.items));
					if (result.valid && result.applied_discounts) {
						setAppliedDiscounts(result.applied_discounts);
						setAutomaticDiscountDetected((result.applied_discounts as AppliedDiscount[]).some(d => d.promotion_type === "automatic"));
					}
				} catch (e) {
					console.error("Auto discount check failed:", e);
				}
			}
		}
		loadCart();
	}, []);

	// Prefill checkout fields for logged-in customers using default address
	useEffect(() => {
		let active = true;

		async function hydrateCustomerDefaults() {
			const customerData = (await getCustomer()) as CheckoutCustomer | null;
			if (!active || !customerData) return;

			const addresses = Array.isArray(customerData.addresses) ? customerData.addresses : [];
			const defaultAddress = addresses.find((address) => address?.is_default) || addresses[0];
			const defaultWilaya = resolveWilayaCode(defaultAddress?.state);

			setForm((prev) => {
				const effectiveWilaya = prev.wilaya || defaultWilaya;
				const nextCommune = resolveCommune(defaultAddress?.city, effectiveWilaya);

				return {
					...prev,
					fullName: prev.fullName.trim() ? prev.fullName : (customerData.full_name || ""),
					phone: prev.phone.trim() ? prev.phone : (customerData.phone || defaultAddress?.phone || ""),
					email: prev.email.trim() ? prev.email : (customerData.email || ""),
					wilaya: prev.wilaya || effectiveWilaya,
					commune: prev.commune || nextCommune,
					address: prev.address.trim() ? prev.address : (defaultAddress?.line1 || ""),
				};
			});
		}

		hydrateCustomerDefaults();
		return () => {
			active = false;
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleWilayaChange = (value: string) => {
		setForm((prev) => ({ ...prev, wilaya: value, commune: "" }));
	};

	const handleCommuneChange = (value: string) => {
		setForm((prev) => ({ ...prev, commune: value }));
	};

	const handleSubmitOrder = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate required fields
		if (!form.fullName.trim()) { setError("الرجاء إدخال الاسم الكامل"); return; }
		if (!form.phone.trim()) { setError("الرجاء إدخال رقم الهاتف"); return; }
		if (!form.wilaya) { setError("الرجاء اختيار الولاية"); return; }
		if (!form.commune) { setError("الرجاء اختيار البلدية"); return; }
		if (!form.address.trim()) { setError("الرجاء إدخال العنوان بالتفصيل"); return; }
		if (!cart?.id) { setError("السلة فارغة. أضف منتجات أولاً."); return; }

		setIsSubmitting(true);

		const wilayaObj = ALGERIAN_WILAYAS.find(w => w.code === form.wilaya);
		const result = await createOrder({
			customer_name: form.fullName,
			customer_phone: form.phone,
			customer_email: form.email || undefined,
			customer_wilaya: wilayaObj ? `${wilayaObj.code} - ${wilayaObj.name}` : form.wilaya,
			customer_commune: form.commune || undefined,
			shipping_address: {
				wilaya: wilayaObj?.name || form.wilaya,
				commune: form.commune,
				address: form.address,
			},
			payment_method: "cod",
			customer_notes: form.notes || undefined,
			coupon_code: appliedDiscounts.length > 0 ? appliedDiscounts.map(d => d.code).filter(Boolean).join(",") : undefined,
		});

		if (result.success && result.order) {
			const normalizedOrder = normalizeOrderResult(result.order);
			if (!normalizedOrder) {
				setError("تم إنشاء الطلب لكن تعذر قراءة بيانات التأكيد.");
				setIsSubmitting(false);
				return;
			}
			setOrderResult(normalizedOrder);
			// Clear localStorage cart data
			if (typeof window !== "undefined") {
				localStorage.removeItem("ecommaps-cart");
			}
		} else {
			setError(result.error || "فشل إرسال الطلب. حاول مرة أخرى.");
		}

		setIsSubmitting(false);
	};

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) return;
		setCouponError(null);
		setIsValidatingCoupon(true);

		try {
			const result = normalizeCouponValidation(await validateCoupon(couponCode, subtotal, cart?.items));
			if (result.valid) {
				const newDiscounts = result.applied_discounts || [];
				// Merge or replace? Usually manual coupon might replace or append.
				// For this "smart" system, let's append but avoid duplicates.
				setAppliedDiscounts(prev => {
					const existingCodes = new Set(prev.map(d => d.code));
					const toAdd = (newDiscounts as AppliedDiscount[]).filter(d => d.code && !existingCodes.has(d.code));
					return [...prev, ...toAdd];
				});
				setCouponCode("");
			} else {
				setCouponError(result.message || "كوبون غير صالح");
			}
		} catch (err) {
			setCouponError("حدث خطأ أثناء التحقق من الكوبون");
		} finally {
			setIsValidatingCoupon(false);
		}
	};

	const removeDiscount = (code?: string | null) => {
		if (!code) return;

		setDisabledDiscountCodes(prev => {
			const next = new Set(prev);
			next.add(code);
			return next;
		});

		setAppliedDiscounts(prev => prev.filter(d => d.code !== code));

		if (appliedDiscounts.length <= 1) {
			setAutomaticDiscountDetected(false);
		}
	};

	const copyOrderNumber = () => {
		if (orderResult?.order_number) {
			navigator.clipboard.writeText(orderResult.order_number);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	// ── Order Confirmation View ──
	if (orderResult) {
		return (
			<div className="w-full max-w-2xl mx-auto text-center py-8" dir="rtl">
				<div className="space-y-8">
					{/* Success Icon */}
					<div className="flex justify-center">
						<div className="size-20 bg-zinc-200 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
							<CheckCircle2 className="size-10 text-zinc-800" />
						</div>
					</div>

					{/* Thank You Message */}
					<div className="space-y-3">
						<h2 className="text-3xl font-black font-heading">شكراً لك على طلبك! 🎉</h2>
						<p className="text-muted-foreground text-lg font-medium">
							تم تأكيد طلبك بنجاح. سنتواصل معك قريباً لتأكيد التوصيل.
						</p>
					</div>

					{/* Order Number */}
					<div className="bg-muted/50 border rounded-2xl p-6 space-y-4">
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<PackageCheck className="size-4" />
							<span>رقم الطلب</span>
						</div>
						<div className="flex items-center justify-center gap-3">
							<span className="text-2xl font-black text-primary tracking-wider">{orderResult.order_number}</span>
							<Button
								variant="outline"
								size="sm"
								className="rounded-lg gap-1"
								onClick={copyOrderNumber}
							>
								{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
								{copied ? "تم النسخ" : "نسخ"}
							</Button>
						</div>
					</div>

					{/* Order Details */}
					<div className="bg-background border rounded-2xl p-6 text-right space-y-4">
						<h3 className="font-bold text-lg">تفاصيل الطلب</h3>

						<div className="divide-y">
							{orderResult.items?.map((item, i: number) => (
								<div key={i} className="flex justify-between items-center py-3 gap-3">
									<div className="w-12 h-12 bg-neutral-100 rounded-md border border-neutral-200 flex-shrink-0 overflow-hidden">
										{(item.image || item.product_image) ? (
											<img src={item.image || item.product_image} alt={item.name || item.product_name} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">صورة</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm truncate">{item.name || item.product_name}</p>
										{(item.variantOptions || item.variant_options) && (
											<div className="text-[10px] text-muted-foreground flex flex-wrap gap-1 mt-0.5">
												{Object.entries(item.variantOptions || item.variant_options || {}).map(([key, val]) => (
													<span key={key} className="bg-muted px-1 py-0.5 rounded-sm">
														{String(val)}
													</span>
												))}
											</div>
										)}
										<p className="text-xs text-muted-foreground mt-0.5">الكمية: {item.quantity}</p>
									</div>
									<p className="font-bold text-sm flex-shrink-0">{formatPrice(item.subtotal || (item.product_price || 0) * item.quantity)}</p>
								</div>
							))}
						</div>

						<div className="border-t pt-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">المجموع الفرعي</span>
								<span className="font-medium">{formatPrice(orderResult.subtotal)}</span>
							</div>
							<div className="flex justify-between font-bold text-lg pt-2 border-t">
								<span>الإجمالي</span>
								<span className="text-primary">{formatPrice(orderResult.total)}</span>
							</div>
						</div>

						<div className="border-t pt-4 text-sm space-y-1">
							<p><span className="text-muted-foreground">العميل:</span> {orderResult.customer_name}</p>
							<p><span className="text-muted-foreground">طريقة الدفع:</span> الدفع عند الاستلام</p>
							<p><span className="text-muted-foreground">الحالة:</span> <span className="text-yellow-600 font-bold">في الانتظار</span></p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
						<Button asChild className="rounded-xl font-bold px-8 h-12">
							<Link href="/">متابعة التسوق</Link>
						</Button>
						<Button asChild variant="outline" className="rounded-xl font-bold px-8 h-12">
							<Link href="/account">عرض طلباتي</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Cart items for the summary
	const cartItems = cart?.items || [];
	const subtotal = cart?.subtotal || 0;

	// Calculate discount
	let discountAmount = 0;
	let isFreeShipping = false;
	appliedDiscounts.forEach(discount => {
		discountAmount += discount.discount_amount || 0;
		if (discount.discount_type === "free_shipping") {
			isFreeShipping = true;
		}
	});

	const selectedWilaya = ALGERIAN_WILAYAS.find((w) => w.code === form.wilaya);
	const baseShippingCost = selectedWilaya?.shippingCost ?? 0;
	const shippingCost = isFreeShipping ? 0 : (shippingMethod === "home" ? baseShippingCost : 0);
	const total = Math.max(0, subtotal - discountAmount + shippingCost);

	// ── Order Summary (reusable) ──
	const orderSummaryContent = (
		<ul className="space-y-4 lg:space-y-5">
			{isLoadingCart ? (
				<li className="flex justify-center py-8">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</li>
			) : cartItems.length === 0 ? (
				<li className="text-center py-8 text-muted-foreground text-sm">
					السلة فارغة
				</li>
			) : (
				<>
					{cartItems.map((item) => (
						<li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div className="w-10 h-10 lg:w-12 lg:h-12 bg-neutral-100 rounded-md border border-neutral-200 flex-shrink-0 overflow-hidden">
									{item.product_image ? (
										<img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">صورة</div>
									)}
								</div>
								<div className="min-w-0 flex-1">
									<h5 className="text-sm font-bold text-neutral-900 truncate">{item.product_name}</h5>
									{(item as { variant_options?: Record<string, string> }).variant_options && (
										<div className="text-[10px] text-neutral-500 flex flex-wrap gap-1 mt-0.5">
											{Object.entries((item as { variant_options?: Record<string, string> }).variant_options!).map(([key, val]) => (
												<span key={key} className="bg-neutral-100 px-1 py-0.5 rounded-sm border border-neutral-200">
													{String(val)}
												</span>
											))}
										</div>
									)}
									<p className="text-xs text-neutral-500 mt-0.5">الكمية: {item.quantity}</p>
								</div>
							</div>
							<p className="font-bold text-neutral-900 text-sm flex-shrink-0 ml-2">{formatPrice(item.subtotal)}</p>
						</li>
					))}
				</>
			)}

			<hr className="my-4 lg:my-6 border-neutral-200" />

			<li className="flex justify-between items-center">
				<h5 className="text-sm text-neutral-600 font-medium">المجموع الفرعي</h5>
				<p className="font-bold text-neutral-900">{formatPrice(subtotal)}</p>
			</li>
			<li className="flex justify-between items-center">
				<h5 className="text-sm text-neutral-600 font-medium">الشحن</h5>
				<p className="font-bold text-neutral-900 flex items-center gap-1">
					<span className="text-xs text-neutral-500">يُحسب عند التأكيد</span>
				</p>
			</li>

			<hr className="my-4 lg:my-6 border-neutral-200" />

			{/* Coupon Section */}
			<li className="space-y-4">
				<div className="space-y-2">
					<h5 className="text-sm text-neutral-600 font-medium">هل لديك كوبون خصم؟</h5>
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Tag className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
							<Input
								placeholder="أدخل الكود هنا"
								value={couponCode}
								onChange={(e) => setCouponCode(e.target.value)}
								className="h-10 pr-9 bg-white border-neutral-200 focus:ring-zinc-500 rounded-lg text-sm"
							/>
						</div>
						<Button
							type="button"
							onClick={handleApplyCoupon}
							disabled={isValidatingCoupon || !couponCode.trim()}
							variant="outline"
							className="h-10 px-4 rounded-lg font-bold border-zinc-700 text-zinc-800 hover:bg-zinc-100 whitespace-nowrap"
						>
							{isValidatingCoupon ? <Loader2 className="size-4 animate-spin" /> : "تطبيق"}
						</Button>
					</div>
					{couponError && <p className="text-[10px] text-red-500 font-medium pr-1">{couponError}</p>}
				</div>

				{appliedDiscounts.length > 0 && (
					<div className="space-y-2">
						{appliedDiscounts.map((discount, idx) => (
							<div key={discount.code || idx} className="bg-zinc-100 border border-zinc-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
								<div className="flex items-center gap-2.5">
									<div className="size-8 rounded-full bg-zinc-200 flex items-center justify-center">
										<TicketPercent className="size-4 text-zinc-800" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-[11px] text-zinc-800 font-bold leading-none">
											{discount.promotion_type === "automatic" ? "خصم تلقائي" : "كوبون"}
										</p>
										<p className="text-sm font-black text-zinc-900 break-words">
											{discount.message || discount.code}
										</p>
									</div>
								</div>
								<Button
									type="button"
									onClick={() => removeDiscount(discount.code)}
									variant="ghost"
									size="icon"
									className="size-8 rounded-lg text-zinc-800 hover:bg-zinc-200 hover:text-zinc-800 ml-2"
								>
									<Trash2 className="size-4" />
								</Button>
							</div>
						))}
					</div>
				)}
			</li>

			<hr className="my-4 lg:my-6 border-neutral-200 border-dashed" />

			{appliedDiscounts.filter(d => (d.discount_amount || 0) > 0).map((discount, idx) => (
				<li key={discount.code || idx} className="flex justify-between items-center mb-2 animate-in fade-in">
					<h5 className="text-sm text-zinc-800 font-bold">
						{discount.promotion_type === "automatic" ? "خصم تلقائي" : `كوبون (${discount.code})`}
					</h5>
					<p className="font-black text-zinc-800">-{formatPrice(discount.discount_amount || 0)}</p>
				</li>
			))}

			{isFreeShipping && (
				<li className="flex justify-between items-center mb-2 animate-in fade-in">
					<h5 className="text-sm text-zinc-800 font-bold">شحن مجاني</h5>
					<p className="font-black text-zinc-800">مطبق</p>
				</li>
			)}

			<li className="flex justify-between items-center pt-2">
				<h5 className="text-lg font-bold text-neutral-900">الإجمالي</h5>
				<div className="text-left">
					<p className="text-xl lg:text-2xl font-black text-zinc-800">
						{formatPrice(total)}
					</p>
					<p className="text-xs text-neutral-400 mt-1 uppercase">DZD</p>
				</div>
			</li>
		</ul>
	);

	return (
		<div className="w-full">
			<div className="mb-8 text-right" dir="rtl">
				<h1 className="text-3xl font-black font-heading mb-2">إتمام الطلب</h1>
				<p className="text-muted-foreground font-medium">الرجاء إدخال بياناتك لإتمام عملية الشراء بنجاح.</p>
			</div>
			<div className="w-full flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8" dir="rtl">

				{/* ── Mobile: Collapsible Order Summary (top) ── */}
				<div className="w-full lg:hidden order-1">
					<div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
						<button
							type="button"
							onClick={() => setShowMobileSummary(!showMobileSummary)}
							className="w-full flex items-center justify-between p-4 text-right"
						>
							<div className="flex items-center gap-3">
								<h4 className="text-base font-bold font-heading">ملخص الطلب</h4>
								<span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">{cart?.items_count || 0} منتجات</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-lg font-black text-zinc-800">
									{formatPrice(total)}
								</span>
								<ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${showMobileSummary ? 'rotate-180' : ''}`} />
							</div>
						</button>
						{showMobileSummary && (
							<div className="px-4 pb-4 border-t border-neutral-200/60">
								<div className="pt-4">
									{orderSummaryContent}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ── Form / Inputs Column ── */}
				<div className="w-full order-2 lg:order-1 flex-1">
					<form onSubmit={handleSubmitOrder}>
						<div className="space-y-6 lg:space-y-8">

							{/* Error Alert */}
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-medium">{error}</div>
							)}

							{/* Step 1: Contact Info */}
							<div className="space-y-5 lg:space-y-6">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-900 font-bold text-sm">
										1
									</div>
									<h2 className="text-lg lg:text-xl font-bold font-heading">معلومات الاتصال</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
									<div className="space-y-2">
										<Label htmlFor="fullName" className="text-sm font-medium text-neutral-700">الاسم الكامل *</Label>
										<Input
											id="fullName"
											name="fullName"
											value={form.fullName}
											onChange={handleInputChange}
											className="h-12 bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-500 font-medium px-4"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone" className="text-sm font-medium text-neutral-700">رقم الهاتف *</Label>
										<Input
											id="phone"
											name="phone"
											type="tel"
											dir="ltr"
											value={form.phone}
											onChange={handleInputChange}
											placeholder="0700000000"
											className="h-12 bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-500 font-medium px-4 text-left"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium text-neutral-700">البريد الإلكتروني (اختياري)</Label>
									<Input
										id="email"
										name="email"
										type="email"
										dir="ltr"
										value={form.email}
										onChange={handleInputChange}
										placeholder="example@email.com"
										className="h-12 bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-500 font-medium px-4 text-left"
									/>
									<p className="text-xs text-neutral-500 mt-1.5">نستخدم بريدك لإرسال تفاصيل الطلب والتتبع.</p>
								</div>
							</div>

							{/* Divider */}
							<div className="h-px bg-neutral-200/60"></div>

							{/* Step 2: Shipping Address */}
							<div className="space-y-5 lg:space-y-6">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-900 font-bold text-sm">
										2
									</div>
									<h2 className="text-lg lg:text-xl font-bold font-heading">عنوان التوصيل</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
									<div className="space-y-2">
										<Label htmlFor="wilaya" className="text-sm font-medium text-neutral-700">الولاية *</Label>
										<Select value={form.wilaya} onValueChange={handleWilayaChange}>
											<SelectTrigger id="wilaya" className="h-12 bg-white rounded-lg focus:ring-1 focus:ring-zinc-500 text-base px-4">
												<SelectValue placeholder="اختر الولاية" />
											</SelectTrigger>
											<SelectContent>
												{ALGERIAN_WILAYAS.map((w) => (
													<SelectItem key={w.code} value={w.code} className="text-right justify-end flex-row-reverse">
														{w.code} - {w.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="commune" className="text-sm font-medium text-neutral-700">البلدية *</Label>
										<Select disabled={!form.wilaya} value={form.commune} onValueChange={handleCommuneChange}>
											<SelectTrigger id="commune" className="h-12 bg-white rounded-lg focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 text-base px-4">
												<SelectValue placeholder={form.wilaya ? "اختر البلدية" : "اختر الولاية أولاً"} />
											</SelectTrigger>
											<SelectContent>
												{form.wilaya && (() => {
													const key = parseInt(form.wilaya).toString();
													const list = (OFFICIAL_COMMUNES as Record<string, string[]>)[key] || [];
													return list.map((c: string) => (
														<SelectItem key={c} value={c} className="text-right justify-end flex-row-reverse">
															{c}
														</SelectItem>
													));
												})()}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="address" className="text-sm font-medium text-neutral-700">العنوان بالتفصيل *</Label>
									<Textarea
										id="address"
										name="address"
										value={form.address}
										onChange={handleInputChange}
										placeholder="حي مزروع قويدر العمار 17 المنزل 2"
										className="min-h-[80px] bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-500 resize-none font-medium p-4 text-base"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="notes" className="text-sm font-medium text-neutral-700">ملاحظات (اختياري)</Label>
									<Input
										id="notes"
										name="notes"
										value={form.notes}
										onChange={handleInputChange}
										placeholder="مثال: يرجى الاتصال قبل الوصول"
										className="h-12 bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-500 font-medium px-4 text-neutral-500 placeholder:text-neutral-400"
									/>
								</div>
							</div>

							{/* Submit button */}
							<div className="pt-4 lg:pt-8 pb-6 lg:pb-0">
								<Button
									type="submit"
									disabled={isSubmitting || isLoadingCart || cartItems.length === 0}
									className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg rounded-xl shadow-sm transition-all shadow-zinc-900/20 active:scale-[0.98] disabled:opacity-50"
								>
									{isSubmitting ? (
										<span className="flex items-center gap-2">
											<Loader2 className="size-5 animate-spin" />
											جاري إرسال الطلب...
										</span>
									) : (
										"تأكيد الطلب"
									)}
								</Button>
							</div>
						</div>
					</form>
				</div>

				{/* ── Desktop: Sticky Order Summary (sidebar) ── */}
				<div className="hidden lg:block w-full lg:w-[420px] bg-neutral-50/80 border border-neutral-200/80 p-6 rounded-2xl order-2 lg:sticky lg:top-24 shadow-sm">
					<h4 className="text-xl font-bold mb-6 font-heading">ملخص الطلب</h4>
					{orderSummaryContent}
				</div>
			</div>
		</div>
	);
}
