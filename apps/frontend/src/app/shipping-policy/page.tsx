import React from "react";

function page() {
  return (
    <div className=" bg-white px-[15px] md:px-[30px] lg:px-[45px] py-4 text-[#000000] w-full">
      <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-3">
        Shipping Policy
      </h1>

      <section className="space-y-4 leading-snug text-justify text-[1rem]">
        <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-2">
          Charges
        </h2>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          The charges for shipping and handling for online shopping at
          www.letstryfoods.com depends on the location to which you want your
          purchases to be sent.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          **Free shipping is available on orders over Rs 500.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          **For customers outside India, international shipping charges, as well
          as duties and taxes as applicable, are payable by the customer.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          ** Handling or convenience fees may apply depending on the nature of
          the special request.
        </p>

        <h2 className="lg:text-xl md:text-xl text-[16px]  font-bold mb-2">
          DELIVERY
        </h2>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          Items will be sent to the address you provide on the website. Make
          sure that you recheck the address before you confirm the order so as
          to avoid incorrect delivery. We prefer to deliver to office or
          residential addresses.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          We do not encourage delivery to POs. boxes or any other destination
          where the recipient is not identifiable because of the risk involved
          due to the value of the goods.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          Delivery dates are not guaranteed in the event of service
          interruptions or failures caused by events beyond our control. These
          interruptions include but are not limited to transportation systems,
          customs clearance issues, shipping carrier delays, or the cardholder’s
          credit card bank delays.
        </p>
        <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-2">
          TIME FRAME
        </h2>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          Domestic Shipping: The standard delivery time for any domestic orders,
          i.e., orders within India, is 3-5 business days unless otherwise
          specified for any particular product.
        </p>
        <p className="text-[12px] lg:text-[16px] md:text-[16px]">
          International Shipping: The standard delivery time for any
          international orders, i.e., orders outside of India, is 14–15 business
          days.
        </p>
      </section>
    </div>
  );
}

export default page;
