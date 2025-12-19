// "use client";

// import { useHomeCombos } from '@/lib/home/use-home-combos';
// import { ComboCard } from './combo-card';

// export function ComboGrid() {
//   const { data: combos = [], isLoading } = useHomeCombos();

//   return (
//     <section className="container mx-auto px-4 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-3xl font-extrabold">Bestselling Combos</h2>
//         <a href="/combos" className="text-blue-700 hover:underline">See all</a>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {isLoading
//           ? Array.from({ length: 4 }).map((_, idx) => (
//               <div key={idx} className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
//                 <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
//               </div>
//             ))
//           : combos.slice(0, 4).map((c) => <ComboCard key={c.id} combo={c} />)}
//       </div>
//     </section>
//   );
// }
