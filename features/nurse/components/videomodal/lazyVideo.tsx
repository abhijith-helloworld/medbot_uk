import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function LazyVideo({
  fileUrl,
  isVideo,
  title,
}: {
  fileUrl: string;
  isVideo: boolean;
  title: string;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true, // load only once
    threshold: 0.2, // start loading when 20% is visible
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center"
    >
      {inView ? (
        isVideo ? (
          <video
            src={fileUrl}
            preload="metadata"
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={fileUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
          Loading...
        </div>
      )}
    </motion.div>
  );
}
