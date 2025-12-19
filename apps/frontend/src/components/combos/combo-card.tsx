// "use client";

// import Link from 'next/link';
// import Image from 'next/image';
// import type { Combo } from '@/types/combo.types';
// import { Button } from '../ui/button';

// export interface ComboCardProps {
//   combo: Combo;
// }

// export function ComboCard({ combo }: ComboCardProps) {
//   const displayPrice = combo.discountedPrice ?? combo.price;
//   const hasDiscount = combo.discountedPrice && combo.price;


 
//   return (
//     <article className="bg-white border border-gray-200 overflow-hidden flex flex-col h-full">
//       <Link href={`/product/${combo.id}`} className="group block flex-1">
//         <div className="relative w-full h-44 bg-[#F3EEEA] p-4 flex items-center justify-center">
//           <div className="relative w-48 h-32">
//             <Image 
//               src={combo.imageUrl ?? ''} 
//               alt={combo.name} 
//               fill 
//               className="object-contain" 
//               unoptimized 
//             />
//           </div>
//         </div>
//         <div className="p-4 text-center">
//           <h3 className="text-sm font-semibold text-gray-900 mb-1 min-h-[2.5rem] flex items-center justify-center">
//             {combo.name}
//           </h3>
//           {combo.unit?.[0] && (
//             <p className="text-sm text-gray-500 mb-2">{combo.unit[0]}</p>
//           )}
//           <div className="flex flex-col items-center gap-1 mb-3">
//             <p className="text-lg font-bold text-gray-900">
//               {displayPrice && typeof displayPrice === 'number' 
//                 ? `₹${displayPrice.toFixed(2)}` 
//                 : displayPrice 
//                   ? `₹${displayPrice}` 
//                   : ''}
//             </p>
//             {hasDiscount && (
//               <p className="text-sm text-gray-500 line-through">
//                 {typeof combo.price === 'number' 
//                   ? `₹${combo.price.toFixed(2)}` 
//                   : `₹${combo.price}`}
//               </p>
//             )}
//           </div>
//         </div>
//       </Link>
//       <div className="p-4 pt-0">
//         <Button
//           variant="outline"
//           className="w-full border border-gray-300 bg-transparent text-gray-700 font-medium hover:bg-gray-100 transition-colors"
//         >
//           Add to cart
//         </Button>
//       </div>
//     </article>
//   );
// }
