import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import {
	Card,
	CardContent,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductProps {
	name: string;
	description: string;
	price: number;
	image: string;
	isBestSeller?: boolean;
	isFavorited?: boolean;
}

export function ProductCardOne({
	name,
	description,
	price,
	image,
	isFavorited = false,
}: ProductProps) {
	return (
		<Card className="w-full h-full rounded-2xl border border-border/40 bg-card shadow-xl shadow-black/5 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
			<CardContent className="p-5 flex flex-col h-full">
				<div className="relative mb-6">
					<div className="bg-muted rounded-xl flex items-center justify-center aspect-square relative overflow-hidden group/img">
						<img
							src={image}
							alt={name}
							className="w-full h-full object-cover"
						/>

						<Button
							variant="ghost"
							size="icon"
							className="absolute top-3 end-3 bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/20 rounded-full"
						>
							<Heart
								className={cn(
									"w-5 h-5 transition-colors",
									isFavorited
										? "fill-red-500 text-red-500"
										: "text-white/90 hover:text-red-500",
								)}
							/>
						</Button>
					</div>
				</div>

				<div className="flex-1 space-y-3">
					<CardTitle className="text-2xl font-bold tracking-tight text-foreground leading-tight">
						{name}
					</CardTitle>
					<CardDescription className="text-base text-muted-foreground/80 line-clamp-2 leading-relaxed">
						{description}
					</CardDescription>
				</div>

				<div className="flex items-center justify-between gap-4 mt-8">
					<p className="text-2xl font-extrabold tracking-tighter text-foreground whitespace-nowrap">
						{price.toLocaleString()} <span className="text-sm font-medium">د.ج</span>
					</p>

					<Button className="rounded-xl h-11 px-6 bg-black text-white hover:bg-black/90 font-bold transition-transform active:scale-95">
						إضافة للسلة
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
