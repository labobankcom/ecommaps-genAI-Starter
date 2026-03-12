import Link from "next/link";
import { getCollections } from "@/app/actions/collections";

export default async function CollectionsPage() {
    const collections = await getCollections();

    return (
        <section className="py-10 lg:py-20">
            <div className="container mx-auto max-w-screen-2xl px-6 lg:px-8">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold lg:text-4xl">المجموعات</h1>
                    <p className="mt-2 text-muted-foreground">
                        تصفح مجموعاتنا المختارة بعناية
                    </p>
                </header>

                {collections.length === 0 ? (
                    <p className="text-center text-muted-foreground py-20">
                        لا توجد مجموعات حالياً
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {collections.map((collection) => (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="relative aspect-[16/9] w-full overflow-hidden">
                                    {collection.image_url ? (
                                        <img
                                            src={collection.image_url}
                                            alt={collection.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                            <span className="text-4xl font-bold text-primary/30">
                                                {collection.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 text-right">
                                        <h3 className="text-xl font-bold text-white">{collection.title}</h3>
                                        {collection.description && (
                                            <p className="mt-1 text-sm text-white/80 line-clamp-2">
                                                {collection.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

