

function page() {
  return (
    
    <div className=" bg-white px-[15px] md:px-[30px] lg:px-[45px] py-4">
    
      <div className="text-[#000000] w-full">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-3">Refund &amp; Cancellations</h1>

        <p className="mb-3 text-[12px] lg:text-[16px] md:text-[16px]">
          We offer a 3-day policy. Unfortunately, we are unable to provide you with a refund or exchange if 3 days have passed since the delivery of your item.
        </p>
        <p className="mb-3 text-[12px] lg:text-[16px] md:text-[16px]">
          Since our goods are perishable, we only accept returns and refunds in the event of a manufacturing defect.
        </p>
        <ul className="list-disc ml-2 space-y-2 mb-1 leading-relaxed text-justify text-[12px] lg:text-[16px] md:text-[16px]">
          <li>
            Cancellation is allowed till the order is dispatched from the warehouse, with a full refund.
          </li>
          <li>
            If you have any concerns regarding the quality of the product, we kindly request you to keep the item ready for pickup. We will arrange for its collection to ensure a thorough review and to prevent such issues from occurring in the future.
          </li>
          <li>
            The refund will be processed back to the source within 7–10 business days.
          </li>
          <li>
            No cancellation of order post-order dispatch from warehouse.
          </li>
          <li>
            If you have any complaints about the product, please make a video and send it to the email address below:<br />
            <a href="mailto:mail@earthcrust.co.in" className="text-black underline break-all italic">
              mail@earthcrust.co.in
            </a>
          </li>
          <li>
            To initiate cancellation of National Delivery orders, please send a cancellation request email with order ID to:<br />
            <a href="mailto:mail@earthcrust.co.in" className="text-black underline break-all italic">
              mail@earthcrust.co.in
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default page