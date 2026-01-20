import { WholesomeCarousel } from './wholesome-carousel';
import { wholesomeItems } from './wholesome-data';

export function WholesomeChoices() {
  return (
    <section
      className="py-8"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #F3EEEA 40%, #F3EEEA 60%, #FFFFFF 100%)',
      }}
    >
      <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-6 mx-4">
        Wholesome Choices
      </h2>
      <WholesomeCarousel items={wholesomeItems} />
    </section>
  );
}
