import Image from "next/image";

export const WhyChooseUs = () => {
  return (
    <section className="py-4 sm:py-6 md:py-8 lg:py-10 bg-white">
      <div className="container mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-xl xl:text-4xl font-bold text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-gray-900">
          Why choose us ?
        </h2>
        <figure className="flex justify-center w-full">
          <div className="w-full max-w-[95%] sm:max-w-[85%] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <Image
              src="https://d11a0m43ek7ap8.cloudfront.net/tableupdated.png"
              alt="Comparison table showing Let's Try advantages over other brands - Deliciously Healthy taste, Healthier Ingredients, Crazy Wide Snackfest range, and Moderate cost"
              width={1600}
              height={600}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </figure>
      </div>
    </section>
  );
};
