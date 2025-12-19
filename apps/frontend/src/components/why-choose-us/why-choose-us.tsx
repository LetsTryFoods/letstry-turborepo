import Image from "next/image";

export const WhyChooseUs = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900">
          Why choose us ?
        </h2>
        <figure className="flex justify-center">
          <Image
            src="https://d11a0m43ek7ap8.cloudfront.net/table.webp"
            alt="Comparison table showing Let's Try advantages over other brands - Deliciously Healthy taste, Healthier Ingredients, Crazy Wide Snackfest range, and Moderate cost"
            width={1600}
            height={600}
            className="max-w-full h-auto"
            priority={false}
          />
        </figure>
      </div>
    </section>
  );
};
