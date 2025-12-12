import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Image 
        src="/images/run-12055.gif" 
        width={300} 
        height={300} 
        alt="Loading..." 
        className="object-contain"
      />
    </div>
  );
}
