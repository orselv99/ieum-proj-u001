export const HeartParticles = ({
  isActive
}: {
  isActive: boolean
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute text-red-500 animate-float-up text-2xl"
          style={{
            left: `${20 + (i * 10)}px`,
            animationDelay: `${i * 0.2}s`,
            bottom: '10px'
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}
