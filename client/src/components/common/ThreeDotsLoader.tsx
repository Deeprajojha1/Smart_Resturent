import { BeatLoader } from "react-spinners";

type ThreeDotsLoaderProps = {
  fullScreen?: boolean;
  size?: number;
};

const ThreeDotsLoader = ({ fullScreen = false, size = 10 }: ThreeDotsLoaderProps) => {
  const loader = (
    <div className="flex items-center justify-center py-3" aria-label="Loading">
      <BeatLoader color="#8A7A62" margin={3} size={size} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E8]">
        {loader}
      </div>
    );
  }

  return loader;
};

export default ThreeDotsLoader;
