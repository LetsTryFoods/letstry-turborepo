interface DiscountBadgeProps {
    discountPercent: number;
}

export const DiscountBadge = ({ discountPercent }: DiscountBadgeProps) => {
    if (discountPercent <= 0) return null;

    return (
        <>
            <div className="absolute top-0 left-[23px] z-10">
                <div
                    className="bg-[#00000010] text-[#00000020] font-bold text-[8px] md:text-[10px] lg:text-[13px] 
            w-[30px] md:w-[45px] lg:w-[55px] pt-1 pb-[9.5px] px-[4.5px] md:px-[8px] lg:px-[10px]
            leading-tight flex flex-col backdrop-blur-sm text-left"
                    style={{
                        clipPath: "polygon(0 -1%, 80% -1%, 80% 100%, 40% 80%, 0 100%)",
                    }}
                >
                    <div>{discountPercent}%</div>
                    <div className="pb-[6px]">OFF</div>
                </div>
            </div>
            <div className="absolute top-0 left-5 z-10">
                <div
                    className="bg-[#3149A6] text-white font-bold text-[8px] md:text-[10px] lg:text-[13px] 
            w-[30px] md:w-[45px] lg:w-[55px] pt-1 pb-2 px-[4.5px] md:px-[8px] lg:px-[10px]
            leading-tight flex flex-col text-left"
                    style={{
                        clipPath: "polygon(0 -1%, 80% -1%, 80% 100%, 40% 80%, 0 100%)",
                    }}
                >
                    <div>{discountPercent}%</div>
                    <div className="pb-[6px]">OFF</div>
                </div>
            </div>
        </>
    );
};
