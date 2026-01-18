export type HealthySnackingSlide = {
  title: string;
  description: string;
  tag: string;
  img: string;
  redirectTo: string;
};

const IMAGE_URL = process.env.NEXT_PUBLIC_API_IMAGE_URL_OLD ?? 'https://d2tmwt8yl5m7qh.cloudfront.net';

export const healthySnackingSlides: HealthySnackingSlide[] = [
  {
    title: "Crunchy. Quick. Healthy.",
    description:
      "Start your day with Khari as it is a light and satisfying choice.\nIt'll provide you with quick energy with their carbohydrate content and will be easier to digest.\nChoosing it will definitely prove to be a healthier option.",
    tag: "Breakfast",
    img: `${IMAGE_URL}/images/HealthySnack_1.webp`,
    redirectTo: "/category/Purani Delhi",
  },
  {
    title: "Crunch. Focus. Conquer.",
    description:
      "Fuel your focus with our healthy namkeens—perfect for study breaks! Made with 100% groundnut oil and wholesome ingredients, our snacks give the right crunch without the guilt. Whether prepping for exams or powering through assignments, these light yet satisfying bites help keep energy up and mind sharp.",
    tag: "Study Breaks",
    img: `${IMAGE_URL}/images/HealthySnack_2.webp`,
    redirectTo: "/range/Namkeen Range",
  },
  {
    title: "Light. Crunchy. Anywhere.",
    description:
      "Snack smart while you travel with our wide range of makhana and puffs—light, crunchy, and packed with goodness. Whether on a road trip, catching a flight, or just commuting, these healthy snacks are easy to carry and perfect for guilt-free munching on the go.",
    tag: "Travelling",
    img: `${IMAGE_URL}/images/HealthySnack_4.webp`,
    redirectTo: "/category/Munchies",
  },
  {
    title: "Protein. Power. Purity.",
    description:
      "Recharge naturally after a workout with our nutritious sattu—packed with protein, fiber, and essential minerals. It's a perfect post-workout drink to help rebuild muscle, boost energy, and keep you full and refreshed without added sugar or preservatives.",
    tag: "Post Workout",
    img: `${IMAGE_URL}/images/HealthySnack_3.webp`,
    redirectTo: "/category/Healthy Snacks",
  },
  {
    title: "Wholesome. Focused. Ready.",
    description:
      "Take a wholesome pause during meetings with our Paachmeva mix and healthy cookies—loaded with the goodness of dry fruits and whole grains. They offer the right balance of taste and nutrition—keeping energy steady, focus sharp, and the day on track.",
    tag: "Meeting Breaks",
    img: `${IMAGE_URL}/images/HealthySnack_5.webp`,
    redirectTo: "/category/Cookies",
  },
];
