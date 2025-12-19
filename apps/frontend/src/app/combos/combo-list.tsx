// "use client";

// import { useCombos } from '@/lib/combo/use-combos';
// import { ComboCard } from '@/components/combos/combo-card';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import type { Combo } from '@/types/combo.types';

// function groupCombosByName(combos: Combo[]) {
//   return combos.reduce((acc, item) => {
//     const name = item.name;
//     if (!acc[name]) {
//       acc[name] = [];
//     }
//     acc[name].push(item);
//     return acc;
//   }, {} as Record<string, Combo[]>);
// }

// export function ComboList() {
//   const router = useRouter();
//   const { data: comboItems = [], isLoading } = useCombos();

//   const groupedByName = groupCombosByName(comboItems);
//   const comboGroups = Object.entries(groupedByName);

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen px-6 md:px-10 lg:px-[70px]">
//         <div className="flex-1">
//           <h1 className="hidden md:block lg:block text-2xl lg:text-3xl font-bold text-black mb-2 mt-12">
//             Combos
//           </h1>
//           <p className="text-xl text-gray-600 mt-4">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (comboGroups.length === 0) {
//     return (
//       <div className="flex min-h-screen px-6 md:px-10 lg:px-[70px]">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 py-2 lg:hidden md:hidden">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => router.push('/')}
//               className="p-0 h-auto"
//             >
//               <ChevronLeft size={24} />
//             </Button>
//             <h1 className="text-lg font-bold">Combos</h1>
//           </div>
//           <p className="text-lg font-medium mt-4 text-gray-600">No products available.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 flex flex-col min-h-screen mb-4 px-6 md:px-10 lg:px-[70px]">
//       <div className="flex-1">
//         <h1 className="hidden md:block lg:block text-2xl lg:text-3xl font-bold text-black mb-2 mt-12">
//           Combos
//         </h1>

//         <div className="flex items-center justify-between py-2 text-black lg:hidden md:hidden">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => router.push('/')}
//             className="p-0 h-auto flex-shrink-0 pr-2"
//           >
//             <ChevronLeft size={24} />
//           </Button>
//           <h1 className="text-lg font-bold flex-1 text-left">Combos</h1>
//           <p className="text-base font-normal flex-shrink-0">
//             {comboItems.length} Product{comboItems.length !== 1 ? 's' : ''}
//           </p>
//         </div>

//         <p className="hidden lg:block md:block text-xl font-light py-2 mb-8 text-black">
//           {comboItems.length} Product{comboItems.length !== 1 ? 's' : ''}
//         </p>

//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[26px] md:gap-[38px]">
//           {comboGroups.map(([name, variants]) => (
//             <ComboCard key={variants[0].id} combo={variants[0]} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
